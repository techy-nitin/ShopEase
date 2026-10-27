import React from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "./config";
export default function Deal() {
  const navigate = useNavigate();

  const Styles = {
    section: {
      background: "#0b0b0b",
      padding: "50px 60px",
      color: "white",
      maxWidth: "1400px",
      margin: "auto"
    },

    title: {
      fontSize: "28px",
      marginBottom: "25px",
      fontWeight: "600"
    },

    container: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "20px"
    },

    link: {
      display: "block",
      overflow: "hidden",
      borderRadius: "12px",
      cursor: "pointer"
    },

    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "12px",
      cursor: "pointer"
    }
  };

  const deals = [
    {
      image: "https://media.tatacroma.com/Croma%20Assets/CMS/LP%20Page%20Banners/2026/Sanity/HP/March/05032026/HP_DOTD_AF_5March26_3xFKzJhMo6.jpg",
      productId: 28
    },
    {
      image: "https://media.tatacroma.com/Croma%20Assets/CMS/LP%20Page%20Banners/2026/Sanity/HP/March/05032026/HP_DOTD_AD_5March26_jgDl0NA2C.jpg",
      productId: 29
    },
    {
      image: "https://media.tatacroma.com/Croma%20Assets/CMS/LP%20Page%20Banners/2026/Sanity/HP/March/05032026/HP_DOTD_M&K_27Feb2026_3GHtaM3iU.jpg",
      productId: 30
    },
    {
      image: "https://media.tatacroma.com/Croma%20Assets/CMS/LP%20Page%20Banners/2026/DOTD/March/05032026/Desktop/HP_DOTD_SW_5March26_79dmwP1Jns.jpg",
      productId: 31
    }
  ];

  return (
    <div style={Styles.section}>
      <h2 style={Styles.title}>Deals Of The Day</h2>

      <div style={Styles.container}>
        {deals.map((item, index) => (
          <div
            key={index}
            style={Styles.link}
            onClick={() => navigate(`/product/${item.productId}`)}
          >
            <img src={item.image} alt="deal" style={Styles.image} />
          </div>
        ))}
      </div>
    </div>
  );
}