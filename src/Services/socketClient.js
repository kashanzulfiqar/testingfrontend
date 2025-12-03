import { io } from "socket.io-client";
import { BASE_URL } from "../config/apiConfig";

let socket;

const getSocketInstance = () => {
  if (!socket) {
    socket = io(BASE_URL, {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }

  return socket;
};

export const connectNotificationSocket = () => {
  const instance = getSocketInstance();

  if (!instance.connected) {
    instance.connect();
  }

  return instance;
};

export const joinNotificationRooms = ({ userId, companyId }) => {
  const instance = connectNotificationSocket();

  if (!userId && !companyId) {
    return instance;
  }

  instance.emit("join", {
    userId,
    companyId,
  });

  return instance;
};

export const subscribeToNewNotifications = (handler) => {
  const instance = connectNotificationSocket();
  instance.on("notification:new", handler);

  return () => instance.off("notification:new", handler);
};

export const subscribeToNotificationRefresh = (handler) => {
  const instance = connectNotificationSocket();
  instance.on("notifications:refresh", handler);

  return () => instance.off("notifications:refresh", handler);
};

export const disconnectNotificationSocket = () => {
  if (socket) {
    socket.removeAllListeners("notification:new");
    socket.removeAllListeners("notifications:refresh");
    socket.disconnect();
    socket = null;
  }
};
