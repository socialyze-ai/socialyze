import "./Channels.scss";
import { FC, useEffect, useState } from "react";

import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@slices/user.slice";
import Modal from "@components/modal/Modal";
import { BACKEND_URL } from "../../config/config";

interface ChannelsProps {
  show: boolean;
  onHide: () => void;
}

const Channels: FC<ChannelsProps> = ({ show, onHide }) => {
  // const { user, updateUser } = useUser();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const facebookHandleLogin = (_response: any) => {
    // Define the URL you want to open in the new window
    const url = `${BACKEND_URL}/connect/facebook2`;
    const width = 500; // Width of the new window
    const height = 500; // Height of the new window
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    window.open(url, "_blank", `width=${width},height=${height},left=${left},top=${top}`);
  };

  const instagramHandleLogin = (_response: any) => {
    // Define the URL you want to open in the new window
    const url = `${BACKEND_URL}/connect/instagram2`;
    const width = 500; // Width of the new window
    const height = 500; // Height of the new window
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    window.open(url, "_blank", `width=${width},height=${height},left=${left},top=${top}`);
  };

  const twitterHandleLogin = (_response: any) => {
    // Define the URL you want to open in the new window
    const url = `${BACKEND_URL}/connect/twitter`;
    const width = 500; // Width of the new window
    const height = 500; // Height of the new window
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    window.open(url, "_blank", `width=${width},height=${height},left=${left},top=${top}`);
  };

  const linkedInHandleLogin = (_response: any) => {
    // Define the URL you want to open in the new window
    const url = `${BACKEND_URL}/connect/linkedin`;
    const width = 500; // Width of the new window
    const height = 500; // Height of the new window
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    window.open(url, "_blank", `width=${width},height=${height},left=${left},top=${top}`);
  };

  useEffect(() => {
    const getChannels = () => {
      axios
        .get(`${BACKEND_URL}/user/channels`)
        .then((_response) => {
          // Handle the successful response data here
          if (user) {
            //let userTemp = user;
            //userTemp.channels = _response.data;
            const updatedUser = { ...user, channels: _response.data };
            dispatch(setUser(updatedUser));
          }
        })
        .catch((error) => {
          // Handle any errors here
          console.error("API request error:", error);
        });
    };
    getChannels();
    window.addEventListener("message", getChannels);

    return () => {
      window.removeEventListener("message", getChannels);
    };
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
              <div className="connectChannel channelFacebook" onClick={facebookHandleLogin}>
                <img src="/channels/facebook.png" />
                <span>Connect to Facebook</span>
              </div>
              <div className="connectChannel channelInstagram" onClick={instagramHandleLogin}>
                <img src="/channels/instagram.png" />
                <span>Connect to Instagram</span>
              </div>
              <div className="connectChannel channelTwitter" onClick={twitterHandleLogin}>
                <img src="/channels/x.png" />
                <span>Connect to Twitter</span>
              </div>
              <div className="connectChannel channelLinkedIn" onClick={linkedInHandleLogin}>
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
