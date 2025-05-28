import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Handle scroll to top on pathname change (forward navigation)
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Handle scroll to top on back/forward navigation
    const handlePopstate = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener("popstate", handlePopstate);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, []);

  return null;
};
