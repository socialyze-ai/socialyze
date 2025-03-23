import { Link, useLocation } from "react-router-dom";
import "./Sidebar.scss";
import { useState } from "react";
import CreatePost from "@components/create/CreatePost";

export const Sidebar = () => {
  const location = useLocation();
  const isActivated = (path: string) => {
    return location.pathname.includes(path);
  };

  const [showCreatePostModal, setCreatePostModal] = useState(false);

  return (
    <div className="sidebar">
      <div className="sidebar-items">
        <div className="sidebar-item sidebar-item-create" onClick={() => setCreatePostModal(true)}>
          <img src="/create.png" alt="" className="icon" />
          <span>Create</span>
        </div>
        <CreatePost
          show={showCreatePostModal}
          onHide={() => {
            setCreatePostModal(false);
          }}
        />
        <Link to="/dashboard">
          <div
            className="sidebar-item"
            id={isActivated("/dashboard") ? "sidebar-item-active" : undefined}
          >
            <img src="/dashboard.png" alt="" className="icon" />
            <span>Dashboard</span>
          </div>
        </Link>
        {/* <Link to="/calendar"> */}
        <div
          className="sidebar-item"
          id={isActivated("/calendar") ? "sidebar-item-active" : undefined}
        >
          <img src="/calendar.png" alt="" className="icon" />
          <span>Calendar</span>
          <img src="/coming-soon2.png" alt="" className="icon comingSoon" />
        </div>
        {/* </Link> */}
        {/* <Link to="/analytics"> */}
        <div
          className="sidebar-item"
          id={isActivated("/analytics") ? "sidebar-item-active" : undefined}
        >
          <img src="/analytics.png" alt="" className="icon" />
          <span>Analytics</span>
          <img src="/coming-soon2.png" alt="" className="icon comingSoon" />
        </div>
        {/* </Link> */}
        {/* <Link to="/engagement"> */}
        <div
          className="sidebar-item"
          id={isActivated("/engagement") ? "sidebar-item-active" : undefined}
        >
          <img src="/engagement.png" alt="" className="icon" />
          <span>Engagement</span>
          <img src="/coming-soon2.png" alt="" className="icon comingSoon" />
        </div>
        {/* </Link> */}
        {/* <Link to="/outreach"> */}
        <div
          className="sidebar-item"
          id={isActivated("/outreach") ? "sidebar-item-active" : undefined}
        >
          <img src="/outreach.png" alt="" className="icon" />
          <span>Outreach</span>
          <img src="/coming-soon2.png" alt="" className="icon comingSoon" />
        </div>
        {/* </Link> */}
        {/* <Link to="/influencer"> */}
        <div
          className="sidebar-item"
          id={isActivated("/influencer") ? "sidebar-item-active" : undefined}
        >
          <img src="/influencer.png" alt="" className="icon" />
          <span>Influencer</span>
          <img src="/coming-soon2.png" alt="" className="icon comingSoon" />
        </div>
        {/* </Link> */}
      </div>
    </div>
  );
};

export default Sidebar;
