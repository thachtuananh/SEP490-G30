import React from "react";
import JobSection from "../../../components/Home/Cleaner/JobSection";
import JobList from "../../../components/Home/Cleaner/JobList";
import "../../../components/Home/Cleaner/home.css"
import Navbar from "../../../components/Home/Cleaner/Navbar";
import Footer from "../../../components/Home/Cleaner/Footer";
const HomeCleaner = () => {
    return (
        <>
            <Navbar />
            <JobSection />
            <JobList />
            <Footer />
        </>
    );
};
export default HomeCleaner;