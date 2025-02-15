import React from "react"
import { Routes, Route } from "react-router-dom"
import HomePage from "../pages/Home"
import Login from "../pages/Login"
import Register from "../pages/Register"
import ForgotPassword from "../pages/ForgotPass"

const Routers = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    )
}

export default Routers
