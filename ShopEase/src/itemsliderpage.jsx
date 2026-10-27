import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// ─── Config ───────────────────────────────────────────────────────────────────
const itemConfig = {
  mobiles: {
    title: "Mobiles",
    eyebrow: "Smartphone Collection",
    subtitle: "Powerful cameras, seamless performance, iconic designs.",
    categoryId: 1,
    banner: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1600&q=80",
  },
  televisions: {
    title: "Televisions",
    eyebrow: "Display Collection",
    subtitle: "Cinema-grade visuals brought into your living room.",
    categoryId: 11,
    banner: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1600&q=80",
  },
  laptops: {
    title: "Laptops",
    eyebrow: "Performance Collection",
    subtitle: "Engineered for creators, professionals and visionaries.",
    categoryId: 10,
    banner: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1600&q=80",
  },
  "air-conditioners": {
    title: "Air Conditioners",
    eyebrow: "Cooling Collection",
    subtitle: "Precision climate control for every space and season.",
    categoryId: 14,
    banner: "https://tse2.mm.bing.net/th/id/OIP.8LhJ0CaWyhQ7s2zxlZZ3hAHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  coolers: {
    title: "Coolers",
    eyebrow: "Air Cooling Collection",
    subtitle: "Refreshing airflow engineered for comfort and efficiency.",
    categoryId: null,
    banner: "https://cpimg.tistatic.com/05387768/b/4/Fiber-Body-Electric-Air-Cooler.jpg",
  },
  vacuum: {
    title: "Vacuum Cleaners",
    eyebrow: "Cleaning Collection",
    subtitle: "Smart, powerful, and effortless cleaning for modern homes.",
    categoryId: null,
    banner: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1600&q=80",
  },
  refrigerators: {
    title: "Refrigerators",
    eyebrow: "Kitchen Collection",
    subtitle: "Freshness preserved. Style delivered. Day after day.",
    categoryId: 12,
    banner: "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&w=1600&q=80",
  },
  headphones: {
    title: "Headphones",
    eyebrow: "Audio Collection",
    subtitle: "Pure sound. Zero compromise. Every note, perfectly rendered.",
    categoryId: 17,
    banner: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
  },
  "kitchen-appliances": {
    title: "Kitchen Appliances",
    eyebrow: "Culinary Collection",
    subtitle: "Tools that transform everyday cooking into craft.",
    categoryId: 26,
    banner: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1600&q=80",
  },
  grooming: {
    title: "Grooming",
    eyebrow: "Personal Care Collection",
    subtitle: "Precision tools for the well-groomed modern individual.",
    categoryId: 25,
    banner: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80",
  },
};

const TEAL = "#12daa8";
const TEAL_DIM = "rgba(18,218,168,0.1)";
const TEAL_BORDER = "rgba(18,218,168,0.25)";

// ─── Component ────────────────────────────────────────────────────────────────
export default function ItemSliderPage() {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  const item = itemConfig[categoryName?.toLowerCase()];

  useEffect(() => {
    if (!item?.banner) return;
    setBannerLoaded(false);
    const img = new Image();
    img.src = item.banner;
    img.onload = () => setBannerLoaded(true);
    img.onerror = () => setBannerLoaded(true);
  }, [item?.banner]);

  useEffect(() => {
    if (!item) { setLoading(false); return; }
    setLoading(true);
    fetch(`http://localhost:8081/api/products/category/${item.categoryId}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setProducts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setProducts([]); setLoading(false); });
  }, [item?.categoryId]);

  const featured = useMemo(() => products.slice(0, 8), [products]);

  // ── Not found ────────────────────────────────────────────────────────────────
  if (!item) {
    return (
      <div style={s.notFound}>
        <style>{fonts + animations}</style>
        <span style={s.notFoundBg}>404</span>
        <div style={s.notFoundContent}>
          <p style={{ ...s.eyebrow, marginBottom: 12 }}>Page Error</p>
          <h1 style={s.notFoundH}>Category Not Found</h1>
          <p style={s.notFoundP}>We couldn't locate this collection.</p>
          <button style={s.notFoundBtn} onClick={() => navigate("/")}>← Return Home</button>
        </div>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading && products.length === 0) {
    return (
      <div style={s.loadingWrap}>
        <style>{fonts + animations}</style>
        <div style={s.loadingRing} />
        <p style={s.loadingText}>Curating {item.title}…</p>
      </div>
    );
  }

  // ── Page ─────────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <style>{fonts + animations}</style>

      {/* ══ HERO — split screen ═══════════════════════════════════════════════ */}
      <header style={s.hero}>

        {/* Left panel — text */}
        <div style={s.heroLeft} className="isp-fade-in">

          {/* Eyebrow pill */}
          <div style={s.pill}>
            <span style={s.pillDot} />
            {item.eyebrow}
          </div>

          {/* Giant serif title */}
          <h1 style={s.heroTitle}>{item.title}</h1>

          {/* Gold rule */}
          <div style={s.rule} />

          <p style={s.heroSub}>{item.subtitle}</p>

          {/* Stats */}
          <div style={s.stats}>
            {[
              { num: `${featured.length}+`, lbl: "Products" },
              { num: "Free",               lbl: "Delivery"  },
              { num: "Easy",               lbl: "Returns"   },
            ].map((st, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div style={s.statSep} />}
                <div style={s.statItem}>
                  <span style={s.statNum}>{st.num}</span>
                  <span style={s.statLbl}>{st.lbl}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Buttons */}
          <div style={s.heroBtns}>
            <button
              className="isp-btn-gold"
              style={s.btnGold}
              onClick={() => navigate(`/products?categoryId=${item.categoryId}`)}
            >
              Shop All {item.title} →
            </button>
            <button
              className="isp-btn-ghost"
              style={s.btnGhost}
              onClick={() => navigate("/")}
            >
              ← Home
            </button>
          </div>
        </div>

        {/* Right panel — banner image */}
        <div style={s.heroRight}>
          {/* dark base always visible — no flash */}
          <div style={s.heroImgBase} />
          {bannerLoaded && (
            <img
              src={item.banner}
              alt={item.title}
              style={s.heroImg}
              className="isp-banner-in"
            />
          )}
          {/* Gradient fade into left panel */}
          <div style={s.heroFade} />
          {/* Gold corner bracket */}
          <div style={s.cornerBracket} />
        </div>
      </header>

      {/* ══ FEATURE STRIP ════════════════════════════════════════════════════ */}
      <div style={s.strip}>
        {[
          { icon: "◈", label: "Premium Selection", desc: "Handpicked for quality & value" },
          { icon: "◉", label: "Top Rated Picks",   desc: "Loved by thousands of customers" },
          { icon: "◎", label: "Secure Checkout",   desc: "Safe & encrypted every time"     },
        ].map((f, i) => (
          <div key={i} style={{ ...s.stripItem, borderRight: i < 2 ? "1px solid #1e1e1e" : "none" }}>
            <span style={s.stripIcon}>{f.icon}</span>
            <div>
              <p style={s.stripLabel}>{f.label}</p>
              <p style={s.stripDesc}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ══ PRODUCTS ════════════════════════════════════════════════════════= */}
      <main style={s.main}>

        {/* Section header */}
        <div style={s.secHead}>
          <div>
            <p style={s.eyebrow}>Featured Selection</p>
            <h2 style={s.secTitle}>{item.title} <span style={s.secTitleThin}>Collection</span></h2>
          </div>
          <button
            className="isp-btn-outline"
            style={s.btnOutline}
            onClick={() => navigate(`/products?categoryId=${item.categoryId}`)}
          >
            View All →
          </button>
        </div>

        {/* Count bar */}
        <div style={s.countBar}>
          <span style={s.countText}>{featured.length} products available</span>
          <div style={s.countLine} />
        </div>

        {/* Grid */}
        {featured.length === 0 ? (
          <div style={s.empty}>
            <p style={s.emptyText}>No products available right now.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {featured.map((p, i) => (
              <article
                key={p.id}
                className="isp-card"
                style={{ ...s.card, animationDelay: `${i * 0.065}s` }}
                onClick={() => navigate(`/product/${p.id}`)}
              >
                {/* Editorial index number */}
                <span style={s.cardIdx}>{String(i + 1).padStart(2, "0")}</span>

                {/* Image */}
                <div style={s.imgWrap}>
                  <img
                    className="isp-card-img"
                    src={p.image || p.imageUrl || "https://via.placeholder.com/300x220?text=No+Image"}
                    alt={p.name}
                    style={s.img}
                  />
                  {/* subtle bottom fade */}
                  <div style={s.imgFade} />
                </div>

                {/* Body */}
                <div style={s.cardBody}>
                  <p style={s.cardName}>{p.name}</p>

                  {/* Rating */}
                  <div style={s.ratingRow}>
                    <span style={s.stars}>★ {Number(p.rating || 0).toFixed(1)}</span>
                    <span style={s.reviews}>({p.reviewCount || 0} reviews)</span>
                  </div>

                  {/* Footer: price + arrow */}
                  <div style={s.cardFooter}>
                    <p style={s.price}>
                      ₹{Number(p.price).toLocaleString("en-IN")}
                    </p>
                    <span style={s.arrowCircle}>→</span>
                  </div>

                  {/* Delivery */}
                  <p style={s.delivery}>
                    ✦ {p.delivery || "Free Delivery By ShopEase"}
                  </p>
                </div>

                {/* Bottom gold bar reveals on hover */}
                <div className="isp-card-bar" style={s.cardBar} />
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Fonts ────────────────────────────────────────────────────────────────────
const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Jost:wght@300;400;500;600&display=swap');
`;

// ─── Animations ──────────────────────────────────────────────────────────────
const animations = `
  .isp-fade-in  { animation: ispUp 0.9s cubic-bezier(0.16,1,0.3,1) both; }
  .isp-banner-in{ animation: ispScale 1s cubic-bezier(0.16,1,0.3,1) both; }

  @keyframes ispUp    { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:none; } }
  @keyframes ispScale { from { opacity:0; transform:scale(1.05); }      to { opacity:1; transform:none; } }
  @keyframes ispSpin  { to   { transform: rotate(360deg); } }
  @keyframes ispPulse { 0%,100%{ opacity:1; } 50%{ opacity:0.4; } }

  /* Card */
  .isp-card {
    animation: ispUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
    transition: transform 0.3s cubic-bezier(0.16,1,0.3,1),
                box-shadow 0.3s ease,
                border-color 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  .isp-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(18,218,168,0.15);
    border-color: rgba(18,218,168,0.3) !important;
  }
  .isp-card-img { transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
  .isp-card:hover .isp-card-img { transform: scale(1.08); }

  /* Card bar */
  .isp-card-bar {
    position: absolute; bottom:0; left:0; right:0; height:3px;
    background: #12daa8;
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
    border-radius: 0 0 16px 16px;
  }
  .isp-card:hover .isp-card-bar { transform: scaleX(1); }

  /* Buttons */
  .isp-btn-gold {
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .isp-btn-gold:hover {
    opacity: 0.85;
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(18,218,168,0.3);
  }
  .isp-btn-gold:active { transform: scale(0.97); }

  .isp-btn-ghost {
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }
  .isp-btn-ghost:hover {
    background: rgba(255,255,255,0.06) !important;
    border-color: rgba(255,255,255,0.3) !important;
  }

  .isp-btn-outline {
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }
  .isp-btn-outline:hover {
    background: #12daa8 !important;
    color: #000 !important;
    border-color: #12daa8 !important;
  }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#080808",
    color: "#fff",
    fontFamily: "'Jost', sans-serif",
  },

  /* ── Hero ── */
  hero: {
    display: "grid",
    gridTemplateColumns: "55% 45%",
    minHeight: "580px",
    overflow: "hidden",
  },
  heroLeft: {
    padding: "110px 7% 80px 8%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "#080808",
    position: "relative",
    zIndex: 2,
  },
  heroRight: {
    position: "relative",
    overflow: "hidden",
    background: "#0d0d0d",
  },
  heroImgBase: {
    position: "absolute",
    inset: 0,
    background: "#0d0d0d",
  },
  heroImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    opacity: 0.6,
  },
  heroFade: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to right, #080808 0%, transparent 40%)",
    pointerEvents: "none",
  },
  cornerBracket: {
    position: "absolute",
    bottom: "28px",
    right: "28px",
    width: "52px",
    height: "52px",
    borderRight: `2px solid ${TEAL}`,
    borderBottom: `2px solid ${TEAL}`,
    borderRadius: "0 0 4px 0",
    opacity: 0.5,
  },

  /* Pill */
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: TEAL_DIM,
    border: `1px solid ${TEAL_BORDER}`,
    borderRadius: "100px",
    padding: "6px 16px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1.8px",
    color: TEAL,
    textTransform: "uppercase",
    marginBottom: "28px",
    width: "fit-content",
  },
  pillDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: TEAL,
    boxShadow: `0 0 8px ${TEAL}`,
  },

  /* Title */
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(52px, 6vw, 86px)",
    fontWeight: "900",
    lineHeight: "1.0",
    margin: "0 0 20px",
    letterSpacing: "-2px",
    color: "#f5f0e8",
  },

  rule: {
    width: "50px",
    height: "2px",
    background: TEAL,
    boxShadow: `0 0 12px ${TEAL}`,
    borderRadius: "2px",
    marginBottom: "22px",
  },

  heroSub: {
    fontSize: "16px",
    color: "#888",
    lineHeight: "1.8",
    marginBottom: "36px",
    fontWeight: "300",
    maxWidth: "420px",
  },

  /* Stats */
  stats: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "38px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  statNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "22px",
    fontWeight: "700",
    color: TEAL,
    lineHeight: 1,
    letterSpacing: "-0.5px",
  },
  statLbl: {
    fontSize: "10px",
    color: "#555",
    fontWeight: "500",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  statSep: {
    width: "1px",
    height: "32px",
    background: "#1e1e1e",
  },

  /* Buttons */
  heroBtns: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  btnGold: {
    padding: "14px 28px",
    borderRadius: "8px",
    border: "none",
    background: TEAL,
    color: "#000",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "'Jost', sans-serif",
    letterSpacing: "0.3px",
  },
  btnGhost: {
    padding: "14px 22px",
    borderRadius: "8px",
    border: "1px solid #222",
    background: "transparent",
    color: "#888",
    fontWeight: "500",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "'Jost', sans-serif",
  },

  /* ── Feature strip ── */
  strip: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    borderTop: "1px solid #141414",
    borderBottom: "1px solid #141414",
    background: "#0e0e0e",
  },
  stripItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "22px 6%",
  },
  stripIcon: {
    fontSize: "26px",
    color: TEAL,
    flexShrink: 0,
    lineHeight: 1,
  },
  stripLabel: {
    margin: "0 0 3px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#e5e5e5",
    letterSpacing: "0.2px",
  },
  stripDesc: {
    margin: 0,
    fontSize: "12px",
    color: "#555",
    fontWeight: "300",
  },

  /* ── Main ── */
  main: {
    padding: "60px 8% 80px",
    maxWidth: "1500px",
    margin: "0 auto",
  },

  secHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "20px",
  },
  eyebrow: {
    margin: "0 0 6px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: TEAL,
  },
  secTitle: {
    margin: 0,
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(26px, 3vw, 40px)",
    fontWeight: "900",
    color: "#f5f0e8",
    letterSpacing: "-0.5px",
  },
  secTitleThin: {
    fontWeight: "400",
    fontStyle: "italic",
    color: "#555",
  },
  btnOutline: {
    padding: "12px 22px",
    borderRadius: "8px",
    border: `1.5px solid ${TEAL_BORDER}`,
    background: "transparent",
    color: TEAL,
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "'Jost', sans-serif",
    letterSpacing: "0.3px",
    whiteSpace: "nowrap",
  },

  countBar: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "32px",
  },
  countText: {
    fontSize: "12px",
    color: "#444",
    fontWeight: "400",
    whiteSpace: "nowrap",
    letterSpacing: "0.5px",
  },
  countLine: {
    flex: 1,
    height: "1px",
    background: "#181818",
  },

  /* ── Card grid ── */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "18px",
  },
  card: {
    background: "#111",
    borderRadius: "16px",
    border: "1px solid #1c1c1c",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  },
  cardIdx: {
    position: "absolute",
    top: "14px",
    left: "16px",
    fontFamily: "'Playfair Display', serif",
    fontSize: "11px",
    fontWeight: "700",
    color: "#2a2a2a",
    letterSpacing: "1px",
    zIndex: 2,
    lineHeight: 1,
  },
  imgWrap: {
    position: "relative",
    height: "210px",
    /* White bg so ALL product photos (white-bg or transparent) look consistent */
    background: "#ffffff",
    overflow: "hidden",
    flexShrink: 0,
    borderRadius: "16px 16px 0 0",
  },
  img: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "14px",
    boxSizing: "border-box",
  },
  imgFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40px",
    /* Fade from white into the card body border */
    background: "linear-gradient(to top, rgba(240,240,240,0.6) 0%, transparent 100%)",
    pointerEvents: "none",
  },
  cardBody: {
    padding: "14px 16px 18px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    borderTop: "1px solid #1a1a1a",
  },
  cardName: {
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
    fontFamily: "'Jost', sans-serif",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "12px",
  },
  stars: {
    fontSize: "12px",
    color: TEAL,
    fontWeight: "600",
  },
  reviews: {
    fontSize: "11px",
    color: "#444",
    fontWeight: "400",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: "12px",
    borderTop: "1px solid #1a1a1a",
  },
  price: {
    margin: 0,
    fontFamily: "'Playfair Display', serif",
    fontSize: "20px",
    fontWeight: "700",
    color: "#f5f0e8",
    letterSpacing: "-0.3px",
  },
  arrowCircle: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: TEAL_DIM,
    border: `1px solid ${TEAL_BORDER}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: TEAL,
    fontSize: "13px",
    flexShrink: 0,
  },
  delivery: {
    margin: "10px 0 0",
    fontSize: "11px",
    fontWeight: "600",
    color: TEAL,
    letterSpacing: "0.2px",
  },
  cardBar: {
    borderRadius: "0 0 16px 16px",
  },

  /* ── Empty ── */
  empty: {
    padding: "80px 0",
    textAlign: "center",
    border: "1px dashed #1e1e1e",
    borderRadius: "16px",
  },
  emptyText: {
    color: "#333",
    fontSize: "16px",
    margin: 0,
    fontFamily: "'Playfair Display', serif",
    fontStyle: "italic",
  },

  /* ── Loading ── */
  loadingWrap: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#080808",
    gap: "20px",
    fontFamily: "'Jost', sans-serif",
  },
  loadingRing: {
    width: "36px",
    height: "36px",
    border: `2px solid #1e1e1e`,
    borderTop: `2px solid ${TEAL}`,
    borderRadius: "50%",
    animation: "ispSpin 0.9s linear infinite",
  },
  loadingText: {
    color: "#444",
    fontSize: "14px",
    fontWeight: "300",
    letterSpacing: "1px",
    margin: 0,
  },

  /* ── Not found ── */
  notFound: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#080808",
    fontFamily: "'Jost', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  notFoundBg: {
    position: "absolute",
    fontFamily: "'Playfair Display', serif",
    fontSize: "30vw",
    fontWeight: "900",
    color: "#0e0e0e",
    lineHeight: 1,
    userSelect: "none",
    pointerEvents: "none",
  },
  notFoundContent: {
    textAlign: "center",
    position: "relative",
    zIndex: 2,
  },
  notFoundH: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "36px",
    fontWeight: "700",
    color: "#f5f0e8",
    margin: "0 0 12px",
  },
  notFoundP: {
    color: "#555",
    marginBottom: "28px",
    fontWeight: "300",
  },
  notFoundBtn: {
    padding: "13px 26px",
    borderRadius: "8px",
    border: "none",
    background: TEAL,
    color: "#000",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Jost', sans-serif",
  },
};