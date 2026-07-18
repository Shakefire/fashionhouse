export interface AppNotification {
  id: string;
  key?: string;
  type: "order" | "reminder" | "status";
  title: string;
  message: string;
  createdAt: string;
  orderId?: string;
  read: boolean;
  priority: "normal" | "high";
}

export interface OrderReminderInput {
  id?: string;
  order_number?: string;
  deadline?: string | null;
  status?: string | null;
}

const STORAGE_KEY = "fashion-notifications";

export function loadNotifications(): AppNotification[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as AppNotification[];
    return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: AppNotification[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export function addNotification(
  notification: Omit<AppNotification, "id" | "createdAt" | "read">,
): AppNotification[] {
  const notifications = loadNotifications();
  const item: AppNotification = {
    ...notification,
    id: `${notification.key ?? notification.title}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const next = [item, ...notifications].slice(0, 20);
  saveNotifications(next);
  return next;
}

export function hasNotification(key: string) {
  return loadNotifications().some((notification) => notification.key === key);
}

export function syncOrderReminders(orders: OrderReminderInput[]) {
  if (typeof window === "undefined") {
    return [];
  }

  const notifications = loadNotifications();
  const now = new Date();
  const nextNotifications = [...notifications];

  orders.forEach((order) => {
    if (!order.deadline || !order.id) return;

    const deadline = new Date(order.deadline);
    const hoursLeft = (deadline.getTime() - now.getTime()) / 36e5;
    const orderLabel = order.order_number || order.id;

    if (hoursLeft <= 48 && hoursLeft > 24) {
      const key = `reminder-${order.id}-48h`;
      if (!nextNotifications.some((notification) => notification.key === key)) {
        nextNotifications.unshift({
          id: key,
          key,
          type: "reminder",
          title: "Deadline approaching",
          message: `Order ${orderLabel} has 48 hours left before its deadline.`,
          createdAt: now.toISOString(),
          orderId: order.id,
          read: false,
          priority: "normal",
        });
      }
    }

    if (hoursLeft <= 24 && hoursLeft > 0) {
      const key = `reminder-${order.id}-24h`;
      if (!nextNotifications.some((notification) => notification.key === key)) {
        nextNotifications.unshift({
          id: key,
          key,
          type: "reminder",
          title: "Final reminder",
          message: `Order ${orderLabel} has 24 hours left before its deadline.`,
          createdAt: now.toISOString(),
          orderId: order.id,
          read: false,
          priority: "high",
        });
      }
    }

    if (order.status === "Completed") {
      const key = `status-${order.id}-completed`;
      if (!nextNotifications.some((notification) => notification.key === key)) {
        nextNotifications.unshift({
          id: key,
          key,
          type: "status",
          title: "Order completed",
          message: `Order ${orderLabel} has been marked completed.`,
          createdAt: now.toISOString(),
          orderId: order.id,
          read: false,
          priority: "normal",
        });
      }
    }

    if (order.status === "Delivered") {
      const key = `status-${order.id}-delivered`;
      if (!nextNotifications.some((notification) => notification.key === key)) {
        nextNotifications.unshift({
          id: key,
          key,
          type: "status",
          title: "Order delivered",
          message: `Order ${orderLabel} has been marked delivered.`,
          createdAt: now.toISOString(),
          orderId: order.id,
          read: false,
          priority: "high",
        });
      }
    }
  });

  const trimmed = nextNotifications.slice(0, 20);
  saveNotifications(trimmed);
  return trimmed;
}
