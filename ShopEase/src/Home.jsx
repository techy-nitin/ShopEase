import Slider from "./Slider";
import Items from "./itemsslider";
import Bank from "./bankoffer";
import Brands from "./Brand";
import WhyCroma from "./Why_Shop";
import Deal from "./Deal";

export default function Home() {
  return (
    <>
      <Slider />
      <Items />
      <Bank />
      {/* <SlidingAuth /> */}
      <Deal />
      <WhyCroma />
      <Brands />
    </>
  );
}