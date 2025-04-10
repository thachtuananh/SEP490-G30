import React from "react";
import { Routes, Route } from "react-router-dom";

import HomeOwner from "../pages/Home/Owner/Home";
import HomeCleaner from "../pages/Home/Cleaner/HomeCleaner";

import LoginUser from "../pages/login/LoginUser";
import LoginCleaner from "../pages/login/LoginCleaner";
// import LoginSelection from "../pages/login/LoginSelection";

import RegisterUser from "../pages/register/RegisterUser";
import RegisterSelection from "../pages/register/RegisterSelection";
import RegisterCleaner from "../pages/register/RegisterCleaner";

import ForgotPasswordUser from "../pages/profile/owner/ForgotPass";
import ForgotPasswordCleaner from "../pages/profile/cleanner/ForgotPass";

import Infomation from "../pages/profile/owner/infomation";
import InfomationCleaner from "../pages/profile/cleanner/infomationCleaner";

import About from "../pages/About";

import { ActivityList } from "../pages/ActivityList";

import Contact from "../pages/Contact";
import ServiceDetails from "../pages/ServiceDetails/ServiceDetails";
import CleanerDetails from "../pages/CleanerDetails/CleanerDetails";
import CreateJob from "../pages/ServiceDetails/CreateJob";
import CreateJobToCleaner from "../pages/ServiceDetails/CreateJobToCleaner";
import OrderSuccess from "../pages/order_success/OrderSuccess";
import ApplySuccess from "../pages/order_success/ApplySuccess";
import WorkDetail from "../pages/work/WorkDetail";
import ActivityJob from "../pages/ActivityJob";
import JobListFilter from "../pages/JobListFilter";
import ServiceDetailsCombo from "./../pages/ServiceDetails/ServiceDetailsCombo";
import ServiceDetailsCleaner from "./../pages/CleanerDetails/ServiceDetail";
import MainDashboard from "../pages/Admin/MainDashboard";

import OwnerList from "../pages/Admin/ManageUser/Owner/OwnerList";
import CleanerList from "../pages/Admin/ManageUser/Cleaner/CleanerList";
import OwnerDetails from "../pages/Admin/ManageUser/Owner/OwnerDetails";
import AdminCleanerDetails from "../pages/Admin/ManageUser/Cleaner/CleanerDetails";
import LoginAdmin from "../pages/Admin/LoginAdmin";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import CleanerListBan from "../pages/Admin/ManageUser/Cleaner/CleanerListBan";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeOwner />} />
      <Route path="/homeclean" element={<HomeCleaner />} />

      {/* <Route path="/login" element={<LoginSelection />} /> */}
      <Route path="/login/user" element={<LoginUser />} />
      <Route path="/homeclean/login/cleaner" element={<LoginCleaner />} />

      <Route path="/forgot-password/user" element={<ForgotPasswordUser />} />
      <Route
        path="/forgot-password/cleaner"
        element={<ForgotPasswordCleaner />}
      />

      <Route path="/register" element={<RegisterSelection />} />
      <Route path="/register/user" element={<RegisterUser />} />
      <Route path="/homeclean/register/cleaner" element={<RegisterCleaner />} />

      <Route path="/activitylist" element={<ActivityList />} />

      <Route path="/contact" element={<Contact />} />

      <Route path="/infomation" element={<Infomation />} />
      <Route
        path="/homeclean/infomationcleaner"
        element={<InfomationCleaner />}
      />
      <Route path="/about" element={<About />} />

      <Route path="/service/:id?" element={<ServiceDetails />} />

      <Route path="/cleaner/:cleanerId" element={<CleanerDetails />} />
      <Route path="/createjob" element={<CreateJob />} />
      <Route path="/createjobtocleaner" element={<CreateJobToCleaner />} />
      <Route path="/homeclean/activityjob" element={<ActivityJob />} />

      {/* <Route path="/ordersuccess" element={<OrderSuccess />} /> */}
      {/* <Route path="/applysuccess" element={<ApplySuccess />} /> */}

      <Route path="/workdetail/:jobId?" element={<WorkDetail />} />

      <Route path="/service-details-combo" element={<ServiceDetailsCombo />} />
      <Route
        path="/service-details-cleaner"
        element={<ServiceDetailsCleaner />}
      />

      <Route path="/homeclean/job-list" element={<JobListFilter />} />

      {/* Admin login route - accessible to everyone */}
      <Route path="/admin-login" element={<LoginAdmin />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <MainDashboard />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/owners"
        element={
          <ProtectedAdminRoute>
            <OwnerList />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/cleaners"
        element={
          <ProtectedAdminRoute>
            <CleanerList />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/cleaners-ban"
        element={
          <ProtectedAdminRoute>
            <CleanerListBan />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/owners/:customerId"
        element={
          <ProtectedAdminRoute>
            <OwnerDetails />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/cleaners/:cleanerId"
        element={
          <ProtectedAdminRoute>
            <AdminCleanerDetails />
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  );
};

export default Routers;
