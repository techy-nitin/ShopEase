import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "./config";
const Orders = () => {
  const [orders, setOrders]                   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [filter, setFilter]                   = useState("ALL");
  const [sortBy, setSortBy]                   = useState("NEWEST");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [returnStatusMap, setReturnStatusMap] = useState({});
  const [returnLoadingId, setReturnLoadingId] = useState(null);

  const getUser   = () => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } };
  const getUserId = () => getUser()?.id;

 const normalizeStatus = (status) => {
  return status?.toUpperCase().replace(/\s+/g, "_");
};
  const normalizeOrder = (order) => ({
    ...order,
    status: normalizeStatus(order.status),
    quantity: Number(order?.quantity ?? order?.productQuantity ?? order?.qty ?? order?.orderQuantity ?? order?.itemQuantity ?? 0),
  });

  useEffect(() => { fetchOrders(); }, []);

  const fetchLatestReturnStatus = async (orderItemId) => {
    try {
      if (!orderItemId) return null;
      const res  = await fetch(`${API_BASE}/return-refund/latest/${orderItemId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data?.message ? null : data;
    } catch { return null; }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) { setOrders([]); return; }
      const res  = await fetch(`${API_BASE}/orders/buyer/${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch orders");
      const safeOrders = Array.isArray(data) ? data.map(normalizeOrder) : [];
      setOrders(safeOrders);
      const returnEntries = await Promise.all(
        safeOrders.map(async (order) => {
          if (!order?.orderItemId) return [String(order?.orderItemId), null];
          const latestReturn = await fetchLatestReturnStatus(order.orderItemId);
          return [String(order.orderItemId), latestReturn];
        })
      );
      setReturnStatusMap(Object.fromEntries(returnEntries));
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  };
  const formatTime = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusColor = (status) => ({
    PLACED: "#3b82f6", CONFIRMED: "#8b5cf6", SHIPPED: "#f59e0b",
    OUT_FOR_DELIVERY: "#06b6d4", DELIVERED: "#12daa8", CANCELLED: "#ef4444",
  }[normalizeStatus(status)] || "#555");

  const getStatusText = (status) => ({
    DELIVERED: "Delivered successfully", OUT_FOR_DELIVERY: "Out for delivery",
    SHIPPED: "Shipped and on the way", CONFIRMED: "Confirmed by seller",
    PLACED: "Order placed successfully", CANCELLED: "Order cancelled",
  }[normalizeStatus(status)] || "Order processing");

  const getOrderQuantity = (order) => {
    const qty = Number(order?.quantity ?? order?.productQuantity ?? order?.qty ?? order?.orderQuantity ?? order?.itemQuantity ?? 0);
    return qty > 0 ? qty : 0;
  };

  const getReturnStage        = (order) => !order?.orderItemId ? null : returnStatusMap[String(order.orderItemId)]?.status || null;
  const isReturnedOrder       = (order) => !!getReturnStage(order);
  const getReturnTrackerSteps = () => [
    { key: "RETURN_REQUESTED", label: "Return Requested" },
    { key: "PICKED_FROM_HOME", label: "Picked From Home" },
    { key: "RETURN_SUCCESSFUL", label: "Return Successful" },
  ];
  const getReturnStepIndex = (order) => {
    const stage = getReturnStage(order);
    return { RETURN_REQUESTED: 0, PICKED_FROM_HOME: 1, RETURN_SUCCESSFUL: 2 }[stage] ?? -1;
  };
  const getReturnStatusText = (order) => ({
    RETURN_REQUESTED: "Return requested by user",
    PICKED_FROM_HOME: "Order picked from your home",
    RETURN_SUCCESSFUL: "Return completed successfully",
  }[getReturnStage(order)] || "");

  const canShowReturn = (order) => {
    if (!order?.orderDate || !order?.orderItemId) return false;
    if (normalizeStatus(order.status) !== "DELIVERED") return false;
    if (isReturnedOrder(order)) return false;
    const diffDays = (Date.now() - new Date(order.orderDate).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };
  const canShowReviewButtons = (status, productId) => normalizeStatus(status) === "DELIVERED" && !!productId;
  const canShowCancel = (orderDate, status) => {
  if (!status) return false;

  const normalized = normalizeStatus(status);

  // Button visible until order shipped
  return ["PLACED", "CONFIRMED", "PROCESSING"].includes(normalized);
};
  const getRemainingCancelMinutes = (orderDate) => {
    if (!orderDate) return 0;
    return Math.max(0, Math.ceil(30 - (Date.now() - new Date(orderDate).getTime()) / (1000 * 60)));
  };

  const downloadInvoice = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/download-invoice`);
      if (!res.ok) throw new Error("Failed to download invoice");
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch { alert("Failed to download invoice"); }
  };

  const requestReturn = async (order) => {
    try {
      if (!order?.orderItemId) { alert("Order item id not found"); return; }
      if (!window.confirm(`Request return for Order #${order.id}?`)) return;
      setReturnLoadingId(order.orderItemId);
      const res  = await fetch(`${API_BASE}/return-refund/request`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemId: order.orderItemId, reason: "Return requested by user", status: "RETURN_REQUESTED", userId: getUser()?.id || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit return request");
      setReturnStatusMap((prev) => ({ ...prev, [String(order.orderItemId)]: data }));
      alert("Return request submitted");
    } catch (err) { alert(err.message || "Failed to request return"); }
    finally { setReturnLoadingId(null); }
  };

  const handleAddReview = async (order) => {
    try {
      if (!order?.productId) { alert("Product not found"); return; }
      const comment = window.prompt("Write your review");
      if (!comment?.trim()) return;
      const ratingInput = window.prompt("Give rating from 1 to 5");
      if (!ratingInput) return;
      const rating = Number(ratingInput);
      if (isNaN(rating) || rating < 1 || rating > 5) { alert("Rating must be between 1 and 5"); return; }
      const res = await fetch(`${API_BASE}/api/products/review`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: order.productId, userId: getUser()?.id || null, userName: getUser()?.name || "User", comment: comment.trim(), rating }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add review");
      alert("Review added successfully");
    } catch (err) { alert(err.message || "Failed to add review"); }
  };

  const handleDeleteReview = async (order) => {
    try {
      const user = getUser();
      if (!order?.productId) { alert("Product not found"); return; }
      if (!user?.id) { alert("User not found"); return; }
      const res = await fetch(`${API_BASE}/api/products/review/product/${order.productId}/user/${user.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.text()) || "Failed to delete review");
      alert("Review deleted successfully");
    } catch (err) { alert(err.message || "Failed to delete review"); }
  };

  const handleBuyAgain = async (order) => {
    try {
      const user = getUser();
      if (!user?.id) { alert("Please login first"); return; }
      if (!order?.productId) { alert("Product id not found"); return; }
      setActionLoadingId(order.id);
      const res = await fetch(`${API_BASE}/api/cart/add`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, productId: order.productId, quantity: 1 }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || "Failed to add product to cart");
      alert("Product added to cart");
      window.location.href = "/cart";
    } catch (err) { alert(err.message || "Failed to fetch"); }
    finally { setActionLoadingId(null); }
  };

  const handleCancelOrder = async (order) => {
    try {
      if (!window.confirm(`Cancel Order #${order.id}?`)) return;
      setActionLoadingId(order.id);
      const res  = await fetch(`${API_BASE}/orders/${order.id}/cancel`, { method: "POST" });
      const text = await res.text();
      if (!res.ok) throw new Error(text || "Failed to cancel order");
      setOrders((prev) => prev.map((item) => item.id === order.id ? { ...item, status: "CANCELLED" } : item));
      alert("Order cancelled successfully");
    } catch (err) { alert(err.message || "Failed to cancel order"); }
    finally { setActionLoadingId(null); }
  };

  const trackerSteps = [
    { key: "PLACED",           label: "Ordered"         },
    { key: "CONFIRMED",        label: "Processed"       },
    { key: "SHIPPED",          label: "Shipped"         },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery"},
    { key: "DELIVERED",        label: "Delivered"       },
  ];

  const getCurrentStepIndex = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "CANCELLED") return 0;
    const index = trackerSteps.findIndex((s) => s.key === normalized);
    return index === -1 ? 0 : index;
  };

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (filter === "RETURNED") {
      result = result.filter(isReturnedOrder);
    } else {
      result = result.filter((o) => !isReturnedOrder(o));
      if (filter === "ACTIVE")    result = result.filter((o) => ["PLACED","CONFIRMED","SHIPPED","OUT_FOR_DELIVERY"].includes(normalizeStatus(o.status)));
      if (filter === "DELIVERED") result = result.filter((o) => normalizeStatus(o.status) === "DELIVERED");
      if (filter === "CANCELLED") result = result.filter((o) => normalizeStatus(o.status) === "CANCELLED");
    }
    result.sort((a, b) => {
      const aT = new Date(a.orderDate || 0).getTime();
      const bT = new Date(b.orderDate || 0).getTime();
      return sortBy === "OLDEST" ? aT - bT : bT - aT;
    });
    return result;
  }, [orders, filter, sortBy, returnStatusMap]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <style>{fonts + anims}</style>

      <div style={s.container}>

        {/* ── Header ── */}
        <div style={s.header} className="od-fade-in">
          <div>
            <p style={s.headerEye}>Purchase History</p>
            <h1 style={s.headerTitle}>My Orders</h1>
          </div>
          <div style={s.headerBadge}>
            <span style={s.headerBadgeNum}>{orders.length}</span>
            <span style={s.headerBadgeLbl}>total</span>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div style={s.toolbar} className="od-fade-in">
          <div style={s.filterGroup}>
            {["ALL","ACTIVE","DELIVERED","CANCELLED","RETURNED"].map((f) => (
              <button
                key={f}
                type="button"
                style={{
                  ...s.chip,
                  background: filter === f ? "#12daa8" : "transparent",
                  color:      filter === f ? "#000"    : "#555",
                  borderColor: filter === f ? "#12daa8" : "#1e1e1e",
                  fontWeight:  filter === f ? "700"    : "500",
                }}
                onClick={() => setFilter(f)}
              >
                {f === "RETURNED" ? "Returned" : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <select
            style={s.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
          </select>
        </div>

        {/* ── Results count ── */}
        <p style={s.resultsText}>
          {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} found
        </p>

        {/* ── States ── */}
        {loading ? (
          <div style={s.emptyWrap}>
            <div style={s.loadRing} />
            <p style={s.emptyText}>Loading your orders…</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={s.emptyWrap}>
            <p style={{ ...s.emptyText, fontStyle: "italic" }}>No orders found for this filter.</p>
          </div>
        ) : (
          filteredOrders.map((order, oi) => {
            const currentStepIndex = getCurrentStepIndex(order.status);
            const isReturned       = isReturnedOrder(order);
            const statusColor      = isReturned
              ? (getReturnStage(order) === "RETURN_SUCCESSFUL" ? "#12daa8" : "#f59e0b")
              : getStatusColor(order.status);

            return (
              <div
                key={order.id}
                className="od-card"
                style={{ ...s.card, animationDelay: `${oi * 0.06}s` }}
              >
                {/* Top bar accent */}
                <div style={{ ...s.cardAccent, background: statusColor }} />

                {/* Card header */}
                <div style={s.cardHead}>
                  <div style={s.cardHeadLeft}>
                    <div style={s.orderIdRow}>
                      <span style={s.orderId}>Order</span>
                      <span style={{ ...s.orderIdNum }}># {order.id}</span>
                    </div>
                    <div style={s.orderMeta}>
                      <span>{formatDate(order.orderDate)} {formatTime(order.orderDate)}</span>
                      <span style={s.metaDot}>·</span>
                      <span>Qty {getOrderQuantity(order)}</span>
                    </div>
                  </div>

                  {/* Status pill */}
                  <div style={{ ...s.statusPill, background: `${statusColor}18`, color: statusColor, borderColor: `${statusColor}40` }}>
                    <span style={{ ...s.statusDot, background: statusColor }} />
                    {isReturned ? getReturnStage(order) : normalizeStatus(order.status)}
                  </div>
                </div>

                {/* Card body */}
                <div style={s.cardBody}>

                  {/* Product image */}
                  <div style={s.imgWrap}>
                    <img
                      src={order.productImage || "https://dummyimage.com/130x130/111/fff&text=Order"}
                      alt={order.productName || "order"}
                      style={s.img}
                      onError={(e) => { e.currentTarget.src = "https://dummyimage.com/130x130/111/fff&text=Order"; }}
                    />
                  </div>

                  {/* Product info + tracker */}
                  <div style={s.productInfo}>
                    <h3 style={s.productName}>{order.productName || `ShopEase Order #${order.id}`}</h3>

                    <p style={s.productSub}>
                      {isReturned ? (
                        <>Return in <strong style={{ color: "#f59e0b" }}>{getReturnStage(order)}</strong> state</>
                      ) : (
                        <span style={{ color: statusColor }}>{getStatusText(order.status)}</span>
                      )}
                    </p>

                    {canShowCancel(order.orderDate, order.status) && (
                      <p style={s.cancelNote}>
                        ⏱ Cancel available for {getRemainingCancelMinutes(order.orderDate)} more min
                      </p>
                    )}

                    {/* ── Tracker ── */}
                    <div style={s.tracker}>
                      {(isReturned ? getReturnTrackerSteps() : trackerSteps).map((step, index) => {
                        const totalSteps = isReturned ? getReturnTrackerSteps().length : trackerSteps.length;
                        const isActive   = isReturned
                          ? index <= getReturnStepIndex(order)
                          : normalizeStatus(order.status) === "CANCELLED" ? index === 0 : index <= currentStepIndex;
                        const lineActive = isReturned
                          ? index < getReturnStepIndex(order)
                          : normalizeStatus(order.status) !== "CANCELLED" && index < currentStepIndex;

                        return (
                          <div key={step.key} style={s.trackerStep}>
                            <div style={s.trackerTop}>
                              <div style={{
                                ...s.trackerCircle,
                                background:   isActive ? "#12daa8" : "#1a1a1a",
                                borderColor:  isActive ? "#12daa8" : "#2a2a2a",
                                boxShadow:    isActive ? "0 0 8px rgba(18,218,168,0.4)" : "none",
                                color:        isActive ? "#000" : "transparent",
                              }}>✓</div>
                              {index < totalSteps - 1 && (
                                <div style={{
                                  ...s.trackerLine,
                                  background: lineActive
                                    ? "linear-gradient(to right, #12daa8, #12daa8)"
                                    : "#1e1e1e",
                                }} />
                              )}
                            </div>
                            <p style={{ ...s.trackerLabel, color: isActive ? "#12daa8" : "#333" }}>{step.label}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* ── Actions ── */}
                    <div style={s.actions}>
                      {!isReturned ? (
                        <>
                          <button type="button" style={s.btnPrimary} className="od-btn-primary"
                            onClick={() => downloadInvoice(order.id)} disabled={actionLoadingId === order.id}>
                            ↓ Invoice
                          </button>
                          <button type="button" style={s.btnGhost} className="od-btn-ghost"
                            onClick={() => handleBuyAgain(order)} disabled={actionLoadingId === order.id}>
                            {actionLoadingId === order.id ? "Adding…" : "Buy Again"}
                          </button>
                          {canShowCancel(order.orderDate, order.status) && (
                            <button type="button" style={s.btnCancel} className="od-btn-cancel"
                              onClick={() => handleCancelOrder(order)} disabled={actionLoadingId === order.id}>
                              Cancel
                            </button>
                          )}
                          {canShowReturn(order) && (
                            <button type="button" style={s.btnReturn} className="od-btn-return"
                              onClick={() => requestReturn(order)} disabled={returnLoadingId === order.orderItemId}>
                              {returnLoadingId === order.orderItemId ? "Requesting…" : "Return"}
                            </button>
                          )}
                          {canShowReviewButtons(order.status, order.productId) && (
                            <>
                              <button type="button" style={s.btnReview} className="od-btn-review"
                                onClick={() => handleAddReview(order)} disabled={actionLoadingId === order.id}>
                                + Review
                              </button>
                              <button type="button" style={s.btnDelete} className="od-btn-delete"
                                onClick={() => handleDeleteReview(order)} disabled={actionLoadingId === order.id}>
                                Del Review
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <span style={{
                            ...s.returnBadge,
                            background: getReturnStage(order) === "RETURN_SUCCESSFUL" ? "rgba(18,218,168,0.1)" : "rgba(245,158,11,0.1)",
                            color:      getReturnStage(order) === "RETURN_SUCCESSFUL" ? "#12daa8" : "#f59e0b",
                            borderColor: getReturnStage(order) === "RETURN_SUCCESSFUL" ? "rgba(18,218,168,0.25)" : "rgba(245,158,11,0.25)",
                          }}>
                            {getReturnStage(order) === "RETURN_SUCCESSFUL" ? "✔ Return Complete" :
                             getReturnStage(order) === "PICKED_FROM_HOME"  ? "📦 Picked Up"      : "↩ Return Requested"}
                          </span>
                          <button type="button" style={s.btnGhost} className="od-btn-ghost"
                            onClick={() => handleBuyAgain(order)} disabled={actionLoadingId === order.id}>
                            Buy Again
                          </button>
                        </>
                      )}
                    </div>

                    {normalizeStatus(order.status) === "DELIVERED" && !isReturned && canShowReturn(order) && (
                      <p style={s.returnNote}>Return window: 7 days from delivery</p>
                    )}
                  </div>

                  {/* Price col */}
                  <div style={s.priceCol}>
                    <span style={s.price}>₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}</span>
                    <span style={s.priceNote}>incl. taxes</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Orders;

// ─── Fonts ────────────────────────────────────────────────────────────────────
const fonts = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');`;

// ─── Animations ──────────────────────────────────────────────────────────────
const anims = `
  .od-fade-in { animation: odUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes odUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
  @keyframes odSpin{ to { transform:rotate(360deg); } }

  .od-card {
    animation: odUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
    transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, border-color 0.3s ease;
  }
  .od-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 56px rgba(0,0,0,0.5) !important;
    border-color: rgba(18,218,168,0.2) !important;
  }

  .od-btn-primary { transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s; }
  .od-btn-primary:hover:not(:disabled) { opacity:0.85; transform:translateY(-1px); box-shadow:0 6px 20px rgba(18,218,168,0.3); }
  .od-btn-primary:active { transform:scale(0.97); }

  .od-btn-ghost   { transition: background 0.2s, border-color 0.2s; }
  .od-btn-ghost:hover:not(:disabled) { background:rgba(255,255,255,0.06) !important; border-color:#333 !important; }

  .od-btn-cancel  { transition: background 0.2s; }
  .od-btn-cancel:hover:not(:disabled) { background:rgba(239,68,68,0.15) !important; }

  .od-btn-return  { transition: background 0.2s; }
  .od-btn-return:hover:not(:disabled) { background:rgba(18,218,168,0.15) !important; }

  .od-btn-review  { transition: background 0.2s; }
  .od-btn-review:hover:not(:disabled) { background:rgba(139,92,246,0.15) !important; }

  .od-btn-delete  { transition: background 0.2s; }
  .od-btn-delete:hover:not(:disabled) { background:rgba(239,68,68,0.15) !important; }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#080808",
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    padding: "90px 20px 60px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  /* Header */
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerEye: {
    margin: "0 0 6px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color: "#12daa8",
  },
  headerTitle: {
    margin: 0,
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(32px, 5vw, 52px)",
    fontWeight: "900",
    letterSpacing: "-1px",
    color: "#f5f5f2",
    lineHeight: 1,
  },
  headerBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "68px",
    height: "68px",
    borderRadius: "50%",
    border: "1.5px solid rgba(18,218,168,0.25)",
    background: "rgba(18,218,168,0.06)",
    flexShrink: 0,
  },
  headerBadgeNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "24px",
    fontWeight: "900",
    color: "#12daa8",
    lineHeight: 1,
  },
  headerBadgeLbl: {
    fontSize: "9px",
    color: "#555",
    fontWeight: "500",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },

  /* Toolbar */
  toolbar: {
    background: "#0e0e0e",
    border: "1px solid #1a1a1a",
    borderRadius: "16px",
    padding: "16px 20px",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: "16px",
  },
  filterGroup: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    flex: 1,
  },
  chip: {
    border: "1px solid #1e1e1e",
    borderRadius: "999px",
    padding: "8px 16px",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
    letterSpacing: "0.3px",
  },
  sortSelect: {
    height: "38px",
    border: "1px solid #1e1e1e",
    borderRadius: "10px",
    padding: "0 14px",
    fontSize: "13px",
    fontWeight: "500",
    background: "#111",
    color: "#aaa",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
  },

  resultsText: {
    fontSize: "12px",
    color: "#333",
    marginBottom: "20px",
    fontWeight: "400",
    letterSpacing: "0.5px",
  },

  /* Empty / Loading */
  emptyWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 0",
    gap: "16px",
    border: "1px dashed #1a1a1a",
    borderRadius: "20px",
  },
  loadRing: {
    width: "36px",
    height: "36px",
    border: "2px solid #1a1a1a",
    borderTop: "2px solid #12daa8",
    borderRadius: "50%",
    animation: "odSpin 0.9s linear infinite",
  },
  emptyText: {
    color: "#333",
    fontSize: "15px",
    fontWeight: "300",
    margin: 0,
  },

  /* Card */
  card: {
    background: "#0e0e0e",
    border: "1px solid #1a1a1a",
    borderRadius: "20px",
    marginBottom: "16px",
    overflow: "hidden",
    position: "relative",
  },
  cardAccent: {
    height: "2px",
    width: "100%",
  },
  cardHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 22px 14px",
    borderBottom: "1px solid #141414",
    flexWrap: "wrap",
    gap: "12px",
  },
  cardHeadLeft: {},
  orderIdRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    marginBottom: "4px",
  },
  orderId: {
    fontSize: "12px",
    color: "#444",
    fontWeight: "400",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
  },
  orderIdNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "20px",
    fontWeight: "700",
    color: "#f5f5f2",
    letterSpacing: "-0.3px",
  },
  orderMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#444",
    fontWeight: "300",
    flexWrap: "wrap",
  },
  metaDot: { color: "#2a2a2a" },

  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "6px 14px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },
  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    flexShrink: 0,
  },

  cardBody: {
    display: "grid",
    gridTemplateColumns: "110px 1fr 130px",
    gap: "20px",
    padding: "20px 22px 22px",
    alignItems: "start",
  },

  imgWrap: {
    width: "110px",
    height: "110px",
    borderRadius: "14px",
    background: "#fff",
    overflow: "hidden",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    boxSizing: "border-box",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  productInfo: { minWidth: 0 },
  productName: {
    margin: "0 0 6px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "16px",
    fontWeight: "600",
    color: "#e8e5e0",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  productSub: {
    margin: "0 0 8px",
    fontSize: "13px",
    color: "#555",
    fontWeight: "300",
    lineHeight: "1.5",
  },
  cancelNote: {
    margin: "0 0 10px",
    fontSize: "12px",
    color: "#f59e0b",
    fontWeight: "500",
  },

  /* Tracker */
  tracker: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0",
    margin: "14px 0 16px",
    overflowX: "auto",
    paddingBottom: "4px",
  },
  trackerStep: {
    flex: 1,
    minWidth: "72px",
    textAlign: "center",
    position: "relative",
  },
  trackerTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: "6px",
  },
  trackerCircle: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
    position: "relative",
    zIndex: 2,
    flexShrink: 0,
    transition: "all 0.3s ease",
  },
  trackerLine: {
    position: "absolute",
    top: "10px",
    left: "50%",
    width: "100%",
    height: "2px",
    zIndex: 1,
    transition: "background 0.3s ease",
  },
  trackerLabel: {
    fontSize: "10px",
    fontWeight: "600",
    lineHeight: "1.2",
    letterSpacing: "0.2px",
  },

  /* Action buttons */
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  btnPrimary: {
    padding: "9px 16px",
    borderRadius: "9px",
    border: "none",
    background: "#12daa8",
    color: "#000",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.3px",
  },
  btnGhost: {
    padding: "9px 16px",
    borderRadius: "9px",
    border: "1px solid #222",
    background: "transparent",
    color: "#888",
    fontWeight: "500",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnCancel: {
    padding: "9px 16px",
    borderRadius: "9px",
    border: "1px solid rgba(239,68,68,0.3)",
    background: "rgba(239,68,68,0.08)",
    color: "#f87171",
    fontWeight: "600",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnReturn: {
    padding: "9px 16px",
    borderRadius: "9px",
    border: "1px solid rgba(18,218,168,0.25)",
    background: "rgba(18,218,168,0.08)",
    color: "#12daa8",
    fontWeight: "600",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnReview: {
    padding: "9px 16px",
    borderRadius: "9px",
    border: "1px solid rgba(139,92,246,0.3)",
    background: "rgba(139,92,246,0.08)",
    color: "#a78bfa",
    fontWeight: "600",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnDelete: {
    padding: "9px 16px",
    borderRadius: "9px",
    border: "1px solid rgba(239,68,68,0.2)",
    background: "transparent",
    color: "#f87171",
    fontWeight: "600",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  returnBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 14px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: "600",
  },
  returnNote: {
    margin: "10px 0 0",
    fontSize: "11px",
    color: "#333",
    fontWeight: "300",
    letterSpacing: "0.3px",
  },

  /* Price col */
  priceCol: {
    textAlign: "right",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
    paddingTop: "4px",
  },
  price: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "22px",
    fontWeight: "700",
    color: "#f5f5f2",
    letterSpacing: "-0.5px",
    lineHeight: 1,
  },
  priceNote: {
    fontSize: "11px",
    color: "#333",
    fontWeight: "300",
  },
};