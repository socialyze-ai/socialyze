import "./Dashboard.scss";

import Channels from "../../popups/channels/Channels";
import { useState } from "react";

const Dashboard = () => {
  const [showChannelsModal, setChannelsModal] = useState(false);

  return (
    <>
      <div className="dashboard">
        Hello
        <button onClick={() => setChannelsModal(true)}>Channels</button>
        <Channels
          show={showChannelsModal}
          onHide={() => {
            setChannelsModal(false);
          }}
        />
      </div>
    </>
  );
};

export default Dashboard;
