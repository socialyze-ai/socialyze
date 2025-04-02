import { useDispatch, useSelector } from "react-redux";
import "./Channel.scss";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config/config";
import { addChannels } from "@slices/channels.slice";
import { RootState } from "../../redux/store";
import AddChannels from "../../popups/addChannels/AddChannels";
import { FiPlus } from "react-icons/fi"; // React Icons

export const Channels = () => {
  const [showChannelsModal, setChannelsModal] = useState(false);
  const dispatch = useDispatch();
  const channels = useSelector((state: RootState) => state.channels.channels);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/channel`)
      .then((response) => {
        dispatch(addChannels(response.data));
      })
      .catch((error) => {
        console.error("API request error:", error);
      });
  }, []);

  return (
    <div className="connectedChannelDiv">
      <div className="connectedChannelList">
        {channels.length > 0 ? (
          <>
            {channels.map((channel) => (
              <div key={channel.channelId} className="connectedChannelListItem">
                <div className="connectedChannelListItemImageWrapper">
                  <img
                    src={
                      channel.channelPicture && channel.channelPicture !== ""
                        ? channel.channelPicture
                        : "/user.png"
                    }
                    alt={channel.channelName}
                    className="connectedChannelListItemImage"
                  />
                  <img
                    src={`/channels/${channel.handle}.png`}
                    alt="handle icon"
                    className="connectedChannelListItemImageIcon"
                  />
                </div>
                <span className="connectedChannelListItemName">{channel.channelName}</span>
              </div>
            ))}
            <div className="connectedChannelListItem">
              <button className="addChannelCircleButton" onClick={() => setChannelsModal(true)}>
                <FiPlus size={24} />
              </button>
              <span className="connectedChannelListItemName">Add Channel</span>
            </div>
          </>
        ) : (
          <>
            <p className="noChannelsMessage">No channels connected Connect now.</p>
            <button className="addChannelButton" onClick={() => setChannelsModal(true)}>
              Add Channel
            </button>
          </>
        )}
      </div>
      <AddChannels show={showChannelsModal} onHide={() => setChannelsModal(false)} />
    </div>
  );
};
