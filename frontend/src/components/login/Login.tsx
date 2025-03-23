import "./login.scss";
import { FC, useState } from "react";
import axios from "axios";
import { Modal, Form, Alert, Button } from "react-bootstrap";
import { BACKEND_URL } from "../../config/endpoints";
import { useUser } from "../../context/UserContext";

interface LoginProps {
  show: boolean;
  onHide: () => void;
}

const Login: FC<LoginProps> = ({ show, onHide }) => {
  const { user, updateUser } = useUser();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event: any) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateEmail = (email: string) => {
    // Regular expression for email validation
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password: string) => {
    // Regular expression for password validation
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{6,}$/;
    return passwordPattern.test(password);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { email, password, rememberMe } = formData;

    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 6 characters and include 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character",
      );
      return;
    }

    // If validation passes, send the HTTP request (adjust the URL)

    try {
      const response = await axios.post(
        `${BACKEND_URL}/user/login`,
        {
          email,
          password,
          rememberMe,
        },
        { withCredentials: true },
      );
      //const test = await axios.get(`${BACKEND_URL}/user/test`, { withCredentials: true });
      setSuccess(response.data.message);
      updateUser(response.data);
      onHide();
    } catch (error: any) {
      setError(error.response.data.message);
    }
  };

  return (
    <Modal show={show} size="lg" onHide={onHide} backdrop="static" keyboard={false} centered>
      <div className="loginBox">
        <h2>Sign Up</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              isInvalid={!validateEmail(formData.email) && formData.email !== ""}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid email address.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              isInvalid={!validatePassword(formData.password) && formData.password !== ""}
            />
            <Form.Control.Feedback type="invalid">
              Password must be at least 6 characters and include 1 lowercase letter, 1 uppercase
              letter, 1 number, and 1 special character.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="rememberMe">
            <Form.Check
              type="checkbox"
              label="Remember Me"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Login
          </Button>
        </Form>
      </div>
    </Modal>
  );
};

export default Login;
