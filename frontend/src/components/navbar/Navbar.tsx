import { FaUser, FaSignOutAlt, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Navbar.scss";
import { useState } from "react";
import Modal from "@components/modal/Modal";

const Navbar = () => {
  const navigate = useNavigate();
  const [openLogoutModal, setOpenLogoutModal] = useState(false);

  const handleLogout = () => {
    setOpenLogoutModal(true);
  };

  const handleNavbarLogoClick = () => {
    navigate("/");
  };

  return (
    <>
      <div className="navbar-container">
        <div className="navbar-logo" onClick={handleNavbarLogoClick}>
          Socialyze
        </div>

        <div className="navbar-search">
          <FaSearch className="navbar-search-icon" />
          <input type="text" placeholder="Search..." className="navbar-search-input" />
        </div>

        <div className="navbar-actions">
          <button className="navbar-profile" onClick={() => navigate("/dashboard/profile")}>
            <FaUser /> Profile
          </button>
          <button className="navbar-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
      {openLogoutModal && (
        <Modal onClose={() => setOpenLogoutModal(false)}>
          <div className="navbar-logout-modal">
            <p>Are you sure you want to logout ?</p>
            <div className="navbar-logout-modal-buttons">
              <button
                onClick={() => setOpenLogoutModal(false)}
                className="navbar-logout-modal-button"
                style={{ backgroundColor: "#ddd", color: "#333" }}
              >
                No
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("jwtToken");
                  localStorage.removeItem("selectedProject");
                  navigate("/login");
                }}
                className="navbar-logout-modal-button"
                style={{ backgroundColor: "#e74c3c", color: "#fff" }}
              >
                Yes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Navbar;
