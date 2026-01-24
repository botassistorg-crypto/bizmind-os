// ============================================
// BIZMIND GROWTH OS - STRATEGY CORE v2.1
// Powered by TacticsEngine v2.0
// ============================================

const StrategyConfig = {
enabled: true,
strategies: [
'low_stock_alert',
'dead_stock_alert',
'inactive_customer',
'vip_nurture',
'new_customer_welcome',
'at_risk_winback',
'reorder_reminder'
]
};

const StrategyCore = {

// ============================================
// MAIN ANALYZE FUNCTION
// Called by app.js for each customer/product
// ============================================

analyze: async function(customer, product) {
const opportunities = [];

try {
// Analyze Customer (if provided)
if (customer) {
const customerOpps = await this.analyzeCustomer(customer);
opportunities.push(...customerOpps);
}

// Analyze Product (if provided)
if (product) {
const productOpps = await this.analyzeProduct(product);
opportunities.push(...productOpps);
}
} catch(e) {
console.error('Strategy Analysis Error:', e);
}

return opportunities;
},

// ============================================
// CUSTOMER ANALYSIS
// ============================================

analyzeCustomer: async function(customer) {
const opportunities = [];
const today = new Date();

// Get customer's orders
let orders = [];
let lastOrderDate = null;
let daysSinceLastOrder = 999;

try {
if (typeof db !== 'undefined') {
orders = await db.orders
.where('customerPhone')
.equals(customer.phone)
.toArray();

if (orders.length > 0) {
orders.sort((a, b) => new Date(b.date) - new Date(a.date));
lastOrderDate = new Date(orders[0].date);
daysSinceLastOrder = Math.floor((today - lastOrderDate) / (1000 * 60 * 60 * 24));
}
}
} catch(e) {
console.error('Error fetching orders:', e);
}

const orderCount = orders.length;
const totalSpent = customer.totalSpent || 0;

// Calculate RFM and get segment
const rfm = TacticsEngine.rfmScoring.calculateRFM(daysSinceLastOrder, orderCount, totalSpent);
const segmentId = TacticsEngine.rfmScoring.getSegmentFromRFM(rfm);
const segment = TacticsEngine.getSegment(segmentId);

// Get shop name
let shopName = 'BizMind Shop';
try {
const setting = await db.settings.get('shopName');
if (setting) shopName = setting.value;
} catch(e) {}

// --- STRATEGY 1: NEW CUSTOMER WELCOME ---
if (segmentId === 'newBuyer' && orderCount === 1 && daysSinceLastOrder <= 7) {
const discount = TacticsEngine.calculateOptimalDiscount('newBuyer', 'low');
const code = TacticsEngine.generateCouponCode('welcome', discount);

const messageData = TacticsEngine.generateCompleteMessage('welcome', 'warm', {
NAME: customer.name || 'ভাই/আপু',
PERCENT: discount.toString(),
CODE: code,
SHOP_NAME: shopName
});

if (messageData) {
opportunities.push({
type: 'Opportunity',
title: `🆕 Welcome ${customer.name || 'New Customer'}`,
desc: 'NEW CUSTOMER - SEND WELCOME',
copy: messageData.message,
action: 'Send Welcome',
priority: 2,
segment: segmentId
});
}
}

// --- STRATEGY 2: NEEDS ATTENTION (30-60 days) ---
if (segmentId === 'needsAttention') {
const discount = TacticsEngine.calculateOptimalDiscount('needsAttention', 'medium');
const code = TacticsEngine.generateCouponCode('winback', discount);

const messageData = TacticsEngine.generateCompleteMessage('reorderReminder', 'gentle', {
NAME: customer.name || 'ভাই/আপু',
DAYS: daysSinceLastOrder.toString(),
LAST_PRODUCT: 'প্রোডাক্ট',
PERCENT: discount.toString(),
CODE: code,
SHOP_NAME: shopName
});

if (messageData) {
opportunities.push({
type: 'Risk',
title: `👀 ${customer.name || 'Customer'} Needs Attention`,
desc: `NO ORDER FOR ${daysSinceLastOrder} DAYS`,
copy: messageData.message,
action: 'Send Reminder',
priority: 3,
segment: segmentId
});
}
}

// --- STRATEGY 3: AT RISK (60-90 days) ---
if (segmentId === 'atRisk') {
const discount = TacticsEngine.calculateOptimalDiscount('atRisk', 'high');
const code = TacticsEngine.generateCouponCode('winback', discount);
const expiry = TacticsEngine.getExpiryDate(7);

const messageData = TacticsEngine.generateCompleteMessage('winBack', 'miss_you', {
NAME: customer.name || 'ভাই/আপু',
DAYS: daysSinceLastOrder.toString(),
PERCENT: discount.toString(),
CODE: code,
EXPIRY: expiry,
SHOP_NAME: shopName
});

if (messageData) {
opportunities.push({
type: 'Risk',
title: `⚠️ ${customer.name || 'Customer'} At Risk`,
desc: `NO ORDER FOR ${daysSinceLastOrder} DAYS - ACT NOW`,
copy: messageData.message,
action: 'Win Back',
priority: 1,
segment: segmentId
});
}
}

// --- STRATEGY 4: LOST CUSTOMER (90+ days) ---
if (segmentId === 'hibernating' || segmentId === 'lost') {
const discount = TacticsEngine.calculateOptimalDiscount(segmentId, 'flash');
const code = TacticsEngine.generateCouponCode('winback', discount);
const expiry = TacticsEngine.getExpiryDate(3);

const messageData = TacticsEngine.generateCompleteMessage('winBack', 'last_chance', {
NAME: customer.name || 'ভাই/আপু',
PERCENT: discount.toString(),
CODE: code,
EXPIRY: expiry,
SHOP_NAME: shopName
});

if (messageData) {
opportunities.push({
type: 'Risk',
title: `💔 Lost: ${customer.name || 'Customer'}`,
desc: `NO ORDER FOR ${daysSinceLastOrder} DAYS - URGENT`,
copy: messageData.message,
action: 'Last Chance',
priority: 0,
segment: segmentId
});
}
}

// --- STRATEGY 5: CAN'T LOSE (Big spender gone quiet) ---
if (segmentId === 'cantLose') {
const discount = TacticsEngine.calculateOptimalDiscount('cantLose', 'high');
const offer = `${discount}% Exclusive ছাড় + ফ্রি ডেলিভারি`;

const messageData = TacticsEngine.generateCompleteMessage('winBack', 'cantLose', {
NAME: customer.name || 'ভাই/আপু',
OFFER: offer,
SHOP_NAME: shopName
});

if (messageData) {
opportunities.push({
type: 'Risk',
title: `🚨 Can't Lose: ${customer.name}`,
desc: `VIP CUSTOMER - TOTAL SPENT: ৳${totalSpent}`,
copy: messageData.message,
action: 'Personal Outreach',
priority: 0,
segment: segmentId
});
}
}

// --- STRATEGY 6: VIP NURTURE ---
if (segmentId === 'champions' || segmentId === 'loyal') {
if (daysSinceLastOrder > 14) {
const discount = TacticsEngine.calculateOptimalDiscount(segmentId, 'low');
const offer = `${discount}% VIP ছাড় + Early Access`;
const expiry = TacticsEngine.getExpiryDate(7);

const messageData = TacticsEngine.generateCompleteMessage('vipExclusive', 'exclusive', {
NAME: customer.name || 'ভাই/আপু',
OFFER: offer,
EXPIRY: expiry,
SHOP_NAME: shopName
});

if (messageData) {
opportunities.push({
type: 'Opportunity',
title: `👑 VIP: ${customer.name}`,
desc: `${segment.icon} ${segment.bangla} - NURTURE`,
copy: messageData.message,
action: 'Send VIP Offer',
priority: 4,
segment: segmentId
});
}
}
}

return opportunities;
},

// ============================================
// PRODUCT ANALYSIS
// ============================================

analyzeProduct: async function(product) {
const opportunities = [];

// Get shop name
let shopName = 'BizMind Shop';
try {
const setting = await db.settings.get('shopName');
if (setting) shopName = setting.value;
} catch(e) {}

const stock = product.stockQuantity || 0;
const productName = product.name || 'Product';

// --- STRATEGY 1: LOW STOCK ALERT (1-5 items) ---
if (stock > 0 && stock <= 5) {
const urgencyText = TacticsEngine.getUrgencyText('stock');
const cleanUrgency = urgencyText.replace('[NUMBER]', stock.toString());

const copy = `🔥 ${productName} প্রায় শেষ!\n\n${cleanUrgency}\n\nদেরি করলে মিস করবেন!\n\n👉 এখনই অর্ডার করুন!\n\n- ${shopName}`;

opportunities.push({
type: 'Inventory',
title: `📦 Low Stock: ${productName}`,
desc: `ONLY ${stock} LEFT - CREATE URGENCY`,
copy: copy,
action: 'Promote Now',
priority: 1
});
}

// --- STRATEGY 2: OUT OF STOCK ---
if (stock === 0) {
opportunities.push({
type: 'Risk',
title: `🚫 Out of Stock: ${productName}`,
desc: 'RESTOCK NEEDED - LOSING SALES',
copy: `⚠️ ${productName} স্টক শেষ!\n\nদ্রুত Restock করুন।\n\nপ্রতিদিন কাস্টমার হারাচ্ছেন!`,
action: 'Restock Now',
priority: 0
});
}

// --- STRATEGY 3: DEAD/SLOW STOCK (High stock, consider sale) ---
if (stock > 20) {
const flashOffer = TacticsEngine.getOfferType('flashSale');
const discount = 30;
const urgencyText = TacticsEngine.getUrgencyText('time');

const copy = `⚡ FLASH SALE!\n\n${productName} এ ${discount}% ছাড়!\n\n${urgencyText}\n\n👉 এখনই অর্ডার করুন!\n\n- ${shopName}`;

opportunities.push({
type: 'Inventory',
title: `📊 Slow Moving: ${productName}`,
desc: `${stock} IN STOCK - CONSIDER FLASH SALE`,
copy: copy,
action: 'Run Flash Sale',
priority: 3
});
}

return opportunities;
},

// ============================================
// GET CUSTOMER SEGMENT
// ============================================

getCustomerSegment: function(orderCount, totalSpent, daysSinceLastOrder) {
const rfm = TacticsEngine.rfmScoring.calculateRFM(daysSinceLastOrder, orderCount, totalSpent);
const segmentId = TacticsEngine.rfmScoring.getSegmentFromRFM(rfm);
const segment = TacticsEngine.getSegment(segmentId);

return {
key: segmentId,
...segment,
rfm: rfm
};
},

// ============================================
// GET ALL INSIGHTS (for dashboard)
// ============================================

getInsights: async function() {
const insights = [];

try {
const customers = await db.customers.toArray();
const products = await db.products.toArray();

// Count segments
let segmentCounts = {
champions: 0,
loyal: 0,
potential: 0,
newBuyer: 0,
promising: 0,
needsAttention: 0,
atRisk: 0,
cantLose: 0,
hibernating: 0,
lost: 0
};

for (const c of customers) {
const orders = await db.orders
.where('customerPhone')
.equals(c.phone)
.toArray();

const orderCount = orders.length;
const totalSpent = c.totalSpent || 0;

let daysSinceLastOrder = 999;
if (orders.length > 0) {
orders.sort((a, b) => new Date(b.date) - new Date(a.date));
const lastOrderDate = new Date(orders[0].date);
daysSinceLastOrder = Math.floor((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24));
}

const segment = this.getCustomerSegment(orderCount, totalSpent, daysSinceLastOrder);

if (segmentCounts.hasOwnProperty(segment.key)) {
segmentCounts[segment.key]++;
}
}

// Low stock count
const lowStockCount = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;

// Build insights array
insights.push(
{
label: 'Champions',
value: segmentCounts.champions,
icon: '🏆',
color: '#FFD700',
action: 'Nurture & Reward'
},
{
label: 'Loyal',
value: segmentCounts.loyal,
icon: '💚',
color: '#4CAF50',
action: 'Upsell & Referral'
},
{
label: 'New Buyers',
value: segmentCounts.newBuyer,
icon: '🆕',
color: '#9C27B0',
action: 'Welcome & Onboard'
},
{
label: 'Needs Attention',
value: segmentCounts.needsAttention,
icon: '👀',
color: '#FF9800',
action: 'Re-engage Now'
},
{
label: 'At Risk',
value: segmentCounts.atRisk,
icon: '⚠️',
color: '#FF5722',
action: 'Win Back Urgently'
},
{
label: "Can't Lose",
value: segmentCounts.cantLose,
icon: '🚨',
color: '#D32F2F',
action: 'Personal Outreach'
},
{
label: 'Hibernating',
value: segmentCounts.hibernating,
icon: '😴',
color: '#795548',
action: 'Reactivation Offer'
},
{
label: 'Lost',
value: segmentCounts.lost,
icon: '💔',
color: '#9E9E9E',
action: 'Last Chance Offer'
},
{
label: 'Low Stock Items',
value: lowStockCount,
icon: '📦',
color: '#FF9800',
action: 'Create Urgency'
},
{
label: 'Out of Stock',
value: outOfStockCount,
icon: '🚫',
color: '#F44336',
action: 'Restock Now'
}
);

} catch(e) {
console.error('Insights Error:', e);
}

return insights;
},

// ============================================
// GET SEGMENT SUMMARY
// ============================================

getSegmentSummary: async function() {
const summary = {
total: 0,
healthy: 0,
atRisk: 0,
lost: 0,
segments: {}
};

try {
const customers = await db.customers.toArray();
summary.total = customers.length;

for (const c of customers) {
const orders = await db.orders
.where('customerPhone')
.equals(c.phone)
.toArray();

const orderCount = orders.length;
const totalSpent = c.totalSpent || 0;

let daysSinceLastOrder = 999;
if (orders.length > 0) {
orders.sort((a, b) => new Date(b.date) - new Date(a.date));
const lastOrderDate = new Date(orders[0].date);
daysSinceLastOrder = Math.floor((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24));
}

const segment = this.getCustomerSegment(orderCount, totalSpent, daysSinceLastOrder);

// Count by segment
if (!summary.segments[segment.key]) {
summary.segments[segment.key] = {
count: 0,
name: segment.name,
bangla: segment.bangla,
icon: segment.icon,
color: segment.color
};
}
summary.segments[segment.key].count++;

// Categorize health
if (['champions', 'loyal', 'potential', 'newBuyer', 'promising'].includes(segment.key)) {
summary.healthy++;
} else if (['needsAttention', 'atRisk', 'cantLose'].includes(segment.key)) {
summary.atRisk++;
} else {
summary.lost++;
}
}

} catch(e) {
console.error('Segment Summary Error:', e);
}

return summary;
},

// ============================================
// HELPER: Get Expiry Date
// ============================================

getExpiryDate: function(daysFromNow) {
return TacticsEngine.getExpiryDate(daysFromNow);
}

};

// ============================================
// MAKE GLOBALLY AVAILABLE
// ============================================

window.StrategyCore = StrategyCore;
window.StrategyConfig = StrategyConfig;

console.log('✅ StrategyCore v2.1 loaded - Powered by TacticsEngine v2.0!');