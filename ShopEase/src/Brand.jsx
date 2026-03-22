import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Link } from "react-router-dom";

import "swiper/css";
import "swiper/css/navigation";

export default function Brands() {

const brands = [
{
image:"https://media.tatacroma.com/Croma%20Assets/CMS/Brand%20Logos/2024/Brands%20Icons/30092024/Brands%20Logo/Brands%20Logo/Desktop/13_fbzbpw.png",
link:"/brand/apple"
},
{
image:"https://media.tatacroma.com/Croma%20Assets/CMS/Brand%20Logos/2024/Brands%20Icons/30092024/Brands%20Logo/Brands%20Logo/Desktop/12_hfsle3.png",
link:"/brand/bose"
},
{
image:"https://media.tatacroma.com/Croma%20Assets/CMS/Brand%20Logos/2024/Brands%20Icons/30092024/Brands%20Logo/Brands%20Logo/Desktop/8_dvwyxd.png",
link:"/brand/croma"
},
{
image:"https://media.tatacroma.com/Croma%20Assets/CMS/Brand%20Logos/2024/Brands%20Icons/30092024/Brands%20Logo/Brands%20Logo/Desktop/7_uvvozm.png",
link:"/brand/dell"
},
{
image:"https://media.tatacroma.com/Croma%20Assets/CMS/Brand%20Logos/2024/Brands%20Icons/30092024/Brands%20Logo/Brands%20Logo/Desktop/6_cruwwo.png",
link:"/brand/haier"
},
{
image:"https://media.tatacroma.com/Croma%20Assets/CMS/Brand%20Logos/2024/Brands%20Icons/30092024/Brands%20Logo/Brands%20Logo/Desktop/5_pjm9wd.png",
link:"/brand/hp"
}
];

const styles = {

section:{
background:"#0f0f0f",
padding:"40px 8%"
},

card:{
width:"220px",
height:"120px",
margin:"0 auto",
background:"#3a3a3a",
borderRadius:"12px",
display:"flex",
alignItems:"center",
justifyContent:"center",
cursor:"pointer",
transition:"0.25s ease"
},

logo:{
width:"120px",
objectFit:"contain"
}

};

return(

<div style={styles.section}>

<Swiper
modules={[Navigation]}
navigation
spaceBetween={20}
slidesPerView={5}
>

{brands.map((item,index)=>(

<SwiperSlide key={index}>

<Link to={item.link} style={{textDecoration:"none"}}>

<div
style={styles.card}
onMouseEnter={(e)=>{
e.currentTarget.style.background="#12daa8";
}}
onMouseLeave={(e)=>{
e.currentTarget.style.background="#3a3a3a";
}}
>

<img
src={item.image}
alt="brand"
style={styles.logo}
/>

</div>

</Link>

</SwiperSlide>

))}

</Swiper>

</div>

);

}