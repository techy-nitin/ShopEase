import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "swiper/css";

export default function Bank() {
  const navigate = useNavigate();

  const offers = [
    {
      image:
        "https://media.tatacroma.com/Croma%20Assets/CMS/LP%20Page%20Banners/2025/More%20For%20Money/December/mobikwik_t33x9lYsK.png",
      link: "/bank-offers",
    },
    {
      image:
        "https://media.tatacroma.com/Croma%20Assets/CMS/LP%20Page%20Banners/2025/More%20For%20Money/December/HSBC_uTJdfLn1f.png",
      link: "/bank-offers",
    },
    {
      image:
        "https://media.tatacroma.com/Croma%20Assets/CMS/LP%20Page%20Banners/2025/More%20For%20Money/April/Carousal/15042025/2_Tata_Neu_zy3tgd.png",
      link: "/bank-offers",
    },
    {
      image:
        "https://media-ik.croma.com/prod/https://media.tatacroma.com/Croma%20Assets/CMS/LP%20Page%20Banners/2025/More%20For%20Money/April/Carousal/15042025/2_Tata_Neu_zy3tgd.png?tr=w-1000",
      link: "/bank-offers",
    },
  ];

  const styles = {
    section: {
      background: "#0f0f0f",
      padding: "40px 10%",
    },
    title: {
      color: "#fff",
      fontSize: "24px",
      marginBottom: "20px",
      fontWeight: "700",
    },
    image: {
      width: "100%",
      borderRadius: "12px",
      cursor: "pointer",
      display: "block",
    },
  };

  return (
    <div style={styles.section}>
      <h2 style={styles.title}>Exciting Bank Offers For You</h2>

      <Swiper
        modules={[Autoplay]}
        loop={true}
        spaceBetween={15}
        slidesPerView={3}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        speed={900}
        breakpoints={{
          0: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {offers.map((item, index) => (
          <SwiperSlide key={index}>
            <img
              src={item.image}
              alt={`Bank Offer ${index + 1}`}
              style={styles.image}
              onClick={() => navigate(item.link)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}