import React, { useRef, useState } from "react";
import "./OtpVerify.css";
import axios from "axios";
import { useDispatch } from "react-redux";
import { BACKEND_URL } from "../../../config/endpoints";
import { setUser } from "@slices/user.slice";



interface OtpVerifyType {
  goBackToRegister: () => void;
  onValidateOtp: (otp: string) => void;
}

export const OtpVerify = ({
  goBackToRegister,
  onValidateOtp,
}: OtpVerifyType) => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const dispatch = useDispatch();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to the next input box
      if (value && index < 5) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputs.current[index - 1]?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        inputs.current[index]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOtpError("");
    const otpValue = otp.join("");
    try {
      const response = await axios.post(
        `${BACKEND_URL}/user/otpVerify`,
        {
          otpValue,
        }
      );
      if (response.status >= 200 && response.status < 300) {
        console.log("Here", response.data);
        dispatch(setUser(response.data))
        onValidateOtp(otpValue);
      }
    } catch (error: any) {
      setOtpError(error.response?.data?.message || "An unknown error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formContainer">
      <h2>OTP Validation</h2>
      <div className="otpParentBox">
        <div>Please enter the otp sent on your mail.</div>
        <div className="otpBoxes">
          {otp.map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputs.current[index] = el)}
              className="otpBox"
              required
            />
          ))}
        </div>
        <div className="otpHint">Hint: Use 123456 to login for now.</div>
      </div>

      {otpError && <p style={{ color: "red" }}>{otpError}</p>}
      <div className="otpButtons">
        <label className="label">
          <a onClick={goBackToRegister}>Go back.</a>
        </label>
        <button type="submit" className="otpVerifyButton">
          Validate OTP
        </button>
      </div>
    </form>
  );
};
