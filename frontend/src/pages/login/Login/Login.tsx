import React, { useState } from "react";
import "./Login.css";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "@slices/user.slice";
import { BACKEND_URL } from "../../../config/config";

interface LoginType {
  onRegisterClick: () => void;
  onLogin: (email: string, password: string) => void;
}

export const Login = ({ onRegisterClick, onLogin }: LoginType) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiError, setApiError] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError("");

    try {
      const response = await axios.post(`${BACKEND_URL}/user/login`, {
        email,
        password,
      });
      if (response.status >= 200 && response.status < 300) {
        dispatch(setUser(response.data));
        onLogin(email, password);
        localStorage.setItem("jwtToken", response.data.token);
      }
    } catch (error: any) {
      setApiError(error.response?.data?.message || "An unknown error occurred");
    }
  };

  const handleGuestLogin = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    setApiError("");

    try {
      const response = await axios.post(
        `${BACKEND_URL}/user/guestLogin`,
        {},
        {
          withCredentials: true,
        },
      );
      if (response.status >= 200 && response.status < 300) {
        dispatch(setUser(response.data));
        onLogin(email, password);
        localStorage.setItem("jwtToken", response.data.token);
      }
    } catch (error: any) {
      setApiError(error.response?.data?.message || "An unknown error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formContainer">
      <h2>Login</h2>
      <div className="loginFormInput">
        <div>
          <div className="loginFormInputLabel">Email:</div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <div className="loginFormInputLabel">Password:</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {apiError && <p style={{ color: "red" }}>{apiError}</p>}
      </div>

      <div className="loginButtons">
        <label className="label">
          Don't have an account? <a onClick={onRegisterClick}>Register here.</a>
        </label>
        <button type="submit" className="loginButton">
          Login
        </button>
        <button type="button" onClick={handleGuestLogin}>
          Continue as a guest
        </button>
      </div>
    </form>
  );
};
