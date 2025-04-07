import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config/config";

const useOAuthHandler = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    let authCode = searchParams.get("code");
    let state = searchParams.get("state");

    let oauth_token = searchParams.get("oauth_token");
    let oauth_verifier = searchParams.get("oauth_verifier");

    if (oauth_token && oauth_verifier) {
      state = oauth_token;
      authCode = `${oauth_token}:${oauth_verifier}`;
    }

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
