import { FC, useRef, useState, useEffect } from "react";
import { FRONTEND_URL } from "../../config/endpoints";

export const Close = () => {
  useEffect(() => {
    // Close the window when the component is mounted
    const message = "Hello from the mini window!";
    window.opener.postMessage(message, FRONTEND_URL);
    window.close();
  }, []);
  return (
    <div>
      <h1>Closing Window...</h1>
    </div>
  );
};
