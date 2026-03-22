import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function ProductListingPage() {
  const [searchParams] = useSearchParams();
  const keyword    = searchParams.get("keyword")    || "";
  const categoryId = searchParams.get("categoryId") || "";

  const [products, setProducts]                   = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [sortBy, setSortBy]                       = useState("relevancy");
  const [excludeOutOfStock, setExcludeOutOfStock] = useState(false);
  const [wishlistIds, setWishlistIds]             = useState([]);
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);

  const getLoggedInUser = () => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } };
  const getUserId       = () => getLoggedInUser()?.id;

  useEffect(() => {
    let url = "http://localhost:8081/api/products";
    if (keyword && categoryId) url = `http://localhost:8081/api/products/search/category/${categoryId}?keyword=${encodeURIComponent(keyword)}`;
    else if (keyword)          url = `http://localhost:8081/api/products/search?keyword=${encodeURIComponent(keyword)}`;
    else if (categoryId)       url = `http://localhost:8081/api/products/category/${categoryId}`;

    setLoading(true);
    fetch(url)
      .then((res) => { if (!res.ok) throw new Error("Failed"); return res.json(); })
      .then((data) => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setProducts([]); setLoading(false); });
  }, [keyword, categoryId]);

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const userId = getUserId();
        if (!userId) return;
        const res  = await fetch(`http://localhost:8081/wishlist/${userId}`);
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setWishlistIds(data.map((item) => Number(item.productId)));
      } catch {}
    }
    fetchWishlist();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (excludeOutOfStock) result = result.filter((item) => (item.stock ?? 1) > 0);
    if (sortBy === "lowToHigh") result.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === "highToLow") result.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sortBy === "topRated")  result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    else if (sortBy === "latest")    result.sort((a, b) => Number(b.id) - Number(a.id));
    return result;
  }, [products, excludeOutOfStock, sortBy]);

  const categoryNames = {
    1: "Mobile Phones", 10: "Laptops", 11: "Televisions", 12: "Refrigerators",
    14: "Air Conditioners", 16: "Tablets", 17: "Headphones & Earbuds",
    18: "Speakers", 26: "Kitchen Appliances", 29: "Home Theatres",
  };

  const pageTitle = keyword
    ? `Results for "${keyword}"`
    : categoryId
    ? categoryNames[Number(categoryId)] || "Category Products"
    : "All Products";

  const isWishlisted = (productId) => wishlistIds.includes(Number(productId));

  const handleAddToWishlist = async (e, productId) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const userId = getUserId();
      if (!userId || isWishlisted(productId)) return;
      setWishlistLoadingId(productId);
      const res = await fetch("http://localhost:8081/wishlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(userId), productId: Number(productId) }),
      });
      if (!res.ok) throw new Error("Failed to add to wishlist");
      setWishlistIds((prev) => [...prev, Number(productId)]);
    } catch (err) { console.error("Wishlist add error:", err); }
    finally { setWishlistLoadingId(null); }
  };

  return (
    <div style={s.page}>
      <style>{fonts + anims}</style>

      <div style={s.wrapper}>

        {/* ── SIDEBAR ── */}
        <aside style={s.sidebar} className="pl-fade-in">

          <p style={s.sideEye}>Refine Search</p>
          <h2 style={s.sideTitle}>Filters</h2>
          <div style={s.ruleTeal} />

          {/* Exclude out of stock */}
          <div style={s.toggleRow} onClick={() => setExcludeOutOfStock(!excludeOutOfStock)}>
            <span style={s.toggleLabel}>Hide out of stock</span>
            <div style={{
              ...s.toggle,
              background: excludeOutOfStock ? "#12daa8" : "#1e1e1e",
              borderColor: excludeOutOfStock ? "#12daa8" : "#2a2a2a",
            }}>
              <div style={{
                ...s.toggleThumb,
                transform: excludeOutOfStock ? "translateX(18px)" : "translateX(2px)",
                background: excludeOutOfStock ? "#000" : "#444",
              }} />
            </div>
          </div>

          {/* Categories */}
          <div style={s.filterSection}>
            <p style={s.filterSectionTitle}>Categories</p>
            {[
              { label: "Laptops",  val: "10" },
              { label: "Mobiles",  val: "1"  },
              { label: "AC",       val: "14" },
              { label: "TVs",      val: "11" },
              { label: "Headphones", val: "17" },
            ].map((cat) => (
              <label key={cat.val} style={s.checkRow}>
                <span style={{
                  ...s.checkBox,
                  background:   categoryId === cat.val ? "#12daa8" : "transparent",
                  borderColor:  categoryId === cat.val ? "#12daa8" : "#2a2a2a",
                }}>
                  {categoryId === cat.val && <span style={s.checkMark}>✓</span>}
                </span>
                <span style={s.checkLabel}>{cat.label}</span>
              </label>
            ))}
          </div>

          {/* Quick filters */}
          <div style={s.filterSection}>
            <p style={s.filterSectionTitle}>Quick Filters</p>
            {["Top Rated", "Latest Arrival", "Discounted"].map((f) => (
              <label key={f} style={s.checkRow}>
                <span style={{ ...s.checkBox, borderColor: "#2a2a2a" }} />
                <span style={s.checkLabel}>{f}</span>
              </label>
            ))}
          </div>

          {/* Sort (also in sidebar for convenience) */}
          <div style={s.filterSection}>
            <p style={s.filterSectionTitle}>Sort By</p>
            {[
              { val: "relevancy", label: "Relevancy"      },
              { val: "lowToHigh", label: "Price: Low → High" },
              { val: "highToLow", label: "Price: High → Low" },
              { val: "topRated",  label: "Top Rated"      },
              { val: "latest",    label: "Latest Arrival" },
            ].map((opt) => (
              <label key={opt.val} style={s.checkRow} onClick={() => setSortBy(opt.val)}>
                <span style={{
                  ...s.radioCircle,
                  borderColor:  sortBy === opt.val ? "#12daa8" : "#2a2a2a",
                  background:   sortBy === opt.val ? "rgba(18,218,168,0.1)" : "transparent",
                }}>
                  {sortBy === opt.val && <span style={s.radioDot} />}
                </span>
                <span style={{ ...s.checkLabel, color: sortBy === opt.val ? "#12daa8" : "#666" }}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <section style={s.content}>

          {/* Top bar */}
          <div style={s.topBar} className="pl-fade-in">
            <div>
              <p style={s.topEye}>
                {keyword ? "Search results" : categoryId ? "Category" : "Browse"}
              </p>
              <h1 style={s.topTitle}>
                {pageTitle}
                <span style={s.topCount}> ({filteredProducts.length})</span>
              </h1>
            </div>

            {/* Sort select — also on top for quick access */}
            <select
              style={s.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevancy">Relevancy</option>
              <option value="lowToHigh">Price: Low → High</option>
              <option value="highToLow">Price: High → Low</option>
              <option value="topRated">Top Rated</option>
              <option value="latest">Latest Arrival</option>
            </select>
          </div>

          <div style={s.ruleTeal} />

          {/* States */}
          {loading ? (
            <div style={s.stateWrap}>
              <div style={s.loadRing} />
              <p style={s.stateText}>Loading products…</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={s.stateWrap}>
              <p style={{ ...s.stateText, fontStyle: "italic" }}>No products found.</p>
            </div>
          ) : (
            <div style={s.grid}>
              {filteredProducts.map((item, i) => (
                <Link
                  to={`/product/${item.id}`}
                  key={item.id}
                  className="pl-card"
                  style={{ ...s.card, animationDelay: `${i * 0.04}s` }}
                >
                  {/* Image area */}
                  <div style={s.imgWrap}>
                    {/* Wishlist button */}
                    <button
                      type="button"
                      className="pl-wish-btn"
                      style={{
                        ...s.wishBtn,
                        color:      isWishlisted(item.id) ? "#12daa8" : "#555",
                        borderColor: isWishlisted(item.id) ? "rgba(18,218,168,0.4)" : "rgba(255,255,255,0.1)",
                        background:  isWishlisted(item.id) ? "rgba(18,218,168,0.12)" : "rgba(0,0,0,0.5)",
                      }}
                      onClick={(e) => handleAddToWishlist(e, item.id)}
                    >
                      {wishlistLoadingId === item.id ? "…" : isWishlisted(item.id) ? "♥" : "♡"}
                    </button>

                    <img
                      src={item.image?.trim() || "/no-image.png"}
                      alt={item.name}
                      style={s.img}
                      className="pl-card-img"
                      onError={(e) => { e.target.src = "/no-image.png"; }}
                    />
                  </div>

                  {/* Card body */}
                  <div style={s.cardBody}>
                    <p style={s.productName}>{item.name}</p>

                    <div style={s.ratingRow}>
                      <span style={s.ratingBadge}>
                        ★ {Number(item.rating || 0).toFixed(1)}
                      </span>
                      <span style={s.reviewCount}>({item.reviewCount || 0})</span>
                    </div>

                    <div style={s.cardFooter}>
                      <p style={s.price}>₹{Number(item.price).toLocaleString("en-IN")}</p>
                      <span style={s.arrowCircle}>→</span>
                    </div>

                    {item.delivery && (
                      <p style={s.delivery}>✦ {item.delivery}</p>
                    )}
                    {item.deliveryDate && (
                      <p style={s.deliveryDate}>{item.deliveryDate}</p>
                    )}
                  </div>

                  {/* Hover bar */}
                  <div className="pl-card-bar" style={s.cardBar} />
                </Link>
              ))}
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
  .pl-fade-in { animation: plUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes plUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
  @keyframes plSpin{ to { transform:rotate(360deg); } }

  .pl-card {
    animation: plUp 0.55s cubic-bezier(0.16,1,0.3,1) both;
    transition: transform 0.3s cubic-bezier(0.16,1,0.3,1),
                box-shadow 0.3s ease, border-color 0.3s ease;
    text-decoration: none !important;
    color: inherit !important;
    display: block;
  }
  .pl-card:hover {
    transform: translateY(-7px);
    box-shadow: 0 28px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(18,218,168,0.2);
    border-color: rgba(18,218,168,0.28) !important;
  }
  .pl-card-img { transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
  .pl-card:hover .pl-card-img { transform: scale(1.07); }

  .pl-card-bar {
    position:absolute; bottom:0; left:0; right:0; height:2px;
    background:#12daa8;
    transform:scaleX(0); transform-origin:left;
    transition:transform 0.35s cubic-bezier(0.16,1,0.3,1);
    border-radius:0 0 16px 16px;
  }
  .pl-card:hover .pl-card-bar { transform:scaleX(1); }

  .pl-wish-btn {
    transition: color 0.2s, background 0.2s, border-color 0.2s, transform 0.15s;
  }
  .pl-wish-btn:hover { transform: scale(1.15); }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#080808",
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    padding: "100px 5% 60px",
  },
  wrapper: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: "24px",
    maxWidth: "1500px",
    margin: "0 auto",
  },

  /* ── Sidebar ── */
  sidebar: {
    background: "#0e0e0e",
    border: "1px solid #1a1a1a",
    borderRadius: "20px",
    padding: "24px",
    height: "fit-content",
    position: "sticky",
    top: "100px",
  },
  sideEye: {
    margin: "0 0 6px",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#12daa8",
  },
  sideTitle: {
    margin: "0 0 14px",
    fontFamily: "'Playfair Display', serif",
    fontSize: "24px",
    fontWeight: "700",
    color: "#f5f5f2",
    letterSpacing: "-0.5px",
  },
  ruleTeal: {
    height: "1px",
    background: "linear-gradient(to right, #12daa8, transparent)",
    opacity: 0.25,
    marginBottom: "20px",
  },

  /* Toggle */
  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    cursor: "pointer",
    padding: "12px 14px",
    background: "#111",
    borderRadius: "10px",
    border: "1px solid #1a1a1a",
  },
  toggleLabel: {
    fontSize: "13px",
    color: "#888",
    fontWeight: "400",
  },
  toggle: {
    width: "38px",
    height: "22px",
    borderRadius: "999px",
    border: "1px solid",
    position: "relative",
    flexShrink: 0,
    transition: "background 0.25s, border-color 0.25s",
  },
  toggleThumb: {
    position: "absolute",
    top: "2px",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1), background 0.25s",
  },

  /* Filter sections */
  filterSection: {
    borderTop: "1px solid #141414",
    paddingTop: "16px",
    marginTop: "16px",
  },
  filterSectionTitle: {
    margin: "0 0 12px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#444",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
  },
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
    cursor: "pointer",
  },
  checkBox: {
    width: "16px",
    height: "16px",
    borderRadius: "4px",
    border: "1.5px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background 0.2s, border-color 0.2s",
  },
  checkMark: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#000",
  },
  checkLabel: {
    fontSize: "13px",
    color: "#666",
    fontWeight: "400",
    userSelect: "none",
  },
  radioCircle: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    border: "1.5px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s",
  },
  radioDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#12daa8",
  },

  /* ── Content ── */
  content: {
    background: "#0e0e0e",
    border: "1px solid #1a1a1a",
    borderRadius: "20px",
    padding: "28px",
    minHeight: "60vh",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  topEye: {
    margin: "0 0 4px",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#12daa8",
  },
  topTitle: {
    margin: 0,
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(22px, 3vw, 34px)",
    fontWeight: "700",
    color: "#f5f5f2",
    letterSpacing: "-0.5px",
  },
  topCount: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "18px",
    fontWeight: "300",
    color: "#333",
    letterSpacing: "0",
  },
  sortSelect: {
    height: "40px",
    border: "1px solid #1e1e1e",
    borderRadius: "10px",
    padding: "0 14px",
    fontSize: "13px",
    fontWeight: "500",
    background: "#111",
    color: "#888",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
  },

  /* States */
  stateWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 0",
    gap: "16px",
    border: "1px dashed #1a1a1a",
    borderRadius: "16px",
    marginTop: "8px",
  },
  loadRing: {
    width: "36px",
    height: "36px",
    border: "2px solid #1a1a1a",
    borderTop: "2px solid #12daa8",
    borderRadius: "50%",
    animation: "plSpin 0.9s linear infinite",
  },
  stateText: {
    color: "#333",
    fontSize: "15px",
    fontWeight: "300",
    margin: 0,
  },

  /* ── Grid & Cards ── */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gap: "16px",
    marginTop: "8px",
  },
  card: {
    background: "#111",
    border: "1px solid #1c1c1c",
    borderRadius: "16px",
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  imgWrap: {
    position: "relative",
    height: "200px",
    background: "#fff",
    overflow: "hidden",
    flexShrink: 0,
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "12px",
    boxSizing: "border-box",
    display: "block",
  },
  wishBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    cursor: "pointer",
    zIndex: 10,
    fontWeight: "700",
  },
  cardBody: {
    padding: "14px 14px 16px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    borderTop: "1px solid #1a1a1a",
  },
  productName: {
    margin: "0 0 8px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#c0bdb8",
    lineHeight: "1.55",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    height: "40px",
    fontFamily: "'DM Sans', sans-serif",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "10px",
  },
  ratingBadge: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#12daa8",
    background: "rgba(18,218,168,0.08)",
    border: "1px solid rgba(18,218,168,0.15)",
    padding: "2px 8px",
    borderRadius: "6px",
  },
  reviewCount: {
    fontSize: "11px",
    color: "#333",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: "10px",
    borderTop: "1px solid #1a1a1a",
  },
  price: {
    margin: 0,
    fontFamily: "'Playfair Display', serif",
    fontSize: "18px",
    fontWeight: "700",
    color: "#f5f5f2",
    letterSpacing: "-0.3px",
  },
  arrowCircle: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "rgba(18,218,168,0.08)",
    border: "1px solid rgba(18,218,168,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#12daa8",
    fontSize: "13px",
    flexShrink: 0,
  },
  delivery: {
    margin: "8px 0 0",
    fontSize: "11px",
    color: "#12daa8",
    fontWeight: "600",
  },
  deliveryDate: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#333",
    fontWeight: "300",
  },
  cardBar: {
    borderRadius: "0 0 16px 16px",
  },
};