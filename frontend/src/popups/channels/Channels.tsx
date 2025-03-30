import "./Channels.scss";
import { FC, useEffect, useState } from "react";

import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@slices/user.slice";
import Modal from "@components/modal/Modal";
import { BACKEND_URL } from "@config/config";
import { FRONTEND_URL } from "../../config/config";

interface ChannelsProps {
  show: boolean;
  onHide: () => void;
}

const Channels: FC<ChannelsProps> = ({ show, onHide }) => {
  const [channels, setChannels] = useState();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleConnect = async (body: { handle: string }) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/channel/getAuthUrl`, body);
      const { url } = response.data;

      if (!url) {
        console.error("Failed to retrieve authentication URL.");
        return;
      }

      // Open authentication popup
      const authWindow = window.open(url, "_blank", "width=600,height=600");

      if (!authWindow) {
        console.error("Popup blocked or failed to open.");
        return;
      }

      // Listen for messages from the popup window
      const handleMessage = (repsponse: MessageEvent) => {
        if (repsponse.origin !== FRONTEND_URL) return;
        if (repsponse.data?.success) {
          // Fetch channels
        }
      };

      window.addEventListener("message", handleMessage);
    } catch (error) {
      console.error("Error while connecting to channel:", error);
    }
  };

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/channel`)
      .then((response) => {
        // if (user) {
        //   const updatedUser = { ...user, channels: _response.data };
        //   dispatch(setUser(updatedUser));
        // }

        console.log(response.data);
      })
      .catch((error) => {
        // Handle any errors here
        console.error("API request error:", error);
      });
  }, []);

  return (
    <div>
      {show && (
        <Modal onClose={onHide}>
          <div className="channelContainer">
            <div className="connectedChannelDiv">
              <label htmlFor="">Connected Channels</label>
              <div className="connectedChannelsList">
                {user &&
                  user.channels &&
                  user.channels.map((item, index) => (
                    <div className="connectedChannel" key={index}>
                      <img
                        src={`${item.profilePic}`}
                        alt="This is an alternative text"
                        className="connectedChannelProfilePic"
                        key={index}
                      />
                      <img
                        src={`/channels/${item.channelName}.png`}
                        alt="/channels/user.png"
                        className="connectedChannelPic"
                      />
                    </div>
                  ))}
              </div>
            </div>
            <label htmlFor="">Connect to any Channel</label>
            <div className="connectChannelList">
              <div
                className="connectChannel channelFacebook"
                onClick={() => {
                  handleConnect({ handle: "facebook" });
                }}
              >
                <img src="/channels/facebook.png" />
                <span>Connect to Facebook</span>
              </div>
              <div
                className="connectChannel channelInstagram"
                onClick={() => {
                  handleConnect({ handle: "instagram" });
                }}
              >
                <img src="/channels/instagram.png" />
                <span>Connect to Instagram</span>
              </div>
              <div
                className="connectChannel channelTwitter"
                onClick={() => {
                  handleConnect({ handle: "x" });
                }}
              >
                <img src="/channels/x.png" />
                <span>Connect to Twitter</span>
              </div>
              <div
                className="connectChannel channelLinkedIn"
                onClick={() => {
                  handleConnect({ handle: "linkedin" });
                }}
              >
                <img src="/channels/linkedin.png" />
                <span>Connect to LinkedIn</span>
              </div>
              <div className="connectChannel">
                <img src="/channels/coming-soon.png" />
                <span>More coming soon</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Channels;
