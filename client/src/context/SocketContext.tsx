/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import PropTypes from "prop-types";

interface SocketContextType {
  socket: any;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }: { children: any }) => {
  const [connected, setConnected] = useState(false);

  // Use lazy initialization to create socket only once
  const [socket] = useState(() => {
    // Determine the base URL: remove '/api' if present for socket connection
    const envApiUrl = import.meta.env.VITE_API_URL;
    console.log("DEBUG: SocketContext VITE_API_URL:", envApiUrl);

    const baseUrl = (envApiUrl || "http://localhost:5000").replace("/api", "");
    console.log("DEBUG: Connecting Socket to:", baseUrl);

    const socketInstance = io(baseUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    socketInstance.on("connect_error", (error: any) => {
      console.error("Socket connection error:", error);
      setConnected(false);
    });

    return socketInstance;
  });

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>;
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
