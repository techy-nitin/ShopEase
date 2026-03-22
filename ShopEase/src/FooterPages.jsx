import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { API_BASE } from "./config";
export default function FooterPages() {
  const location = useLocation();

  // Fix scroll offset (prevents hiding under navbar)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);

      if (el) {
        setTimeout(() => {
          const navbarOffset = 100;
          const elementPosition =
            el.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navbarOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }, 100);
      }
    }
  }, [location]);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  const scrollToBottom = () =>
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>

        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>ShopEase Info</h2>

          <nav style={styles.nav}>
            <Link to="/footer-pages#about" style={styles.link}>About Us</Link>
            <Link to="/footer-pages#support" style={styles.link}>Help & Support</Link>
            <Link to="/footer-pages#faq" style={styles.link}>FAQs</Link>
            <Link to="/footer-pages#guide" style={styles.link}>Buying Guide</Link>
            <Link to="/footer-pages#return" style={styles.link}>Return Policy</Link>
            <Link to="/footer-pages#store" style={styles.link}>Store Locator</Link>
            <Link to="/footer-pages#careers" style={styles.link}>Careers</Link>
            <Link to="/footer-pages#terms" style={styles.link}>Terms Of Use</Link>
            <Link to="/footer-pages#disclaimer" style={styles.link}>Disclaimer</Link>
            <Link to="/footer-pages#privacy" style={styles.link}>Privacy Policy</Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={styles.content}>
          <div style={styles.hero}>
            <h1 style={styles.heroTitle}>ShopEase Information Center</h1>
            <p style={styles.heroText}>
              Explore company information, policies, customer support details,
              and shopping guidance designed to make your ShopEase experience
              secure, transparent, and convenient.
            </p>
          </div>

          <Section id="about" title="About Us" />
          <Section id="support" title="Help & Support" />
          <Section id="faq" title="FAQs" />
          <Section id="guide" title="Buying Guide" />
          <Section id="return" title="Return Policy" />
          <Section id="store" title="Store Locator" />
          <Section id="careers" title="Careers" />
          <Section id="terms" title="Terms Of Use" />
          <Section id="disclaimer" title="Disclaimer" />
          <Section id="privacy" title="Privacy Policy" />
        </main>
      </div>

      {/* Floating Buttons */}
      <div style={styles.floatingBtns}>
        <button style={styles.floatBtn} onClick={scrollToTop}>
          ↑ Top
        </button>
        <button style={styles.floatBtn} onClick={scrollToBottom}>
          ↓ Bottom
        </button>
      </div>
    </div>
  );
}

/* Section Component */

function Section({ id, title }) {
  return (
    <section id={id} style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <p style={styles.sectionText}>
        This section provides important information related to {title.toLowerCase()}.
        ShopEase ensures transparency, clarity, and accessibility so customers can
        confidently understand policies, services, and support processes.
      </p>
    </section>
  );
}

/* Styles */

const styles = {
  page: {
    backgroundColor: "#0b0b0b",
    color: "#ffffff",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },

  wrapper: {
    display: "flex",
    maxWidth: "1600px",
    margin: "0 auto",
  },

  sidebar: {
    width: "260px",
    minHeight: "100vh",
    backgroundColor: "#111",
    borderRight: "1px solid #222",
    padding: "28px 20px",
    position: "sticky",
    top: 0,
  },

  sidebarTitle: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#12DAA8",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  link: {
    textDecoration: "none",
    color: "#e5e5e5",
    backgroundColor: "#181818",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #262626",
    fontSize: "14px",
    transition: "0.25s",
  },

  content: {
    flex: 1,
    padding: "32px",
  },

  hero: {
    background: "#121212",
    border: "1px solid #242424",
    borderRadius: "16px",
    padding: "28px",
    marginBottom: "28px",
  },

  heroTitle: {
    fontSize: "34px",
    marginBottom: "12px",
    color: "#12DAA8",
  },

  heroText: {
    fontSize: "16px",
    color: "#d0d0d0",
    lineHeight: "1.8",
  },

  section: {
    backgroundColor: "#121212",
    border: "1px solid #232323",
    borderRadius: "14px",
    padding: "26px",
    marginBottom: "22px",
    scrollMarginTop: "110px",
  },

  sectionTitle: {
    fontSize: "26px",
    marginBottom: "12px",
    color: "#12DAA8",
    borderBottom: "1px solid #252525",
    paddingBottom: "10px",
  },

  sectionText: {
    fontSize: "15px",
    color: "#d7d7d7",
    lineHeight: "1.9",
  },

  floatingBtns: {
    position: "fixed",
    right: "22px",
    bottom: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  floatBtn: {
    backgroundColor: "#12DAA8",
    color: "#000",
    border: "none",
    borderRadius: "10px",
    padding: "12px 16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(18,218,168,0.35)",
  },
};