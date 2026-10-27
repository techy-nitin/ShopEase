import React, { useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {

  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email.trim()) {
      alert("Please enter your email first");
      return;
    }

    alert("Newsletter feature coming soon 🚀 Stay tuned for exciting offers!");
    setEmail("");
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* CONNECT WITH US */}
        <div style={{ ...styles.column, ...styles.withBorder }}>
          <h3 style={styles.heading}>CONNECT WITH US</h3>

          <div style={styles.subscribeBox}>
            <input
              type="email"
              placeholder="Enter Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />

            <button
              style={styles.subscribeBtn}
              onClick={handleSubscribe}
            >
              Subscribe
            </button>
          </div>

          <p style={styles.smallText}>
            Stay updated with latest offers, new arrivals, and important
            shopping updates from ShopEase.
          </p>

          <div style={styles.socialRow}>
            <a href="#" style={styles.socialIcon}>YT</a>
            <a href="#" style={styles.socialIcon}>FB</a>
            <a href="#" style={styles.socialIcon}>IG</a>
            <a href="#" style={styles.socialIcon}>IN</a>
            <a href="#" style={styles.socialIcon}>TW</a>
          </div>

          <p style={styles.copyText}>© 2026 ShopEase. All rights reserved.</p>
        </div>

        {/* USEFUL LINKS */}
        <div style={{ ...styles.column, ...styles.withBorder }}>
          <h3 style={styles.heading}>USEFUL LINKS</h3>

          <div style={styles.linkGrid}>
            <ul style={styles.list}>
              <li><Link to="/footer-pages#about" style={styles.link}>About Us</Link></li>
              <li><Link to="/footer-pages#support" style={styles.link}>Help & Support</Link></li>
              <li><Link to="/footer-pages#faq" style={styles.link}>FAQs</Link></li>
              <li><Link to="/footer-pages#guide" style={styles.link}>Buying Guide</Link></li>
              <li><Link to="/footer-pages#return" style={styles.link}>Return Policy</Link></li>
              <li><Link to="/footer-pages#store" style={styles.link}>Store Locator</Link></li>
            </ul>

            <ul style={styles.list}>
              <li><Link to="/footer-pages#careers" style={styles.link}>Careers</Link></li>
              <li><Link to="/footer-pages#terms" style={styles.link}>Terms Of Use</Link></li>
              <li><Link to="/footer-pages#disclaimer" style={styles.link}>Disclaimer</Link></li>
              <li><Link to="/footer-pages#privacy" style={styles.link}>Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* PRODUCTS */}
       {/* PRODUCTS */}
<div style={styles.column}>
  <h3 style={styles.heading}>PRODUCTS</h3>

  <div style={styles.linkGrid}>
    <ul style={styles.list}>
      <li><Link to="/products?categoryId=11" style={styles.link}>Televisions</Link></li>
      <li><Link to="/products?categoryId=14" style={styles.link}>Air Conditioners</Link></li>
      <li><Link to="/products?categoryId=1" style={styles.link}>Mobile Phones</Link></li>
      <li><Link to="/products?categoryId=10" style={styles.link}>Laptops</Link></li>
      <li><Link to="/products?categoryId=26" style={styles.link}>Kitchen Appliances</Link></li>
    </ul>

    <ul style={styles.list}>
      <li><Link to="/products?categoryId=29" style={styles.link}>Home Theatres</Link></li>
      <li><Link to="/products?categoryId=18" style={styles.link}>Speakers</Link></li>
      <li><Link to="/products?categoryId=17" style={styles.link}>Headphones & Earbuds</Link></li>
      <li><Link to="/products?categoryId=16" style={styles.link}>Tablets</Link></li>
      <li><Link to="/products?categoryId=12" style={styles.link}>Refrigerators</Link></li>
    </ul>
  </div>
</div>
      </div>
    </footer>
  );
};


const styles = {
  footer: {
    backgroundColor: "#0f0f0f",
    color: "#ffffff",
    padding: "60px 70px 40px",
    borderTop: "1px solid #232323",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    display: "flex",
    justifyContent: "space-between",
    gap: "30px",
    maxWidth: "1500px",
    margin: "0 auto",
    flexWrap: "wrap",
  },

  column: {
    flex: "1",
    minWidth: "280px",
    paddingRight: "30px",
  },

  withBorder: {
    borderRight: "1px solid #2a2a2a",
  },

  heading: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "22px",
    letterSpacing: "1px",
    color: "#ffffff",
  },

  subscribeBox: {
    display: "flex",
    gap: "10px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },

  input: {
    flex: "1",
    minWidth: "180px",
    padding: "13px 14px",
    borderRadius: "10px",
    border: "1px solid #2d2d2d",
    backgroundColor: "#181818",
    color: "#fff",
    outline: "none",
    fontSize: "14px",
  },

  subscribeBtn: {
    padding: "13px 18px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#00c8ff",
    color: "#000",
    fontWeight: "700",
    cursor: "pointer",
  },

  smallText: {
    color: "#b8b8b8",
    fontSize: "14px",
    lineHeight: "1.7",
    marginBottom: "18px",
  },

  socialRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },

  socialIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "#1b1b1b",
    border: "1px solid #2f2f2f",
    color: "#ffffff",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
  },

  copyText: {
    color: "#8f8f8f",
    fontSize: "13px",
    marginTop: "10px",
  },

  linkGrid: {
    display: "flex",
    gap: "50px",
    flexWrap: "wrap",
  },

  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  link: {
    color: "#d9d9d9",
    textDecoration: "none",
    fontSize: "15px",
    lineHeight: "1.6",
  },
};

export default Footer;