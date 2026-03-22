import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData]                   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [wishlist, setWishlist]           = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [cartLoading, setCartLoading]     = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [activeTab, setActiveTab]         = useState("description");
  const [imgZoom, setImgZoom]             = useState(false);

  const getLoggedInUser = () => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  };
  const getUserId = () => getLoggedInUser()?.id;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`http://localhost:8081/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const result = await res.json();
        setData(result);
        if (result.images?.length > 0) setSelectedImage(result.images[0].imageUrl);

        const userId = getUserId();
        if (userId) {
          const wishRes  = await fetch(`http://localhost:8081/wishlist/${userId}`);
          const wishData = await wishRes.json();
          if (wishRes.ok && Array.isArray(wishData)) {
            setWishlist(wishData.some((item) => Number(item.productId) === Number(id)));
          }
        }
      } catch (err) {
        console.error("Product detail fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const product     = data?.product  || {};
  const images      = data?.images   || [];
  const reviewsData = data?.reviews  || [];

  const averageRating = useMemo(() => {
    if (!reviewsData.length) return 0;
    return (reviewsData.reduce((s, r) => s + (r.rating || 0), 0) / reviewsData.length).toFixed(1);
  }, [reviewsData]);

  const actualPrice     = Number(product.price || 0);
  const discount        = actualPrice <= 10000 ? 500 : actualPrice <= 30000 ? 1500 : actualPrice <= 60000 ? 3000 : 5000;
  const oldPrice        = actualPrice + discount;
  const discountPercent = oldPrice ? ((discount / oldPrice) * 100).toFixed(1) : 0;

  const handleAddToCart = async () => {
    try {
      const userId = getUserId();
      if (!userId) { alert("Please login first"); return; }
      if (!id)     { alert("Product id not found"); return; }
      setCartLoading(true);
      const res = await fetch("http://localhost:8081/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(userId), productId: Number(id), quantity: 1 }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || "Failed to add to cart");
      alert("Product added to cart successfully");
    } catch (err) { alert(err.message || "Failed to add product to cart"); }
    finally { setCartLoading(false); }
  };

  const handleAddToWishlist = async () => {
    try {
      const userId = getUserId();
      if (!userId) { alert("Please login first"); return; }
      setWishlistLoading(true);
      const res = await fetch("http://localhost:8081/wishlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(userId), productId: Number(id) }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || "Failed to add to wishlist");
      setWishlist(true);
    } catch (err) { alert(err.message || "Failed to add to wishlist"); }
    finally { setWishlistLoading(false); }
  };

  /* ── Loading ────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={s.loadWrap}>
        <style>{fonts + anims}</style>
        <div style={s.loadRing} />
        <p style={s.loadText}>Loading product…</p>
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div style={s.loadWrap}>
        <style>{fonts + anims}</style>
        <p style={{ color: "#555", fontFamily: "'DM Sans',sans-serif" }}>Product not found.</p>
        <button style={s.backBtn} onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div style={s.page}>
      <style>{fonts + anims}</style>

      {/* Image zoom overlay */}
      {imgZoom && (
        <div style={s.zoomOverlay} onClick={() => setImgZoom(false)}>
          <img src={selectedImage} alt="zoom" style={s.zoomImg} />
          <span style={s.zoomClose}>✕</span>
        </div>
      )}

      <div style={s.wrap}>

        {/* Breadcrumb */}
        <nav style={s.breadcrumb} className="pd-fade-in">
          <span style={s.breadItem} onClick={() => navigate("/")}>Home</span>
          <span style={s.breadSep}>›</span>
          <span style={s.breadItem} onClick={() => navigate(-1)}>Products</span>
          <span style={s.breadSep}>›</span>
          <span style={{ ...s.breadItem, color: "#777", cursor: "default" }}>
            {product.name?.substring(0, 40)}{product.name?.length > 40 ? "…" : ""}
          </span>
        </nav>

        {/* Main grid */}
        <div style={s.mainGrid}>

          {/* ── LEFT: Gallery ── */}
          <div style={s.galleryPanel} className="pd-fade-in">

            {/* Thumbnails */}
            <div style={s.thumbCol}>
              {(images.length > 0 ? images : [{ imageUrl: "" }]).map((img, i) => (
                <div
                  key={i}
                  style={{
                    ...s.thumbWrap,
                    borderColor: selectedImage === img.imageUrl ? "#12daa8" : "transparent",
                    boxShadow: selectedImage === img.imageUrl ? "0 0 0 1px #12daa8" : "none",
                  }}
                  onClick={() => setSelectedImage(img.imageUrl)}
                >
                  <img
                    src={img.imageUrl || "https://via.placeholder.com/80x80?text=No"}
                    alt={`thumb-${i}`}
                    style={s.thumb}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/80x80?text=No"; }}
                  />
                </div>
              ))}
            </div>

            {/* Main image */}
            <div style={s.mainImgWrap} onClick={() => setImgZoom(true)}>
              <img
                src={selectedImage || "https://via.placeholder.com/400x400?text=No+Image"}
                alt={product.name}
                style={s.mainImg}
                className="pd-img"
                onError={(e) => { e.target.src = "https://via.placeholder.com/400x400?text=No+Image"; }}
              />
              <div style={s.zoomHint}>🔍 Click to zoom</div>
            </div>
          </div>

          {/* ── RIGHT: Info ── */}
          <div style={s.infoPanel} className="pd-fade-in" >

            {/* Badge row */}
            <div style={s.badgeRow}>
              {product.stock > 0
                ? <span style={s.inStockBadge}>● In Stock</span>
                : <span style={s.outStockBadge}>● Out of Stock</span>
              }
              <span style={s.discBadge}>{discountPercent}% OFF</span>
            </div>

            {/* Title */}
            <h1 style={s.title}>{product.name}</h1>
            <p style={s.productId}>Product ID #{product.id}</p>

            {/* Rating */}
            <div style={s.ratingRow}>
              <div style={s.starsWrap}>
                {[1,2,3,4,5].map((star) => (
                  <span key={star} style={{ color: star <= Math.round(averageRating) ? "#12daa8" : "#2a2a2a", fontSize: "18px" }}>★</span>
                ))}
              </div>
              <span style={s.ratingNum}>{averageRating}</span>
              <span style={s.ratingCount}>({reviewsData.length} reviews)</span>
            </div>

            {/* Divider */}
            <div style={s.ruleTeal} />

            {/* Price block */}
            <div style={s.priceBlock}>
              <span style={s.newPrice}>₹{actualPrice.toLocaleString("en-IN")}</span>
              <span style={s.taxNote}>incl. all taxes</span>
            </div>
            <div style={s.priceSecRow}>
              <span style={s.mrp}>MRP ₹{oldPrice.toLocaleString("en-IN")}</span>
              <span style={s.saving}>You save ₹{discount.toLocaleString("en-IN")}</span>
            </div>
            <p style={s.emi}>EMI available from ₹{Math.round(actualPrice / 12).toLocaleString("en-IN")}/month</p>

            {/* Delivery */}
            <div style={s.deliveryBox}>
              <div style={s.deliveryRow}>
                <span style={s.delivIcon}>🚚</span>
                <div>
                  <p style={s.delivTitle}>Free Delivery by ShopEase</p>
                  <p style={s.delivSub}>Estimated delivery in 3–4 business days</p>
                </div>
              </div>
            </div>

            {/* Tab switcher */}
            <div style={s.tabRow}>
              {["description", "features", "stock"].map((tab) => (
                <button
                  key={tab}
                  className="pd-tab"
                  style={{
                    ...s.tabBtn,
                    borderBottom: activeTab === tab ? "2px solid #12daa8" : "2px solid transparent",
                    color: activeTab === tab ? "#12daa8" : "#555",
                  }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div style={s.tabContent}>
              {activeTab === "description" && (
                <p style={s.tabText}>{product.description || "No description available for this product."}</p>
              )}
              {activeTab === "features" && (
                <ul style={s.featureList}>
                  <li style={s.featureItem}>
                    <span style={s.featureDot} />
                    {product.description || "No description available"}
                  </li>
                  <li style={s.featureItem}><span style={s.featureDot} />Premium build quality</li>
                  <li style={s.featureItem}><span style={s.featureDot} />Fast & reliable performance</li>
                  <li style={s.featureItem}><span style={s.featureDot} />Long battery backup</li>
                </ul>
              )}
              {activeTab === "stock" && (
                <div style={s.tabText}>
                  <span style={{ color: product.stock > 0 ? "#12daa8" : "#f87171", fontWeight: "600" }}>
                    {product.stock > 0 ? `✔ In Stock — ${product.stock} units available` : "✘ Out of Stock"}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={s.actionRow}>
              <button
                className="pd-btn-primary"
                style={s.btnCart}
                onClick={handleAddToCart}
                disabled={cartLoading || product.stock === 0}
              >
                {cartLoading ? "Adding…" : "Add to Cart"}
              </button>
              <button
                className="pd-btn-wishlist"
                style={{
                  ...s.btnWish,
                  background: wishlist ? "rgba(18,218,168,0.12)" : "transparent",
                  borderColor: wishlist ? "#12daa8" : "#2a2a2a",
                  color: wishlist ? "#12daa8" : "#aaa",
                }}
                onClick={handleAddToWishlist}
                disabled={wishlistLoading || wishlist}
              >
                {wishlist ? "♥ Wishlisted" : wishlistLoading ? "Adding…" : "♡ Wishlist"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Reviews ─────────────────────────────────────────────────────── */}
        <section style={s.reviewSection} className="pd-fade-in">

          <div style={s.reviewHeader}>
            <div>
              <p style={s.reviewEye}>Customer Feedback</p>
              <h2 style={s.reviewTitle}>Ratings & Reviews</h2>
            </div>

            {/* Big rating display */}
            <div style={s.bigRatingWrap}>
              <span style={s.bigRating}>{averageRating}</span>
              <div>
                <div style={s.bigStars}>
                  {[1,2,3,4,5].map((star) => (
                    <span key={star} style={{ color: star <= Math.round(averageRating) ? "#12daa8" : "#1e1e1e", fontSize: "20px" }}>★</span>
                  ))}
                </div>
                <p style={s.bigRatingNote}>Based on {reviewsData.length} {reviewsData.length === 1 ? "review" : "reviews"}</p>
              </div>
            </div>
          </div>

          <div style={s.ruleTeal} />

          {reviewsData.length > 0 ? (
            <div style={s.reviewGrid}>
              {reviewsData.map((review, i) => (
                <div key={review.id} className="pd-review-card" style={{ ...s.reviewCard, animationDelay: `${i * 0.06}s` }}>
                  {/* Top row */}
                  <div style={s.reviewTop}>
                    <div style={s.reviewerAvatar}>
                      {String(review.userId).slice(-1).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={s.reviewerName}>User #{review.userId}</p>
                      <p style={s.reviewDate}>{review.createdAt ? review.createdAt.split("T")[0] : "—"}</p>
                    </div>
                    <div style={s.reviewRatingBadge}>
                      {review.rating} ★
                    </div>
                  </div>

                  <p style={s.reviewLabel}>Customer Review</p>
                  <p style={s.reviewComment}>{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={s.noReviews}>
              <p style={s.noReviewsText}>No reviews yet. Be the first to review this product.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ─── Fonts ────────────────────────────────────────────────────────────────────
const fonts = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');`;

// ─── Animations ──────────────────────────────────────────────────────────────
const anims = `
  .pd-fade-in { animation: pdUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes pdUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
  @keyframes pdSpin { to { transform:rotate(360deg); } }

  .pd-img { transition: transform 0.4s ease; }
  .pd-img:hover { transform: scale(1.03); cursor: zoom-in; }

  .pd-tab { transition: color 0.2s, border-color 0.2s; cursor: pointer; }
  .pd-tab:hover { color: #12daa8 !important; }

  .pd-btn-primary {
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .pd-btn-primary:hover:not(:disabled) {
    opacity: 0.85;
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(18,218,168,0.3);
  }
  .pd-btn-primary:active { transform: scale(0.97); }

  .pd-btn-wishlist {
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }
  .pd-btn-wishlist:hover:not(:disabled) {
    background: rgba(18,218,168,0.08) !important;
    border-color: rgba(18,218,168,0.4) !important;
    color: #12daa8 !important;
  }

  .pd-review-card {
    animation: pdUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
    transition: border-color 0.25s ease, transform 0.25s ease;
  }
  .pd-review-card:hover {
    border-color: rgba(18,218,168,0.25) !important;
    transform: translateY(-3px);
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
    paddingBottom: "80px",
  },
  wrap: {
    maxWidth: "1380px",
    margin: "0 auto",
    padding: "100px 5% 0",
  },

  /* Breadcrumb */
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    marginBottom: "32px",
    flexWrap: "wrap",
  },
  breadItem: {
    color: "#444",
    cursor: "pointer",
    transition: "color 0.2s",
  },
  breadSep: { color: "#2a2a2a", fontSize: "16px" },

  /* Main grid */
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "32px",
    alignItems: "start",
    marginBottom: "48px",
  },

  /* Gallery panel */
  galleryPanel: {
    background: "#0e0e0e",
    border: "1px solid #1a1a1a",
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    gap: "16px",
    position: "sticky",
    top: "100px",
  },
  thumbCol: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  thumbWrap: {
    width: "68px",
    height: "68px",
    borderRadius: "12px",
    border: "2px solid transparent",
    background: "#fff",
    overflow: "hidden",
    cursor: "pointer",
    padding: "4px",
    boxSizing: "border-box",
    flexShrink: 0,
    transition: "border-color 0.2s",
  },
  thumb: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  mainImgWrap: {
    flex: 1,
    background: "#fff",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "460px",
    overflow: "hidden",
    position: "relative",
    cursor: "zoom-in",
  },
  mainImg: {
    maxWidth: "100%",
    maxHeight: "420px",
    objectFit: "contain",
    padding: "16px",
  },
  zoomHint: {
    position: "absolute",
    bottom: "12px",
    right: "12px",
    fontSize: "11px",
    color: "#bbb",
    background: "rgba(0,0,0,0.5)",
    padding: "4px 10px",
    borderRadius: "999px",
    pointerEvents: "none",
  },

  /* Zoom overlay */
  zoomOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.92)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "zoom-out",
  },
  zoomImg: {
    maxWidth: "90vw",
    maxHeight: "90vh",
    objectFit: "contain",
    borderRadius: "12px",
  },
  zoomClose: {
    position: "absolute",
    top: "24px",
    right: "32px",
    color: "#fff",
    fontSize: "24px",
    cursor: "pointer",
  },

  /* Info panel */
  infoPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "0px",
  },

  badgeRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  inStockBadge: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#12daa8",
    background: "rgba(18,218,168,0.1)",
    border: "1px solid rgba(18,218,168,0.2)",
    padding: "4px 12px",
    borderRadius: "999px",
    letterSpacing: "0.3px",
  },
  outStockBadge: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#f87171",
    background: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.2)",
    padding: "4px 12px",
    borderRadius: "999px",
  },
  discBadge: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#12daa8",
    background: "rgba(18,218,168,0.08)",
    border: "1px solid rgba(18,218,168,0.15)",
    padding: "4px 12px",
    borderRadius: "999px",
  },

  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(22px, 2.5vw, 32px)",
    fontWeight: "700",
    lineHeight: "1.3",
    color: "#f5f5f2",
    margin: "0 0 6px",
    letterSpacing: "-0.3px",
  },
  productId: {
    margin: "0 0 14px",
    fontSize: "12px",
    color: "#333",
    fontWeight: "400",
    letterSpacing: "0.5px",
  },

  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  starsWrap: { display: "flex", gap: "2px" },
  ratingNum: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#12daa8",
  },
  ratingCount: {
    fontSize: "13px",
    color: "#444",
  },

  ruleTeal: {
    height: "1px",
    background: "linear-gradient(to right, #12daa8, transparent)",
    opacity: 0.3,
    marginBottom: "20px",
  },

  /* Price */
  priceBlock: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
    marginBottom: "6px",
  },
  newPrice: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "36px",
    fontWeight: "900",
    color: "#f5f5f2",
    letterSpacing: "-1px",
  },
  taxNote: {
    fontSize: "12px",
    color: "#444",
    fontWeight: "300",
  },
  priceSecRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  mrp: {
    fontSize: "14px",
    color: "#333",
    textDecoration: "line-through",
  },
  saving: {
    fontSize: "13px",
    color: "#12daa8",
    fontWeight: "600",
  },
  emi: {
    fontSize: "13px",
    color: "#555",
    margin: "0 0 20px",
    fontWeight: "300",
  },

  /* Delivery box */
  deliveryBox: {
    background: "#0e0e0e",
    border: "1px solid #1a1a1a",
    borderRadius: "14px",
    padding: "16px 18px",
    marginBottom: "22px",
  },
  deliveryRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  delivIcon: { fontSize: "20px", marginTop: "2px" },
  delivTitle: {
    margin: "0 0 3px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#e5e5e5",
  },
  delivSub: {
    margin: 0,
    fontSize: "12px",
    color: "#12daa8",
    fontWeight: "400",
  },

  /* Tabs */
  tabRow: {
    display: "flex",
    gap: "0",
    borderBottom: "1px solid #1a1a1a",
    marginBottom: "16px",
  },
  tabBtn: {
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    padding: "10px 18px",
    fontSize: "13px",
    fontWeight: "500",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.3px",
    cursor: "pointer",
    marginBottom: "-1px",
    textTransform: "capitalize",
  },
  tabContent: {
    minHeight: "80px",
    marginBottom: "24px",
  },
  tabText: {
    fontSize: "14px",
    color: "#888",
    lineHeight: "1.8",
    margin: 0,
    fontWeight: "300",
  },
  featureList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    fontSize: "14px",
    color: "#888",
    lineHeight: "1.6",
    fontWeight: "300",
  },
  featureDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#12daa8",
    marginTop: "7px",
    flexShrink: 0,
  },

  /* Action buttons */
  actionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  btnCart: {
    flex: 1,
    minWidth: "140px",
    padding: "15px 20px",
    borderRadius: "12px",
    border: "none",
    background: "#12daa8",
    color: "#000",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.3px",
  },
  btnWish: {
    flex: 1,
    minWidth: "140px",
    padding: "15px 20px",
    borderRadius: "12px",
    border: "1px solid #2a2a2a",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  /* Reviews section */
  reviewSection: {
    background: "#0e0e0e",
    border: "1px solid #1a1a1a",
    borderRadius: "24px",
    padding: "36px",
    marginTop: "8px",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "20px",
  },
  reviewEye: {
    margin: "0 0 6px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#12daa8",
  },
  reviewTitle: {
    margin: 0,
    fontFamily: "'Playfair Display', serif",
    fontSize: "28px",
    fontWeight: "700",
    color: "#f5f5f2",
    letterSpacing: "-0.5px",
  },
  bigRatingWrap: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  bigRating: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "52px",
    fontWeight: "900",
    color: "#12daa8",
    lineHeight: 1,
    letterSpacing: "-2px",
  },
  bigStars: { display: "flex", gap: "3px", marginBottom: "4px" },
  bigRatingNote: {
    margin: 0,
    fontSize: "12px",
    color: "#444",
    fontWeight: "300",
  },

  reviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
    marginTop: "8px",
  },
  reviewCard: {
    background: "#111",
    border: "1px solid #1c1c1c",
    borderRadius: "16px",
    padding: "20px",
  },
  reviewTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
  },
  reviewerAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "rgba(18,218,168,0.1)",
    border: "1px solid rgba(18,218,168,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
    color: "#12daa8",
    flexShrink: 0,
  },
  reviewerName: {
    margin: "0 0 2px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#e5e5e5",
  },
  reviewDate: {
    margin: 0,
    fontSize: "11px",
    color: "#444",
    fontWeight: "300",
  },
  reviewRatingBadge: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#12daa8",
    background: "rgba(18,218,168,0.1)",
    border: "1px solid rgba(18,218,168,0.15)",
    padding: "4px 10px",
    borderRadius: "999px",
    marginLeft: "auto",
    flexShrink: 0,
  },
  reviewLabel: {
    margin: "0 0 6px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#333",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  reviewComment: {
    margin: 0,
    fontSize: "14px",
    color: "#777",
    lineHeight: "1.75",
    fontWeight: "300",
  },

  noReviews: {
    padding: "48px 0",
    textAlign: "center",
    border: "1px dashed #1a1a1a",
    borderRadius: "16px",
    marginTop: "8px",
  },
  noReviewsText: {
    color: "#333",
    fontStyle: "italic",
    fontFamily: "'Playfair Display', serif",
    margin: 0,
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
    animation: "pdSpin 0.9s linear infinite",
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