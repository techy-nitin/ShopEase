import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "./config";
import "./index.css";
import "swiper/css";
import "swiper/css/navigation";

import Ac from "./assets/Air.webp";
import Cooler from "./assets/Cooler.webp";
import earphone from "./assets/Fan.webp";
import fridge from "./assets/fridge.webp";
import Grooming from "./assets/Grooming.webp";
import Kitchen from "./assets/Kitchen.webp";
import Laptop from "./assets/Laptop.webp";
import mobile from "./assets/mobile.webp";
import tv from "./assets/tv.webp";
import Vaccum from "./assets/Vaccum.webp";

export default function Items() {
  const navigate = useNavigate();

  const category = [
    { name: "Mobiles", image: mobile, link: "/items/mobiles" },
    { name: "Televisions", image: tv, link: "/items/televisions" },
    { name: "Laptops", image: Laptop, link: "/items/laptops" },
    { name: "Air Conditioners", image: Ac, link: "/items/air-conditioners" },
    { name: "Coolers", image: Cooler, link: "/items/coolers" },
    { name: "Vacuum", image: Vaccum, link: "/items/vacuum" },
    { name: "Refrigerators", image: fridge, link: "/items/refrigerators" },
    { name: "Headphones", image: earphone, link: "/items/headphones" },
    { name: "Kitchen Appliances", image: Kitchen, link: "/items/kitchen-appliances" },
    { name: "Grooming", image: Grooming, link: "/items/grooming" },
  ];

  const styles = {
    categorySlider: {
      width: "80%",
      padding: "35px 0",
      margin: "0 auto",
      background: "#0f0f0f",
    },

    categoryCard: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textDecoration: "none",
      cursor: "pointer",
    },

    iconImg: {
      width: "120px",
      height: "120px",
      borderRadius: "25px",
      objectFit: "cover",
      border: "1px solid #222",
      transition: "transform 0.25s ease, box-shadow 0.25s ease",
    },

    text: {
      marginTop: "10px",
      fontSize: "13px",
      color: "#d4d4d4",
      textAlign: "center",
      fontWeight: "600",
    },
  };

  return (
    <div style={styles.categorySlider}>
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={25}
        slidesPerView={8}
        breakpoints={{
          0: { slidesPerView: 2, spaceBetween: 14 },
          480: { slidesPerView: 3, spaceBetween: 16 },
          768: { slidesPerView: 5, spaceBetween: 20 },
          1024: { slidesPerView: 7, spaceBetween: 22 },
          1280: { slidesPerView: 8, spaceBetween: 25 },
        }}
      >
        {category.map((item, index) => (
          <SwiperSlide key={index}>
            <div
              style={styles.categoryCard}
              onClick={() => navigate(item.link)}
            >
              <img
                src={item.image}
                style={styles.iconImg}
                alt={item.name}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <p style={styles.text}>{item.name}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}