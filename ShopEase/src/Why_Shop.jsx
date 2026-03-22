import React from "react";
import why from "./assets/Why.png";
export default function WhyCroma(){

const image = why;

const styles = {

section:{
background:"#0f0f0f",
padding:"50px 8%"
},

title:{
color:"#fff",
fontSize:"26px",
marginBottom:"20px"
},

image:{
width:"100%",
borderRadius:"12px",
cursor:"pointer"
}

};

return(

<div style={styles.section}>

<h2 style={styles.title}>
Why ShopEase?
</h2>

<img
src={image}
alt="Why ShopEase"
style={styles.image}
/>

</div>

);

}