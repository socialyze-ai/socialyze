import { useState } from "react";
import { Login } from "./Login/Login";
import Register from "./Register/Register";
import { OtpVerify } from "./OtpVerify/OtpVerify";

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginStepsType {
  onClose: () => void;
}

export const LoginSteps = ({ onClose }: LoginStepsType) => {
  const [step, setStep] = useState("login");

  const handleLogin = (email: string, password: string) => {
    console.log("Login with:", email, password);
    onClose();
  };

  const handleRegisterClick = () => {
    setStep("register");
  };

  const handleBackToLogin = () => {
    setStep("login");
  };

  const handleRegister = (registerForm: RegisterForm) => {
    console.log("Register with:", registerForm.email);
    setStep("otp");
  };

  const handleValidateOTP = (otp: string) => {
    console.log("Validate OTP:", otp);
    onClose();
  };

  return (
    <div>
      {step === "login" && (
        <Login onRegisterClick={handleRegisterClick} onLogin={handleLogin} />
      )}
      {step === "register" && (
        <Register
          onRegister={handleRegister}
          onBackToLogin={handleBackToLogin}
        />
      )}
      {step === "otp" && (
        <OtpVerify
          goBackToRegister={handleRegisterClick}
          onValidateOtp={handleValidateOTP}
        />
      )}
    </div>
  );
};
