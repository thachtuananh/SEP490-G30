import React from "react"
import Hero from "../../../components/Home/Owner/Hero"
import FeaturesSection from "../../../components/Home/Owner/FeaturesSection"
import ServiceSection from "../../../components/Home/Owner/ServiceSection"
import NewsSection from "../../../components/Home/Owner/NewsSection"
import TestimonialSection from "../../../components/Home/Owner/TestimonialSection"
import Navbar from "../../../components/Home/Owner/Navbar"
import Footer from "../../../components/Home/Owner/Footer"
import JobUpload from "../../../components/Home/Owner/JobUpload"

const HomePage = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <JobUpload />
            <ServiceSection title="Dịch vụ tiêu biểu" />
            <FeaturesSection />
            <TestimonialSection />
            <NewsSection />
            <Footer />
        </>
    )
}

export default HomePage