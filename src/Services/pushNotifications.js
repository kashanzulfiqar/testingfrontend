import { apiServices } from "./apiServices";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("Notifications are not supported in this browser.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported in this browser.");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/service-worker.js"
    );
    return registration;
  } catch (error) {
    console.error("Failed to register service worker", error);
    return null;
  }
};

export const ensurePushSubscription = async ({ user } = {}) => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications are not supported in this browser.");
    return null;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn("VAPID public key missing. Set REACT_APP_VAPID_PUBLIC_KEY.");
    return null;
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    } catch (error) {
      console.error("Push subscription failed", error);
      return null;
    }
  }

  try {
    const payload = {
      subscription,
      userId: user?.user?._id || user?.email,
    };
    await apiServices("POST", "notifications/save-subscription", payload, user);
  } catch (error) {
    console.error("Failed to persist push subscription", error);
  }

  return subscription;
};



