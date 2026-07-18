import test from 'node:test';
import assert from 'node:assert/strict';
import { addNotification, loadNotifications } from '../src/utils/notifications.ts';

class LocalStorageMock {
  private store = new Map<string, string>();

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

const storage = new LocalStorageMock();

Object.defineProperty(globalThis, 'localStorage', {
  value: storage,
  configurable: true,
});

Object.defineProperty(globalThis, 'window', {
  value: { localStorage: storage },
  configurable: true,
});

test('addNotification stores and loads notifications', () => {
  storage.clear();

  const notifications = addNotification({
    key: 'order-created-1',
    type: 'order',
    title: 'New order created',
    message: 'A new order has been taken.',
    orderId: 'order-1',
    priority: 'high',
  });

  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].title, 'New order created');
  assert.equal(notifications[0].read, false);

  const loaded = loadNotifications();
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].message, 'A new order has been taken.');
});
