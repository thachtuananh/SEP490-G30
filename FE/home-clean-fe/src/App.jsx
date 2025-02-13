import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "./index.css"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Hero from "./components/Hero"
import FeaturesSection from "./components/FeaturesSection"
import ServiceSection from "./components/ServiceSection"
import NewsSection from "./components/NewsSection"
import TestimonialSection from "./components/TestimonialSection"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPass"
function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <ServiceSection title="Dịch vụ tiêu biểu" />
      <ServiceSection title="Sản phẩm mới" />
      <FeaturesSection />
      <TestimonialSection />
      <NewsSection />
      <Footer />
    </>
  )
}

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

