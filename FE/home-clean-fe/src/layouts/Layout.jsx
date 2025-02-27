import React from "react"
import { useLocation } from "react-router-dom"
import Navbar from "../components/Home/Owner/Navbar"
import Footer from "../components/Home/Owner/Footer"
import Routers from "../routers/Routers"

const Layout = () => {
    const location = useLocation()

    // Danh sách các trang không cần Navbar và Footer
    const hideNavbarFooter = [
        "/login",
        "/register",
        "/forgot-password",
        "/register/user",
        "/register/cleaner",
        "/login",
        "/login/user",
        "/login/cleaner",
        "/homeclean",
        "/",
        "/infomationcleaner",

    ].includes(location.pathname)

    return (
        <>
            {!hideNavbarFooter && <Navbar />}
            <Routers />
            {!hideNavbarFooter && <Footer />}
        </>
    )
}

export default Layout
