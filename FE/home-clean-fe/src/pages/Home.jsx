import React from "react"
import Hero from "../components/Hero"
import FeaturesSection from "../components/FeaturesSection"
import ServiceSection from "../components/ServiceSection"
import NewsSection from "../components/NewsSection"
import TestimonialSection from "../components/TestimonialSection"

const HomePage = () => {
    return (
        <>
            <Hero />
            <ServiceSection title="Dịch vụ tiêu biểu" />
            <ServiceSection title="Sản phẩm mới" />
            <FeaturesSection />
            <TestimonialSection />
            <NewsSection />
        </>
    )
}

export default HomePage
