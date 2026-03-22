import React from "react";

export default function BankOfferPage() {
  const offerCards = [
    { bank: "RBL Bank", title: "7.5% Instant Discount", desc: "Up to ₹3000 on Credit Card EMI transactions.", tag: "LIMITED TIME", color: "#ff7a00" },
    { bank: "AU Bank", title: "10% Instant Discount", desc: "Avail offer on selected products with eligible cards.", tag: "NEW OFFER", color: "#c2185b" },
    { bank: "HSBC Bank", title: "10% Instant Discount", desc: "Up to ₹5000 with eligible EMI transactions.", tag: "TOP DEAL", color: "#0077b6" },
    { bank: "MobiKwik", title: "Cashback Offer", desc: "Flat cashback on wallet / UPI transactions.", tag: "CASHBACK", color: "#00a8e8" },
    { bank: "Kotak Bank", title: "Special Discount", desc: "Extra savings on eligible debit and credit cards.", tag: "SAVE MORE", color: "#7b2cbf" },
    { bank: "Tata Neu", title: "NeuCard Offer", desc: "Up to ₹4000 off on selected orders.", tag: "HOT OFFER", color: "#d90429" },
    { bank: "OneCard", title: "Flat Discount", desc: "Extra discount on electronics purchase.", tag: "SPECIAL", color: "#f77f00" },
    { bank: "HDFC Bank", title: "10% Instant Discount", desc: "Applicable on EMI and full swipe transactions.", tag: "BANK DEAL", color: "#008000" },
  ];

  return (
    <div style={styles.page}>
      {/* HERO SECTION */}
      <div style={styles.hero}>
        <div>
          <p style={styles.tag}>PAYMENT OFFERS</p>
          <h1 style={styles.title}>Weekly Cashback & Bank Deals</h1>
          <p style={styles.subtitle}>
            Unlock exclusive savings with top bank credit cards, EMI offers,
            cashback deals, and wallet promotions on ShopEase.
          </p>
        </div>
      </div>

      {/* OFFER GRID */}
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Featured Bank Offers</h2>

        <div style={styles.grid}>
          {offerCards.map((item, index) => (
            <div key={index} style={styles.card}>
              <div
                style={{
                  ...styles.tagBadge,
                  background: item.color,
                }}
              >
                {item.tag}
              </div>

              <h3 style={styles.bank}>{item.bank}</h3>
              <p style={styles.offerTitle}>{item.title}</p>
              <p style={styles.desc}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* TERMS SECTION */}
        <div style={styles.termsBox}>
          <h2 style={styles.sectionTitle}>Terms & Conditions</h2>

          <ul style={styles.list}>
            <li>Offers valid on selected cards, EMI, wallet & UPI payments.</li>
            <li>Minimum cart value required for eligibility.</li>
            <li>Cashback credited as per bank timeline.</li>
            <li>Offers may not combine with other coupons.</li>
            <li>Refunds may reverse applied benefits.</li>
          </ul>

          <p style={styles.footerNote}>
            ShopEase reserves the right to modify or discontinue offers without
            prior notice. Bank policies apply for eligibility verification.
          </p>
        </div>
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
    minHeight: "320px",
    padding: "110px 8% 60px",
    display: "flex",
    alignItems: "center",
    background:
      "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1600)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  tag: {
    color: "rgb(18,218,168)",
    fontWeight: "700",
    letterSpacing: "2px",
    fontSize: "13px",
  },

  title: {
    fontSize: "48px",
    fontWeight: "800",
    margin: "12px 0",
  },

  subtitle: {
    maxWidth: "620px",
    fontSize: "18px",
    color: "#d1d5db",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "40px 8%",
  },

  sectionTitle: {
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "22px",
  },

  card: {
    background: "#121212",
    borderRadius: "18px",
    padding: "20px",
    border: "1px solid #222",
    transition: "0.25s",
    cursor: "pointer",
  },

  tagBadge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "6px 10px",
    borderRadius: "6px",
    color: "#fff",
    marginBottom: "12px",
    display: "inline-block",
  },

  bank: {
    fontSize: "18px",
    fontWeight: "700",
  },

  offerTitle: {
    fontSize: "16px",
    fontWeight: "700",
    margin: "8px 0",
  },

  desc: {
    fontSize: "14px",
    color: "#aaa",
  },

  termsBox: {
    marginTop: "50px",
    background: "#121212",
    borderRadius: "18px",
    padding: "30px",
    border: "1px solid #222",
  },

  list: {
    paddingLeft: "18px",
    lineHeight: "2",
    color: "#ccc",
  },

  footerNote: {
    marginTop: "20px",
    color: "#888",
    fontSize: "14px",
  },
};