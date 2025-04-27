import { useOAuthHandler } from "@/api/apiHooks/useOAuthHandler";
import { BACKEND_URL } from "@/config/config";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const Authenticate = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mutate, isPending } = useOAuthHandler();

  const handleOAuth = () => {
    let authCode = searchParams.get("code");
    let state = searchParams.get("state");

    let oauth_token = searchParams.get("oauth_token");
    let oauth_verifier = searchParams.get("oauth_verifier");

    if (oauth_token && oauth_verifier) {
      state = oauth_token;
      authCode = `${oauth_token}:${oauth_verifier}`;
    }

    if (authCode) {
      mutate(
        { authCode: authCode, state: state },
        {
          onSuccess: (response) => {
            console.log(response);
            if (response.success) {
              window.opener?.postMessage({ success: true, message: response.message }, "*");
              window.close();
            }
          },
        },
      );
    }
  };

  useEffect(() => {
    handleOAuth();
  }, [searchParams, navigate, setSearchParams]);

  return (
    <div className="authenticate-container">
      <p>Authenticating, please wait...</p>
    </div>
  );
};
