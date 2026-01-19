// db.js (Fixed Schema)

const db = new Dexie('BizMind_GrowthOS_v1');

// VERSION 2 (Increases version to force an upgrade/fix)
db.version(2).stores({
    
    // 📦 ORDERS
    orders: `
        ++id, 
        &orderId, 
        date, 
        customerPhone, 
        status, 
        paymentStatus, 
        courier, 
        area, 
        netProfit, 
        [date+status]
    `,

    // 👥 CUSTOMERS
    customers: `
        &phone, 
        name, 
        totalSpent, 
        totalOrders, 
        lastOrderDate, 
        riskScore, 
        walletBalance, 
        tier, 
        tags
    `,

    // 🛍️ PRODUCTS
    products: `
        ++id,
        &sku,
        name,
        category,
        costPrice,
        sellingPrice,
        stockQuantity,
        alertThreshold,
        supplier
    `,

    // 🚚 COURIERS
    couriers: `
        ++id,
        name,
        chargeInsideDhaka,
        chargeOutsideDhaka,
        codPercentage
    `,

    // 🧠 OFFERS
    offerRules: `
        ++id,
        name,
        triggerType,
        conditionValue,   
        rewardType,
        rewardValue,
        isActive
    `,

    // 💸 EXPENSES
    expenses: `
        ++id,
        date,
        category,
        amount
    `,

    // ⚙️ SETTINGS
    settings: `
        key,
        value
    `
});

// POPULATE DEFAULTS
db.on('populate', () => {
    db.settings.bulkAdd([
        { key: 'shop_name', value: 'My Awesome Store' },
        { key: 'currency', value: '৳' },
        { key: 'plan_tier', value: 'BASIC' }
    ]);
    
    db.couriers.bulkAdd([
        { name: 'Pathao', chargeInsideDhaka: 60, chargeOutsideDhaka: 120, codPercentage: 1 },
        { name: 'Steadfast', chargeInsideDhaka: 60, chargeOutsideDhaka: 100, codPercentage: 0 },
        { name: 'Paperfly', chargeInsideDhaka: 50, chargeOutsideDhaka: 110, codPercentage: 1 }
    ]);
});

console.log("✅ Database Schema Loaded (v2)");