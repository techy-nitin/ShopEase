import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const brandConfig = {
  apple: {
    title: "Apple",
    subtitle: "Premium devices with elegant design and powerful performance.",
    categoryId: 1,
    banner: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1400",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  },
  bose: {
    title: "Bose",
    subtitle: "Immersive sound, premium audio quality, and modern design.",
    categoryId: 18,
    banner: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400",
    logo: "https://1000logos.net/wp-content/uploads/2017/05/Bose-Logo.png",
  },
  croma: {
    title: "Croma",
    subtitle: "Smart electronics and reliable products for every lifestyle.",
    categoryId: 11,
    banner: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1400",
    logo: "https://media.tatacroma.com/Croma%20Assets/Brand%20Identity/Logo/croma_logo.png",
  },
  dell: {
    title: "Dell",
    subtitle: "Performance laptops and work essentials built for productivity.",
    categoryId: 10,
    banner: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg",
  },
  haier: {
    title: "Haier",
    subtitle: "Trusted home appliances designed for comfort and convenience.",
    categoryId: 14,
    banner: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/32/Haier_logo.svg",
  },
  hp: {
    title: "HP",
    subtitle: "Reliable laptops and accessories for work and study.",
    categoryId: 10,
    banner: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1400",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg",
  },
};

export default function BrandPage() {
  const { brandName } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  const brand = brandConfig[brandName?.toLowerCase()];

  useEffect(() => {
    if (!brand?.banner) return;
    setBannerLoaded(false);
    const img = new Image();
    img.src = brand.banner;
    img.onload = () => setBannerLoaded(true);
    img.onerror = () => setBannerLoaded(true);
  }, [brand?.banner]);

  useEffect(() => {
    if (!brand) {
      setProducts([]);
      setProductsLoading(false);
      return;
    }
    setProductsLoading(true);
    fetch(`http://localhost:8081/api/products/category/${brand.categoryId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch brand products");
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setProductsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setProducts([]);
        setProductsLoading(false);
      });
  }, [brand?.categoryId]);

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

  if (!brand) {
    return (
      <div style={styles.notFoundWrap}>
        <h1 style={styles.notFoundTitle}>Brand Not Found</h1>
        <p style={styles.notFoundText}>This brand page is not available right now.</p>
      </div>
    );
  }

  if (productsLoading && products.length === 0) {
    return (
      <div style={styles.loadingWrap}>
        <p style={styles.loadingText}>Loading {brand.title} products...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div
        style={{
          ...styles.hero,
          backgroundColor: "#111",
          backgroundImage: bannerLoaded
            ? `linear-gradient(rgba(0,0,0,0.62), rgba(0,0,0,0.72)), url("${brand.banner}")`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transition: "background-image 0.4s ease",
        }}
      >
        <div style={styles.heroContent}>
          <div style={styles.logoBox}>
            <img src={brand.logo} alt={brand.title} style={styles.logo} />
          </div>
          <div>
            <p style={styles.brandTag}>BRAND STORE</p>
            <h1 style={styles.heroTitle}>{brand.title}</h1>
            <p style={styles.heroSubtitle}>{brand.subtitle}</p>
            <div style={styles.heroButtons}>
              <button
                style={styles.primaryBtn}
                onClick={() => navigate(`/products?categoryId=${brand.categoryId}`)}
              >
                View All Products
              </button>
              <button style={styles.secondaryBtn} onClick={() => navigate("/")}>
                Back To Home
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.infoStrip}>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>Top Quality</h3>
            <p style={styles.infoText}>Carefully selected products for better shopping experience.</p>
          </div>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>Trending Picks</h3>
            <p style={styles.infoText}>Explore most popular items from the {brand.title} collection.</p>
          </div>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>Fast Delivery</h3>
            <p style={styles.infoText}>Get premium products delivered with confidence and convenience.</p>
          </div>
        </div>

        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Featured {brand.title} Products</h2>
            <p style={styles.sectionSub}>{featuredProducts.length} products available</p>
          </div>
          <button
            style={styles.viewAllBtn}
            onClick={() => navigate(`/products?categoryId=${brand.categoryId}`)}
          >
            Explore More
          </button>
        </div>

        {featuredProducts.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyText}>No products available for {brand.title} right now.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {featuredProducts.map((item) => (
              <div
                key={item.id}
                style={styles.card}
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <div style={styles.imageWrap}>
                  <img
                    src={item.image || "https://via.placeholder.com/300x220?text=No+Image"}
                    alt={item.name}
                    style={styles.image}
                  />
                </div>

                <div style={styles.cardBody}>
                  {/* Clamped to 2 lines — keeps all cards the same height */}
                  <p style={styles.productName}>{item.name}</p>

                  <p style={styles.price}>
                    ₹{Number(item.price).toLocaleString("en-IN")}
                  </p>

                  <div style={styles.ratingRow}>
                    <span style={styles.ratingBadge}>
                      ⭐ {Number(item.rating || 0).toFixed(1)}
                    </span>
                    <span style={styles.reviewCount}>
                      ({item.reviewCount || 0} reviews)
                    </span>
                  </div>

                  {/* marginTop: auto pushes delivery to the bottom of every card */}
                  <p style={styles.delivery}>
                    ✦ {item.delivery || "Free Delivery By ShopEase"}
                  </p>
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
    minHeight: "100vh",
    background: "#0b0b0b",
    color: "#fff",
  },
  hero: {
    minHeight: "420px",
    display: "flex",
    alignItems: "center",
    padding: "110px 8% 60px",
  },
  heroContent: {
    display: "flex",
    alignItems: "center",
    gap: "40px",
    flexWrap: "wrap",
  },
  logoBox: {
    width: "160px",
    height: "160px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
  },
  logo: {
    width: "90px",
    maxHeight: "90px",
    objectFit: "contain",
    background: "#fff",
    padding: "8px",
    borderRadius: "12px",
  },
  brandTag: {
    margin: 0,
    color: "#12daa8",
    fontWeight: "700",
    letterSpacing: "2px",
    fontSize: "13px",
  },
  heroTitle: {
    margin: "10px 0 12px",
    fontSize: "54px",
    fontWeight: "800",
  },
  heroSubtitle: {
    margin: 0,
    maxWidth: "620px",
    color: "#d1d5db",
    fontSize: "18px",
    lineHeight: "1.7",
  },
  heroButtons: {
    display: "flex",
    gap: "14px",
    marginTop: "28px",
    flexWrap: "wrap",
  },
  primaryBtn: {
    padding: "14px 22px",
    borderRadius: "12px",
    border: "none",
    background: "#12daa8",
    color: "#000",
    fontWeight: "700",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "14px 22px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "transparent",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
  content: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "36px 8% 60px",
  },
  infoStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "36px",
  },
  infoCard: {
    background: "#141414",
    border: "1px solid #222",
    borderRadius: "18px",
    padding: "22px",
  },
  infoTitle: {
    margin: "0 0 10px",
    fontSize: "18px",
    color: "#fff",
  },
  infoText: {
    margin: 0,
    color: "#9ca3af",
    fontSize: "14px",
    lineHeight: "1.7",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "22px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
  },
  sectionSub: {
    margin: "8px 0 0",
    color: "#9ca3af",
    fontSize: "14px",
  },
  viewAllBtn: {
    padding: "12px 18px",
    borderRadius: "12px",
    border: "1px solid #2b2b2b",
    background: "#171717",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },

  /* ── Card grid ── */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "18px",
  },
  card: {
    background: "#141414",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #262626",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",  /* key: lets body stretch to fill card height */
  },
  imageWrap: {
    position: "relative",
    height: "200px",
    overflow: "hidden",
    flexShrink: 0,
    background: "#1e1e1e",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "12px",
    boxSizing: "border-box",
    background: "#1e1e1e",
  },
  cardBody: {
    padding: "14px 16px 16px",
    display: "flex",
    flexDirection: "column",
    flex: 1,                  /* key: fills remaining card space */
  },
  productName: {
    margin: "0 0 10px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#d1d5db",
    lineHeight: "1.5",
    /* 2-line clamp keeps every card the same height regardless of name length */
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    height: "39px",
  },
  price: {
    margin: "0 0 10px",
    fontSize: "20px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-0.3px",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },
  ratingBadge: {
    background: "#0d2b1f",
    color: "#34d399",
    fontSize: "12px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  reviewCount: {
    color: "#6b7280",
    fontSize: "12px",
  },
  delivery: {
    marginTop: "auto",        /* key: sticks to bottom of card body */
    paddingTop: "10px",
    borderTop: "1px solid #222",
    color: "#12daa8",
    fontSize: "12px",
    fontWeight: "600",
  },

  /* ── Misc ── */
  emptyBox: {
    background: "#121212",
    border: "1px solid #222",
    borderRadius: "18px",
    padding: "40px",
    textAlign: "center",
  },
  emptyText: {
    margin: 0,
    color: "#9ca3af",
    fontSize: "16px",
    fontWeight: "600",
  },
  loadingWrap: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0b0b0b",
  },
  loadingText: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#fff",
  },
  notFoundWrap: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    background: "#0b0b0b",
    color: "#fff",
  },
  notFoundTitle: {
    margin: 0,
    fontSize: "38px",
    fontWeight: "800",
  },
  notFoundText: {
    marginTop: "12px",
    color: "#9ca3af",
  },
};