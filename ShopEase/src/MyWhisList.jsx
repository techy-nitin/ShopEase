import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Photo from "./assets/emptty.png";
import { API_BASE } from "./config";
// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ rating, reviews }) => (
  <div style={s.ratingRow}>
    <div style={s.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ ...s.star, color: star <= rating ? "#12daa8" : "#2a2a2a" }}>★</span>
      ))}
    </div>
    <span style={s.reviewCount}>({reviews} reviews)</span>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyWishlist = () => {
  const navigate = useNavigate();
  return (
    <div style={s.emptyWrap}>
      <style>{fonts + anims}</style>
      <div style={s.emptyGlow} />
      <div style={s.emptyInner} className="wl-fade-in">
        <img src={Photo} alt="Empty wishlist" style={s.emptyImg} />
        <p style={s.emptyEye}>WISHLIST</p>
        <h2 style={s.emptyTitle}>Nothing saved yet</h2>
        <p style={s.emptySub}>Browse products and tap the heart to save them here.</p>
        <button style={s.emptyBtn} className="wl-btn-teal" onClick={() => navigate("/")}>
          Start Exploring →
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Wishlist() {
  const [wishlistData, setWishlistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const getLoggedInUser = () => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  };
  const getUserId = () => getLoggedInUser()?.id;

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) { setWishlistData([]); return; }

      const res = await fetch(`${API_BASE}/wishlist/${userId}`);
      const wishlistItems = await res.json();
      if (!res.ok) throw new Error(wishlistItems.error || "Failed to fetch");

      const fullData = await Promise.all(
        wishlistItems.map(async (item) => {
          try {
            const productRes = await fetch(`${API_BASE}/api/products/${item.productId}`);
            const productData = await productRes.json();
            if (!productRes.ok) throw new Error("Failed to fetch product");

            const product = productData.product || {};
            const images  = productData.images  || [];
            const reviews = productData.reviews || [];

            const actualPrice = Number(product.price || 0);
            let discount = 0;
            if      (actualPrice <= 10000) discount = 500;
            else if (actualPrice <= 30000) discount = 1500;
            else if (actualPrice <= 60000) discount = 3000;
            else                           discount = 5000;

            const oldPrice        = actualPrice + discount;
            const discountPercent = oldPrice ? ((discount / oldPrice) * 100).toFixed(1) : 0;
            const avgRating       = reviews.length
              ? Math.round(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length)
              : 0;

            return {
              id: item.id, userId: item.userId, productId: item.productId,
              name:     product.name || "No Product Name",
              image:    images.length > 0 ? images[0].imageUrl : "https://via.placeholder.com/200x200?text=No+Image",
              newPrice: `₹${actualPrice.toLocaleString("en-IN")}`,
              oldPrice: `₹${oldPrice.toLocaleString("en-IN")}`,
              discount: `${discountPercent}% OFF`,
              rating:   avgRating,
              reviews:  reviews.length,
              addedOn:  item.addedIt ? item.addedIt.split("T")[0] : "Recently",
              link:     `/product/${item.productId}`,
            };
          } catch { return null; }
        })
      );
      setWishlistData(fullData.filter(Boolean));
    } catch { setWishlistData([]); }
    finally { setLoading(false); }
  };

  const handleAddToCart = async (item) => {
    try {
      setActionLoading(`cart-${item.productId}`);
      const userId = getUserId();
      if (!userId) { alert("Please login first"); return; }

      const res = await fetch(`${API_BASE}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(userId), productId: Number(item.productId), quantity: 1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to add to cart");

      await fetch(`${API_BASE}/wishlist/remove?userid=${userId}&productId=${item.productId}`, { method: "DELETE" });
      setWishlistData((prev) => prev.filter((w) => w.productId !== item.productId));
    } catch (err) { alert(err.message || "Failed to add to cart"); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (item) => {
    try {
      setActionLoading(`del-${item.productId}`);
      const userId = getUserId();
      if (!userId) { alert("Please login first"); return; }

      const res = await fetch(`${API_BASE}/wishlist/remove?userid=${userId}&productId=${item.productId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setWishlistData((prev) => prev.filter((w) => w.productId !== item.productId));
    } catch (err) { alert(err.message || "Failed to delete"); }
    finally { setActionLoading(null); }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={s.loadWrap}>
        <style>{fonts + anims}</style>
        <div style={s.loadRing} />
        <p style={s.loadText}>Loading your wishlist…</p>
      </div>
    );
  }

  if (wishlistData.length === 0) return <EmptyWishlist />;

  // ── Page ──────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <style>{fonts + anims}</style>

      <div style={s.container}>

        {/* Header */}
        <div style={s.header} className="wl-fade-in">
          <div>
            <p style={s.headerEye}>My Collection</p>
            <h1 style={s.headerTitle}>Wishlist</h1>
            <p style={s.headerSub}>Products you love, saved for later.</p>
          </div>
          <div style={s.headerBadge}>
            <span style={s.headerBadgeNum}>{wishlistData.length}</span>
            <span style={s.headerBadgeLbl}>items</span>
          </div>
        </div>

        {/* Divider */}
        <div style={s.divider} />

        {/* Grid */}
        <div style={s.grid}>
          {wishlistData.map((item, i) => (
            <div
              key={item.id}
              className="wl-card"
              style={{ ...s.card, animationDelay: `${i * 0.07}s` }}
            >
              {/* Teal bar on hover */}
              <div className="wl-card-bar" style={s.cardBar} />

              {/* Image */}
              <Link to={item.link} style={s.imgLink}>
                <div style={s.imgWrap}>
                  <img
                    className="wl-card-img"
                    src={item.image}
                    alt={item.name}
                    style={s.img}
                  />
                </div>
              </Link>

              {/* Body */}
              <div style={s.cardBody}>

                {/* Index */}
                <span style={s.cardIdx}>{String(i + 1).padStart(2, "0")}</span>

                {/* Name */}
                <Link to={item.link} style={{ textDecoration: "none" }}>
                  <h3 style={s.cardName}>{item.name}</h3>
                </Link>

                <p style={s.cardId}>ID #{item.productId}</p>

                {/* Price row */}
                <div style={s.priceRow}>
                  <span style={s.newPrice}>{item.newPrice}</span>
                  <span style={s.oldPrice}>{item.oldPrice}</span>
                  <span style={s.discBadge}>{item.discount}</span>
                </div>

                {/* Rating + date */}
                <div style={s.metaRow}>
                  <StarRating rating={item.rating} reviews={item.reviews} />
                  <span style={s.addedDate}>Added {item.addedOn}</span>
                </div>

                {/* Actions */}
                <div style={s.actions}>
                  <button
                    className="wl-btn-teal"
                    style={s.btnCart}
                    onClick={() => handleAddToCart(item)}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === `cart-${item.productId}` ? "Adding…" : "Move to Cart →"}
                  </button>
                  <button
                    className="wl-btn-del"
                    style={s.btnDel}
                    onClick={() => handleDelete(item)}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === `del-${item.productId}` ? "…" : "✕"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Fonts ────────────────────────────────────────────────────────────────────
const fonts = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');`;

// ─── Animations ──────────────────────────────────────────────────────────────
const anims = `
  .wl-fade-in { animation: wlUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes wlUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
  @keyframes wlSpin { to { transform:rotate(360deg); } }

  .wl-card {
    animation: wlUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
    transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, border-color 0.3s ease;
    position: relative; overflow: hidden;
  }
  .wl-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 28px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(18,218,168,0.18);
    border-color: rgba(18,218,168,0.28) !important;
  }
  .wl-card-bar {
    position:absolute; top:0; left:0; right:0; height:2px;
    background:#12daa8;
    transform:scaleX(0); transform-origin:left;
    transition:transform 0.35s cubic-bezier(0.16,1,0.3,1);
  }
  .wl-card:hover .wl-card-bar { transform:scaleX(1); }
  .wl-card-img { transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
  .wl-card:hover .wl-card-img { transform:scale(1.06); }

  .wl-btn-teal {
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .wl-btn-teal:hover {
    opacity: 0.85;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(18,218,168,0.3);
  }
  .wl-btn-teal:active { transform:scale(0.97); }

  .wl-btn-del {
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }
  .wl-btn-del:hover {
    background: rgba(239,68,68,0.15) !important;
    border-color: rgba(239,68,68,0.4) !important;
    color: #f87171 !important;
  }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  /* Page */
  page: {
    minHeight: "100vh",
    background: "#080808",
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    paddingTop: "80px",
    paddingBottom: "80px",
  },
  container: {
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "0 6%",
  },

  /* Header */
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "20px",
  },
  headerEye: {
    margin: "0 0 8px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color: "#12daa8",
  },
  headerTitle: {
    margin: "0 0 8px",
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(36px, 5vw, 58px)",
    fontWeight: "900",
    letterSpacing: "-1.5px",
    color: "#f5f5f2",
    lineHeight: 1,
  },
  headerSub: {
    margin: 0,
    fontSize: "14px",
    color: "#555",
    fontWeight: "300",
  },
  headerBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    border: "1.5px solid rgba(18,218,168,0.3)",
    background: "rgba(18,218,168,0.06)",
    flexShrink: 0,
  },
  headerBadgeNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "26px",
    fontWeight: "900",
    color: "#12daa8",
    lineHeight: 1,
  },
  headerBadgeLbl: {
    fontSize: "10px",
    color: "#555",
    fontWeight: "500",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },

  divider: {
    height: "1px",
    background: "linear-gradient(to right, #12daa8, transparent)",
    marginBottom: "40px",
    opacity: 0.3,
  },

  /* Grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "20px",
  },

  /* Card */
  card: {
    background: "#111",
    border: "1px solid #1c1c1c",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  cardBar: {},  /* CSS-only via .wl-card-bar class */

  imgLink: { display: "block" },
  imgWrap: {
    width: "100%",
    height: "220px",
    background: "#fff",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "16px",
    boxSizing: "border-box",
  },

  cardBody: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
    position: "relative",
  },
  cardIdx: {
    position: "absolute",
    top: "18px",
    right: "20px",
    fontFamily: "'Playfair Display', serif",
    fontSize: "12px",
    fontWeight: "700",
    color: "#222",
    letterSpacing: "1px",
  },
  cardName: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    color: "#e8e5e0",
    lineHeight: "1.5",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    paddingRight: "32px",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
  },
  cardId: {
    margin: 0,
    fontSize: "11px",
    color: "#333",
    fontWeight: "500",
    letterSpacing: "0.5px",
  },

  /* Price */
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  newPrice: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "22px",
    fontWeight: "700",
    color: "#f5f5f2",
    letterSpacing: "-0.5px",
  },
  oldPrice: {
    fontSize: "13px",
    color: "#3a3a3a",
    textDecoration: "line-through",
    fontWeight: "400",
  },
  discBadge: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#12daa8",
    background: "rgba(18,218,168,0.1)",
    border: "1px solid rgba(18,218,168,0.2)",
    padding: "3px 9px",
    borderRadius: "999px",
    letterSpacing: "0.3px",
  },

  /* Meta */
  metaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    paddingTop: "6px",
    borderTop: "1px solid #1a1a1a",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  stars: {
    display: "flex",
    gap: "2px",
  },
  star: {
    fontSize: "14px",
  },
  reviewCount: {
    fontSize: "12px",
    color: "#444",
    fontWeight: "400",
  },
  addedDate: {
    fontSize: "11px",
    color: "#333",
    fontWeight: "400",
    letterSpacing: "0.3px",
  },

  /* Actions */
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "4px",
  },
  btnCart: {
    flex: 1,
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#12daa8",
    color: "#000",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.3px",
  },
  btnDel: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    border: "1px solid #2a2a2a",
    background: "transparent",
    color: "#555",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontFamily: "'DM Sans', sans-serif",
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
    width: "40px",
    height: "40px",
    border: "2px solid #1a1a1a",
    borderTop: "2px solid #12daa8",
    borderRadius: "50%",
    animation: "wlSpin 0.9s linear infinite",
  },
  loadText: {
    color: "#444",
    fontSize: "14px",
    fontWeight: "300",
    letterSpacing: "1px",
    margin: 0,
  },

  /* Empty */
  emptyWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#080808",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  emptyGlow: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(18,218,168,0.06) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  emptyInner: {
    textAlign: "center",
    padding: "40px 20px",
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  emptyImg: {
    width: "220px",
    objectFit: "contain",
    marginBottom: "28px",
    opacity: 0.85,
  },
  emptyEye: {
    margin: "0 0 10px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color: "#12daa8",
  },
  emptyTitle: {
    margin: "0 0 12px",
    fontFamily: "'Playfair Display', serif",
    fontSize: "36px",
    fontWeight: "900",
    color: "#f5f5f2",
    letterSpacing: "-0.5px",
  },
  emptySub: {
    color: "#555",
    fontSize: "15px",
    fontWeight: "300",
    marginBottom: "28px",
    maxWidth: "320px",
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
  },
};