import React, { useState } from "react";
import { RegisterForm } from "../LoginSteps";
import axios from "axios";
import { BACKEND_URL } from "../../../config/endpoints";
import "./Register.css";
import { useDispatch } from "react-redux";
import { setUser } from "@slices/user.slice";

interface RegisterType {
  onRegister: (registerForm: RegisterForm) => void;
  onBackToLogin: () => void;
}

const Register = ({ onRegister, onBackToLogin }: RegisterType) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const dispatch = useDispatch();

  const validateForm = () => {
    const nameRegex = /^[a-zA-Z0-9 ]{3,20}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!nameRegex.test(name)) {
      return "Name should be between 3 to 20 characters and cannot contain special characters.";
    }
    if (!emailRegex.test(email)) {
      return "Invalid email address.";
    }
    if (!passwordRegex.test(password)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character and atleast 6 character long";
    }
    if (password !== confirmPassword) {
      return "Confirm password do not match.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/user/register`, {
        name,
        email,
        password,
        confirmPassword,
      });

      if (response.status >= 200 && response.status < 300) {
        dispatch(setUser(response.data));
        onRegister(response.data);
        localStorage.setItem("jwtToken", response.data.token);
      }
    } catch (error: any) {
      setApiError(error.response?.data?.message || "An unknown error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formContainer">
      <h2>Register</h2>

      <div className="registerFormInput">
        <div>
          <div className="registerFormInputLabel">Name:</div>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <div className="registerFormInputLabel">Email:</div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <div className="registerFormInputLabel">Password:</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <div className="registerFormInputLabel">Confirm Password:</div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {apiError && <p style={{ color: "red" }}>{apiError}</p>}
      </div>
      <div className="registerButtons">
        <label className="label">
          Already have an account? <a onClick={onBackToLogin}>Login here.</a>
        </label>
        <button type="submit" className="registerButton">
          Register
        </button>
      </div>
    </form>
  );
};

export default Register;
