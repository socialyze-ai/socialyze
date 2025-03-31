import "./Dashboard.scss";
import { useState } from "react";
import AddChannels from "../../popups/addChannels/AddChannels";
import { Channels } from "@components/channels/Channels";

const Dashboard = () => {
  return (
    <>
      <div className="dashboard">
        <Channels />
      </div>
    </>
  );
};

export default Dashboard;
