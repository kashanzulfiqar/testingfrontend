/* eslint-disable no-restricted-globals */
/**
 * Basic service worker to surface push notifications.
 * The payload sent from the server should be JSON with
 * at least { title, message, icon?, url? }.
 */
self.addEventListener("push", (event) => {
  if (!event?.data) {
    return;
  }

  const data = event.data.json();
  const title = data.title || "Notification";
  const body = data.message || "";
  const icon = data.icon || "../../files/Icons/DaftarProWhiteIcon.svg";
  const tag =
    data.id || data._id || data.notificationId || data.title || "dp-notif";

  event.waitUntil(
    (async () => {
      // Close any existing notification with the same tag to avoid duplicates.
      const existing = await self.registration.getNotifications({ tag });
      existing.forEach((n) => n.close());

      await self.registration.showNotification(title, {
        body,
        icon,
        data,
        tag,
        renotify: false,
      });
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  const targetUrl = event?.notification?.data?.url || "/";
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus an open tab if it matches, otherwise open a new one.
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return null;
    })
  );
});

