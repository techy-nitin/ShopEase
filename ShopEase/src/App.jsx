import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import EmptyCart from "./Cart";
import Navbar from "./navbar";
import Footer from "./footer";
import SlidingAuth from "./login";
import ProtectedRoute from "./Protected";
import Profilepage from "./profile";
import Orders from "./MyOrder";
import Wishlist from "./MyWhisList";
import ProductDetailPage from "./ProductDetail";
import ProductListingPage from "./Productlisting";
import CheckoutOrder from "./Checkout";
import MaintainPage from "./WebsiteMaintain";
import SellerRegister from "./SellerRegistration";
import SellerDashboard from "./SellerDashBoard";
import AddProduct from "./AddProduct";
import FooterPages from "./FooterPages";
import BankOfferPage from "./BankOfferPage";
import BrandPage from "./BrandPage";
import CategorySliderPage from "./SliderPage";
import ItemSliderPage from "./itemsliderpage";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function NotFound() {
  return <h1>404 Page Not Found</h1>;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/brand/:brandName"
          element={
            <Layout>
              <BrandPage />
            </Layout>
          }
        />
        <Route
          path="/slider/:category"
          element={
            <Layout>
              <ProtectedRoute>
                <CategorySliderPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route path="/items/:categoryName" element={<ItemSliderPage />} />
        <Route
          path="/cart"
          element={
            <Layout>
              <ProtectedRoute>
                <EmptyCart />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/bank-offers"
          element={
            <Layout>
              <ProtectedRoute>
                <BankOfferPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route path="/login" element={<SlidingAuth />} />
        <Route
          path="/profile"
          element={
            <Layout>
              <Profilepage />
            </Layout>
          }
        />
        <Route
          path="/footer-pages"
          element={
            <Layout>
              <FooterPages />
            </Layout>
          }
        />
        <Route
          path="/orders"
          element={
            <Layout>
              <Orders />
            </Layout>
          }
        />
        <Route
          path="/seller/add-product"
          element={
            <Layout>
              <AddProduct />
            </Layout>
          }
        />
        <Route
          path="/product/:id"
          element={
            <Layout>
              <ProductDetailPage />
            </Layout>
          }
        />
        <Route
          path="/wishlist"
          element={
            <Layout>
              <Wishlist />
            </Layout>
          }
        />
        <Route
          path="/seller-reg"
          element={
            <Layout>
              <SellerRegister />
            </Layout>
          }
        />
        <Route
          path="/mp"
          element={
            <Layout>
              <MaintainPage />
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <Layout>
              <ProductListingPage />
            </Layout>
          }
        />
        <Route
          path="/seller-dashboard"
          element={
            <Layout>
              <SellerDashboard />
            </Layout>
          }
        />
        <Route
          path="/checkout"
          element={
            <Layout>
              <CheckoutOrder />
            </Layout>
          }
        />
        <Route
          path="*"
          element={
            <div style={{ fontSize: "40px", textAlign: "center", marginTop: "100px", background: "White" }}>
              404 PAGE NOT FOUND
            </div>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;