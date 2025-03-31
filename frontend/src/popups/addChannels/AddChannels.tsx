import "./AddChannels.scss";
import { FC } from "react";

import axios from "axios";
import { useDispatch } from "react-redux";
import Modal from "@components/modal/Modal";
import { BACKEND_URL } from "@config/config";
import { FRONTEND_URL } from "../../config/config";
import { addChannels } from "@slices/channels.slice";

interface ChannelsProps {
  show: boolean;
  onHide: () => void;
}

const AddChannels: FC<ChannelsProps> = ({ show, onHide }) => {
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
          axios
            .get(`${BACKEND_URL}/channel`)
            .then((response) => {
              dispatch(addChannels(response.data));
            })
            .catch((error) => {
              console.error("API request error:", error);
            });
        }
      };

      window.addEventListener("message", handleMessage);
    } catch (error) {
      console.error("Error while connecting to channel:", error);
    }
  };

  return (
    <div>
      {show && (
        <Modal onClose={onHide}>
          <div className="channelContainer">
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

export default AddChannels;
