// ============================================
// BIZMIND GROWTH OS - OFFER WIZARD v2.0
// AI-Powered Offer Generator
// ============================================

var OfferWizard = {

currentStep: 1,
selectedCustomer: null,
selectedOfferType: null,
selectedUrgency: null,
generatedMessage: null,

offerTypes: [
{
id: 'win_back',
name: 'Win Back',
bangla: 'ফিরিয়ে আনুন',
icon: '💔',
description: 'Inactive customers কে ফেরত আনুন',
discountRange: '15-25%',
bestFor: 'atRisk, lost'
},
{
id: 'vip_exclusive',
name: 'VIP Exclusive',
bangla: 'ভিআইপি অফার',
icon: '👑',
description: 'Top customers দের special offer',
discountRange: '10-20%',
bestFor: 'champions, loyal'
},
{
id: 'flash_sale',
name: 'Flash Sale',
bangla: 'ফ্ল্যাশ সেল',
icon: '⚡',
description: 'Limited time urgent offer',
discountRange: '20-40%',
bestFor: 'all'
},
{
id: 'free_delivery',
name: 'Free Delivery',
bangla: 'ফ্রি ডেলিভারি',
icon: '🚚',
description: 'Delivery charge মাফ',
discountRange: 'Free shipping',
bestFor: 'newBuyer, potential'
},
{
id: 'bundle_deal',
name: 'Bundle Deal',
bangla: 'কম্বো অফার',
icon: '🎁',
description: 'Multiple products একসাথে',
discountRange: '15-30%',
bestFor: 'loyal, promising'
},
{
id: 'first_order',
name: 'First Order',
bangla: 'প্রথম অর্ডার',
icon: '🆕',
description: 'New customer welcome offer',
discountRange: '10-15%',
bestFor: 'newBuyer'
},
{
id: 'loyalty_reward',
name: 'Loyalty Reward',
bangla: 'আনুগত্য পুরস্কার',
icon: '💚',
description: 'Regular customers কে reward',
discountRange: '10-20%',
bestFor: 'loyal, promising'
},
{
id: 'clearance',
name: 'Clearance Sale',
bangla: 'ক্লিয়ারেন্স সেল',
icon: '🏷️',
description: 'Stock clearance এর জন্য',
discountRange: '30-50%',
bestFor: 'hibernating, lost'
}
],

urgencyLevels: [
{
id: 'low',
name: 'Soft',
bangla: 'সাধারণ',
icon: '😊',
duration: '7 days',
description: 'No pressure, friendly tone'
},
{
id: 'medium',
name: 'Moderate',
bangla: 'মাঝারি',
icon: '⏰',
duration: '3 days',
description: 'Some urgency, limited time'
},
{
id: 'high',
name: 'Urgent',
bangla: 'জরুরি',
icon: '🔥',
duration: '24 hours',
description: 'High pressure, act now'
},
{
id: 'flash',
name: 'Flash',
bangla: 'ফ্ল্যাশ',
icon: '⚡',
duration: '6 hours',
description: 'Extreme urgency, limited stock'
}
],
// ============================================
// RENDER WIZARD MODAL
// ============================================

renderModal: async function() {
var customers = await this.getCustomersWithSegments();
var self = this;

return '<div id="offerWizardModal" class="fixed inset-0 bg-black/50 z-50 flex items-end justify-center animate-fade-in">' +
'<div class="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-hidden animate-slide-up">' +

'<div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white">' +
'<div class="flex items-center justify-between">' +
'<div>' +
'<h2 class="text-xl font-bold flex items-center gap-2">' +
'<i class="ph-duotone ph-brain"></i> Offer AI' +
'</h2>' +
'<p class="text-white/80 text-sm">Smart offer generator</p>' +
'</div>' +
'<button onclick="OfferWizard.closeModal()" class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">' +
'<i class="ph-bold ph-x text-xl"></i>' +
'</button>' +
'</div>' +

'<div class="flex items-center gap-2 mt-4">' +
this.renderProgressSteps() +
'</div>' +
'</div>' +

'<div class="p-5 overflow-y-auto max-h-[60vh]" id="wizardBody">' +
await this.renderStep1(customers) +
'</div>' +

'<div class="p-4 border-t border-slate-200 bg-slate-50" id="wizardFooter">' +
this.renderFooter() +
'</div>' +

'</div>' +
'</div>';
},

// ============================================
// PROGRESS STEPS
// ============================================

renderProgressSteps: function() {
var steps = [
{ num: 1, label: 'Customer' },
{ num: 2, label: 'Offer Type' },
{ num: 3, label: 'Urgency' },
{ num: 4, label: 'Generate' }
];

var html = '';
var self = this;

for (var i = 0; i < steps.length; i++) {
var step = steps[i];
var opacity = step.num <= this.currentStep ? 'opacity-100' : 'opacity-40';
var bgClass = '';

if (step.num === this.currentStep) {
bgClass = 'bg-white text-purple-600';
} else if (step.num < this.currentStep) {
bgClass = 'bg-green-400 text-white';
} else {
bgClass = 'bg-white/30 text-white';
}

var checkOrNum = step.num < this.currentStep ? '✓' : step.num;

html += '<div class="flex items-center gap-2 ' + opacity + '">' +
'<div class="w-7 h-7 rounded-full ' + bgClass + ' flex items-center justify-center text-sm font-bold">' +
checkOrNum +
'</div>' +
'<span class="text-xs font-medium hidden sm:inline">' + step.label + '</span>' +
'</div>';

if (step.num < 4) {
html += '<div class="flex-1 h-0.5 bg-white/30 rounded"></div>';
}
}

return html;
},

// ============================================
// FOOTER
// ============================================

renderFooter: function() {
if (this.currentStep === 1) {
var disabled = !this.selectedCustomer ? 'disabled' : '';
return '<button onclick="OfferWizard.nextStep()" class="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-purple-500" id="nextBtn" ' + disabled + '>' +
'Next: Select Offer Type →' +
'</button>';
} else if (this.currentStep === 2) {
var disabled = !this.selectedOfferType ? 'disabled' : '';
return '<div class="flex gap-3">' +
'<button onclick="OfferWizard.prevStep()" class="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300">← Back</button>' +
'<button onclick="OfferWizard.nextStep()" class="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500" id="nextBtn" ' + disabled + '>Next →</button>' +
'</div>';
} else if (this.currentStep === 3) {
var disabled = !this.selectedUrgency ? 'disabled' : '';
return '<div class="flex gap-3">' +
'<button onclick="OfferWizard.prevStep()" class="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300">← Back</button>' +
'<button onclick="OfferWizard.nextStep()" class="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500" id="nextBtn" ' + disabled + '>Generate Offer 🎉</button>' +
'</div>';
} else {
return '<button onclick="OfferWizard.closeModal()" class="w-full py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700">Done ✓</button>';
}
},
// ============================================
// STEP 1: SELECT CUSTOMER
// ============================================

renderStep1: async function(customers) {
var html = '<div class="space-y-3">' +
'<h3 class="font-bold text-slate-800 mb-3">Select Customer</h3>' +

'<div class="relative">' +
'<i class="ph-bold ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>' +
'<input type="text" id="customerSearch" placeholder="Search by name or phone..." onkeyup="OfferWizard.filterCustomers()" class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500">' +
'</div>' +

'<div class="flex gap-2 flex-wrap">' +
'<button onclick="OfferWizard.filterBySegment(\'all\')" class="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium hover:bg-slate-200 segment-filter active" data-segment="all">All</button>' +
'<button onclick="OfferWizard.filterBySegment(\'champions\')" class="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium hover:bg-yellow-200 segment-filter" data-segment="champions">👑 VIP</button>' +
'<button onclick="OfferWizard.filterBySegment(\'atRisk\')" class="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200 segment-filter" data-segment="atRisk">⚠️ At Risk</button>' +
'<button onclick="OfferWizard.filterBySegment(\'lost\')" class="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 segment-filter" data-segment="lost">💔 Lost</button>' +
'<button onclick="OfferWizard.filterBySegment(\'newBuyer\')" class="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 segment-filter" data-segment="newBuyer">🆕 New</button>' +
'</div>' +

'<div class="space-y-2 max-h-64 overflow-y-auto" id="customerList">';

for (var i = 0; i < customers.length; i++) {
html += this.renderCustomerCard(customers[i]);
}

html += '</div>';

if (customers.length === 0) {
html += '<div class="text-center py-8 text-slate-500">' +
'<i class="ph-duotone ph-users text-4xl mb-2"></i>' +
'<p>No customers found</p>' +
'</div>';
}

html += '</div>';

return html;
},

renderCustomerCard: function(customer) {
var segmentKey = customer.segment ? customer.segment.key : 'unknown';
var segmentIcon = customer.segment ? customer.segment.icon : '❓';
var segmentName = customer.segment ? customer.segment.name : 'Unknown';

var colorClass = 'bg-slate-100 border-slate-300 text-slate-700';
if (segmentKey === 'champions') colorClass = 'bg-yellow-100 border-yellow-300 text-yellow-700';
else if (segmentKey === 'loyal') colorClass = 'bg-green-100 border-green-300 text-green-700';
else if (segmentKey === 'potential') colorClass = 'bg-blue-100 border-blue-300 text-blue-700';
else if (segmentKey === 'newBuyer') colorClass = 'bg-purple-100 border-purple-300 text-purple-700';
else if (segmentKey === 'atRisk' || segmentKey === 'needsAttention') colorClass = 'bg-orange-100 border-orange-300 text-orange-700';
else if (segmentKey === 'lost' || segmentKey === 'hibernating' || segmentKey === 'cantLose') colorClass = 'bg-red-100 border-red-300 text-red-700';

var selectedClass = '';
if (this.selectedCustomer && this.selectedCustomer.phone === customer.phone) {
selectedClass = 'border-purple-500 bg-purple-50 ring-2 ring-purple-500';
}

var customerName = customer.name || 'Unknown';
var firstLetter = customerName.charAt(0).toUpperCase();
var hasNotes = customer.notes ? '📝' : '';

return '<div class="customer-card p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all ' + selectedClass + '" data-phone="' + customer.phone + '" data-name="' + customerName + '" data-segment="' + segmentKey + '" onclick="OfferWizard.selectCustomer(\'' + customer.phone + '\')">' +
'<div class="flex items-center gap-3">' +
'<div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">' + firstLetter + '</div>' +
'<div class="flex-1 min-w-0">' +
'<div class="flex items-center gap-2">' +
'<p class="font-semibold text-slate-800 truncate">' + customerName + '</p>' +
'<button onclick="event.stopPropagation(); CustomerNotes.open(\'' + customer.phone + '\')" class="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full transition-all" title="View/Add Notes">' +
'📝' + (customer.notes ? '✓' : '') +
'</button>' +
'</div>' +
'<p class="text-xs text-slate-500">' + customer.phone + '</p>' +
'</div>' +
'<div class="text-right">' +
'<span class="inline-block px-2 py-1 rounded-full text-xs font-medium ' + colorClass + '">' + segmentIcon + ' ' + segmentName + '</span>' +
'<p class="text-xs text-slate-500 mt-1">৳' + (customer.totalSpent || 0) + '</p>' +
'</div>' +
'</div>' +
'</div>';
},

// ============================================
// STEP 2: SELECT OFFER TYPE
// ============================================

renderStep2: function() {
var segmentName = 'this customer';
if (this.selectedCustomer && this.selectedCustomer.segment) {
segmentName = this.selectedCustomer.segment.name || 'this customer';
}

var html = '<div class="space-y-3">' +
'<h3 class="font-bold text-slate-800 mb-3">Select Offer Type</h3>' +
'<p class="text-sm text-slate-500 mb-4">Recommended for <span class="font-semibold text-purple-600">' + segmentName + '</span></p>' +
'<div class="grid grid-cols-2 gap-3" id="offerTypeList">';

for (var i = 0; i < this.offerTypes.length; i++) {
html += this.renderOfferTypeCard(this.offerTypes[i]);
}

html += '</div></div>';

return html;
},

renderOfferTypeCard: function(offer) {
var segmentKey = '';
if (this.selectedCustomer && this.selectedCustomer.segment) {
segmentKey = this.selectedCustomer.segment.key || '';
}

var recommended = false;
if (segmentKey === 'lost' && (offer.id === 'win_back' || offer.id === 'clearance')) recommended = true;
if (segmentKey === 'atRisk' && (offer.id === 'win_back' || offer.id === 'loyalty_reward')) recommended = true;
if (segmentKey === 'champions' && (offer.id === 'vip_exclusive' || offer.id === 'bundle_deal')) recommended = true;
if (segmentKey === 'loyal' && (offer.id === 'loyalty_reward' || offer.id === 'vip_exclusive')) recommended = true;
if (segmentKey === 'newBuyer' && (offer.id === 'first_order' || offer.id === 'free_delivery')) recommended = true;

var selectedClass = '';
if (this.selectedOfferType && this.selectedOfferType.id === offer.id) {
selectedClass = 'border-purple-500 bg-purple-50';
} else {
selectedClass = 'border-slate-200 hover:border-purple-300';
}

var recommendedRing = recommended ? 'ring-2 ring-green-400' : '';
var recommendedBadge = recommended ? '<span class="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">✨ Recommended</span>' : '';

var banglaName = offer.bangla || offer.name;

return '<div class="offer-type-card p-4 border-2 rounded-xl cursor-pointer transition-all ' + selectedClass + ' ' + recommendedRing + '" data-offer-id="' + offer.id + '" onclick="OfferWizard.selectOfferType(\'' + offer.id + '\')">' +
'<div class="text-2xl mb-2">' + offer.icon + '</div>' +
'<p class="font-bold text-slate-800 text-sm">' + banglaName + '</p>' +
'<p class="text-xs text-slate-500">' + offer.discountRange + '</p>' +
recommendedBadge +
'</div>';
},

// ============================================
// STEP 3: SELECT URGENCY
// ============================================

renderStep3: function() {
var html = '<div class="space-y-3">' +
'<h3 class="font-bold text-slate-800 mb-3">Select Urgency Level</h3>' +
'<p class="text-sm text-slate-500 mb-4">How much pressure do you want to create?</p>' +
'<div class="space-y-3" id="urgencyList">';

for (var i = 0; i < this.urgencyLevels.length; i++) {
html += this.renderUrgencyCard(this.urgencyLevels[i]);
}

html += '</div></div>';

return html;
},

renderUrgencyCard: function(level) {
var selectedClass = '';
if (this.selectedUrgency && this.selectedUrgency.id === level.id) {
selectedClass = 'border-purple-500 bg-purple-50';
} else {
selectedClass = 'border-slate-200 hover:border-purple-300';
}

var banglaName = level.bangla || level.name;
var desc = level.description || '';

return '<div class="urgency-card p-4 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-4 ' + selectedClass + '" data-urgency-id="' + level.id + '" onclick="OfferWizard.selectUrgency(\'' + level.id + '\')">' +
'<div class="text-3xl">' + level.icon + '</div>' +
'<div class="flex-1">' +
'<p class="font-bold text-slate-800">' + banglaName + '</p>' +
'<p class="text-xs text-slate-500">' + desc + '</p>' +
'</div>' +
'<div class="text-right">' +
'<span class="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-mono">' + level.duration + '</span>' +
'</div>' +
'</div>';
},
// ============================================
// STEP 4: GENERATE & PREVIEW
// ============================================

renderStep4: async function() {
var message = await this.generateOffer();
this.generatedMessage = message;

var customerName = this.selectedCustomer ? (this.selectedCustomer.name || 'Customer') : 'Customer';
var offerIcon = this.selectedOfferType ? this.selectedOfferType.icon : '';
var offerName = this.selectedOfferType ? (this.selectedOfferType.bangla || this.selectedOfferType.name) : '';
var urgencyIcon = this.selectedUrgency ? this.selectedUrgency.icon : '';
var urgencyDuration = this.selectedUrgency ? this.selectedUrgency.duration : '';

return '<div class="space-y-4">' +
'<h3 class="font-bold text-slate-800 mb-3">Generated Offer 🎉</h3>' +

'<div class="bg-slate-100 p-3 rounded-xl">' +
'<div class="flex items-center gap-4 text-sm">' +
'<span class="text-slate-600">👤 ' + customerName + '</span>' +
'<span class="text-slate-600">' + offerIcon + ' ' + offerName + '</span>' +
'<span class="text-slate-600">' + urgencyIcon + ' ' + urgencyDuration + '</span>' +
'</div>' +
'</div>' +

'<div class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">' +
'<div class="flex items-center justify-between mb-3">' +
'<span class="text-xs font-semibold text-green-700 uppercase tracking-widest">Generated Message</span>' +
'<button onclick="OfferWizard.regenerate()" class="text-xs text-purple-600 font-medium hover:underline flex items-center gap-1">' +
'<i class="ph-bold ph-arrows-clockwise"></i> Regenerate' +
'</button>' +
'</div>' +
'<pre class="whitespace-pre-wrap text-slate-800 text-sm font-sans leading-relaxed" id="generatedMessageText">' + message + '</pre>' +
'</div>' +

'<div class="grid grid-cols-2 gap-3">' +
'<button onclick="OfferWizard.copyMessage()" class="flex items-center justify-center gap-2 p-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors">' +
'<i class="ph-bold ph-copy"></i> Copy' +
'</button>' +
'<button onclick="OfferWizard.sendWhatsApp()" class="flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-500 transition-colors">' +
'<i class="ph-bold ph-whatsapp-logo"></i> WhatsApp' +
'</button>' +
'</div>' +

'</div>';
},

// ============================================
// GENERATE OFFER MESSAGE
// ============================================

generateOffer: async function() {
var customer = OfferWizard.selectedCustomer;
var offerType = OfferWizard.selectedOfferType;
var urgency = OfferWizard.selectedUrgency;

if (!customer || !offerType || !urgency) {
console.error('Missing data:', {
customer: customer,
offerType: offerType,
urgency: urgency
});
return 'Error: Missing data. Please go back and select all options.';
}
var shopName = 'BizMind Shop';
try {
var setting = await db.settings.get('shopName');
if (setting) shopName = setting.value;
} catch(e) {}

var segmentKey = 'promising';
if (customer.segment && customer.segment.key) {
segmentKey = customer.segment.key;
} else if (customer.segmentKey) {
segmentKey = customer.segmentKey;
} else {
try {
var orders = await db.orders
.where('customerPhone')
.equals(customer.phone)
.toArray();

var orderCount = orders.length || customer.orderCount || 1;
var totalSpent = customer.totalSpent || 0;
var daysSinceLastOrder = 999;

if (orders.length > 0) {
orders.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
var lastOrderDate = new Date(orders[0].date);
daysSinceLastOrder = Math.floor((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24));
} else if (customer.daysSinceLastOrder) {
daysSinceLastOrder = customer.daysSinceLastOrder;
}

var rfm = TacticsEngine.rfmScoring.calculateRFM(daysSinceLastOrder, orderCount, totalSpent);
segmentKey = TacticsEngine.rfmScoring.getSegmentFromRFM(rfm);
} catch(e) {
console.error('Error calculating segment:', e);
}
}

var discountPercent = TacticsEngine.calculateOptimalDiscount(segmentKey, urgency.id);

if (offerType.id === 'clearance') discountPercent += 10;
if (offerType.id === 'flash_sale') discountPercent += 5;
if (offerType.id === 'godfather') discountPercent += 10;

if (discountPercent > 50) discountPercent = 50;

var expiryText = TacticsEngine.getExpiryDate(7);
if (urgency.id === 'flash') {
expiryText = TacticsEngine.getExpiryDate(1);
} else if (urgency.id === 'high') {
expiryText = TacticsEngine.getExpiryDate(1);
} else if (urgency.id === 'medium') {
expiryText = TacticsEngine.getExpiryDate(3);
}

var code = this.generateCode(offerType.id, discountPercent);
var customerName = customer.name || 'Customer';

var messageCategory = 'reorderReminder';
var messageType = 'gentle';

if (offerType.id === 'win_back' || offerType.id === 'reactivation') {
messageCategory = 'winBack';
messageType = (urgency.id === 'flash' || urgency.id === 'high') ? 'last_chance' : 'miss_you';
}
else if (offerType.id === 'vip_exclusive') {
messageCategory = 'vipExclusive';
messageType = 'exclusive';
}
else if (offerType.id === 'flash_sale') {
messageCategory = 'flashSale';
messageType = 'announcement';
}
else if (offerType.id === 'first_order') {
messageCategory = 'welcome';
messageType = 'warm';
}

var variables = {
NAME: customerName,
SHOP_NAME: shopName,
PERCENT: discountPercent.toString(),
CODE: code,
EXPIRY: expiryText,
DAYS: customer.daysSinceLastOrder ? customer.daysSinceLastOrder.toString() : '30',
OFFER: discountPercent + '% discount',
HOURS: (urgency.id === 'flash') ? '6' : '24',
END_TIME: '11:59 PM',
LAST_PRODUCT: 'product'
};

var result = TacticsEngine.generateCompleteMessage(messageCategory, messageType, variables);

if (result && result.message) {
return result.message;
}

var fallbackMsg = customerName + ',\n\n';
fallbackMsg += 'Special Offer for you!\n\n';
fallbackMsg += discountPercent + '% OFF!\n\n';
fallbackMsg += 'Code: ' + code + '\n';
fallbackMsg += 'Valid: ' + expiryText + '\n\n';
fallbackMsg += '- ' + shopName;

return fallbackMsg;
},

generateCode: function(offerType, percent) {
var prefixes = {
win_back: 'BACK',
vip_exclusive: 'VIP',
flash_sale: 'FLASH',
free_delivery: 'FREE',
first_order: 'WELCOME',
loyalty_reward: 'LOYAL',
bundle_deal: 'BUNDLE',
clearance: 'CLEAR'
};

var prefix = prefixes[offerType] || 'OFFER';
return prefix + percent;
},
// ============================================
// ACTIONS: SELECT CUSTOMER
// ============================================

selectCustomer: async function(phone) {
var self = this;
var customers = await this.getCustomersWithSegments();

this.selectedCustomer = null;

for (var i = 0; i < customers.length; i++) {
if (customers[i].phone == phone) {
this.selectedCustomer = customers[i];
break;
}
}

if (this.selectedCustomer) {
console.log('Customer selected:', this.selectedCustomer.name, this.selectedCustomer.phone);
} else {
console.error('Customer not found for phone:', phone);
}

var cards = document.querySelectorAll('.customer-card');
for (var i = 0; i < cards.length; i++) {
cards[i].classList.remove('border-purple-500', 'bg-purple-50', 'ring-2', 'ring-purple-500');
}

var selectedCard = document.querySelector('.customer-card[data-phone="' + phone + '"]');
if (selectedCard) {
selectedCard.classList.add('border-purple-500', 'bg-purple-50', 'ring-2', 'ring-purple-500');
}

var nextBtn = document.getElementById('nextBtn');
if (nextBtn) {
nextBtn.removeAttribute('disabled');
}

},

// ============================================
// ACTIONS: SELECT OFFER TYPE
// ============================================

selectOfferType: function(offerId) {
for (var i = 0; i < this.offerTypes.length; i++) {
if (this.offerTypes[i].id === offerId) {
this.selectedOfferType = this.offerTypes[i];
break;
}
}

var cards = document.querySelectorAll('.offer-type-card');
for (var i = 0; i < cards.length; i++) {
cards[i].classList.remove('border-purple-500', 'bg-purple-50');
cards[i].classList.add('border-slate-200');
}

var selectedCard = document.querySelector('.offer-type-card[data-offer-id="' + offerId + '"]');
if (selectedCard) {
selectedCard.classList.remove('border-slate-200');
selectedCard.classList.add('border-purple-500', 'bg-purple-50');
}

var nextBtn = document.getElementById('nextBtn');
if (nextBtn) {
nextBtn.removeAttribute('disabled');
}
},

// ============================================
// ACTIONS: SELECT URGENCY
// ============================================

selectUrgency: function(urgencyId) {
for (var i = 0; i < this.urgencyLevels.length; i++) {
if (this.urgencyLevels[i].id === urgencyId) {
this.selectedUrgency = this.urgencyLevels[i];
break;
}
}

var cards = document.querySelectorAll('.urgency-card');
for (var i = 0; i < cards.length; i++) {
cards[i].classList.remove('border-purple-500', 'bg-purple-50');
cards[i].classList.add('border-slate-200');
}

var selectedCard = document.querySelector('.urgency-card[data-urgency-id="' + urgencyId + '"]');
if (selectedCard) {
selectedCard.classList.remove('border-slate-200');
selectedCard.classList.add('border-purple-500', 'bg-purple-50');
}

var nextBtn = document.getElementById('nextBtn');
if (nextBtn) {
nextBtn.removeAttribute('disabled');
}
},

// ============================================
// ACTIONS: NAVIGATION
// ============================================

nextStep: async function() {
if (this.currentStep < 4) {
this.currentStep++;
await this.updateWizardView();
}
},

prevStep: async function() {
if (this.currentStep > 1) {
this.currentStep--;
await this.updateWizardView();
}
},

updateWizardView: async function() {
var body = document.getElementById('wizardBody');
var footer = document.getElementById('wizardFooter');

var modal = document.getElementById('offerWizardModal');
if (modal) {
var header = modal.querySelector('.bg-gradient-to-r');
if (header) {
var progressContainer = header.querySelector('.flex.items-center.gap-2.mt-4');
if (progressContainer) {
progressContainer.innerHTML = this.renderProgressSteps();
}
}
}

if (this.currentStep === 1) {
var customers = await this.getCustomersWithSegments();
body.innerHTML = await this.renderStep1(customers);
} else if (this.currentStep === 2) {
body.innerHTML = this.renderStep2();
} else if (this.currentStep === 3) {
body.innerHTML = this.renderStep3();
} else if (this.currentStep === 4) {
body.innerHTML = await this.renderStep4();
}

footer.innerHTML = this.renderFooter();
},

// ============================================
// ACTIONS: FILTERS
// ============================================

filterCustomers: function() {
var searchInput = document.getElementById('customerSearch');
var search = searchInput ? searchInput.value.toLowerCase() : '';

var cards = document.querySelectorAll('.customer-card');
for (var i = 0; i < cards.length; i++) {
var card = cards[i];
var name = card.getAttribute('data-name') || '';
var phone = card.getAttribute('data-phone') || '';

if (name.toLowerCase().indexOf(search) !== -1 || phone.indexOf(search) !== -1) {
card.style.display = 'block';
} else {
card.style.display = 'none';
}
}
},

filterBySegment: function(segment) {
var filterBtns = document.querySelectorAll('.segment-filter');
for (var i = 0; i < filterBtns.length; i++) {
filterBtns[i].classList.remove('active', 'ring-2', 'ring-purple-500');
}

var activeBtn = document.querySelector('.segment-filter[data-segment="' + segment + '"]');
if (activeBtn) {
activeBtn.classList.add('active', 'ring-2', 'ring-purple-500');
}

var cards = document.querySelectorAll('.customer-card');
for (var i = 0; i < cards.length; i++) {
var card = cards[i];
var cardSegment = card.getAttribute('data-segment') || '';

if (segment === 'all' || cardSegment === segment) {
card.style.display = 'block';
} else {
card.style.display = 'none';
}
}
},

// ============================================
// ACTIONS: REGENERATE, COPY, WHATSAPP
// ============================================

regenerate: async function() {
var message = await this.generateOffer();
this.generatedMessage = message;
var messageEl = document.getElementById('generatedMessageText');
if (messageEl) {
messageEl.textContent = message;
}
},

copyMessage: function() {
var self = this;
navigator.clipboard.writeText(this.generatedMessage).then(function() {
alert('Message copied!');
}).catch(function() {
alert('Could not copy. Please select and copy manually.');
});
},

sendWhatsApp: function() {
var phone = this.selectedCustomer ? this.selectedCustomer.phone : '';
if (!phone) {
alert('No phone number found!');
return;
}

// Save to campaign history
if (typeof CampaignHistory !== 'undefined') {
CampaignHistory.save({
customerPhone: phone,
customerName: this.selectedCustomer ? this.selectedCustomer.name : 'Unknown',
type: 'offer',
offerType: this.selectedOfferType ? this.selectedOfferType.id : '',
discount: 0,
message: this.generatedMessage,
channel: 'whatsapp',
status: 'sent'
});
}

phone = String(phone).replace(/[^0-9]/g, '');

if (phone.indexOf('1') === 0 && phone.length === 10) {
phone = '880' + phone;
} else if (phone.indexOf('01') === 0) {
phone = '88' + phone;
}

var message = encodeURIComponent(this.generatedMessage);
window.open('https://wa.me/' + phone + '?text=' + message, '_blank');
},

// ============================================
// ACTIONS: CLOSE
// ============================================

closeModal: function() {

var modal = document.getElementById('offerWizardModal');
if (modal) {
modal.remove();
}

this.currentStep = 1;
this.selectedCustomer = null;
this.selectedOfferType = null;
this.selectedUrgency = null;
this.generatedMessage = null;
},

// ============================================
// HELPERS: GET CUSTOMERS WITH SEGMENTS
// ============================================

getCustomersWithSegments: async function() {
var customers = [];

try {
customers = await db.customers.toArray();

for (var i = 0; i < customers.length; i++) {
var customer = customers[i];

var orders = await db.orders
.where('customerPhone')
.equals(customer.phone)
.toArray();

var orderCount = orders.length;
var totalSpent = customer.totalSpent || 0;

var daysSinceLastOrder = 999;
if (orders.length > 0) {
orders.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
var lastOrderDate = new Date(orders[0].date);
daysSinceLastOrder = Math.floor((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24));
}

customer.orderCount = orderCount;
customer.daysSinceLastOrder = daysSinceLastOrder;
customer.segment = StrategyCore.getCustomerSegment(orderCount, totalSpent, daysSinceLastOrder);
}

customers.sort(function(a, b) {
var priority = { lost: 0, atRisk: 1, cantLose: 2, hibernating: 3, needsAttention: 4, champions: 5, loyal: 6, newBuyer: 7, potential: 8, promising: 9 };
var aPriority = a.segment ? (priority[a.segment.key] || 10) : 10;
var bPriority = b.segment ? (priority[b.segment.key] || 10) : 10;
return aPriority - bPriority;
});

} catch(e) {
console.error('Error loading customers:', e);
}

return customers;
},

// ============================================
// OPEN MODAL
// ============================================

open: async function() {
var modalHTML = await this.renderModal();
document.body.insertAdjacentHTML('beforeend', modalHTML);
}

};

// ============================================
// MAKE GLOBALLY AVAILABLE
// ============================================

window.OfferWizard = OfferWizard;

console.log('OfferWizard v2.0 loaded successfully!');