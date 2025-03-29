import { useState } from "react";
import {
  FaChartLine,
  FaRegChartBar,
  FaComments,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./Sidebar.scss";
import { useNavigate } from "react-router-dom";
import CreatePost from "@components/create/CreatePost";

const Sidebar = () => {
  const path = location.pathname.split("/")[2] || "dashboard";
  const [activeTab, setActiveTab] = useState(path);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [showCreatePostModal, setCreatePostModal] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    navigate(tab.toLowerCase());
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleCreateClick = () => {
    console.log("Create button clicked");
    // Add your logic here
  };

  return (
    <div className={`sidebar-container ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-toggle" onClick={toggleCollapse}>
        {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </div>

      <button className="sidebar-create-button" onClick={() => setCreatePostModal(true)}>
        <FaPlus className="sidebar-icon" />
        {!isCollapsed && <span>Create</span>}
      </button>

      <CreatePost
        show={showCreatePostModal}
        onHide={() => {
          setCreatePostModal(false);
        }}
      />

      <hr className="sidebar-separator" />

      <div
        className={`sidebar-tab ${activeTab === "dashboard" ? "active" : ""}`}
        onClick={() => handleTabClick("dashboard")}
      >
        <FaChartLine className="sidebar-icon" />
        {!isCollapsed && <span>Publish</span>}
      </div>

      <div
        className={`sidebar-tab ${activeTab === "analytics" ? "active" : ""}`}
        onClick={() => handleTabClick("analytics")}
      >
        <FaRegChartBar className="sidebar-icon" />
        {!isCollapsed && <span>Analytics</span>}
      </div>

      <div
        className={`sidebar-tab ${activeTab === "engagement" ? "active" : ""}`}
        onClick={() => handleTabClick("engagement")}
      >
        <FaComments className="sidebar-icon" />
        {!isCollapsed && <span>Engagement</span>}
      </div>
    </div>
  );
};

export default Sidebar;
