import { useEffect } from "react";

const useClickOutside = ({ setState, refElm }) => {
  const handleMousedown = (e) => {
    if (refElm.current && !refElm.current.contains(e.target)) {
      setState(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleMousedown);

    return () => document.removeEventListener("mousedown", handleMousedown);
  }, []);
};

export default useClickOutside;
