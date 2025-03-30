import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config/config";

const useOAuthHandler = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const authCode = searchParams.get("code");
    const state = searchParams.get("state");

    if (authCode) {
      axios
        .post(`${BACKEND_URL}/channel/authenticate`, { authCode: authCode, state: state })
        .then((response) => {
          if (response.data?.success) {
            window.opener?.postMessage({ success: true, message: response.data?.message }, "*");
            window.close();
          }
        })
        .catch((error) => {
          console.error("OAuth token exchange failed:", error);
          window.opener?.postMessage({ success: false, message: error }, "*");
          window.close();
        });
    }
  }, [searchParams, navigate, setSearchParams]);
};

export default useOAuthHandler;
