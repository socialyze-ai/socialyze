import { useEffect, useRef, useState } from "react";
import "./Navbar.scss";
import axios from "axios";
import { BACKEND_URL, WEBSITE_URL } from "../../config/endpoints";
import { redirect, Link } from "react-router-dom";

export const Navbar = () => {
  const [showSettingDropdown, setSettingDropdown] = useState(false);
  const settingsDropdownRef = useRef<HTMLDivElement | null>(null);
  const settingsIconRef = useRef<HTMLImageElement | null>(null);

  const toggleSettingDropdown = (e: any) => {
    e.stopPropagation();
    setSettingDropdown(!showSettingDropdown);
  };

  //Handle outside click
  const handleOutsideClick = (event: any) => {
    if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target)) {
      setSettingDropdown(false);
    }
  };
  const updateSettingDropdownPos = () => {
    if (settingsIconRef.current && settingsDropdownRef.current) {
      const iconRect = settingsIconRef.current.getBoundingClientRect();
      const dropdownRect = settingsDropdownRef.current.getBoundingClientRect();
      // Calculate initial position
      let top = iconRect.bottom + 10; // Add 10 pixels
      let left = iconRect.left - (dropdownRect.width - iconRect.width) / 2; // Center align

      // Check if the dropdown goes outside the right edge of the viewport
      const rightEdge = left + dropdownRect.width;
      const viewportWidth = window.innerWidth;
      if (rightEdge > viewportWidth) {
        left -= rightEdge - viewportWidth;
      }
      left -= 10;

      // Check if the dropdown goes outside the bottom edge of the viewport
      const bottomEdge = top + dropdownRect.height;
      const viewportHeight = window.innerHeight;
      if (bottomEdge > viewportHeight) {
        top -= bottomEdge - viewportHeight;
      }

      // Ensure the dropdown stays within the viewport
      top = Math.max(top, 0); // Ensure it's not above the top edge
      left = Math.max(left, 0); // Ensure it's not left of the left edge

      settingsDropdownRef.current.style.position = "absolute";
      settingsDropdownRef.current.style.top = `${top}px`;
      settingsDropdownRef.current.style.left = `${left}px`;
    }
  };

  const handleLogoutButton = () => {
    // Chack if user already loggedin or not
    axios
      .get(`${BACKEND_URL}/user/logout`, { withCredentials: true })
      .then((response) => {
        // Handle the successful response data here
        window.location.href = "http://simpleeffex.com";
      })
      .catch((error) => {
        // Handle any errors here
        console.error("API request error:", error);
      });
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    window.addEventListener("resize", updateSettingDropdownPos);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("resize", updateSettingDropdownPos);
    };
  }, []);

  useEffect(() => {
    updateSettingDropdownPos();
  }, [showSettingDropdown]);

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <Link to="/dashboard">
          <img src="/logo.png" alt="Logo" />
        </Link>
      </div>
      <div className="navbar-icons">
        <Link to={`${WEBSITE_URL}/privacy-policy.html`} target="_blank">
          <img src="/question.png" alt="" className="icon" />
        </Link>
        <img
          src="/setting.png"
          alt=""
          className="icon"
          ref={settingsIconRef}
          onClick={toggleSettingDropdown}
        />
      </div>
      {showSettingDropdown && (
        <div
          className="settingDropdownItems"
          ref={settingsDropdownRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="item">
            <img src="/account.png" alt="" className="icon" />
            <span>Profile</span>
          </div>
          <div className="item" onClick={handleLogoutButton}>
            <img src="/logout.png" alt="" className="icon" />
            <span>Logout</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
