import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORY_OPTIONS = [
  { id: 1, label: "Mobile Phones" },
  { id: 10, label: "Laptops" },
  { id: 11, label: "Televisions" },
  { id: 12, label: "Refrigerators" },
  { id: 13, label: "Washing Machines" },
  { id: 14, label: "Air Conditioners" },
  { id: 15, label: "Smart Watches" },
  { id: 16, label: "Tablets" },
  { id: 17, label: "Headphones & Earbuds" },
  { id: 18, label: "Speakers" },
  { id: 19, label: "Cameras" },
  { id: 20, label: "Printers" },
  { id: 21, label: "Monitors" },
  { id: 22, label: "Keyboards & Mice" },
  { id: 23, label: "Power Banks" },
  { id: 24, label: "Chargers & Cables" },
  { id: 25, label: "Trimmers & Grooming" },
  { id: 26, label: "Kitchen Appliances" },
  { id: 27, label: "Microwaves" },
  { id: 28, label: "Water Purifiers" },
  { id: 29, label: "Home Theatres" },
];
export default function AddProduct() {
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

  const [formData, setFormData] = useState({
    sellerId: sellerId,
    categoryId: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!sellerId || role !== "seller") {
    navigate("/login");
  }

  const selectedCategory = CATEGORY_OPTIONS.find(
    (item) => item.id === Number(formData.categoryId)
  );

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (
      !formData.categoryId ||
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.stock
    ) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        sellerId: Number(sellerId),
        categoryId: Number(formData.categoryId),
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        imageUrl: formData.imageUrl.trim(),
      };

      const res = await fetch("http://localhost:8081/api/seller/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Product added successfully");
        setFormData({
          sellerId: sellerId,
          categoryId: "",
          name: "",
          description: "",
          price: "",
          stock: "",
          imageUrl: "",
        });

        setTimeout(() => {
          navigate("/seller-dashboard");
        }, 1200);
      } else {
        setError(data.error || "Failed to add product");
      }
    } catch (error) {
      setError("Something went wrong while adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.headerBox}>
          <div>
            <h1 style={styles.title}>Add New Product</h1>
            <p style={styles.subtitle}>
              Add product details, stock, price, and product image link.
            </p>
          </div>

          <button
            style={styles.backBtn}
            onClick={() => navigate("/seller-dashboard")}
          >
            Back To Dashboard
          </button>
        </div>

        <div style={styles.card}>
          {error && <div style={styles.error}>{error}</div>}
          {message && <div style={styles.success}>{message}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.grid}>
              <div>
                <label style={styles.label}>Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select product category</option>
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.id} - {category.label}
                    </option>
                  ))}
                </select>

                {selectedCategory && (
                  <p style={styles.helperText}>
                    Selected: {selectedCategory.label} (ID: {selectedCategory.id})
                  </p>
                )}
              </div>

              <div>
                <label style={styles.label}>Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter product price"
                  style={styles.input}
                />
              </div>

              <div style={styles.fullWidth}>
                <label style={styles.label}>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  style={styles.input}
                />
              </div>

              <div style={styles.fullWidth}>
                <label style={styles.label}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  style={styles.textarea}
                />
              </div>

              <div>
                <label style={styles.label}>Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Enter stock quantity"
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="Paste image url"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.categoryGuideBox}>
              <p style={styles.categoryGuideTitle}>Quick Category Guide</p>
              <div style={styles.categoryGuideGrid}>
                <span style={styles.categoryTag}>1 - Mobile Phones</span>
  <span style={styles.categoryTag}>10 - Laptops</span>
  <span style={styles.categoryTag}>11 - Televisions</span>
  <span style={styles.categoryTag}>12 - Refrigerators</span>
  <span style={styles.categoryTag}>13 - Washing Machines</span>
  <span style={styles.categoryTag}>14 - Air Conditioners</span>
  <span style={styles.categoryTag}>15 - Smart Watches</span>
  <span style={styles.categoryTag}>16 - Tablets</span>
              </div>
            </div>

            <div style={styles.actionRow}>
              <button
                type="button"
                style={styles.secondaryBtn}
                onClick={() => navigate("/seller-dashboard")}
              >
                Cancel
              </button>

              <button type="submit" style={styles.primaryBtn} disabled={loading}>
                {loading ? "Adding Product..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "100px 24px 24px 24px",
    boxSizing: "border-box",
  },
  wrapper: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  headerBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    margin: "8px 0 0 0",
    fontSize: "14px",
    color: "#64748b",
  },
  backBtn: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
  card: {
    background: "#fff",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    border: "1px solid #e2e8f0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },
  fullWidth: {
    gridColumn: "1 / -1",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#1e293b",
    fontSize: "14px",
    fontWeight: "700",
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #dbe3ec",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #dbe3ec",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
    background: "#fff",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #dbe3ec",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
    resize: "vertical",
  },
  helperText: {
    marginTop: "8px",
    marginBottom: 0,
    fontSize: "13px",
    color: "#475569",
  },
  categoryGuideBox: {
    marginTop: "20px",
    padding: "16px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  categoryGuideTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
  },
  categoryGuideGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  categoryTag: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#e2e8f0",
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: "600",
  },
  actionRow: {
    marginTop: "22px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryBtn: {
    padding: "14px 20px",
    borderRadius: "12px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
  },
  secondaryBtn: {
    padding: "14px 20px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "700",
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    marginBottom: "16px",
  },
  success: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    marginBottom: "16px",
  },
};