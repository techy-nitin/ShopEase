import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_BASE } from "./config";
export default function ProductListingPage() {
  const [searchParams] = useSearchParams();

  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("relevancy");
  const [excludeOutOfStock, setExcludeOutOfStock] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);

  const getLoggedInUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (error) {
      console.error("Invalid user in localStorage:", error);
      return null;
    }
  };

  const getUserId = () => {
    const user = getLoggedInUser();
    return user?.id;
  };

  useEffect(() => {
    let url = `${API_BASE}/api/products`;

    if (keyword) {
      url = `${API_BASE}/api/products/search?keyword=${encodeURIComponent(keyword)}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setProducts([]);
        setLoading(false);
      });
  }, [keyword, category]);

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const userId = getUserId();
        if (!userId) return;

        const res = await fetch(`${API_BASE}/wishlist/${userId}`);
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setWishlistIds(data.map((item) => Number(item.productId)));
        }
      } catch (error) {
        console.error("Wishlist fetch error:", error);
      }
    }

    fetchWishlist();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category) {
      result = result.filter((item) =>
        item.name?.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (excludeOutOfStock) {
      result = result.filter((item) => (item.stock ?? 1) > 0);
    }

    if (sortBy === "lowToHigh") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "highToLow") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "topRated") {
      result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === "latest") {
      result.sort((a, b) => Number(b.id) - Number(a.id));
    }

    return result;
  }, [products, category, excludeOutOfStock, sortBy]);

  const pageTitle = keyword
    ? `Results for "${keyword}"`
    : category
    ? `${category.charAt(0).toUpperCase() + category.slice(1)}`
    : "All Products";

  const isWishlisted = (productId) => {
    return wishlistIds.includes(Number(productId));
  };

  const handleAddToWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const userId = getUserId();
      if (!userId) return;

      if (isWishlisted(productId)) return;

      setWishlistLoadingId(productId);

      const payload = {
        userId: Number(userId),
        productId: Number(productId),
      };

      const res = await fetch(`${API_BASE}/wishlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("Wishlist response status:", res.status);
      console.log("Wishlist response body:", text);

      if (!res.ok) {
        throw new Error(text || "Failed to add to wishlist");
      }

      setWishlistIds((prev) => [...prev, Number(productId)]);
    } catch (error) {
      console.error("Wishlist add error:", error);
    } finally {
      setWishlistLoadingId(null);
    }
  };

  const styles = {
    page: {
      maxWidth: "1450px",
      margin: "0 auto",
      padding: "100px 20px 40px",
      background: "#0f0f10",
      color: "#fff",
      fontFamily: "Arial, sans-serif"
    },
    wrapper: {
      display: "grid",
      gridTemplateColumns: "280px 1fr",
      gap: "24px"
    },
    sidebar: {
      background: "#18181b",
      borderRadius: "16px",
      padding: "20px",
      height: "fit-content",
      position: "sticky",
      top: "100px"
    },
    content: {
      background: "#18181b",
      borderRadius: "16px",
      padding: "20px"
    },
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
      marginBottom: "20px"
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      margin: 0
    },
    count: {
      color: "#9ca3af",
      marginLeft: "8px",
      fontSize: "18px"
    },
    select: {
      padding: "10px 14px",
      borderRadius: "10px",
      background: "#111827",
      color: "#fff",
      border: "1px solid #2b2b2f",
      outline: "none"
    },
    toggleRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px"
    },
    filterTitle: {
      fontSize: "18px",
      fontWeight: "700",
      marginBottom: "18px"
    },
    filterBox: {
      borderTop: "1px solid #2b2b2f",
      paddingTop: "16px",
      marginTop: "16px"
    },
    checkLabel: {
      display: "block",
      marginBottom: "12px",
      color: "#d1d5db",
      cursor: "pointer"
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
      gap: "20px"
    },
    card: {
      background: "#111827",
      border: "1px solid #23262d",
      borderRadius: "16px",
      overflow: "hidden",
      textDecoration: "none",
      color: "#fff",
      display: "block"
    },
    imgWrap: {
      background: "#fff",
      height: "240px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    },
    img: {
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain"
    },
    body: {
      padding: "16px"
    },
    productTitle: {
      fontSize: "15px",
      fontWeight: "600",
      lineHeight: "1.5",
      minHeight: "44px",
      marginBottom: "10px"
    },
    rating: {
      color: "#12daa8",
      fontSize: "14px",
      marginBottom: "10px"
    },
    price: {
      fontSize: "22px",
      fontWeight: "700",
      marginBottom: "8px"
    },
    delivery: {
      color: "#d1d5db",
      fontSize: "14px"
    },
    deliveryDate: {
      color: "#12daa8",
      fontSize: "14px",
      marginTop: "4px"
    },
    empty: {
      padding: "40px 0",
      textAlign: "center",
      color: "#9ca3af",
      fontSize: "18px"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <aside style={styles.sidebar}>
          <div style={styles.toggleRow}>
            <span>Exclude out of stock items</span>
            <input
              type="checkbox"
              checked={excludeOutOfStock}
              onChange={() => setExcludeOutOfStock(!excludeOutOfStock)}
            />
          </div>

          <div style={styles.filterTitle}>Filters</div>

          <div style={styles.filterBox}>
            <div style={{ fontWeight: "700", marginBottom: "10px" }}>Categories</div>
            <label style={styles.checkLabel}>
              <input type="checkbox" checked={category === "laptop"} readOnly /> Laptops
            </label>
            <label style={styles.checkLabel}>
              <input type="checkbox" checked={category === "mobile"} readOnly /> Mobiles
            </label>
            <label style={styles.checkLabel}>
              <input type="checkbox" checked={category === "ac"} readOnly /> AC
            </label>
          </div>

          <div style={styles.filterBox}>
            <div style={{ fontWeight: "700", marginBottom: "10px" }}>Quick Filters</div>
            <label style={styles.checkLabel}>
              <input type="checkbox" /> Top Rated
            </label>
            <label style={styles.checkLabel}>
              <input type="checkbox" /> Latest Arrival
            </label>
            <label style={styles.checkLabel}>
              <input type="checkbox" /> Discounted
            </label>
          </div>
        </aside>

        <section style={styles.content}>
          <div style={styles.topBar}>
            <h1 style={styles.title}>
              {pageTitle}
              <span style={styles.count}>({filteredProducts.length})</span>
            </h1>

            <select
              style={styles.select}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevancy">Relevancy</option>
              <option value="lowToHigh">Price (Lowest First)</option>
              <option value="highToLow">Price (Highest First)</option>
              <option value="topRated">Top Rated</option>
              <option value="latest">Latest Arrival</option>
            </select>
          </div>

          {loading ? (
            <div style={styles.empty}>Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div style={styles.empty}>No products found</div>
          ) : (
            <div style={styles.grid}>
              {filteredProducts.map((item) => (
                <Link to={`/product/${item.id}`} key={item.id} style={styles.card}>
                  <div style={{ ...styles.imgWrap, position: "relative" }}>
                    <button
                      type="button"
                      onClick={(e) => handleAddToWishlist(e, item.id)}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        fontSize: "22px",
                        color: isWishlisted(item.id) ? "red" : "#fff",
                        background: "rgba(0,0,0,0.6)",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 10,
                        border: "none"
                      }}
                    >
                      {wishlistLoadingId === item.id ? "..." : isWishlisted(item.id) ? "♥" : "♡"}
                    </button>

                    <img
                      src={item.image && item.image.trim() !== "" ? item.image : "/no-image.png"}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "220px",
                        objectFit: "contain",
                        background: "#fff",
                        borderRadius: "12px"
                      }}
                      onError={(e) => {
                        console.log("Image failed:", item.image);
                        e.target.src = "/no-image.png";
                      }}
                    />
                  </div>

                  <div style={styles.body}>
                    <div style={styles.productTitle}>{item.name}</div>

                    <div style={styles.rating}>
                      {Number(item.rating || 0).toFixed(1)} ★ ({item.reviewCount || 0})
                    </div>

                    <div style={styles.price}>
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </div>

                    <div style={styles.delivery}>{item.delivery}</div>
                    <div style={styles.deliveryDate}>{item.deliveryDate}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}