import axios from "axios";
import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { BACKEND_URL } from "../config/endpoints";

export type Channels = {
  channelId: string;
  channelName: string;
  profilePic: string;
  userName: number;
};

export type User = {
  username: string;
  createdAt: string;
  email: string;
  id: number;
  name: string;
  password: null;
  phoneNumber: string;
  profilePic: string;
  updatedAt: string;
  userName: string;
  channels: Channels[];
};

type UserContextType = {
  user: User | null;
  //setUser: Dispatch<SetStateAction<User | null>>;
  updateUser: (userData: User) => void;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return user;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const updateUser = (user: User) => {
    setUser(user);
  };

  useEffect(() => {
    // Chack if user already loggedin or not
    axios
      .get(`${BACKEND_URL}/user/isLoggedIn`, { withCredentials: true })
      .then((_response) => {
        // Handle the successful response data here
        updateUser(_response.data.userDetails);
      })
      .catch((error) => {
        // Handle any errors here
        console.error("API request error:", error);
      });
  }, []);

  return <UserContext.Provider value={{ user, updateUser }}>{children}</UserContext.Provider>;
};
