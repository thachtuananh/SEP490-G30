import React from "react"
import { Routes, Route } from "react-router-dom"

import HomeOwner from "../pages/Home/Owner/Home"
import HomeCleaner from "../pages/Home/Cleaner/HomeCleaner"

import LoginUser from "../pages/login/LoginUser"
import LoginCleaner from "../pages/login/LoginCleaner"
import LoginSelection from "../pages/login/LoginSelection"

import RegisterUser from "../pages/register/RegisterUser"
import RegisterSelection from "../pages/register/RegisterSelection"
import RegisterCleaner from "../pages/register/RegisterCleaner"


import ForgotPassword from "../pages/ForgotPass"
import Infomation from "../pages/profile/owner/infomation"
import InfomationCleaner from "../pages/profile/cleanner/infomationCleaner"

import About from "../pages/About"

import { ActivityList } from "../pages/ActivityList"

import Contact from "../pages/Contact"
import ServiceDetails from "../pages/ServiceDetails/ServiceDetails"

import CreateJob from "../pages/ServiceDetails/CreateJob"
import OrderSuccess from "../pages/order_success/OrderSuccess"
import ApplySuccess from "../pages/order_success/ApplySuccess"
import WorkDetail from "../pages/work/WorkDetail"


const Routers = () => {
    return (
        <Routes>
            <Route path="/" element={<HomeOwner />} />
            <Route path="/homeclean" element={<HomeCleaner />} />

            <Route path="/login" element={<LoginSelection />} />
            <Route path="/login/user" element={<LoginUser />} />
            <Route path="/login/cleaner" element={<LoginCleaner />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/register" element={<RegisterSelection />} />
            <Route path="/register/user" element={<RegisterUser />} />
            <Route path="/register/cleaner" element={<RegisterCleaner />} />

            <Route path="/activitylist" element={<ActivityList />} />

            <Route path="/contact" element={<Contact />} />

            <Route path="/infomation" element={<Infomation />} />
            <Route path="/infomationcleaner" element={<InfomationCleaner />} />
            <Route path="/about" element={<About />} />

            <Route path="/service/:id?" element={<ServiceDetails />} />

            <Route path="/createjob" element={<CreateJob />} />

            <Route path="/ordersuccess" element={<OrderSuccess />} />
            <Route path="/applysuccess" element={<ApplySuccess />} />

            <Route path="/workdetail/:jobId?" element={<WorkDetail />} />

        </Routes>
    )
}

export default Routers