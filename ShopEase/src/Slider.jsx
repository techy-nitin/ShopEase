import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";

import Slider1 from "./assets/slider1.webp";
import Slider2 from "./assets/slider2.webp";
import Slider3 from "./assets/slider3.webp";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Slider() {
  const navigate = useNavigate();

  const slides = [
    { image: Slider1, alt: "Laptop Deals", path: "/slider/laptop" },
    { image: Slider2, alt: "TV Deals", path: "/slider/tv" },
    { image: Slider3, alt: "Fridge Deals", path: "/slider/fridge" },
  ];

  return (
    <>
      <style>{`
        .hero-slider-section {
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          margin-top: 72px;
          overflow: hidden;
        }

        .hero-slider-section .swiper {
          width: 100%;
        }

        /* Full viewport height minus navbar — just like Croma */
        .slider-slide-inner {
          width: 100%;
          height: calc(100vh - 72px);
          min-height: 400px;
          max-height: 700px;
          background-size: cover;
          background-position: center top;
          background-repeat: no-repeat;
          cursor: pointer;
          display: block;
        }

        /* Nav arrows */
        .hero-slider-section .swiper-button-next,
        .hero-slider-section .swiper-button-prev {
          color: #ffffff;
          background: rgba(0,0,0,0.30);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          backdrop-filter: blur(4px);
          transition: background 0.2s ease;
        }
        .hero-slider-section .swiper-button-next::after,
        .hero-slider-section .swiper-button-prev::after {
          font-size: 16px;
          font-weight: 900;
        }
        .hero-slider-section .swiper-button-next:hover,
        .hero-slider-section .swiper-button-prev:hover {
          background: rgba(0,0,0,0.55);
        }

        /* Pagination dots */
        .hero-slider-section .swiper-pagination {
          bottom: 16px;
        }
        .hero-slider-section .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: rgba(255,255,255,0.55);
          opacity: 1;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .hero-slider-section .swiper-pagination-bullet-active {
          background: #ffffff;
          transform: scale(1.3);
        }
      `}</style>

      <section className="hero-slider-section">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={true}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div
                className="slider-slide-inner"
                role="img"
                aria-label={slide.alt}
                onClick={() => navigate(slide.path)}
                style={{ backgroundImage: `url(${slide.image})` }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </>
  );
}