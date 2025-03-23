import Calendar from "./pages/calendar/Calendar";
import Engagement from "./pages/engagement/Engagement";
import Analytics from "./pages/analytics/Analytics";
import Influencer from "@pages/influencer/Influencer";
import Outreach from "@pages/oureach/Outreach";
import Dashboard from "./pages/dashboard/Dashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Login from "./components/login/Login";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import Footer from "./components/footer/Footer";
import "./styles/global.scss";
import { useEffect, useState } from "react";
import { useUser, UserContext, User, UserProvider } from "./context/UserContext";
import axios from "axios";
import { BACKEND_URL } from "./config/endpoints";
import { Close } from "@pages/close/Close";

function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    // Chack if user already loggedin or not
    axios
      .get(`${BACKEND_URL}/user/isLoggedIn`, { withCredentials: true })
      .then((response) => {
        // Handle the successful response data here
        setUserLoggedIn(response.data.loggedIn);
      })
      .catch((error) => {
        // Handle any errors here
        console.error("API request error:", error);
      });
  }, []);

  const Layout = () => {
    return (
      <div className="main">
        <Navbar />
        <div className="mainContainer">
          <div className="sidebarContainer">
            <Sidebar />
          </div>
          <div className="contentContainer">
            <Outlet />
          </div>
        </div>
        <Footer />
      </div>
    );
  };
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Dashboard />,
        },
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        {
          path: "/calendar",
          element: <Calendar />,
        },
        {
          path: "/engagement",
          element: <Engagement />,
        },
        {
          path: "/analytics",
          element: <Analytics />,
        },
        {
          path: "/outreach",
          element: <Outreach />,
        },
        {
          path: "/influencer",
          element: <Influencer />,
        },
      ],
    },
    { path: "/close", element: <Close /> },
  ]);

  return (
    <UserProvider>
      {!userLoggedIn && (
        <Login
          show={!userLoggedIn}
          onHide={() => {
            setUserLoggedIn(true);
          }}
        />
      )}
      <RouterProvider router={router} />
    </UserProvider>
  );
}

export default App;
