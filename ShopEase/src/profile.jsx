import React, { useState } from "react";
import { API_BASE } from "./config";

export default function ProfilePage() {
  const [focus, setFocus] = useState(null);

  // ✅ Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const handleDelete = async (userId) => {  
    const isConfirmed = window.confirm("Delete account permanently?");
    if (!isConfirmed) return;

    try {
        const response = await fetch(`${API_BASE}/delete/${userId}`, {
            method: "DELETE", 
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.removeItem("user"); // ✅ Clear user on delete
            window.location.href = "/login";
        } else {
            alert(data.error || "Failed to delete account");
        }
    } catch (error) {
        console.error(error);
        alert("Something went wrong");
    }
  };

  const styles = {
    container: {
      background: "#0f1111",
      minHeight: "100vh",
      padding: "100px",
      color: "white",
      fontFamily: "Arial",
    },
    title: {
      fontSize: "28px",
      marginBottom: "30px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
    },
    full: {
      gridColumn: "span 2",
    },
    label: {
      color: "#aaa",
      marginBottom: "6px",
      display: "block",
    },
    input: (name) => ({
      width: "100%",
      padding: "14px",
      borderRadius: "10px",
      border: focus === name ? "1px solid #00c853" : "1px solid #444",
      background: "#1c1c1c",
      color: "white",
      outline: "none",
      boxShadow:
        focus === name ? "0 0 8px rgba(0,200,83,0.5)" : "none",
      transition: "0.3s",
    }),
    read: {
      background: "#dcdcdc",
      color: "black",
      border: "none",
    },
    radio: {
      display: "flex",
      gap: "30px",
    },
    inputIcon: {
      display: "flex",
      alignItems: "center",
      background: "#dcdcdc",
      borderRadius: "10px",
      padding: "0 10px",
    },
    prefix: {
      marginRight: "10px",
      color: "black",
    },
    icon: {
      cursor: "pointer",
      fontSize: "14px",
    },
    btnWrap: {
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      marginTop: "40px",
    },
    btn: {
      padding: "12px 24px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "600",
      transition: "0.3s",
    },
    discard: {
      background: "transparent",
      border: "1px solid white",
      color: "white",
    },
    save: {
      background: "#00c853",
      border: "none",
      color: "black",
    },
    delete: {
      background: "Red",
      border: "none",
      color: "black",
    },
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>My Profile Page</h3>

      <form>
        <div style={styles.grid}>

          {/* Title */}
          <div>
            <label style={styles.label}>Title</label>
            <select
              style={styles.input("title")}
              onFocus={() => setFocus("title")}
              onBlur={() => setFocus(null)}
            >
              <option>Mr</option>
              <option>Ms</option>
              <option>Mrs</option>
            </select>
          </div>

          {/* First Name */}
          <div>
            <label style={styles.label}>First Name</label>
            <input
              defaultValue="Guest"
              style={styles.input("fname")}
              onFocus={() => setFocus("fname")}
              onBlur={() => setFocus(null)}
            />
          </div>

          {/* Gender */}
          <div style={styles.full}>
            <div style={styles.radio}>
              <label><input type="radio" name="g" /> Female</label>
              <label><input type="radio" name="g" defaultChecked /> Male</label>
              <label><input type="radio" name="g" /> Transgender</label>
              <label><input type="radio" name="g" /> I'd rather not say</label>
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label style={styles.label}>Mobile Number *</label>
            <div style={styles.inputIcon}>
              <span style={styles.prefix}>+91</span>
              <input
                defaultValue=""
                readOnly
                style={{ ...styles.input(), ...styles.read }}
              />
              <span style={styles.icon}>✏️</span>
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={styles.label}>Email Id *</label>
            <div style={styles.inputIcon}>
              <input
                defaultValue=""
                readOnly
                style={{ ...styles.input(), ...styles.read }}
              />
              <span style={styles.icon}>✏️</span>
            </div>
          </div>

          {/* DOB */}
          <div>
            <label style={styles.label}>Date of Birth</label>
            <input
              type="date"
              style={styles.input("dob")}
              onFocus={() => setFocus("dob")}
              onBlur={() => setFocus(null)}
            />
          </div>

          {/* Anniversary */}
          <div>
            <label style={styles.label}>Date of Anniversary</label>
            <input
              type="date"
              style={styles.input("ann")}
              onFocus={() => setFocus("ann")}
              onBlur={() => setFocus(null)}
            />
          </div>

        </div>

        {/* Buttons */}
        <div style={styles.btnWrap}>
          <button type="button" style={{ ...styles.btn, ...styles.discard }}>
            DISCARD CHANGES
          </button>
          <button type="button" style={{ ...styles.btn, ...styles.save }}>
            SAVE CHANGES
          </button>
          <button
            type="button"
            onClick={() => handleDelete(currentUser?.id)}
            style={{ ...styles.btn, ...styles.delete }}>
            DELETE ACCOUNT
          </button>
        </div>
      </form>
    </div>
  );
}