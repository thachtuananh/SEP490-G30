import React from "react"
import { Routes, Route } from "react-router-dom"
import HomePage from "../pages/Home"
import Login from "../pages/login/Login"
import Register from "../pages/register/Register"
import ForgotPassword from "../pages/ForgotPass"
import Infomation from "../pages/profile/owner/infomation"

const Routers = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/infomation" element={<Infomation />} />
        </Routes>
    )
}

export default Routers
