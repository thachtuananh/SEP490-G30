import React from "react"
import { Routes, Route } from "react-router-dom"
import HomePage from "../pages/Home"
import LoginUser from "../pages/login/LoginUser"
import LoginCleaner from "../pages/login/LoginCleaner"
import LoginSelection from "../pages/login/LoginSelection"

import RegisterUser from "../pages/register/RegisterUser"
import RegisterSelection from "../pages/register/RegisterSelection"
import RegisterCleaner from "../pages/register/RegisterCleaner"

import ForgotPassword from "../pages/ForgotPass"
import Infomation from "../pages/profile/owner/infomation"
import About from "../pages/About"



const Routers = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginSelection />} />
            <Route path="/login/user" element={<LoginUser />} />
            <Route path="/login/cleaner" element={<LoginCleaner />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/register" element={<RegisterSelection />} />
            <Route path="/register/user" element={<RegisterUser />} />
            <Route path="/register/cleaner" element={<RegisterCleaner />} />

            <Route path="/infomation" element={<Infomation />} />
            <Route path="/about" element={<About />} />
        </Routes>
    )
}

export default Routers
