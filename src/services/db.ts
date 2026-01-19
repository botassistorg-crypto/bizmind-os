import Dexie, { Table } from 'dexie';
import { Product, Order, Expense, UserSession, Tier } from '../types';

class BizMindDB extends Dexie {
  products!: Table<Product>;
  orders!: Table<Order>;
  expenses!: Table<Expense>;
  session!: Table<UserSession, string>;

  constructor() {
    super('BizMindDB');
    (this as any).version(1).stores({
      products: '++id, name, category, stock',
      orders: '++id, date, status, customerMobile',
      expenses: '++id, date, category',
      session: 'id'
    });
  }
}

export const db = new BizMindDB();

export const seedDatabase = async () => {
  const count = await db.products.count();
  if (count === 0) {
    await db.products.bulkAdd([
      { name: 'Premium Silk Saree', category: 'Saree', costPrice: 1200, sellingPrice: 2500, stock: 10, sku: 'SR-001' },
      { name: 'Leather Wallet', category: 'Accessories', costPrice: 300, sellingPrice: 800, stock: 4, sku: 'WL-002' },
    ]);
  }
};

export const getSession = async (): Promise<UserSession | undefined> => {
  return await db.session.get('active_session');
};

export const saveSession = async (session: UserSession) => {
  await db.session.put({ ...session, id: 'active_session' });
};

export const clearSession = async () => {
  await db.session.delete('active_session');
};

export const verifyLicense = async (mobile: string, key: string): Promise<UserSession> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); 

  let tier: Tier | null = null;
  const upperKey = key.toUpperCase().trim();

  if (upperKey.startsWith('STARTER')) tier = Tier.STARTER;
  else if (upperKey.startsWith('GROWTH')) tier = Tier.GROWTH;
  else if (upperKey.startsWith('ELITE')) tier = Tier.ELITE;

  if (!tier) {
    throw new Error("Invalid License Key");
  }

  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = 'DEV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    localStorage.setItem('device_id', deviceId);
  }

  return {
    mobile,
    licenseKey: upperKey,
    deviceId,
    tier,
    settings: {
      storeName: 'My BizMind Shop',
      storeAddress: 'Dhaka, Bangladesh',
      deliveryInside: 60,
      deliveryOutside: 120,
      googleSheetId: '',
      customCategories: ['Saree', 'Panjabi', 'Electronics', 'Accessories']
    }
  };
};