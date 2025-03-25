import Footer from "@components/footer/Footer";
import Navbar from "@components/navbar/Navbar";
import Sidebar from "@components/sidebar/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
    return (
      <div className="main">
        <Navbar />
        <div className="mainContainer">
          <div className="sidebarContainer">
            <Sidebar />
          </div>
          <div className="contentContainer">
            <Outlet />
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  export default Layout;