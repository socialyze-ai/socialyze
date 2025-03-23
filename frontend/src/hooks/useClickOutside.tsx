import { useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useClickOutside = (ref: any, callback: () => void) => {
  const handleClick = (e: MouseEvent) => {
    if (ref?.current && !ref.current.contains(e.target)) {
      callback();
    }
  };
  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  });
};

export default useClickOutside;
