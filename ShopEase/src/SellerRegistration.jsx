import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SellerRegistration() {
  const navigate = useNavigate();

  const savedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const userId = savedUser?.id || Number(localStorage.getItem("userId")) || 0;
  const userEmail = savedUser?.email || localStorage.getItem("email") || "";
  const role = savedUser?.role || localStorage.getItem("role") || "";

  const [step, setStep] = useState("sendOtp");
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);

  const [sellerStatus, setSellerStatus] = useState("");
  const [reactivationMode, setReactivationMode] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);

  const [formData, setFormData] = useState({
    email: userEmail,
    otp: "",
    storeName: "",
    phone: "",
    address: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (role === "seller") {
      navigate("/seller-dashboard");
    }
  }, [role, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const loadSellerStatus = async () => {
    if (!userId) {
      setInitialChecking(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:8081/api/seller/status/${userId}`);
      const text = await res.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (res.ok) {
        const currentStatus = data.sellerStatus || data.status || "";
        setSellerStatus(currentStatus);

        if (data.role === "seller" && currentStatus === "active") {
          const updatedUser = {
            ...savedUser,
            id: userId,
            email: userEmail,
            role: "seller",
          };

          localStorage.setItem("user", JSON.stringify(updatedUser));
          localStorage.setItem("userId", String(userId));
          localStorage.setItem("email", userEmail);
          localStorage.setItem("role", "seller");

          navigate("/seller-dashboard");
          return;
        }

        if (currentStatus === "deactivated") {
          setReactivationMode(true);

          const profileData = {
            storeName: data.storeName || "",
            phone: data.phone || "",
            address: data.address || "",
          };

          setExistingProfile(profileData);
          setFormData((prev) => ({
            ...prev,
            email: userEmail || prev.email,
            storeName: data.storeName || "",
            phone: data.phone || "",
            address: data.address || "",
          }));
        } else {
          setReactivationMode(false);
          setExistingProfile(null);
        }
      }
    } catch (error) {
      console.log("Initial status check failed:", error);
    } finally {
      setInitialChecking(false);
    }
  };

  useEffect(() => {
    loadSellerStatus();
  }, [userId]);

  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    if (!userId) {
      setError("User not found. Please login again.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter email");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8081/api/seller/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email: formData.email,
        }),
      });

      const text = await res.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text || "Server returned invalid response" };
      }

      if (res.ok) {
        setMessage(
          data.message ||
            (reactivationMode
              ? "OTP sent successfully. Verify to reactivate seller account."
              : "OTP sent successfully")
        );
        setStep("verifyOtp");
      } else {
        setError(data.error || `Failed to send OTP (HTTP ${res.status})`);
      }
    } catch (error) {
      setError("Something went wrong while sending OTP");
      console.log("Send OTP error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");

    if (!userId) {
      setError("User not found. Please login again.");
      return;
    }

    if (!formData.otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    if (
      !reactivationMode &&
      (
        !formData.storeName.trim() ||
        !formData.phone.trim() ||
        !formData.address.trim()
      )
    ) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const bodyData = {
        userId,
        otp: formData.otp,
      };

      if (!reactivationMode) {
        bodyData.storeName = formData.storeName;
        bodyData.phone = formData.phone;
        bodyData.address = formData.address;
      }

      const res = await fetch("http://localhost:8081/api/seller/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      const text = await res.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text || "Server returned invalid response" };
      }

      if (res.ok) {
        setMessage(
          data.message ||
            (reactivationMode
              ? "Seller reactivation started successfully"
              : "OTP verified successfully")
        );
        setSellerStatus(data.status || "pending");
        setStep("pending");
      } else {
        setError(data.error || `OTP verification failed (HTTP ${res.status})`);
      }
    } catch (error) {
      setError("Something went wrong while verifying OTP");
      console.log("Verify OTP error:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkSellerStatus = async () => {
    if (!userId) return;

    try {
      setCheckingStatus(true);

      const res = await fetch(`http://localhost:8081/api/seller/status/${userId}`);
      const text = await res.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (res.ok) {
        const currentStatus = data.sellerStatus || data.status || "";
        setSellerStatus(currentStatus);

        if (currentStatus === "deactivated") {
          setReactivationMode(true);
          setExistingProfile({
            storeName: data.storeName || "",
            phone: data.phone || "",
            address: data.address || "",
          });
        }

        if (data.role === "seller" && currentStatus === "active") {
          const updatedUser = {
            ...savedUser,
            id: userId,
            email: userEmail,
            role: "seller",
          };

          localStorage.setItem("user", JSON.stringify(updatedUser));
          localStorage.setItem("userId", String(userId));
          localStorage.setItem("email", userEmail);
          localStorage.setItem("role", "seller");

          navigate("/seller-dashboard");
        } else if (currentStatus === "pending") {
          setMessage("Seller request is still pending activation.");
        } else if (currentStatus === "deactivated") {
          setMessage("Seller account is deactivated. Please complete OTP verification.");
        }
      } else {
        setError(data.error || `Failed to check seller status (HTTP ${res.status})`);
      }
    } catch (error) {
      console.log("Status check failed:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    let interval;

    if (step === "pending") {
      interval = setInterval(() => {
        checkSellerStatus();
      }, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, userId]);

  if (initialChecking) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>Checking seller status...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.overlay}>
        <div style={styles.left}>
          <div style={styles.badge}>
            {reactivationMode ? "Reactivate Seller Account" : "Become a Seller"}
          </div>

          <h1 style={styles.title}>
            {reactivationMode ? "Reactivate With ShopEase" : "Earn With ShopEase"}
          </h1>

          <p style={styles.subtitle}>
            {reactivationMode
              ? "Your previous seller profile already exists. Verify OTP and continue with your saved store details."
              : "Start selling on ShopEase and grow your business with more customers, better visibility, and easy seller tools."}
          </p>

          <div style={styles.pointsBox}>
            <div style={styles.point}>✔ Reach more customers</div>
            <div style={styles.point}>✔ Manage your own products</div>
            <div style={styles.point}>✔ Track sales and analytics</div>
            <div style={styles.point}>✔ Export reports in CSV</div>
          </div>
        </div>

        <div style={styles.right}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              {reactivationMode ? "Seller Reactivation" : "Seller Registration"}
            </h2>

            <p style={styles.cardText}>
              {reactivationMode
                ? "Your old seller profile was found. Verify OTP to reactivate without entering store details again."
                : "Join ShopEase and start earning by selling your products online."}
            </p>

            {!userId && (
              <div style={styles.error}>
                User session not found. Please login again.
              </div>
            )}

            {reactivationMode && existingProfile && (
              <div style={styles.infoBox}>
                <div style={styles.infoTitle}>Saved Seller Details</div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Store</span>
                  <span style={styles.infoValue}>{existingProfile.storeName || "-"}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Phone</span>
                  <span style={styles.infoValue}>{existingProfile.phone || "-"}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Address</span>
                  <span style={styles.infoValue}>{existingProfile.address || "-"}</span>
                </div>
              </div>
            )}

            {error && <div style={styles.error}>{error}</div>}
            {message && <div style={styles.success}>{message}</div>}

            {step === "sendOtp" && (
              <>
                <label style={styles.label}>Registered Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                />

                <button
                  onClick={handleSendOtp}
                  disabled={loading || !userId}
                  style={{
                    ...styles.primaryBtn,
                    opacity: loading || !userId ? 0.7 : 1,
                    cursor: loading || !userId ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </>
            )}

            {step === "verifyOtp" && (
              <>
                <label style={styles.label}>OTP</label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  style={styles.input}
                />

                {!reactivationMode && (
                  <>
                    <label style={styles.label}>Store Name</label>
                    <input
                      type="text"
                      name="storeName"
                      placeholder="Enter your store name"
                      value={formData.storeName}
                      onChange={handleChange}
                      style={styles.input}
                    />

                    <label style={styles.label}>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      style={styles.input}
                    />

                    <label style={styles.label}>Address</label>
                    <textarea
                      name="address"
                      placeholder="Enter business address"
                      value={formData.address}
                      onChange={handleChange}
                      style={styles.textarea}
                    />
                  </>
                )}

                {reactivationMode && (
                  <div style={styles.reuseBox}>
                    Your saved seller profile will be reused after OTP verification.
                  </div>
                )}

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || !userId}
                  style={{
                    ...styles.primaryBtn,
                    opacity: loading || !userId ? 0.7 : 1,
                    cursor: loading || !userId ? "not-allowed" : "pointer",
                  }}
                >
                  {loading
                    ? "Verifying..."
                    : reactivationMode
                    ? "Verify & Reactivate"
                    : "Verify & Register"}
                </button>
              </>
            )}

            {step === "pending" && (
              <div style={styles.pendingBox}>
                <div style={styles.pendingIcon}>⏳</div>
                <h3 style={styles.pendingTitle}>Activation In Progress</h3>
                <p style={styles.pendingText}>
                  Your seller account is being activated. Please check status.
                </p>

                <button
                  onClick={checkSellerStatus}
                  disabled={checkingStatus || !userId}
                  style={{
                    ...styles.primaryBtn,
                    opacity: checkingStatus || !userId ? 0.7 : 1,
                    cursor:
                      checkingStatus || !userId ? "not-allowed" : "pointer",
                  }}
                >
                  {checkingStatus ? "Checking..." : "Check Status"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background:
      "linear-gradient(135deg, #0f172a 0%, #111827 35%, #1e293b 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 20px",
    boxSizing: "border-box",
  },
  overlay: {
    width: "100%",
    maxWidth: "1200px",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "30px",
    alignItems: "center",
  },
  left: {
    color: "white",
    padding: "20px",
  },
  badge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "18px",
  },
  title: {
    fontSize: "54px",
    lineHeight: "1.05",
    margin: "0 0 16px 0",
    fontWeight: "800",
    letterSpacing: "-1px",
    color: "#fff",
  },
  subtitle: {
    fontSize: "17px",
    lineHeight: "1.8",
    color: "#cbd5e1",
    maxWidth: "560px",
    marginBottom: "28px",
  },
  pointsBox: {
    display: "grid",
    gap: "12px",
    maxWidth: "420px",
  },
  point: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e2e8f0",
    padding: "14px 16px",
    borderRadius: "14px",
    fontSize: "15px",
    fontWeight: "500",
  },
  right: {
    display: "flex",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: "430px",
    background: "rgba(255,255,255,0.96)",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    boxSizing: "border-box",
  },
  cardTitle: {
    fontSize: "30px",
    margin: "0 0 8px 0",
    color: "#0f172a",
    fontWeight: "800",
  },
  cardText: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "22px",
    lineHeight: "1.6",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    marginTop: "12px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #dbe3ec",
    outline: "none",
    fontSize: "15px",
    marginBottom: "6px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: "95px",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #dbe3ec",
    outline: "none",
    fontSize: "15px",
    resize: "vertical",
    marginBottom: "10px",
    boxSizing: "border-box",
  },
  primaryBtn: {
    width: "100%",
    marginTop: "16px",
    padding: "14px 16px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    fontSize: "15px",
    fontWeight: "700",
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    marginBottom: "14px",
  },
  success: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    marginBottom: "14px",
  },
  infoBox: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    padding: "14px",
    borderRadius: "14px",
    marginBottom: "14px",
  },
  infoTitle: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#1d4ed8",
    marginBottom: "10px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "6px 0",
    borderBottom: "1px solid rgba(59,130,246,0.12)",
  },
  infoLabel: {
    fontSize: "13px",
    color: "#475569",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: "13px",
    color: "#0f172a",
    fontWeight: "700",
    textAlign: "right",
    wordBreak: "break-word",
  },
  reuseBox: {
    marginTop: "12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#334155",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    lineHeight: "1.6",
  },
  pendingBox: {
    textAlign: "center",
    padding: "20px 8px 8px 8px",
  },
  pendingIcon: {
    fontSize: "38px",
    marginBottom: "10px",
  },
  pendingTitle: {
    fontSize: "22px",
    margin: "0 0 10px 0",
    color: "#0f172a",
  },
  pendingText: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.7",
    marginBottom: "16px",
  },
  loadingCard: {
    background: "rgba(255,255,255,0.96)",
    color: "#0f172a",
    padding: "18px 22px",
    borderRadius: "16px",
    fontWeight: "700",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
};