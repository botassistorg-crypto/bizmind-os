// ============================================
// BIZMIND GROWTH OS - SEGMENT DASHBOARD v1.0
// Visual Buyer Segments Display
// ============================================

const SegmentDashboard = {

// ============================================
// RENDER MAIN DASHBOARD
// ============================================

render: async function() {
const summary = await StrategyCore.getSegmentSummary();
const insights = await StrategyCore.getInsights();

const healthPercent = summary.total > 0
? Math.round((summary.healthy / summary.total) * 100)
: 0;

return `
<div class="segment-dashboard p-4">

<!-- Header -->
<div class="mb-6">
<h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
<i class="ph-duotone ph-users-three"></i>
Buyer Segments
</h2>
<p class="text-slate-500 text-sm">Total Buyers: ${summary.total}</p>
</div>

<!-- Health Meter -->
<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-4">
<div class="flex items-center justify-between mb-2">
<span class="text-sm font-semibold text-slate-700">Customer Health</span>
<span class="text-sm font-bold ${healthPercent >= 60 ? 'text-green-600' : healthPercent >= 40 ? 'text-yellow-600' : 'text-red-600'}">${healthPercent}% Healthy</span>
</div>
<div class="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
<div class="h-full rounded-full ${healthPercent >= 60 ? 'bg-green-500' : healthPercent >= 40 ? 'bg-yellow-500' : 'bg-red-500'}" style="width: ${healthPercent}%"></div>
</div>
<div class="flex justify-between mt-2 text-xs">
<span class="text-green-600">🟢 Healthy: ${summary.healthy}</span>
<span class="text-yellow-600">🟡 At Risk: ${summary.atRisk}</span>
<span class="text-red-600">🔴 Lost: ${summary.lost}</span>
</div>
</div>

<!-- Segment Cards Grid -->
<div class="grid grid-cols-2 gap-3 mb-4">
${this.renderSegmentCards(summary.segments)}
</div>

<!-- Quick Actions -->
<div class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 text-white">
<h3 class="font-bold mb-3 flex items-center gap-2">
<i class="ph-duotone ph-lightning"></i>
Quick Actions
</h3>
<div class="grid grid-cols-2 gap-2">
<button onclick="SegmentDashboard.sendToSegment('atRisk')" class="bg-white/20 hover:bg-white/30 rounded-xl p-3 text-sm font-medium text-left transition-all">
⚠️ Win Back At Risk
</button>
<button onclick="SegmentDashboard.sendToSegment('champions')" class="bg-white/20 hover:bg-white/30 rounded-xl p-3 text-sm font-medium text-left transition-all">
👑 Reward Champions
</button>
<button onclick="SegmentDashboard.sendToSegment('newBuyer')" class="bg-white/20 hover:bg-white/30 rounded-xl p-3 text-sm font-medium text-left transition-all">
🆕 Welcome New
</button>
<button onclick="SegmentDashboard.sendToSegment('lost')" class="bg-white/20 hover:bg-white/30 rounded-xl p-3 text-sm font-medium text-left transition-all">
💔 Reactivate Lost
</button>
</div>
</div>

</div>
`;
},

// ============================================
// RENDER SEGMENT CARDS
// ============================================

renderSegmentCards: function(segments) {
const segmentOrder = [
'champions', 'loyal', 'potential', 'newBuyer',
'promising', 'needsAttention', 'atRisk', 'cantLose',
'hibernating', 'lost'
];

let html = '';

for (const segmentId of segmentOrder) {
const segment = segments[segmentId];
if (!segment) continue;

const segmentInfo = TacticsEngine.getSegment(segmentId);
if (!segmentInfo) continue;

const isRisk = ['needsAttention', 'atRisk', 'cantLose', 'hibernating', 'lost'].includes(segmentId);

html += `
<div
class="segment-card bg-white rounded-xl p-4 shadow-sm border-2 cursor-pointer hover:shadow-md transition-all ${isRisk ? 'border-red-200 hover:border-red-400' : 'border-slate-200 hover:border-purple-400'}"
onclick="SegmentDashboard.showSegmentDetail('${segmentId}')"
>
<div class="flex items-center justify-between mb-2">
<span class="text-2xl">${segment.icon}</span>
<span class="text-2xl font-bold" style="color: ${segment.color}">${segment.count}</span>
</div>
<p class="font-semibold text-slate-800 text-sm">${segment.bangla}</p>
<p class="text-xs text-slate-500">${segment.name}</p>
</div>
`;
}

return html;
},

// ============================================
// SHOW SEGMENT DETAIL MODAL
// ============================================

showSegmentDetail: async function(segmentId) {
const segmentInfo = TacticsEngine.getSegment(segmentId);
if (!segmentInfo) return;

// Get all buyers in this segment
const buyers = await this.getBuyersInSegment(segmentId);

const modalHTML = `
<div id="segmentDetailModal" class="fixed inset-0 bg-black/50 z-50 flex items-end justify-center animate-fade-in">
<div class="bg-white w-full max-w-lg rounded-t-3xl max-h-[85vh] overflow-hidden animate-slide-up">

<!-- Header -->
<div class="p-4 border-b border-slate-200" style="background: linear-gradient(135deg, ${segmentInfo.color}22, ${segmentInfo.color}11)">
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<span class="text-3xl">${segmentInfo.icon}</span>
<div>
<h2 class="text-lg font-bold text-slate-800">${segmentInfo.bangla}</h2>
<p class="text-sm text-slate-600">${buyers.length} Buyers</p>
</div>
</div>
<button onclick="SegmentDashboard.closeModal()" class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300">
<i class="ph-bold ph-x text-xl"></i>
</button>
</div>
</div>

<!-- Strategy Info -->
<div class="p-3 bg-slate-50 border-b border-slate-200">
<p class="text-xs text-slate-600 mb-1"><strong>Strategy:</strong> ${segmentInfo.strategy}</p>
<p class="text-xs text-slate-600"><strong>Recommended Discount:</strong> ${segmentInfo.discountRange.min}% - ${segmentInfo.discountRange.max}%</p>
</div>

<!-- Buyers List -->
<div class="p-4 overflow-y-auto max-h-[50vh]">
${buyers.length > 0 ? this.renderBuyersList(buyers, segmentId) : `
<div class="text-center py-8 text-slate-500">
<i class="ph-duotone ph-users text-4xl mb-2"></i>
<p>No buyers in this segment</p>
</div>
`}
</div>

<!-- Footer Actions -->
<div class="p-4 border-t border-slate-200 bg-slate-50">
${buyers.length > 0 ? `
<button onclick="SegmentDashboard.sendToAllInSegment('${segmentId}')" class="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
<i class="ph-bold ph-paper-plane-tilt"></i>
Send Offer to All ${buyers.length} Buyers
</button>
` : ''}
</div>

</div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);
},

// ============================================
// GET BUYERS IN SEGMENT
// ============================================

getBuyersInSegment: async function(targetSegmentId) {
const buyers = [];

try {
const customers = await db.customers.toArray();

for (const c of customers) {
const orders = await db.orders
.where('customerPhone')
.equals(c.phone)
.toArray();

const orderCount = orders.length;
const totalSpent = c.totalSpent || 0;

let daysSinceLastOrder = 999;
let lastOrderDate = null;

if (orders.length > 0) {
orders.sort((a, b) => new Date(b.date) - new Date(a.date));
lastOrderDate = new Date(orders[0].date);
daysSinceLastOrder = Math.floor((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24));
}

const segment = StrategyCore.getCustomerSegment(orderCount, totalSpent, daysSinceLastOrder);

if (segment.key === targetSegmentId) {
buyers.push({
...c,
orderCount: orderCount,
totalSpent: totalSpent,
daysSinceLastOrder: daysSinceLastOrder,
lastOrderDate: lastOrderDate,
segment: segment
});
}
}

// Sort by total spent (highest first)
buyers.sort((a, b) => b.totalSpent - a.totalSpent);

} catch(e) {
console.error('Error getting buyers:', e);
}

return buyers;
},

// ============================================
// RENDER BUYERS LIST
// ============================================

renderBuyersList: function(buyers, segmentId) {
var html = '';

for (var i = 0; i < buyers.length; i++) {
var buyer = buyers[i];
var firstLetter = (buyer.name || 'C').charAt(0).toUpperCase();
var buyerName = buyer.name || 'Unknown';
var lastOrderText = buyer.daysSinceLastOrder === 999 ? 'No orders' : 'Last order: ' + buyer.daysSinceLastOrder + ' days ago';

html += '<div class="buyer-card bg-white border border-slate-200 rounded-xl p-3 mb-2 hover:border-purple-400 transition-all">' +
'<div class="flex items-center justify-between">' +
'<div class="flex items-center gap-3">' +
'<div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">' +
firstLetter +
'</div>' +
'<div>' +
'<p class="font-semibold text-slate-800">' + buyerName + '</p>' +
'<p class="text-xs text-slate-500">' + buyer.phone + '</p>' +
'</div>' +
'</div>' +
'<div class="text-right">' +
'<p class="font-bold text-slate-800">৳' + (buyer.totalSpent || 0) + '</p>' +
'<p class="text-xs text-slate-500">' + buyer.orderCount + ' orders</p>' +
'</div>' +
'</div>' +
'<div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">' +
'<span class="text-xs text-slate-500">' + lastOrderText + '</span>' +
'<div class="flex gap-2">' +
'<button onclick="event.stopPropagation(); CustomerNotes.open(\'' + buyer.phone + '\')" class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium hover:bg-slate-200 transition-all" title="Notes">' +
'📝' +
'</button>' +
'<button onclick="SegmentDashboard.sendToBuyer(\'' + buyer.phone + '\', \'' + segmentId + '\')" class="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium hover:bg-purple-200 transition-all">' +
'Send Offer' +
'</button>' +
'</div>' +
'</div>' +
'</div>';
}

return html;
},

sendToBuyer: async function(phone, segmentId) {
    console.log('📤 sendToBuyer called:', phone, segmentId);
    
    try {
        // Find the customer
       // Try multiple formats to find customer
let customer = await db.customers.get(phone);

if (!customer) {
    customer = await db.customers.get(String(phone));
}

if (!customer) {
    customer = await db.customers.get(Number(phone));
}

if (!customer) {
    // Try with leading zero
    customer = await db.customers.get('0' + phone);
}

if (!customer) {
    // Try without leading zero
    const phoneStr = String(phone);
    if (phoneStr.startsWith('0')) {
        customer = await db.customers.get(phoneStr.substring(1));
    }
}

        if (customer) {
            // Close segment modal AFTER getting customer
            this.closeModal();
            
            // Small delay to let modal close
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Set in OfferWizard and open
            OfferWizard.selectedCustomer = customer;
            OfferWizard.selectedCustomer.segment = TacticsEngine.getSegment ? 
                TacticsEngine.getSegment(segmentId) : segmentId;
            OfferWizard.currentStep = 2;
            
            console.log('🚀 Opening OfferWizard...');
            await OfferWizard.open();
            
            if (typeof OfferWizard.updateWizardView === 'function') {
                await OfferWizard.updateWizardView();
            }
            
            console.log('✅ OfferWizard should be open!');
        } else {
            console.error('❌ Customer not found for phone:', phone);
            alert('কাস্টমার পাওয়া যায়নি!');
        }
    } catch (error) {
        console.error('❌ Error in sendToBuyer:', error);
        alert('একটি সমস্যা হয়েছে: ' + error.message);
    }
},

// ============================================
// SEND TO ALL IN SEGMENT
// ============================================

sendToAllInSegment: async function(segmentId) {
const segmentInfo = TacticsEngine.getSegment(segmentId);
const buyers = await this.getBuyersInSegment(segmentId);

if (buyers.length === 0) {
alert('No buyers in this segment!');
return;
}

// Get recommended discount
const discount = TacticsEngine.calculateOptimalDiscount(segmentId, 'medium');
const code = TacticsEngine.generateCouponCode('winback', discount);
const expiry = TacticsEngine.getExpiryDate(7);

// Get shop name
let shopName = 'BizMind Shop';
try {
const setting = await db.settings.get('shopName');
if (setting) shopName = setting.value;
} catch(e) {}

// Choose message type based on segment
let messageCategory = 'reorderReminder';
let messageType = 'gentle';

if (['atRisk', 'hibernating', 'lost'].includes(segmentId)) {
messageCategory = 'winBack';
messageType = segmentId === 'lost' ? 'last_chance' : 'miss_you';
} else if (['champions', 'loyal'].includes(segmentId)) {
messageCategory = 'vipExclusive';
messageType = 'exclusive';
} else if (segmentId === 'newBuyer') {
messageCategory = 'welcome';
messageType = 'warm';
} else if (segmentId === 'cantLose') {
messageCategory = 'winBack';
messageType = 'cantLose';
}

// Generate base message
const offer = `${discount}% ছাড়`;

// Show bulk send modal
const modalHTML = `
<div id="bulkSendModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
<div class="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-slide-up">

<!-- Header -->
<div class="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
<h2 class="text-lg font-bold flex items-center gap-2">
<i class="ph-duotone ph-paper-plane-tilt"></i>
Bulk Send to ${segmentInfo.bangla}
</h2>
<p class="text-sm text-white/80">${buyers.length} buyers will receive this message</p>
</div>

<!-- Message Preview -->
<div class="p-4">
<label class="text-sm font-semibold text-slate-700 mb-2 block">Message Preview:</label>
<textarea id="bulkMessage" rows="8" class="w-full p-3 border border-slate-300 rounded-xl text-sm resize-none focus:ring-2 focus:ring-purple-500">${this.generateBulkMessage(segmentId, discount, code, expiry, shopName)}</textarea>
</div>

<!-- Buyer List Preview -->
<div class="px-4 pb-2">
<p class="text-xs text-slate-500 mb-2">Recipients:</p>
<div class="max-h-24 overflow-y-auto bg-slate-50 rounded-lg p-2">
${buyers.slice(0, 10).map(b => `<span class="inline-block bg-slate-200 rounded-full px-2 py-1 text-xs mr-1 mb-1">${b.name || b.phone}</span>`).join('')}
${buyers.length > 10 ? `<span class="inline-block text-xs text-slate-500">+${buyers.length - 10} more</span>` : ''}
</div>
</div>

<!-- Actions -->
<div class="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
<button onclick="SegmentDashboard.closeBulkModal()" class="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all">
Cancel
</button>
<button onclick="SegmentDashboard.executeBulkSend('${segmentId}')" class="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-500 transition-all">
<i class="ph-bold ph-whatsapp-logo"></i>
Send All
</button>
</div>

</div>
</div>
`;

// Close segment detail modal first
this.closeModal();

// Show bulk send modal
document.body.insertAdjacentHTML('beforeend', modalHTML);
},

// ============================================
// GENERATE BULK MESSAGE
// ============================================

generateBulkMessage: function(segmentId, discount, code, expiry, shopName) {
const segmentMessages = {
champions: `👑 প্রিয় VIP Customer,\n\nআপনি আমাদের সেরা কাস্টমারদের একজন!\n\n🎁 আপনার জন্য Exclusive:\n${discount}% ছাড়!\n\nCode: ${code}\n⏰ Valid: ${expiry}\n\nধন্যবাদ সবসময় আমাদের সাথে থাকার জন্য! 💝\n\n- ${shopName}`,

loyal: `💚 প্রিয় Customer,\n\nআপনার loyalty এর জন্য ধন্যবাদ!\n\n🎁 আপনার জন্য Special:\n${discount}% ছাড়!\n\nCode: ${code}\n⏰ Valid: ${expiry}\n\n- ${shopName}`,

newBuyer: `🎉 স্বাগতম!\n\nআমাদের থেকে কেনার জন্য ধন্যবাদ!\n\n💝 পরবর্তী অর্ডারে ${discount}% ছাড় পেতে:\nCode: ${code}\n\n⏰ Valid: ${expiry}\n\nআবার আসবেন! 😊\n\n- ${shopName}`,

needsAttention: `👋 হ্যালো!\n\nঅনেকদিন দেখা নেই!\n\n🎁 আপনার জন্য রেখেছি:\n${discount}% ছাড়!\n\nCode: ${code}\n⏰ Valid: ${expiry}\n\nফিরে আসুন! 💚\n\n- ${shopName}`,

atRisk: `😢 আপনাকে মিস করছি!\n\nঅনেকদিন অর্ডার নেই।\n\n🎁 ফিরে আসুন:\n${discount}% ছাড় শুধু আপনার জন্য!\n\nCode: ${code}\n⏰ Valid: ${expiry}\n\nআমরা অপেক্ষায় আছি!\n\n- ${shopName}`,

cantLose: `🙏 প্রিয় Valued Customer,\n\nআপনি আমাদের কাছে খুবই গুরুত্বপূর্ণ।\n\nঅনেকদিন দেখা নেই। কোনো সমস্যা হলে জানাবেন।\n\n💎 Special VIP Offer:\n${discount}% ছাড় + Free Delivery!\n\nCode: ${code}\n⏰ Valid: ${expiry}\n\n- ${shopName}`,

hibernating: `😴 অনেকদিন দেখা নেই!\n\n🎁 বিশেষ অফার:\n${discount}% ছাড়!\n\nCode: ${code}\n⏰ Valid: ${expiry}\n\nফিরে আসুন!\n\n- ${shopName}`,

lost: `🚨 LAST CHANCE!\n\n${discount}% ছাড় - শুধু আপনার জন্য!\n\nCode: ${code}\n⏰ আজ রাত পর্যন্ত!\n\nমিস করবেন না!\n\n- ${shopName}`
};

return segmentMessages[segmentId] || segmentMessages.needsAttention;
},

// ============================================
// EXECUTE BULK SEND
// ============================================

executeBulkSend: async function(segmentId) {
const message = document.getElementById('bulkMessage').value;
const buyers = await this.getBuyersInSegment(segmentId);

// Copy message to clipboard
await navigator.clipboard.writeText(message);

// Show instructions
alert(`✅ Message copied!\n\n${buyers.length} জন buyer এর জন্য message copy হয়েছে।\n\nএখন WhatsApp এ paste করে পাঠান।\n\nBuyers:\n${buyers.slice(0, 5).map(b => b.phone).join('\n')}${buyers.length > 5 ? '\n...' : ''}`);

// Close modal
this.closeBulkModal();
},

// ============================================
// SEND TO SEGMENT (Quick Action)
// ============================================

sendToSegment: async function(segmentId) {
await this.showSegmentDetail(segmentId);
},

// ============================================
// CLOSE MODALS
// ============================================

closeModal: function() {
document.getElementById('segmentDetailModal')?.remove();
},

closeBulkModal: function() {
document.getElementById('bulkSendModal')?.remove();
}

};

// ============================================
// MAKE GLOBALLY AVAILABLE
// ============================================

window.SegmentDashboard = SegmentDashboard;

console.log('✅ SegmentDashboard v1.0 loaded!');