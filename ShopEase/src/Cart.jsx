import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import anima from "./assets/animation.mp4";
import { API_BASE } from "./config";
export default function CartPage() {
  const [cartItems, setCartItems]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const getLoggedInUser = () => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } };
  const getUserId       = () => getLoggedInUser()?.id;

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) { setCartItems([]); return; }

      const res      = await fetch(`${API_BASE}/api/cart/${userId}`);
      const cartRows = await res.json();
      if (!res.ok) throw new Error(cartRows.error || "Failed to fetch cart");

      const fullCartData = await Promise.all(
        (Array.isArray(cartRows) ? cartRows : []).map(async (item) => {
          try {
            const productRes  = await fetch(`${API_BASE}/api/products/${item.productId}`);
            const productData = await productRes.json();
            if (!productRes.ok) throw new Error("Failed to fetch product");

            const product = productData.product || {};
            const images  = productData.images  || [];
            const reviews = productData.reviews || [];

            const actualPrice = Number(product.price || 0);
            let oldPrice = actualPrice;
            if      (actualPrice <= 10000) oldPrice = actualPrice + 9010;
            else if (actualPrice <= 30000) oldPrice = actualPrice + 7000;
            else if (actualPrice <= 60000) oldPrice = actualPrice + 9000;
            else                           oldPrice = actualPrice + 12000;

            const avgRating      = reviews.length ? Math.round(reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) : 3;
            const deliveryCharge = actualPrice < 500 ? 40 : 69;
            const emi            = Math.round(actualPrice / 21);

            return {
              id: item.id, userId: item.userId, productId: item.productId,
              quantity: Number(item.quantity || 1),
              productName: product.name || "No Product Name",
              imageUrl:    images.length > 0 ? images[0].imageUrl : "https://via.placeholder.com/140x140?text=No+Image",
              price: actualPrice, originalPrice: oldPrice,
              rating: avgRating, deliveryCharge, emi,
            };
          } catch {
            return {
              id: item.id, userId: item.userId, productId: item.productId,
              quantity: Number(item.quantity || 1),
              productName: "Product unavailable",
              imageUrl: "https://via.placeholder.com/140x140?text=No+Image",
              price: 0, originalPrice: 0, rating: 0, deliveryCharge: 0, emi: null,
            };
          }
        })
      );
      setCartItems(fullCartData);
    } catch { setCartItems([]); }
    finally { setLoading(false); }
  };

  const removeFromCart = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove item");
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch { alert("Failed to remove item from cart"); }
  };

  const increaseQuantity = async (item) => {
    try {
      setUpdatingId(item.id);
      setCartItems((prev) => prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      fetch(`${API_BASE}/api/cart/add`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(item.userId), productId: Number(item.productId), quantity: 1 }),
      }).catch(() => alert("Failed to update cart"));
    } finally { setUpdatingId(null); }
  };

  const decreaseQuantity = async (item) => {
    if (Number(item.quantity || 1) <= 1) { removeFromCart(item.id); return; }
    try {
      setUpdatingId(item.id);
      const newQty = item.quantity - 1;
      setCartItems((prev) => prev.map((c) => c.id === item.id ? { ...c, quantity: newQty } : c));
      await fetch(`${API_BASE}/api/cart/${item.id}`, { method: "DELETE" });
      await fetch(`${API_BASE}/api/cart/add`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(item.userId), productId: Number(item.productId), quantity: newQty }),
      });
    } catch { alert("Failed to update cart"); }
    finally { setUpdatingId(null); }
  };

  const moveToWishlist = async (item) => {
    try {
      const userId = getUserId();
      if (!userId) { alert("Please login first"); return; }
      const wishRes = await fetch(`${API_BASE}/wishlist/add`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(userId), productId: Number(item.productId) }),
      });
      if (!wishRes.ok) throw new Error((await wishRes.text()) || "Failed to move to wishlist");
      const delRes = await fetch(`${API_BASE}/api/cart/${item.id}`, { method: "DELETE" });
      if (!delRes.ok) throw new Error("Failed to remove from cart");
      setCartItems((prev) => prev.filter((c) => c.id !== item.id));
    } catch (err) { alert(err.message || "Failed to move to wishlist"); }
  };

  const totalPrice         = useMemo(() => cartItems.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 1), 0), [cartItems]);
  const totalOriginalPrice = useMemo(() => cartItems.reduce((s, i) => s + Number(i.originalPrice || 0) * Number(i.quantity || 1), 0), [cartItems]);
  const totalDiscount      = totalOriginalPrice - totalPrice;
  const totalItems         = cartItems.reduce((s, i) => s + Number(i.quantity || 1), 0);

  const fmt = (n) => Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={s.loadWrap}>
        <style>{fonts + anims}</style>
        <div style={s.loadRing} />
        <p style={s.loadText}>Loading your cart…</p>
      </div>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div style={s.emptyWrap}>
        <style>{fonts + anims}</style>
        <div style={s.emptyGlow} />
        <video src={anima} autoPlay loop muted style={s.emptyVideo} />
        <p style={s.emptyEye}>CART</p>
        <h2 style={s.emptyTitle}>Your cart is empty</h2>
        <p style={s.emptySub}>Add items you love and they'll appear here.</p>
        <button style={s.emptyBtn} className="ct-btn-primary" onClick={() => navigate("/")}>
          Start Shopping →
        </button>
      </div>
    );
  }

  // ── Page ───────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <style>{fonts + anims}</style>

      <div style={s.container}>

        {/* Header */}
        <div style={s.header} className="ct-fade-in">
          <div>
            <p style={s.headerEye}>Shopping Bag</p>
            <h1 style={s.headerTitle}>Your Cart</h1>
          </div>
          <div style={s.headerBadge}>
            <span style={s.headerBadgeNum}>{totalItems}</span>
            <span style={s.headerBadgeLbl}>items</span>
          </div>
        </div>

        <div style={s.layout}>

          {/* ── LEFT: items ── */}
          <div style={s.left}>

            {/* Coupon bar */}
            <div style={s.couponBar} className="ct-fade-in">
              <div style={s.couponLeft}>
                <div style={s.couponIcon}>%</div>
                <span style={s.couponText}>Apply Coupon Code</span>
              </div>
              <span style={s.couponArrow}>›</span>
            </div>

            {/* Cart items */}
            {cartItems.map((item, i) => (
              <div
                key={item.id}
                className="ct-card"
                style={{ ...s.card, animationDelay: `${i * 0.07}s` }}
              >
                {/* Top accent bar */}
                <div style={s.cardAccent} />

                <div style={s.itemRow}>

                  {/* Image */}
                  <div style={s.imgWrap}>
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      style={s.img}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/140x140?text=No+Image"; }}
                    />
                  </div>

                  {/* Middle: name, rating, delivery, qty, actions */}
                  <div style={s.middle}>
                    <p style={s.productName}>{item.productName}</p>

                    {/* Stars */}
                    <div style={s.starsRow}>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span key={idx} style={{ color: idx < Number(item.rating || 0) ? "#12daa8" : "#222", fontSize: "16px" }}>★</span>
                      ))}
                    </div>

                    {/* Delivery */}
                    <div style={s.deliveryPill}>
                      <span style={s.deliveryDot} />
                      Delivery by tomorrow · ₹{Number(item.deliveryCharge || 0)}
                    </div>

                    {/* Quantity */}
                    <div style={s.qtyRow}>
                      <span style={s.qtyLabel}>Qty</span>
                      <div style={s.qtyBox}>
                        <button
                          type="button"
                          style={s.qtyBtn}
                          className="ct-qty-btn"
                          onClick={() => decreaseQuantity(item)}
                          disabled={updatingId === item.id}
                        >−</button>
                        <span style={s.qtyNum}>{item.quantity}</span>
                        <button
                          type="button"
                          style={s.qtyBtn}
                          className="ct-qty-btn"
                          onClick={() => increaseQuantity(item)}
                          disabled={updatingId === item.id}
                        >+</button>
                      </div>
                      {updatingId === item.id && <span style={s.qtyUpdating}>updating…</span>}
                    </div>

                    {/* Actions */}
                    <div style={s.actionRow}>
                      <button style={s.btnWishlist} className="ct-btn-ghost" onClick={() => moveToWishlist(item)}>
                        ♡ Move to Wishlist
                      </button>
                      <button style={s.btnRemove} className="ct-btn-remove" onClick={() => removeFromCart(item.id)}>
                        ✕ Remove
                      </button>
                    </div>
                  </div>

                  {/* Right: price */}
                  <div style={s.priceCol}>
                    <p style={s.itemPrice}>
                      ₹{fmt(Number(item.price || 0) * Number(item.quantity || 1))}
                    </p>
                    <p style={s.itemTax}>incl. all taxes</p>

                    <div style={s.priceDivider} />

                    <p style={s.itemMrp}>MRP ₹{fmt(Number(item.originalPrice || 0) * Number(item.quantity || 1))}</p>
                    <p style={s.itemSaving}>
                      Save ₹{fmt((Number(item.originalPrice || 0) - Number(item.price || 0)) * Number(item.quantity || 1))}
                    </p>

                    <div style={s.priceDivider} />

                    <p style={s.emiPrice}>₹{item.emi}/mo</p>
                    <p style={s.emiLabel}>EMI Available</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── RIGHT: summary ── */}
          <div style={s.summary} className="ct-fade-in">

            {/* Summary header */}
            <div style={s.summaryHead}>
              <p style={s.summaryEye}>Price Breakdown</p>
              <h2 style={s.summaryTitle}>
                Order Summary
              </h2>
              <p style={s.summaryCount}>{cartItems.length} product{cartItems.length > 1 ? "s" : ""} · {totalItems} item{totalItems > 1 ? "s" : ""}</p>
            </div>

            <div style={s.summaryBody}>
              <div style={s.summaryRow}>
                <span style={s.summaryLabel}>Original Price</span>
                <span style={s.summaryValue}>₹{fmt(totalOriginalPrice)}</span>
              </div>
              <div style={s.summaryRow}>
                <span style={s.summaryLabel}>Discount</span>
                <span style={{ ...s.summaryValue, color: "#12daa8" }}>− ₹{fmt(totalDiscount)}</span>
              </div>
              <div style={s.summaryRow}>
                <span style={s.summaryLabel}>Delivery</span>
                <span style={{ ...s.summaryValue, color: "#12daa8" }}>Free</span>
              </div>

              <div style={s.summaryDivider} />

              <div style={s.totalRow}>
                <span style={s.totalLabel}>Total</span>
                <span style={s.totalValue}>₹{fmt(totalPrice)}</span>
              </div>

              <div style={s.savingsBanner}>
                <span style={s.savingsIcon}>🎉</span>
                <span style={s.savingsText}>You're saving <strong>₹{fmt(totalDiscount)}</strong> on this order!</span>
              </div>
            </div>

            <div style={s.summaryFooter}>
              <Link to="/checkout" style={{ textDecoration: "none", display: "block" }}>
                <button style={s.checkoutBtn} className="ct-btn-primary">
                  Proceed to Checkout →
                </button>
              </Link>
              <button style={s.continueBtn} className="ct-btn-ghost" onClick={() => navigate("/")}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fonts ────────────────────────────────────────────────────────────────────
const fonts = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');`;

// ─── Animations ──────────────────────────────────────────────────────────────
const anims = `
  .ct-fade-in { animation: ctUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes ctUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
  @keyframes ctSpin{ to { transform:rotate(360deg); } }

  .ct-card {
    animation: ctUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
    transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, border-color 0.3s ease;
  }
  .ct-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(18,218,168,0.15);
    border-color: rgba(18,218,168,0.22) !important;
  }

  .ct-btn-primary {
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .ct-btn-primary:hover {
    opacity: 0.86;
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(18,218,168,0.3);
  }
  .ct-btn-primary:active { transform: scale(0.97); }

  .ct-btn-ghost {
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }
  .ct-btn-ghost:hover {
    background: rgba(18,218,168,0.07) !important;
    border-color: rgba(18,218,168,0.35) !important;
    color: #12daa8 !important;
  }

  .ct-btn-remove {
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }
  .ct-btn-remove:hover {
    background: rgba(239,68,68,0.1) !important;
    border-color: rgba(239,68,68,0.35) !important;
    color: #f87171 !important;
  }

  .ct-qty-btn {
    transition: background 0.15s, color 0.15s;
  }
  .ct-qty-btn:hover:not(:disabled) {
    background: rgba(18,218,168,0.12) !important;
    color: #12daa8 !important;
  }
  .ct-qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  /* Page */
  page: {
    minHeight: "100vh",
    background: "#080808",
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    padding: "90px 5% 60px",
  },
  container: {
    maxWidth: "1400px",
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

  /* Layout */
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: "20px",
    alignItems: "start",
  },
  left: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  /* Coupon bar */
  couponBar: {
    background: "#0e0e0e",
    border: "1px solid #1a1a1a",
    borderRadius: "14px",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  couponLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  couponIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "1.5px solid rgba(18,218,168,0.4)",
    background: "rgba(18,218,168,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#12daa8",
    fontSize: "15px",
    fontWeight: "700",
  },
  couponText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#aaa",
  },
  couponArrow: {
    fontSize: "22px",
    color: "#333",
  },

  /* Cart card */
  card: {
    background: "#0e0e0e",
    border: "1px solid #1a1a1a",
    borderRadius: "18px",
    overflow: "hidden",
  },
  cardAccent: {
    height: "2px",
    background: "linear-gradient(to right, #12daa8, transparent)",
    opacity: 0.4,
  },
  itemRow: {
    display: "grid",
    gridTemplateColumns: "130px 1fr 200px",
    gap: "20px",
    padding: "20px 22px 22px",
    alignItems: "start",
  },

  /* Image */
  imgWrap: {
    width: "130px",
    height: "130px",
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    padding: "8px",
    boxSizing: "border-box",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  /* Middle */
  middle: { minWidth: 0 },
  productName: {
    margin: "0 0 10px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#e8e5e0",
    lineHeight: "1.5",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  starsRow: {
    display: "flex",
    gap: "2px",
    marginBottom: "10px",
  },
  deliveryPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#555",
    fontWeight: "400",
    marginBottom: "14px",
    background: "#111",
    padding: "4px 10px",
    borderRadius: "999px",
    border: "1px solid #1a1a1a",
  },
  deliveryDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#12daa8",
    flexShrink: 0,
  },

  /* Quantity */
  qtyRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
  },
  qtyLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#555",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  qtyBox: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #1e1e1e",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#111",
  },
  qtyBtn: {
    width: "34px",
    height: "34px",
    border: "none",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer",
    color: "#888",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
  },
  qtyNum: {
    minWidth: "36px",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "700",
    color: "#f5f5f2",
    borderLeft: "1px solid #1e1e1e",
    borderRight: "1px solid #1e1e1e",
    lineHeight: "34px",
  },
  qtyUpdating: {
    fontSize: "11px",
    color: "#12daa8",
    fontStyle: "italic",
    letterSpacing: "0.3px",
  },

  /* Actions */
  actionRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  btnWishlist: {
    padding: "9px 14px",
    borderRadius: "9px",
    border: "1px solid #1e1e1e",
    background: "transparent",
    color: "#666",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnRemove: {
    padding: "9px 14px",
    borderRadius: "9px",
    border: "1px solid #1e1e1e",
    background: "transparent",
    color: "#555",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  /* Price column */
  priceCol: {
    textAlign: "right",
    paddingTop: "2px",
  },
  itemPrice: {
    margin: "0 0 4px",
    fontFamily: "'Playfair Display', serif",
    fontSize: "22px",
    fontWeight: "700",
    color: "#f5f5f2",
    letterSpacing: "-0.5px",
  },
  itemTax: {
    margin: "0 0 10px",
    fontSize: "11px",
    color: "#333",
    fontWeight: "300",
  },
  priceDivider: {
    height: "1px",
    background: "#141414",
    margin: "8px 0",
  },
  itemMrp: {
    margin: "0 0 2px",
    fontSize: "12px",
    color: "#2a2a2a",
    textDecoration: "line-through",
  },
  itemSaving: {
    margin: "0 0 10px",
    fontSize: "12px",
    color: "#12daa8",
    fontWeight: "500",
  },
  emiPrice: {
    margin: "0 0 2px",
    fontFamily: "'Playfair Display', serif",
    fontSize: "16px",
    fontWeight: "700",
    color: "#888",
  },
  emiLabel: {
    margin: 0,
    fontSize: "11px",
    color: "#12daa8",
    fontWeight: "500",
    cursor: "pointer",
  },

  /* ── Summary ── */
  summary: {
    background: "#0e0e0e",
    border: "1px solid #1a1a1a",
    borderRadius: "20px",
    overflow: "hidden",
    position: "sticky",
    top: "90px",
  },
  summaryHead: {
    padding: "22px 22px 16px",
    borderBottom: "1px solid #141414",
    background: "linear-gradient(135deg, #0e0e0e, #111)",
  },
  summaryEye: {
    margin: "0 0 4px",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#12daa8",
  },
  summaryTitle: {
    margin: "0 0 4px",
    fontFamily: "'Playfair Display', serif",
    fontSize: "22px",
    fontWeight: "700",
    color: "#f5f5f2",
    letterSpacing: "-0.3px",
  },
  summaryCount: {
    margin: 0,
    fontSize: "12px",
    color: "#444",
    fontWeight: "300",
  },
  summaryBody: {
    padding: "18px 22px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  summaryLabel: {
    fontSize: "13px",
    color: "#555",
    fontWeight: "400",
  },
  summaryValue: {
    fontSize: "13px",
    color: "#aaa",
    fontWeight: "600",
  },
  summaryDivider: {
    height: "1px",
    background: "#141414",
    margin: "16px 0",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "16px",
  },
  totalLabel: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#e5e5e5",
  },
  totalValue: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "24px",
    fontWeight: "700",
    color: "#f5f5f2",
    letterSpacing: "-0.5px",
  },
  savingsBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(18,218,168,0.07)",
    border: "1px solid rgba(18,218,168,0.15)",
    borderRadius: "10px",
    padding: "10px 14px",
    marginBottom: "4px",
  },
  savingsIcon: { fontSize: "16px" },
  savingsText: {
    fontSize: "12px",
    color: "#888",
    fontWeight: "300",
    lineHeight: "1.5",
  },
  summaryFooter: {
    padding: "16px 22px 22px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    borderTop: "1px solid #141414",
  },
  checkoutBtn: {
    width: "100%",
    height: "48px",
    border: "none",
    borderRadius: "12px",
    background: "#12daa8",
    color: "#000",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.3px",
  },
  continueBtn: {
    width: "100%",
    height: "40px",
    border: "1px solid #1e1e1e",
    borderRadius: "12px",
    background: "transparent",
    color: "#555",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  /* Empty */
  emptyWrap: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#080808",
    padding: "20px",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  emptyGlow: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(18,218,168,0.05) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  emptyVideo: {
    width: "100%",
    maxWidth: "340px",
    borderRadius: "16px",
    marginBottom: "24px",
    position: "relative",
    zIndex: 2,
  },
  emptyEye: {
    margin: "0 0 8px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color: "#12daa8",
    position: "relative",
    zIndex: 2,
  },
  emptyTitle: {
    margin: "0 0 10px",
    fontFamily: "'Playfair Display', serif",
    fontSize: "36px",
    fontWeight: "900",
    color: "#f5f5f2",
    letterSpacing: "-0.5px",
    position: "relative",
    zIndex: 2,
  },
  emptySub: {
    color: "#555",
    fontSize: "15px",
    fontWeight: "300",
    marginBottom: "28px",
    position: "relative",
    zIndex: 2,
  },
  emptyBtn: {
    padding: "14px 28px",
    borderRadius: "10px",
    border: "none",
    background: "#12daa8",
    color: "#000",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    zIndex: 2,
  },

  /* Loading */
  loadWrap: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#080808",
    gap: "20px",
    fontFamily: "'DM Sans', sans-serif",
  },
  loadRing: {
    width: "38px",
    height: "38px",
    border: "2px solid #1a1a1a",
    borderTop: "2px solid #12daa8",
    borderRadius: "50%",
    animation: "ctSpin 0.9s linear infinite",
  },
  loadText: {
    color: "#444",
    fontSize: "14px",
    fontWeight: "300",
    letterSpacing: "1px",
    margin: 0,
  },
};