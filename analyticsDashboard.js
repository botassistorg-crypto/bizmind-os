// ============================================
// BIZMIND - ANALYTICS DASHBOARD v1.0
// Visual charts for customer segments & revenue
// ============================================

var AnalyticsDashboard = {

// Open analytics modal
open: async function() {
var segmentData = await this.getSegmentData();
var revenueData = await this.getRevenueData();
var stats = await this.getOverallStats();

var modalHTML = '<div id="analyticsModal" class="fixed inset-0 bg-black/50 z-50 flex items-end justify-center animate-fade-in">' +
'<div class="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-hidden animate-slide-up">' +

'<div class="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">' +
'<div class="flex items-center justify-between">' +
'<div>' +
'<h2 class="font-bold flex items-center gap-2">' +
'<i class="ph-duotone ph-chart-line-up"></i> Analytics Dashboard' +
'</h2>' +
'<p class="text-white/70 text-sm">Business insights & trends</p>' +
'</div>' +
'<button onclick="AnalyticsDashboard.close()" class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">' +
'<i class="ph-bold ph-x text-xl"></i>' +
'</button>' +
'</div>' +
'</div>' +

'<div class="p-4 overflow-y-auto max-h-[70vh]">' +

'<div class="grid grid-cols-2 gap-3 mb-4">' +
'<div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">' +
'<p class="text-2xl font-bold text-emerald-700">' + stats.totalCustomers + '</p>' +
'<p class="text-xs text-emerald-600">Total Customers</p>' +
'</div>' +
'<div class="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">' +
'<p class="text-2xl font-bold text-blue-700">' + stats.totalOrders + '</p>' +
'<p class="text-xs text-blue-600">Total Orders</p>' +
'</div>' +
'<div class="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">' +
'<p class="text-2xl font-bold text-purple-700">৳' + stats.totalRevenue + '</p>' +
'<p class="text-xs text-purple-600">Total Revenue</p>' +
'</div>' +
'<div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">' +
'<p class="text-2xl font-bold text-amber-700">৳' + stats.avgOrderValue + '</p>' +
'<p class="text-xs text-amber-600">Avg Order Value</p>' +
'</div>' +
'</div>' +

'<div class="bg-white border border-slate-200 rounded-xl p-4 mb-4">' +
'<h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2">' +
'<i class="ph-duotone ph-users"></i> Customer Segments' +
'</h3>' +
this.renderSegmentBars(segmentData) +
'</div>' +

'<div class="bg-white border border-slate-200 rounded-xl p-4 mb-4">' +
'<h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2">' +
'<i class="ph-duotone ph-heartbeat"></i> Customer Health' +
'</h3>' +
this.renderHealthChart(segmentData) +
'</div>' +

'<div class="bg-white border border-slate-200 rounded-xl p-4 mb-4">' +
'<h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2">' +
'<i class="ph-duotone ph-calendar"></i> Orders This Week' +
'</h3>' +
this.renderWeeklyOrders(revenueData.weeklyOrders) +
'</div>' +

'<div class="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 text-white">' +
'<h3 class="font-bold mb-2">💡 AI Insights</h3>' +
'<ul class="text-sm space-y-2">' +
this.generateInsights(segmentData, stats) +
'</ul>' +
'</div>' +

'</div>' +

'<div class="p-4 border-t border-slate-200 bg-slate-50">' +
'<button onclick="AnalyticsDashboard.close()" class="w-full py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700">Close</button>' +
'</div>' +

'</div>' +
'</div>';

document.body.insertAdjacentHTML('beforeend', modalHTML);
},

// Get segment data
getSegmentData: async function() {
var segments = {
champions: { count: 0, label: 'Champions', icon: '🏆', color: '#FFD700' },
loyal: { count: 0, label: 'Loyal', icon: '💚', color: '#4CAF50' },
potential: { count: 0, label: 'Potential', icon: '⭐', color: '#2196F3' },
newBuyer: { count: 0, label: 'New', icon: '🆕', color: '#9C27B0' },
promising: { count: 0, label: 'Promising', icon: '💫', color: '#00BCD4' },
needsAttention: { count: 0, label: 'Needs Attention', icon: '👀', color: '#FF9800' },
atRisk: { count: 0, label: 'At Risk', icon: '⚠️', color: '#FF5722' },
cantLose: { count: 0, label: 'Cant Lose', icon: '🚨', color: '#D32F2F' },
hibernating: { count: 0, label: 'Hibernating', icon: '😴', color: '#795548' },
lost: { count: 0, label: 'Lost', icon: '💔', color: '#9E9E9E' }
};

try {
var customers = await db.customers.toArray();

for (var i = 0; i < customers.length; i++) {
var customer = customers[i];
var orders = await db.orders.where('customerPhone').equals(customer.phone).toArray();

var orderCount = orders.length;
var totalSpent = customer.totalSpent || 0;
var daysSinceLastOrder = 999;

if (orders.length > 0) {
orders.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
var lastOrderDate = new Date(orders[0].date);
daysSinceLastOrder = Math.floor((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24));
}

var segment = StrategyCore.getCustomerSegment(orderCount, totalSpent, daysSinceLastOrder);

if (segments[segment.key]) {
segments[segment.key].count++;
}
}
} catch(e) {
console.error('Error getting segment data:', e);
}

return segments;
},

// Get revenue data
getRevenueData: async function() {
var data = {
weeklyOrders: [0, 0, 0, 0, 0, 0, 0],
totalRevenue: 0
};

try {
var orders = await db.orders.toArray();
var today = new Date();

for (var i = 0; i < orders.length; i++) {
var order = orders[i];
var orderDate = new Date(order.date);
var daysAgo = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));

if (daysAgo < 7) {
var dayIndex = 6 - daysAgo;
data.weeklyOrders[dayIndex]++;
}

data.totalRevenue += (order.grandTotal || 0);
}
} catch(e) {
console.error('Error getting revenue data:', e);
}

return data;
},

// Get overall stats
getOverallStats: async function() {
var stats = {
totalCustomers: 0,
totalOrders: 0,
totalRevenue: 0,
avgOrderValue: 0
};

try {
var customers = await db.customers.toArray();
var orders = await db.orders.toArray();

stats.totalCustomers = customers.length;
stats.totalOrders = orders.length;

for (var i = 0; i < orders.length; i++) {
stats.totalRevenue += (orders[i].grandTotal || 0);
}

if (stats.totalOrders > 0) {
stats.avgOrderValue = Math.round(stats.totalRevenue / stats.totalOrders);
}
} catch(e) {
console.error('Error getting stats:', e);
}

return stats;
},

// Render segment bars
renderSegmentBars: function(segments) {
var html = '';
var maxCount = 1;

for (var key in segments) {
if (segments[key].count > maxCount) {
maxCount = segments[key].count;
}
}

var order = ['champions', 'loyal', 'potential', 'newBuyer', 'promising', 'needsAttention', 'atRisk', 'cantLose', 'hibernating', 'lost'];

for (var i = 0; i < order.length; i++) {
var key = order[i];
var seg = segments[key];
var width = Math.max(5, (seg.count / maxCount) * 100);

html += '<div class="mb-2">' +
'<div class="flex items-center justify-between text-xs mb-1">' +
'<span>' + seg.icon + ' ' + seg.label + '</span>' +
'<span class="font-bold">' + seg.count + '</span>' +
'</div>' +
'<div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">' +
'<div class="h-full rounded-full" style="width: ' + width + '%; background-color: ' + seg.color + '"></div>' +
'</div>' +
'</div>';
}

return html;
},

// Render health chart
renderHealthChart: function(segments) {
var healthy = segments.champions.count + segments.loyal.count + segments.potential.count + segments.newBuyer.count + segments.promising.count;
var atRisk = segments.needsAttention.count + segments.atRisk.count + segments.cantLose.count;
var lost = segments.hibernating.count + segments.lost.count;
var total = healthy + atRisk + lost;

if (total === 0) total = 1;

var healthyPct = Math.round((healthy / total) * 100);
var atRiskPct = Math.round((atRisk / total) * 100);
var lostPct = Math.round((lost / total) * 100);

return '<div class="flex items-center gap-2 mb-2">' +
'<div class="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden flex">' +
'<div class="h-full bg-green-500" style="width: ' + healthyPct + '%"></div>' +
'<div class="h-full bg-yellow-500" style="width: ' + atRiskPct + '%"></div>' +
'<div class="h-full bg-red-500" style="width: ' + lostPct + '%"></div>' +
'</div>' +
'</div>' +
'<div class="flex justify-between text-xs">' +
'<span class="text-green-600">🟢 Healthy: ' + healthy + ' (' + healthyPct + '%)</span>' +
'<span class="text-yellow-600">🟡 At Risk: ' + atRisk + ' (' + atRiskPct + '%)</span>' +
'<span class="text-red-600">🔴 Lost: ' + lost + ' (' + lostPct + '%)</span>' +
'</div>';
},

// Render weekly orders
renderWeeklyOrders: function(weeklyOrders) {
var days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
var today = new Date().getDay();
var orderedDays = [];

for (var i = 6; i >= 0; i--) {
var dayIndex = (today - i + 7) % 7;
orderedDays.push(days[dayIndex]);
}

var maxOrders = Math.max.apply(null, weeklyOrders) || 1;
var html = '<div class="flex items-end justify-between gap-1 h-24">';

for (var i = 0; i < 7; i++) {
var height = Math.max(10, (weeklyOrders[i] / maxOrders) * 100);
var isToday = i === 6;

html += '<div class="flex-1 flex flex-col items-center">' +
'<span class="text-xs font-bold text-slate-700 mb-1">' + weeklyOrders[i] + '</span>' +
'<div class="w-full rounded-t-lg ' + (isToday ? 'bg-emerald-500' : 'bg-slate-300') + '" style="height: ' + height + '%"></div>' +
'<span class="text-[10px] text-slate-500 mt-1">' + orderedDays[i] + '</span>' +
'</div>';
}

html += '</div>';
return html;
},

// Generate AI insights
generateInsights: function(segments, stats) {
var insights = [];

var atRiskTotal = segments.atRisk.count + segments.cantLose.count + segments.needsAttention.count;
var lostTotal = segments.hibernating.count + segments.lost.count;

if (atRiskTotal > 5) {
insights.push('<li>⚠️ You have <strong>' + atRiskTotal + '</strong> at-risk customers. Send win-back offers today!</li>');
}

if (lostTotal > 10) {
insights.push('<li>💔 <strong>' + lostTotal + '</strong> customers are lost. Consider a reactivation campaign.</li>');
}

if (segments.champions.count > 0) {
insights.push('<li>👑 Nurture your <strong>' + segments.champions.count + '</strong> champions with VIP offers!</li>');
}

if (segments.newBuyer.count > 3) {
insights.push('<li>🆕 <strong>' + segments.newBuyer.count + '</strong> new customers! Send welcome messages to build loyalty.</li>');
}

if (stats.avgOrderValue < 500) {
insights.push('<li>📦 Average order is ৳' + stats.avgOrderValue + '. Try bundle offers to increase it!</li>');
}

if (insights.length === 0) {
insights.push('<li>✅ Your business looks healthy! Keep up the good work.</li>');
}

return insights.join('');
},

// Close modal
close: function() {
var modal = document.getElementById('analyticsModal');
if (modal) modal.remove();
}

};

window.AnalyticsDashboard = AnalyticsDashboard;
console.log('AnalyticsDashboard v1.0 loaded!');