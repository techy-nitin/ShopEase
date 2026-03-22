import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "./config";
export default function SellerDashboard() {
  const navigate = useNavigate();

  const savedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const sellerId = savedUser?.id || Number(localStorage.getItem("userId")) || 0;
  const role = savedUser?.role || localStorage.getItem("role") || "";
  const localUserName = savedUser?.name || "Seller";

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    activeProducts: 0,
    storeName: "",
    address: "",
    phone: "",
    sellerStatus: "",
    sellerName: "",
    totalUnitsSold: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    recentOrders: [],
    topProducts: [],
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!sellerId) { navigate("/login"); return; }
    if (role !== "seller") { navigate("/"); return; }
    fetchDashboardData();
  }, [sellerId, role, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, productsRes] = await Promise.all([
        fetch(`${API_BASE}/api/seller/dashboard/${sellerId}`),
        fetch(`${API_BASE}/api/seller/products/${sellerId}`),
      ]);
      let d = {}, p = [];
      if (dashboardRes.ok) d = await dashboardRes.json();
      if (productsRes.ok) p = await productsRes.json();
      setStats({
        totalProducts: d.totalProducts || d.productsCount || d.productCount || 0,
        totalOrders: d.totalOrders || d.ordersCount || d.orderCount || 0,
        totalRevenue: d.totalRevenue || d.revenue || d.totalSales || 0,
        lowStockProducts: d.lowStockProducts || d.lowStock || 0,
        activeProducts: d.activeProducts || d.availableProducts || 0,
        storeName: d.storeName || "",
        address: d.address || "",
        phone: d.phone || "",
        sellerStatus: d.sellerStatus || "",
        sellerName: d.sellerName || "",
        totalUnitsSold: d.totalUnitsSold || 0,
        deliveredOrders: d.deliveredOrders || 0,
        pendingOrders: d.pendingOrders || 0,
        cancelledOrders: d.cancelledOrders || 0,
        recentOrders: Array.isArray(d.recentOrders) ? d.recentOrders : [],
        topProducts: Array.isArray(d.topProducts) ? d.topProducts : [],
      });
      setProducts(Array.isArray(p) ? p : []);
    } catch (err) {
      console.log("Dashboard fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    ["user", "token", "userId", "email", "role"].forEach((k) => localStorage.removeItem(k));
    navigate("/login");
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/seller/products/${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) { alert(data.message || "Deleted"); fetchDashboardData(); }
      else alert(data.error || "Failed to delete");
    } catch { alert("Something went wrong"); }
  };

  const handleExportProducts = () => window.open(`${API_BASE}/api/seller/export/products/${sellerId}`, "_blank");
  const handleExportOrders = () => window.open(`${API_BASE}/api/seller/export/orders/${sellerId}`, "_blank");

  const handleDeregisterSeller = async () => {
    if (!window.confirm("Deregister seller account? Make sure all products are deleted first.")) return;
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE}/api/seller/deregister/${sellerId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify({ ...savedUser, role: "user" }));
        localStorage.setItem("role", "user");
        alert(data.message || "Deregistered successfully");
        navigate("/");
      } else alert(data.error || "Failed to deregister");
    } catch { alert("Something went wrong"); }
    finally { setActionLoading(false); }
  };

  const statCards = [
    { label: "Total Products", value: stats.totalProducts, icon: "📦", color: "#4f46e5", bg: "#eef2ff" },
    { label: "Total Orders", value: stats.totalOrders, icon: "🛒", color: "#0891b2", bg: "#ecfeff" },
    { label: "Revenue", value: `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}`, icon: "💰", color: "#d97706", bg: "#fffbeb" },
    { label: "Units Sold", value: stats.totalUnitsSold, icon: "📈", color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Delivered", value: stats.deliveredOrders, icon: "✅", color: "#059669", bg: "#ecfdf5" },
    { label: "Low Stock", value: stats.lowStockProducts, icon: "⚠️", color: stats.lowStockProducts > 0 ? "#dc2626" : "#059669", bg: stats.lowStockProducts > 0 ? "#fef2f2" : "#ecfdf5" },
  ];

  return (
    <div style={s.page}>
      <style>{fonts + anims}</style>

      {/* Sidebar accent bar */}
      <div style={s.accentBar} />

      {/* Topbar */}
      <div style={s.topbar} className="fade-in">
        <div style={s.brandBlock}>
          <div style={s.brandIcon}>🏪</div>
          <div>
            <p style={s.brandLabel}>SELLER PORTAL</p>
            <h1 style={s.brandName}>{stats.storeName || "ShopEase Seller"}</h1>
            <p style={s.brandAddress}>{stats.address || "Address not set"}</p>
          </div>
        </div>

        <div style={s.topActions}>
          <div style={{ position: "relative" }}>
            <button
              style={s.ghostBtn}
              className="ghost-btn"
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
            >
              <span>👤</span> Seller Info
            </button>
            {showInfo && (
              <div
                style={s.infoCard}
                className="dropdown"
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
              >
                <p style={s.infoCardTitle}>Seller Details</p>
                {[
                  { label: "Seller ID", value: sellerId },
                  { label: "Role", value: role },
                  { label: "Status", value: stats.sellerStatus || "N/A" },
                  { label: "Phone", value: stats.phone || "N/A" },
                  { label: "Active Products", value: stats.activeProducts },
                  { label: "Low Stock", value: stats.lowStockProducts },
                ].map((row) => (
                  <div key={row.label} style={s.infoRow}>
                    <span style={s.infoLabel}>{row.label}</span>
                    <span style={s.infoValue}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button style={s.ghostBtn} className="ghost-btn" onClick={() => navigate("/")}>
            ← Back to Store
          </button>
          <button style={s.dangerBtn} className="danger-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Welcome banner */}
      <div style={s.banner} className="fade-in">
        <div>
          <p style={s.bannerEye}>Good day</p>
          <h2 style={s.bannerTitle}>Welcome back, {stats.sellerName || localUserName} 👋</h2>
          <p style={s.bannerSub}>Here's an overview of your store performance and inventory.</p>
        </div>
        <div style={s.bannerActions}>
          <button style={s.primaryBtn} className="primary-btn" onClick={() => navigate("/seller/add-product")}>
            + Add Product
          </button>
          <button style={s.outlineBtn} className="outline-btn" onClick={handleExportProducts}>
            Export Products
          </button>
          <button style={s.outlineBtn} className="outline-btn" onClick={handleExportOrders}>
            Export Orders
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={s.statGrid}>
        {statCards.map((card, i) => (
          <div key={card.label} className="stat-card" style={{ ...s.statCard, animationDelay: `${i * 0.07}s` }}>
            <div style={{ ...s.statIcon, background: card.bg, color: card.color }}>{card.icon}</div>
            <p style={s.statLabel}>{card.label}</p>
            <p style={{ ...s.statValue, color: card.color }}>{loading ? "—" : card.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={s.card} className="fade-in">
        <div style={s.cardHead}>
          <h3 style={s.cardTitle}>Quick Actions</h3>
        </div>
        <div style={s.quickGrid}>
          {[
            { label: "Add Product", icon: "➕", action: () => navigate("/seller/add-product"), danger: false },
            { label: "Export Products", icon: "📤", action: handleExportProducts, danger: false },
            { label: "Export Orders", icon: "🧾", action: handleExportOrders, danger: false },
            { label: "Refresh Data", icon: "🔄", action: fetchDashboardData, danger: false },
            { label: actionLoading ? "Processing…" : "Deregister", icon: "🗑️", action: handleDeregisterSeller, danger: true, disabled: actionLoading },
          ].map((btn) => (
            <button
              key={btn.label}
              style={btn.danger ? s.quickDanger : s.quickBtn}
              className={btn.danger ? "quick-danger" : "quick-btn"}
              onClick={btn.action}
              disabled={btn.disabled}
            >
              <span style={s.quickIcon}>{btn.icon}</span>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Two col: Orders + Top Products */}
      <div style={s.twoCol}>
        <div style={s.card} className="fade-in">
          <div style={s.cardHead}>
            <h3 style={s.cardTitle}>Recent Orders</h3>
            <span style={s.cardBadge}>{stats.recentOrders.length}</span>
          </div>
          {loading ? <Spinner /> : stats.recentOrders.length === 0 ? (
            <p style={s.emptyText}>No recent orders found.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["Order ID", "Date", "Amount", "Status"].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order, i) => (
                    <tr key={order.orderId || i} className="table-row">
                      <td style={s.td}><span style={s.tdId}>#{order.orderId}</span></td>
                      <td style={s.td}>{order.orderDate ? new Date(order.orderDate).toLocaleDateString("en-IN") : "—"}</td>
                      <td style={s.td}><strong>₹{order.totalAmount || 0}</strong></td>
                      <td style={s.td}><span style={getStatusStyle(order.status)}>{order.status || "PENDING"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={s.card} className="fade-in">
          <div style={s.cardHead}>
            <h3 style={s.cardTitle}>Top Products</h3>
          </div>
          {loading ? <Spinner /> : stats.topProducts.length === 0 ? (
            <p style={s.emptyText}>No product sales data.</p>
          ) : (
            <div style={s.topList}>
              {stats.topProducts.map((item, i) => (
                <div key={i} style={s.topRow}>
                  <span style={s.topRank}>#{i + 1}</span>
                  <div style={s.topInfo}>
                    <p style={s.topName}>{item.name}</p>
                    <div style={s.topBarWrap}>
                      <div style={{
                        ...s.topBarFill,
                        width: `${Math.min(100, (item.unitsSold / (stats.topProducts[0]?.unitsSold || 1)) * 100)}%`
                      }} />
                    </div>
                  </div>
                  <span style={s.topUnits}>{item.unitsSold} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div style={s.card} className="fade-in">
        <div style={s.cardHead}>
          <h3 style={s.cardTitle}>Your Inventory</h3>
          <button style={s.ghostBtn} className="ghost-btn" onClick={() => navigate("/seller/add-product")}>
            + Add New
          </button>
        </div>

        {loading ? <Spinner /> : products.length === 0 ? (
          <p style={s.emptyText}>No products found for this seller.</p>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["ID", "Product Name", "Price", "Stock", "Category", "Actions"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => (
                  <tr key={product.id || i} className="table-row">
                    <td style={s.td}><span style={s.tdId}>#{product.id}</span></td>
                    <td style={s.td}><span style={s.productName}>{product.name || product.productName || "—"}</span></td>
                    <td style={s.td}><span style={s.price}>₹{product.price ?? product.discountPrice ?? 0}</span></td>
                    <td style={s.td}><span style={getStockStyle(product.stock)}>{product.stock ?? 0}</span></td>
                    <td style={s.td}><span style={s.category}>{product.category || product.categoryId || "General"}</span></td>
                    <td style={s.td}>
                      <div style={s.actionWrap}>
                        <button style={s.editBtn} className="edit-btn" onClick={() => navigate(`/seller/edit-product/${product.id}`)}>Edit</button>
                        <button style={s.deleteBtn} className="delete-btn" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
      <div style={{
        width: "32px", height: "32px",
        border: "3px solid #e5e7eb",
        borderTop: "3px solid #4f46e5",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
    </div>
  );
}

function getStockStyle(stock) {
  const base = { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", display: "inline-block" };
  return (stock ?? 0) <= 5
    ? { ...base, background: "#fef2f2", color: "#dc2626" }
    : { ...base, background: "#ecfdf5", color: "#059669" };
}

function getStatusStyle(status) {
  const base = { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", display: "inline-block" };
  const map = {
    DELIVERED: { background: "#ecfdf5", color: "#059669" },
    CANCELLED: { background: "#fef2f2", color: "#dc2626" },
    SHIPPED:   { background: "#eff6ff", color: "#2563eb" },
    CONFIRMED: { background: "#f5f3ff", color: "#7c3aed" },
  };
  return { ...base, ...(map[status] || { background: "#fffbeb", color: "#d97706" }) };
}

const fonts = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
`;

const anims = `
  * { box-sizing: border-box; }

  .fade-in { animation: fadeUp 0.5s ease both; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: none; }
  }

  .stat-card {
    animation: fadeUp 0.5s ease both;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.10);
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .ghost-btn { transition: all 0.15s ease; }
  .ghost-btn:hover { background: #f1f5f9 !important; color: #1e293b !important; }

  .danger-btn { transition: all 0.15s ease; }
  .danger-btn:hover { background: #dc2626 !important; color: white !important; }

  .primary-btn { transition: all 0.15s ease; }
  .primary-btn:hover { background: #4338ca !important; transform: translateY(-1px); }

  .outline-btn { transition: all 0.15s ease; }
  .outline-btn:hover { background: #f8fafc !important; }

  .table-row { transition: background 0.15s ease; }
  .table-row:hover td { background: #f8fafc !important; }

  .quick-btn, .quick-danger { transition: all 0.15s ease; }
  .quick-btn:hover { background: #eff6ff !important; border-color: #bfdbfe !important; }
  .quick-danger:hover { background: #fef2f2 !important; border-color: #fecaca !important; }

  .edit-btn { transition: all 0.15s ease; }
  .edit-btn:hover { background: #4f46e5 !important; color: white !important; }

  .delete-btn { transition: all 0.15s ease; }
  .delete-btn:hover { background: #dc2626 !important; color: white !important; }

  .dropdown { animation: dropDown 0.18s ease both; }
  @keyframes dropDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: none; }
  }

  @media (max-width: 1024px) {
    .sd-two-col { grid-template-columns: 1fr !important; }
  }
`;

const s = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#1e293b",
    fontFamily: "'DM Sans', sans-serif",
    padding: "90px 40px 60px",
  },

  accentBar: {
    position: "fixed",
    top: 0, left: 0,
    width: "4px",
    height: "100vh",
    background: "linear-gradient(180deg, #4f46e5, #7c3aed, #0891b2)",
    zIndex: 100,
  },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "28px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e2e8f0",
    position: "relative",
    zIndex: 200,
  },

  brandBlock: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  brandIcon: {
    width: "52px", height: "52px",
    borderRadius: "14px",
    background: "#eef2ff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
  },

  brandLabel: {
    margin: "0 0 2px",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "2px",
    color: "#4f46e5",
    textTransform: "uppercase",
  },

  brandName: {
    margin: "0 0 2px",
    fontFamily: "'DM Serif Display', serif",
    fontSize: "clamp(22px, 2.5vw, 30px)",
    fontWeight: "400",
    color: "#0f172a",
  },

  brandAddress: {
    margin: 0,
    fontSize: "13px",
    color: "#94a3b8",
  },

  topActions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  ghostBtn: {
    padding: "9px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#475569",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  dangerBtn: {
    padding: "9px 16px",
    borderRadius: "10px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
  },

  infoCard: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    width: "260px",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
    zIndex: 9999,
  },

  infoCardTitle: {
    margin: "0 0 10px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#4f46e5",
    paddingBottom: "10px",
    borderBottom: "1px solid #f1f5f9",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #f8fafc",
    gap: "8px",
  },

  infoLabel: { fontSize: "12px", color: "#94a3b8", fontWeight: "500" },
  infoValue: { fontSize: "12px", color: "#1e293b", fontWeight: "700", textAlign: "right", wordBreak: "break-word", maxWidth: "140px" },

  banner: {
    background: "linear-gradient(135deg, #eef2ff 0%, #f0fdf4 100%)",
    border: "1px solid #e0e7ff",
    borderRadius: "20px",
    padding: "28px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "24px",
    position: "relative",
    zIndex: 1,
  },

  bannerEye: {
    margin: "0 0 4px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    color: "#7c3aed",
    textTransform: "uppercase",
  },

  bannerTitle: {
    margin: "0 0 6px",
    fontFamily: "'DM Serif Display', serif",
    fontSize: "clamp(22px, 2.2vw, 30px)",
    fontWeight: "400",
    color: "#0f172a",
  },

  bannerSub: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
  },

  bannerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  primaryBtn: {
    padding: "11px 20px",
    borderRadius: "10px",
    border: "none",
    background: "#4f46e5",
    color: "white",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  outlineBtn: {
    padding: "11px 18px",
    borderRadius: "10px",
    border: "1px solid #c7d2fe",
    background: "white",
    color: "#4f46e5",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },

  statCard: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  statIcon: {
    width: "40px", height: "40px",
    borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "18px",
    marginBottom: "12px",
  },

  statLabel: {
    margin: "0 0 6px",
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  statValue: {
    margin: 0,
    fontFamily: "'DM Serif Display', serif",
    fontSize: "26px",
    fontWeight: "400",
    lineHeight: 1,
  },

  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "22px 24px",
    marginBottom: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },

  cardHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    flexWrap: "wrap",
    gap: "10px",
  },

  cardTitle: {
    margin: 0,
    fontFamily: "'DM Serif Display', serif",
    fontSize: "20px",
    fontWeight: "400",
    color: "#0f172a",
  },

  cardBadge: {
    padding: "4px 10px",
    borderRadius: "999px",
    background: "#eef2ff",
    color: "#4f46e5",
    fontSize: "12px",
    fontWeight: "700",
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "12px",
  },

  quickBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
  },

  quickDanger: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
  },

  quickIcon: { fontSize: "18px" },

  twoCol: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "16px",
    marginBottom: "0",
  },

  tableWrap: { width: "100%", overflowX: "auto" },

  table: { width: "100%", borderCollapse: "collapse" },

  th: {
    textAlign: "left",
    padding: "10px 14px",
    borderBottom: "2px solid #f1f5f9",
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    background: "#fafafa",
  },

  td: {
    padding: "14px 14px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "13px",
    color: "#475569",
    verticalAlign: "middle",
  },

  tdId: { color: "#94a3b8", fontSize: "12px", fontWeight: "700" },

  productName: { color: "#0f172a", fontWeight: "600" },

  price: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "16px",
    color: "#d97706",
  },

  category: {
    padding: "4px 10px",
    borderRadius: "6px",
    background: "#f1f5f9",
    color: "#475569",
    fontSize: "11px",
    fontWeight: "600",
  },

  actionWrap: { display: "flex", gap: "6px", flexWrap: "wrap" },

  editBtn: {
    padding: "7px 14px",
    borderRadius: "8px",
    border: "1px solid #c7d2fe",
    background: "#eef2ff",
    color: "#4f46e5",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
    fontFamily: "'DM Sans', sans-serif",
  },

  deleteBtn: {
    padding: "7px 14px",
    borderRadius: "8px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
    fontFamily: "'DM Sans', sans-serif",
  },

  topList: { display: "flex", flexDirection: "column", gap: "14px" },

  topRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  topRank: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "16px",
    color: "#4f46e5",
    width: "28px",
    flexShrink: 0,
  },

  topInfo: { flex: 1, minWidth: 0 },

  topName: {
    margin: "0 0 6px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  topBarWrap: {
    height: "5px",
    background: "#f1f5f9",
    borderRadius: "999px",
    overflow: "hidden",
  },

  topBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
    borderRadius: "999px",
    transition: "width 0.4s ease",
  },

  topUnits: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  emptyText: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: "8px 0",
  },
};