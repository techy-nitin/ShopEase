import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CheckoutOrder() {
  const navigate = useNavigate();

  const [cartItems, setCartItems]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "", phone: "", address: "",
    city: "", state: "", pincode: "",
    paymentMethod: "COD",
  });

  const getLoggedInUser = () => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } };
  const getUserId       = () => getLoggedInUser()?.id;

  useEffect(() => { fetchCheckoutItems(); }, []);

  const fetchCheckoutItems = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) { setCartItems([]); return; }

      const res      = await fetch(`http://localhost:8081/api/cart/${userId}`);
      const cartRows = await res.json();
      if (!res.ok) throw new Error(cartRows.error || "Failed to fetch cart");

      const fullCartData = await Promise.all(
        (Array.isArray(cartRows) ? cartRows : []).map(async (item) => {
          try {
            const productRes  = await fetch(`http://localhost:8081/api/products/${item.productId}`);
            const productData = await productRes.json();
            if (!productRes.ok) throw new Error("Failed to fetch product");
            const product = productData.product || {};
            const images  = productData.images  || [];
            return {
              id: item.id, productId: item.productId,
              quantity: Number(item.quantity || 1),
              price:    Number(product.price || 0),
              name:     product.name || "No Product Name",
              imageUrl: images.length > 0 ? images[0].imageUrl : "https://via.placeholder.com/120x120?text=No+Image",
            };
          } catch {
            return { id: item.id, productId: item.productId, quantity: Number(item.quantity || 1), price: 0, name: "Product unavailable", imageUrl: "https://via.placeholder.com/120x120?text=No+Image" };
          }
        })
      );
      setCartItems(fullCartData);
    } catch { setCartItems([]); }
    finally { setLoading(false); }
  };

  const subtotal      = useMemo(() => cartItems.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 1), 0), [cartItems]);
  const totalAmount   = subtotal;
  const totalItems    = cartItems.reduce((s, i) => s + Number(i.quantity || 1), 0);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePlaceOrder = async () => {
    try {
      const userId = getUserId();
      if (!userId)              { alert("Please login first"); return; }
      if (cartItems.length === 0) { alert("Your cart is empty"); return; }
      const { fullName, phone, address, city, state, pincode } = formData;
      if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
        alert("Please fill all delivery details"); return;
      }
      setPlacingOrder(true);
      const res = await fetch("http://localhost:8081/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: Number(userId), totalAmount: Number(totalAmount),
          items: cartItems.map((i) => ({ productId: Number(i.productId), quantity: Number(i.quantity), price: Number(i.price) })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");
      alert("Order placed successfully");
      navigate("/orders");
    } catch (err) { alert(err.message || "Failed to place order"); }
    finally { setPlacingOrder(false); }
  };

  const paymentOptions = [
    { value: "COD",  icon: "💵", label: "Cash on Delivery",    desc: "Pay when your order arrives" },
    { value: "UPI",  icon: "📱", label: "UPI",                 desc: "Google Pay, PhonePe, Paytm"  },
    { value: "CARD", icon: "💳", label: "Debit / Credit Card", desc: "All major cards accepted"     },
  ];

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={s.loadWrap}>
        <style>{fonts + anims}</style>
        <div style={s.loadRing} />
        <p style={s.loadText}>Loading checkout…</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={s.loadWrap}>
        <style>{fonts + anims}</style>
        <p style={{ color: "#555", fontFamily: "'DM Sans',sans-serif", fontStyle: "italic" }}>Your cart is empty.</p>
        <button style={s.backBtn} className="co-btn-primary" onClick={() => navigate("/")}>Go Shopping</button>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{fonts + anims}</style>

      <div style={s.container}>

        {/* Header */}
        <div style={s.header} className="co-fade-in">
          <div>
            <p style={s.headerEye}>Almost there</p>
            <h1 style={s.headerTitle}>Checkout</h1>
          </div>
          <div style={s.stepPills}>
            {["Cart", "Checkout", "Confirm"].map((step, i) => (
              <React.Fragment key={step}>
                <div style={{ ...s.stepPill, background: i === 1 ? "#12daa8" : "transparent", color: i === 1 ? "#000" : "#333", borderColor: i === 1 ? "#12daa8" : "#1e1e1e" }}>
                  <span style={{ ...s.stepNum, background: i === 1 ? "rgba(0,0,0,0.2)" : "#111" }}>{i + 1}</span>
                  {step}
                </div>
                {i < 2 && <span style={s.stepSep}>›</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div style={s.layout}>

          {/* ── LEFT col ── */}
          <div style={s.leftCol}>

            {/* Delivery card */}
            <div style={s.card} className="co-fade-in">
              <div style={s.cardHead}>
                <span style={s.cardHeadIcon}>◎</span>
                <div>
                  <p style={s.cardEye}>Step 01</p>
                  <h2 style={s.cardTitle}>Delivery Details</h2>
                </div>
              </div>

              <div style={s.ruleTeal} />

              <div style={s.grid2}>
                <div style={s.fieldWrap}>
                  <label style={s.fieldLabel}>Full Name</label>
                  <input className="co-input" style={s.input} type="text" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} />
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.fieldLabel}>Phone Number</label>
                  <input className="co-input" style={s.input} type="text" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} />
                </div>
              </div>

              <div style={s.fieldWrap}>
                <label style={s.fieldLabel}>Full Address</label>
                <textarea className="co-input" style={s.textarea} name="address" placeholder="House / Flat no., Street, Area…" value={formData.address} onChange={handleChange} />
              </div>

              <div style={s.grid2}>
                <div style={s.fieldWrap}>
                  <label style={s.fieldLabel}>City</label>
                  <input className="co-input" style={s.input} type="text" name="city" placeholder="Mumbai" value={formData.city} onChange={handleChange} />
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.fieldLabel}>State</label>
                  <input className="co-input" style={s.input} type="text" name="state" placeholder="Maharashtra" value={formData.state} onChange={handleChange} />
                </div>
              </div>

              <div style={s.fieldWrap}>
                <label style={s.fieldLabel}>Pincode</label>
                <input className="co-input" style={{ ...s.input, maxWidth: "200px" }} type="text" name="pincode" placeholder="400001" value={formData.pincode} onChange={handleChange} />
              </div>
            </div>

            {/* Payment card */}
            <div style={s.card} className="co-fade-in">
              <div style={s.cardHead}>
                <span style={s.cardHeadIcon}>◈</span>
                <div>
                  <p style={s.cardEye}>Step 02</p>
                  <h2 style={s.cardTitle}>Payment Method</h2>
                </div>
              </div>

              <div style={s.ruleTeal} />

              <div style={s.paymentGrid}>
                {paymentOptions.map((opt) => {
                  const active = formData.paymentMethod === opt.value;
                  return (
                    <label
                      key={opt.value}
                      style={{
                        ...s.paymentCard,
                        borderColor:  active ? "#12daa8" : "#1a1a1a",
                        background:   active ? "rgba(18,218,168,0.06)" : "#111",
                        boxShadow:    active ? "0 0 0 1px #12daa8" : "none",
                        cursor: "pointer",
                      }}
                    >
                      <input type="radio" name="paymentMethod" value={opt.value} checked={active} onChange={handleChange} style={{ display: "none" }} />
                      <div style={s.paymentCardTop}>
                        <span style={s.paymentIcon}>{opt.icon}</span>
                        <div style={{ ...s.paymentRadio, borderColor: active ? "#12daa8" : "#333", background: active ? "#12daa8" : "transparent" }}>
                          {active && <span style={s.paymentRadioDot} />}
                        </div>
                      </div>
                      <p style={{ ...s.paymentLabel, color: active ? "#12daa8" : "#aaa" }}>{opt.label}</p>
                      <p style={s.paymentDesc}>{opt.desc}</p>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Items card */}
            <div style={s.card} className="co-fade-in">
              <div style={s.cardHead}>
                <span style={s.cardHeadIcon}>◉</span>
                <div>
                  <p style={s.cardEye}>Step 03</p>
                  <h2 style={s.cardTitle}>Order Items</h2>
                </div>
              </div>

              <div style={s.ruleTeal} />

              {cartItems.map((item, i) => (
                <div key={item.id} style={{ ...s.productRow, borderBottom: i < cartItems.length - 1 ? "1px solid #141414" : "none" }}>
                  <div style={s.productImgWrap}>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={s.productImg}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/120x120?text=No+Image"; }}
                    />
                  </div>
                  <div style={s.productInfo}>
                    <p style={s.productName}>{item.name}</p>
                    <p style={s.productQty}>Quantity: {item.quantity}</p>
                  </div>
                  <div style={s.productPrice}>
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: summary ── */}
          <div style={s.summaryCard} className="co-fade-in">

            <div style={s.summaryHead}>
              <p style={s.summaryEye}>Billing</p>
              <h2 style={s.summaryTitle}>Order Summary</h2>
              <p style={s.summaryMeta}>{cartItems.length} product{cartItems.length > 1 ? "s" : ""} · {totalItems} item{totalItems > 1 ? "s" : ""}</p>
            </div>

            <div style={s.summaryBody}>
              {cartItems.map((item) => (
                <div key={item.id} style={s.summaryItem}>
                  <span style={s.summaryItemName}>{item.name.length > 28 ? item.name.substring(0, 28) + "…" : item.name}</span>
                  <span style={s.summaryItemPrice}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}

              <div style={s.summaryDivider} />

              <div style={s.summaryRow}>
                <span style={s.summaryLabel}>Subtotal</span>
                <span style={s.summaryValue}>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div style={s.summaryRow}>
                <span style={s.summaryLabel}>Delivery</span>
                <span style={{ ...s.summaryValue, color: "#12daa8" }}>Free</span>
              </div>

              <div style={s.summaryDivider} />

              <div style={s.totalRow}>
                <span style={s.totalLabel}>Total</span>
                <span style={s.totalValue}>₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>

              {/* Payment method badge */}
              <div style={s.payMethodBadge}>
                <span style={s.payMethodIcon}>
                  {paymentOptions.find((p) => p.value === formData.paymentMethod)?.icon}
                </span>
                <span style={s.payMethodText}>
                  {paymentOptions.find((p) => p.value === formData.paymentMethod)?.label}
                </span>
              </div>
            </div>

            <div style={s.summaryFooter}>
              <button
                style={{ ...s.placeBtn, opacity: placingOrder ? 0.7 : 1 }}
                className="co-btn-primary"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
              >
                {placingOrder ? "Placing Order…" : "Place Order →"}
              </button>
              <p style={s.secureNote}>🔒 Secure & encrypted checkout</p>
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
  .co-fade-in { animation: coUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes coUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
  @keyframes coSpin{ to { transform:rotate(360deg); } }

  .co-input { transition: border-color 0.2s, box-shadow 0.2s; }
  .co-input:focus { outline: none; border-color: rgba(18,218,168,0.5) !important; box-shadow: 0 0 0 3px rgba(18,218,168,0.07) !important; }
  .co-input::placeholder { color: #2a2a2a; }

  .co-btn-primary { transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s; }
  .co-btn-primary:hover:not(:disabled) { opacity:0.86; transform:translateY(-1px); box-shadow:0 8px 28px rgba(18,218,168,0.3); }
  .co-btn-primary:active { transform: scale(0.97); }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#080808",
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    padding: "90px 5% 60px",
  },
  container: {
    maxWidth: "1360px",
    margin: "0 auto",
  },

  /* Header */
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "20px",
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
  stepPills: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
  },
  stepPill: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: "600",
    fontFamily: "'DM Sans', sans-serif",
  },
  stepNum: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "700",
    color: "#fff",
  },
  stepSep: {
    color: "#222",
    fontSize: "16px",
  },

  /* Layout */
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    gap: "20px",
    alignItems: "start",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  /* Card */
  card: {
    background: "#0e0e0e",
    border: "1px solid #1a1a1a",
    borderRadius: "20px",
    padding: "24px",
  },
  cardHead: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "16px",
  },
  cardHeadIcon: {
    fontSize: "22px",
    color: "#12daa8",
    marginTop: "2px",
    flexShrink: 0,
  },
  cardEye: {
    margin: "0 0 3px",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "#12daa8",
  },
  cardTitle: {
    margin: 0,
    fontFamily: "'Playfair Display', serif",
    fontSize: "20px",
    fontWeight: "700",
    color: "#f5f5f2",
    letterSpacing: "-0.3px",
  },
  ruleTeal: {
    height: "1px",
    background: "linear-gradient(to right, #12daa8, transparent)",
    opacity: 0.2,
    marginBottom: "20px",
  },

  /* Form */
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "14px",
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
  },
  fieldLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#444",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #1e1e1e",
    background: "#111",
    color: "#e5e5e5",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: "90px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #1e1e1e",
    background: "#111",
    color: "#e5e5e5",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    resize: "vertical",
    boxSizing: "border-box",
  },

  /* Payment */
  paymentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  paymentCard: {
    borderRadius: "14px",
    border: "1px solid",
    padding: "16px 14px",
    transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  paymentCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  paymentIcon: {
    fontSize: "22px",
    lineHeight: 1,
  },
  paymentRadio: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    flexShrink: 0,
  },
  paymentRadioDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#000",
  },
  paymentLabel: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "600",
    transition: "color 0.2s",
  },
  paymentDesc: {
    margin: 0,
    fontSize: "11px",
    color: "#333",
    fontWeight: "300",
  },

  /* Product rows */
  productRow: {
    display: "grid",
    gridTemplateColumns: "80px 1fr auto",
    gap: "14px",
    alignItems: "center",
    padding: "14px 0",
  },
  productImgWrap: {
    width: "80px",
    height: "80px",
    background: "#fff",
    borderRadius: "10px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
    boxSizing: "border-box",
    flexShrink: 0,
  },
  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  productInfo: { minWidth: 0 },
  productName: {
    margin: "0 0 4px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#c0bdb8",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  productQty: {
    margin: 0,
    fontSize: "11px",
    color: "#444",
    fontWeight: "400",
  },
  productPrice: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "16px",
    fontWeight: "700",
    color: "#f5f5f2",
    whiteSpace: "nowrap",
  },

  /* Summary card */
  summaryCard: {
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
  summaryMeta: {
    margin: 0,
    fontSize: "12px",
    color: "#444",
    fontWeight: "300",
  },
  summaryBody: {
    padding: "18px 22px",
  },
  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    gap: "8px",
  },
  summaryItemName: {
    fontSize: "12px",
    color: "#444",
    fontWeight: "300",
    flex: 1,
  },
  summaryItemPrice: {
    fontSize: "12px",
    color: "#666",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  summaryDivider: {
    height: "1px",
    background: "#141414",
    margin: "14px 0",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
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
    fontSize: "26px",
    fontWeight: "700",
    color: "#f5f5f2",
    letterSpacing: "-0.5px",
  },
  payMethodBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(18,218,168,0.06)",
    border: "1px solid rgba(18,218,168,0.15)",
    borderRadius: "10px",
    padding: "10px 14px",
  },
  payMethodIcon: { fontSize: "16px" },
  payMethodText: {
    fontSize: "12px",
    color: "#12daa8",
    fontWeight: "600",
  },
  summaryFooter: {
    padding: "16px 22px 22px",
    borderTop: "1px solid #141414",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  placeBtn: {
    width: "100%",
    height: "50px",
    border: "none",
    borderRadius: "12px",
    background: "#12daa8",
    color: "#000",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.3px",
    transition: "opacity 0.2s",
  },
  secureNote: {
    margin: 0,
    textAlign: "center",
    fontSize: "11px",
    color: "#333",
    fontWeight: "300",
    letterSpacing: "0.3px",
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
    animation: "coSpin 0.9s linear infinite",
  },
  loadText: {
    color: "#444",
    fontSize: "14px",
    fontWeight: "300",
    letterSpacing: "1px",
    margin: 0,
  },
  backBtn: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    background: "#12daa8",
    color: "#000",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
};