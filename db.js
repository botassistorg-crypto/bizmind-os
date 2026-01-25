const db = new Dexie('BizMind_GrowthOS_v1');

// VERSION 9 - Added A/B Tests table & couponCode to orders
db.version(9).stores({
    orders: '++id, &orderId, date, customerPhone, status, grandTotal, netProfit, couponCode',
    customers: '&phone, name, totalSpent, tier',
    products: '++id, &sku, name, category, costPrice, sellingPrice, stockQuantity, expiryDate, sizes, colors',
    expenses: '++id, date, category, amount, note',
    staff: '++id, name, role, salary, phone, joinDate',
    fixedCosts: '++id, name, amount, category',
    settings: 'key, value',
    couriers: '++id, name',
    campaigns: '++id, customerPhone, customerName, type, message, createdAt',
    abTests: '++id, name, status, startDate, endDate, createdAt'
});

// VERSION 8 - Previous version (for upgrade path)
db.version(8).stores({
    orders: '++id, &orderId, date, customerPhone, status, grandTotal, netProfit',
    customers: '&phone, name, totalSpent, tier',
    products: '++id, &sku, name, category, costPrice, sellingPrice, stockQuantity, expiryDate, sizes, colors',
    expenses: '++id, date, category, amount, note',
    staff: '++id, name, role, salary, phone, joinDate',
    fixedCosts: '++id, name, amount, category',
    settings: 'key, value',
    couriers: '++id, name',
    campaigns: '++id, customerPhone, customerName, type, message, createdAt'
});

// VERSION 7 - Previous version (for upgrade path)
db.version(7).stores({
    orders: '++id, &orderId, date, customerPhone, status, grandTotal, netProfit',
    customers: '&phone, name, totalSpent, tier',
    products: '++id, &sku, name, category, costPrice, sellingPrice, stockQuantity, sizes, colors',
    expenses: '++id, date, category, amount, note',
    staff: '++id, name, role, salary, phone, joinDate',
    fixedCosts: '++id, name, amount, category',
    settings: 'key, value',
    couriers: '++id, name',
    campaigns: '++id, customerPhone, customerName, type, message, createdAt'
});

// VERSION 6 - Previous version (for upgrade path)
db.version(6).stores({
    orders: '++id, &orderId, date, customerPhone, status, grandTotal, netProfit',
    customers: '&phone, name, totalSpent, tier',
    products: '++id, &sku, name, category, costPrice, sellingPrice, stockQuantity, sizes, colors',
    expenses: '++id, date, category, amount, note',
    staff: '++id, name, role, salary, phone, joinDate',
    fixedCosts: '++id, name, amount, category',
    settings: 'key, value',
    couriers: '++id, name'
});

db.on('populate', () => {
    db.settings.bulkAdd([{ key: 'currency', value: '৳' }]);
    db.couriers.bulkAdd([{ name: 'Pathao' }, { name: 'Steadfast' }]);
});
