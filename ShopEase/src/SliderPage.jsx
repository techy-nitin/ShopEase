import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE } from "./config";
const categoryConfig = {
  laptop: {
    title: "Laptops",
    label: "Performance Collection",
    subtitle: "Engineered for those who demand more — from ultrabooks to powerhouse workstations.",
    categoryId: 10,
    accent: "#12daa8",
    banner: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1600",
  },
  tv: {
    title: "Smart TVs",
    label: "Entertainment Collection",
    subtitle: "Every frame a masterpiece. Immerse yourself in cinematic brilliance.",
    categoryId: 5,
    accent: "#12daa8",
    banner: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1600",
  },
  fridge: {
    title: "Refrigerators",
    label: "Kitchen Collection",
    subtitle: "Smart cooling technology that keeps your world fresh, efficient and beautiful.",
    categoryId: 14,
    accent: "#12daa8",
    banner: "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?w=1600",
  },
};

export default function CategorySliderPage() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const config = categoryConfig[category?.toLowerCase()];

  useEffect(() => {
    if (!config?.banner) return;
    setBannerLoaded(false);
    const img = new Image();
    img.src = config.banner;
    img.onload = () => setBannerLoaded(true);
    img.onerror = () => setBannerLoaded(true);
  }, [config?.banner]);

  useEffect(() => {
    if (!config) return;
    fetch(`${API_BASE}/api/products/category/${config.categoryId}`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, [config?.categoryId]);

  if (!config) {
    return (
      <div style={styles.notFound}>
        <div style={styles.notFoundInner}>
          <p style={styles.notFoundLabel}>404</p>
          <h2 style={styles.notFoundTitle}>Category Not Found</h2>
          <p style={styles.notFoundSub}>The category you're looking for doesn't exist.</p>
          <button style={styles.notFoundBtn} onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .cat-hero-content { animation: fadeSlideUp 0.9s cubic-bezier(0.16,1,0.3,1) both; }
        .cat-grid-item { animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cat-card-hover {
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .cat-card-hover:hover {
          transform: translateY(-6px);
          border-color: rgba(18,218,168,0.35) !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(18,218,168,0.1);
        }
        .cat-card-hover:hover .cat-img {
          transform: scale(1.06);
        }
        .cat-img {
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .cat-primary-btn {
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .cat-primary-btn:hover {
          background: #0fbf93 !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(18,218,168,0.3);
        }
        .cat-primary-btn:active { transform: scale(0.98); }

        .cat-secondary-btn {
          transition: background 0.2s, border-color 0.2s;
        }
        .cat-secondary-btn:hover {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.3) !important;
        }

        .cat-stat-item { transition: opacity 0.2s; }
        .cat-stat-item:hover { opacity: 0.75; }
      `}</style>

      {/* ── HERO ── */}
      <div
        style={{
          ...styles.hero,
          backgroundColor: "#0a0a0a",
          backgroundImage: bannerLoaded
            ? `linear-gradient(105deg, rgba(0,0,0,0.92) 38%, rgba(0,0,0,0.55) 100%), url(${config.banner})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Subtle teal glow bottom-left */}
        <div style={styles.heroGlow} />

        <div style={{ ...styles.heroInner, position: "relative", zIndex: 2 }}>
          <div className="cat-hero-content">
            {/* Label pill */}
            <div style={styles.labelPill}>
              <span style={styles.labelDot} />
              {config.label}
            </div>

            {/* Big serif title */}
            <h1 style={styles.heroTitle}>{config.title}</h1>

            {/* Accent line */}
            <div style={styles.accentLine} />

            <p style={styles.heroSubtitle}>{config.subtitle}</p>

            {/* Stats row */}
            <div style={styles.statsRow}>
              <div className="cat-stat-item" style={styles.statItem}>
                <span style={styles.statNum}>{products.length}+</span>
                <span style={styles.statLabel}>Products</span>
              </div>
              <div style={styles.statDivider} />
              <div className="cat-stat-item" style={styles.statItem}>
                <span style={styles.statNum}>Free</span>
                <span style={styles.statLabel}>Delivery</span>
              </div>
              <div style={styles.statDivider} />
              <div className="cat-stat-item" style={styles.statItem}>
                <span style={styles.statNum}>24/7</span>
                <span style={styles.statLabel}>Support</span>
              </div>
            </div>

            <div style={styles.btnRow}>
              <button
                className="cat-primary-btn"
                style={styles.primaryBtn}
                onClick={() => navigate(`/products?categoryId=${config.categoryId}`)}
              >
                Explore All →
              </button>
              <button
                className="cat-secondary-btn"
                style={styles.secondaryBtn}
                onClick={() => navigate("/")}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION HEADER ── */}
      <div style={styles.container}>
        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.sectionEyebrow}>Curated for you</p>
            <h2 style={styles.sectionTitle}>Featured {config.title}</h2>
          </div>
          <button
            className="cat-secondary-btn"
            style={styles.viewAllBtn}
            onClick={() => navigate(`/products?categoryId=${config.categoryId}`)}
          >
            View All Products
          </button>
        </div>

        {/* ── GRID ── */}
        {products.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No products available right now.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {products.slice(0, 8).map((item, i) => (
              <div
                key={item.id}
                className="cat-grid-item cat-card-hover"
                style={{ ...styles.card, animationDelay: `${i * 0.07}s` }}
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <div style={styles.imageWrap}>
                  <img
                    className="cat-img"
                    src={item.image || "https://via.placeholder.com/300x220?text=No+Image"}
                    alt={item.name}
                    style={styles.image}
                  />
                  {/* Hover overlay */}
                  <div style={styles.imageOverlay} />
                </div>

                <div style={styles.cardBody}>
                  <p style={styles.productName}>{item.name}</p>

                  <div style={styles.cardFooter}>
                    <p style={styles.price}>
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </p>
                    <div style={styles.arrowBtn}>→</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#080808",
    color: "#fff",
    minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif",
  },

  /* ── Hero ── */
  hero: {
    minHeight: "520px",
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    bottom: "-80px",
    left: "-80px",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(18,218,168,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 1,
  },
  heroInner: {
    padding: "120px 8% 80px",
    maxWidth: "680px",
  },
  labelPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(18,218,168,0.1)",
    border: "1px solid rgba(18,218,168,0.25)",
    borderRadius: "100px",
    padding: "6px 14px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    color: "#12daa8",
    textTransform: "uppercase",
    marginBottom: "24px",
  },
  labelDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#12daa8",
    boxShadow: "0 0 6px #12daa8",
  },
  heroTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(52px, 7vw, 82px)",
    fontWeight: "700",
    margin: "0 0 16px",
    lineHeight: "1.05",
    letterSpacing: "-1px",
    color: "#f8f8f6",
  },
  accentLine: {
    width: "48px",
    height: "2px",
    background: "#12daa8",
    borderRadius: "2px",
    marginBottom: "20px",
    boxShadow: "0 0 10px rgba(18,218,168,0.5)",
  },
  heroSubtitle: {
    fontSize: "16px",
    color: "#9ca3af",
    lineHeight: "1.75",
    marginBottom: "32px",
    fontWeight: "300",
    maxWidth: "520px",
  },
  statsRow: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginBottom: "36px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    cursor: "default",
  },
  statNum: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#fff",
    fontFamily: "'Cormorant Garamond', serif",
    letterSpacing: "-0.5px",
  },
  statLabel: {
    fontSize: "11px",
    color: "#6b7280",
    fontWeight: "500",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  statDivider: {
    width: "1px",
    height: "32px",
    background: "#262626",
  },
  btnRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryBtn: {
    padding: "14px 28px",
    borderRadius: "10px",
    border: "none",
    background: "#12daa8",
    color: "#000",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.3px",
  },
  secondaryBtn: {
    padding: "14px 24px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "#d1d5db",
    fontWeight: "500",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  /* ── Section ── */
  container: {
    padding: "56px 8% 80px",
    maxWidth: "1500px",
    margin: "0 auto",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  sectionEyebrow: {
    margin: "0 0 6px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#12daa8",
  },
  sectionTitle: {
    margin: 0,
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(28px, 3vw, 40px)",
    fontWeight: "700",
    color: "#f8f8f6",
    letterSpacing: "-0.5px",
  },
  viewAllBtn: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "1px solid #262626",
    background: "transparent",
    color: "#9ca3af",
    fontWeight: "500",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
  },

  /* ── Grid & Card ── */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "#111111",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #1c1c1c",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  },
  imageWrap: {
    position: "relative",
    height: "210px",
    background: "#161616",
    overflow: "hidden",
    flexShrink: 0,
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "16px",
    boxSizing: "border-box",
  },
  imageOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(17,17,17,0.6) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  cardBody: {
    padding: "14px 16px 16px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    borderTop: "1px solid #1c1c1c",
  },
  productName: {
    margin: "0 0 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#c9cdd4",
    lineHeight: "1.55",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    height: "40px",
    fontFamily: "'DM Sans', sans-serif",
  },
  cardFooter: {
    marginTop: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#f8f8f6",
    fontFamily: "'Cormorant Garamond', serif",
    letterSpacing: "-0.3px",
  },
  arrowBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "rgba(18,218,168,0.1)",
    border: "1px solid rgba(18,218,168,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#12daa8",
    fontSize: "14px",
    flexShrink: 0,
  },

  /* ── Empty / Not Found ── */
  emptyState: {
    padding: "80px 0",
    textAlign: "center",
    border: "1px dashed #222",
    borderRadius: "16px",
  },
  emptyText: {
    color: "#4b5563",
    fontSize: "16px",
    margin: 0,
  },
  notFound: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#080808",
    fontFamily: "'DM Sans', sans-serif",
  },
  notFoundInner: {
    textAlign: "center",
    padding: "40px",
  },
  notFoundLabel: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "120px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: 0,
    lineHeight: 1,
  },
  notFoundTitle: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#fff",
    margin: "0 0 12px",
  },
  notFoundSub: {
    color: "#6b7280",
    marginBottom: "28px",
  },
  notFoundBtn: {
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