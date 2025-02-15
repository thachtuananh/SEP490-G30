import React from "react"
import { useLocation } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import Routers from "../routers/Routers"

const Layout = () => {
    const location = useLocation()

    // Danh sách các trang không cần Navbar và Footer
    const hideNavbarFooter = ["/login", "/register", "/forgot-password"].includes(location.pathname)

    return (
        <>
            {!hideNavbarFooter && <Navbar />}
            <Routers />
            {!hideNavbarFooter && <Footer />}
        </>
    )
}

export default Layout
