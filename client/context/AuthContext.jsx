import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  /* ===============================
     Helper: Get token
  =============================== */
  const getToken = () => localStorage.getItem("token");

  /* ===============================
     Set axios auth header
  =============================== */
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  /* ===============================
     Check authentication on load
  =============================== */
  const checkAuth = async () => {
    const token = getToken();
    if (!token) return;

    setAuthHeader(token);

    try {
      const { data } = await axios.get("/api/auth/check");

      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        logout();
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      } else {
        console.error("Auth check failed:", error.message);
      }
    }
  };

  /* ===============================
     Login
  =============================== */
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      localStorage.setItem("token", data.token);
      setAuthHeader(data.token);

      setAuthUser(data.userData);
      connectSocket(data.userData);

      toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ===============================
     Logout
  =============================== */
  const logout = () => {
    setAuthUser(null);
    setOnlineUsers([]);
    localStorage.removeItem("token");
    setAuthHeader(null);

    if (socket) socket.disconnect();
    setSocket(null);

    toast.success("Logged out successfully");
  };

  /* ===============================
     Update profile
  =============================== */
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);

      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ===============================
     Connect Socket
  =============================== */
  const connectSocket = (userData) => {
    if (!userData) return;
    if (socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
    });

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });
  };

  /* ===============================
     Run auth check once
  =============================== */
  useEffect(() => {
    checkAuth();
  }, []);

  /* ===============================
     Context value
  =============================== */
  const value = {
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
