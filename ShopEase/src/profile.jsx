import React, { useState } from "react";
import { API_BASE } from "./config";

export default function ProfilePage() {
  const [focus, setFocus] = useState(null);

  // get logged-in user
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const handleDelete = async (e) => {
    e.preventDefault();

    if (!currentUser || !currentUser.id) {
      alert("User not found");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete your account?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/auth/delete/${currentUser.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      // remove user session
      localStorage.removeItem("user");

      alert("Account deleted successfully");

      // redirect to login page
      window.location.href = "/ShopEase/#/login";
    } catch (error) {
      console.error(error);
      alert("Failed to delete account");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Profile Settings</h2>

        <form>
          <div style={styles.field}>
            <label>Name</label>
            <input
              type="text"
              value={currentUser?.name || ""}
              readOnly
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label>Email</label>
            <input
              type="text"
              value={currentUser?.email || ""}
              readOnly
              style={styles.input}
            />
          </div>

          <button
            type="button"
            onClick={handleDelete}
            style={styles.deleteBtn}
          >
            DELETE ACCOUNT
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "16px",
    width: "400px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
  },
  title: {
    marginBottom: "25px",
    textAlign: "center",
  },
  field: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  deleteBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    fontWeight: "bold",
    borderRadius: "6px",
    cursor: "pointer",
  },
};