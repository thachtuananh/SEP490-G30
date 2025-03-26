import React from "react"
import Hero from "../../../components/Home/Owner/Hero"
import FeaturesSection from "../../../components/Home/Owner/FeaturesSection"
import NewsSection from "../../../components/Home/Owner/NewsSection"
import TestimonialSection from "../../../components/Home/Owner/TestimonialSection"
import Navbar from "../../../components/Home/Owner/Navbar"
import Footer from "../../../components/Home/Owner/Footer"
import JobUpload from "../../../components/combo-service/JobUpload"
import CleanerSection from "../../../components/Home/Owner/CleanerSection"

const HomePage = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <JobUpload />
            <CleanerSection />
            <FeaturesSection />
            <TestimonialSection />
            <NewsSection />
            <Footer />
        </>
    )
}

export default HomePage