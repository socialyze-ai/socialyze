import Calendar from "./pages/calendar/Calendar";
import Engagement from "./pages/engagement/Engagement";
import Analytics from "./pages/analytics/Analytics";
import Influencer from "@pages/influencer/Influencer";
import Dashboard from "./pages/dashboard/Dashboard";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles/global.scss";
import Layout from "@pages/layout/Layout";
import Modal from "@components/modal/Modal";
import { LoginSteps } from "@pages/login/LoginSteps";
import { useEffect, useState } from "react";
import Authenticate from "@pages/authenticate/Authenticate";

function App() {
  const [showLoginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    setLoginModalOpen(!token);
  }, []);

  const handleModalClose = () => {
    setLoginModalOpen(false);
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <Dashboard /> }, // Default route
        { path: "dashboard", element: <Dashboard /> },
        { path: "engagement", element: <Engagement /> },
        { path: "analytics", element: <Analytics /> },
        { path: "influencer", element: <Influencer /> },
      ],
    },
    { path: "/authenticate", element: <Authenticate /> },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      {showLoginModalOpen && (
        <Modal onClose={handleModalClose}>
          <LoginSteps onClose={handleModalClose} />
        </Modal>
      )}
    </>
  );
}

export default App;
