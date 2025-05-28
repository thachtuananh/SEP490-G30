import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Home/Owner/Navbar";
import Footer from "../components/Home/Owner/Footer";
import Routers from "../routers/Routers";

const Layout = () => {
  const location = useLocation();

  // Danh sách các trang không cần Navbar và Footer
  const hideNavbarFooter =
    [
      "/login",
      "/register",
      "/forgot-password/user",
      "/forgot-password/cleaner",
      "/register/user",
      "/register/cleaner",
      "/login",
      "/login/user",
      "/login/cleaner",
      "/homeclean",
      "/",
      "/admin-login",
      "/admin",
      "/cleaner-pricing",
    ].includes(location.pathname) ||
    location.pathname.startsWith("/workdetail/") ||
    location.pathname.startsWith("/admin/") ||
    location.pathname.startsWith("/homeclean/");

  return (
    <>
      {!hideNavbarFooter && <Navbar />}
      <Routers />
      {!hideNavbarFooter && <Footer />}
    </>
  );
};

export default Layout;
