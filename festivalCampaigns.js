// ============================================
// BIZMIND GROWTH OS - FESTIVAL CAMPAIGNS v1.0
// Ready-made festival campaign generator
// ============================================

const FestivalCampaigns = {

// ============================================
// RENDER CAMPAIGN SELECTOR MODAL
// ============================================

open: async function() {
const modalHTML = `
<div id="festivalModal" class="fixed inset-0 bg-black/50 z-50 flex items-end justify-center animate-fade-in">
<div class="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-hidden animate-slide-up">

<!-- Header -->
<div class="bg-gradient-to-r from-pink-500 to-orange-500 p-5 text-white">
<div class="flex items-center justify-between">
<div>
<h2 class="text-xl font-bold flex items-center gap-2">
<i class="ph-duotone ph-confetti"></i>
Festival Campaigns
</h2>
<p class="text-white/80 text-sm">Ready-made campaigns for Bangladesh</p>
</div>
<button onclick="FestivalCampaigns.close()" class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
<i class="ph-bold ph-x text-xl"></i>
</button>
</div>
</div>

<!-- Festival List -->
<div class="p-4 overflow-y-auto max-h-[70vh]">
<div class="space-y-3">
${this.renderFestivalCards()}
</div>
</div>

</div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);
},

// ============================================
// RENDER FESTIVAL CARDS
// ============================================

renderFestivalCards: function() {
const festivals = TacticsEngine.festivalCalendar;
let html = '';

const festivalStyles = {
eid_ul_fitr: {
gradient: 'from-emerald-500 to-teal-600',
icon: '🌙',
bgPattern: '🕌'
},
eid_ul_adha: {
gradient: 'from-emerald-600 to-green-700',
icon: '🐐',
bgPattern: '🕋'
},
pohela_boishakh: {
gradient: 'from-red-500 to-orange-500',
icon: '🎉',
bgPattern: '🌸'
},
victory_day: {
gradient: 'from-green-600 to-red-600',
icon: '🇧🇩',
bgPattern: '🏆'
},
independence_day: {
gradient: 'from-green-500 to-red-500',
icon: '🇧🇩',
bgPattern: '✊'
},
new_year: {
gradient: 'from-purple-500 to-pink-500',
icon: '🎆',
bgPattern: '🎊'
}
};

for (const [key, festival] of Object.entries(festivals)) {
const style = festivalStyles[key] || { gradient: 'from-slate-500 to-slate-600', icon: '🎉', bgPattern: '✨' };

html += `
<div
class="festival-card bg-gradient-to-r ${style.gradient} rounded-2xl p-4 text-white cursor-pointer hover:scale-[1.02] transition-transform shadow-lg relative overflow-hidden"
onclick="FestivalCampaigns.selectFestival('${key}')"
>
<div class="absolute right-2 top-2 text-4xl opacity-20">${style.bgPattern}</div>
<div class="relative z-10">
<div class="flex items-center gap-3 mb-2">
<span class="text-3xl">${style.icon}</span>
<div>
<h3 class="font-bold text-lg">${festival.bangla}</h3>
<p class="text-white/80 text-sm">${festival.name}</p>
</div>
</div>
<div class="flex items-center justify-between mt-3">
<span class="bg-white/20 px-3 py-1 rounded-full text-xs">
${festival.date || festival.timing}
</span>
<span class="text-sm font-medium">
${festival.defaultOffer} →
</span>
</div>
</div>
</div>
`;
}

return html;
},

// ============================================
// SELECT FESTIVAL & SHOW CAMPAIGN BUILDER
// ============================================

selectFestival: async function(festivalKey) {
const festival = TacticsEngine.festivalCalendar[festivalKey];
if (!festival) return;

// Get shop name
let shopName = 'My Shop';
try {
const setting = await db.settings.get('shopName');
if (setting) shopName = setting.value;
} catch(e) {}

// Get customer count
let customerCount = 0;
try {
customerCount = await db.customers.count();
} catch(e) {}

// Generate default message
const defaultMessage = this.generateFestivalMessage(festivalKey, {
SHOP_NAME: shopName,
OFFER: festival.defaultOffer,
EXPIRY: TacticsEngine.getExpiryDate(festival.peakDays)
});

// Show campaign builder
const builderHTML = `
<div id="festivalBuilder" class="fixed inset-0 bg-black/50 z-50 flex items-end justify-center animate-fade-in">
<div class="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-hidden animate-slide-up">

<!-- Header -->
<div class="bg-gradient-to-r from-pink-500 to-orange-500 p-4 text-white">
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<button onclick="FestivalCampaigns.backToList()" class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
<i class="ph-bold ph-arrow-left"></i>
</button>
<div>
<h2 class="font-bold">${festival.bangla}</h2>
<p class="text-white/80 text-xs">${festival.name}</p>
</div>
</div>
<button onclick="FestivalCampaigns.closeBuilder()" class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
<i class="ph-bold ph-x text-xl"></i>
</button>
</div>
</div>

<!-- Campaign Builder -->
<div class="p-4 overflow-y-auto max-h-[60vh]">

<!-- Offer Input -->
<div class="mb-4">
<label class="text-sm font-semibold text-slate-700 mb-2 block">Your Offer:</label>
<input
type="text"
id="festivalOffer"
value="${festival.defaultOffer}"
class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500"
placeholder="e.g., ২০% ছাড় + ফ্রি ডেলিভারি"
onchange="FestivalCampaigns.updateMessage('${festivalKey}')"
>
</div>

<!-- Expiry Input -->
<div class="mb-4">
<label class="text-sm font-semibold text-slate-700 mb-2 block">Offer Valid Until:</label>
<input
type="text"
id="festivalExpiry"
value="${TacticsEngine.getExpiryDate(festival.peakDays)}"
class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500"
placeholder="e.g., ১৫ এপ্রিল"
onchange="FestivalCampaigns.updateMessage('${festivalKey}')"
>
</div>

<!-- Message Preview -->
<div class="mb-4">
<label class="text-sm font-semibold text-slate-700 mb-2 block">Message Preview:</label>
<textarea
id="festivalMessage"
rows="8"
class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 text-sm resize-none"
>${defaultMessage}</textarea>
</div>

<!-- Recipient Info -->
<div class="bg-slate-100 p-3 rounded-xl mb-4">
<div class="flex items-center justify-between">
<span class="text-sm text-slate-600">Recipients:</span>
<span class="font-bold text-slate-800">${customerCount} Customers</span>
</div>
</div>

</div>

<!-- Footer Actions -->
<div class="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
<button onclick="FestivalCampaigns.copyMessage()" class="w-full py-3 bg-slate-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all">
<i class="ph-bold ph-copy"></i>
Copy Message
</button>
<button onclick="FestivalCampaigns.sendToAll()" class="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
<i class="ph-bold ph-whatsapp-logo"></i>
Send to All Customers
</button>
</div>

</div>
</div>
`;

// Close festival list, show builder
this.close();
document.body.insertAdjacentHTML('beforeend', builderHTML);
},

// ============================================
// GENERATE FESTIVAL MESSAGE
// ============================================

generateFestivalMessage: function(festivalKey, variables) {
const templates = {
eid_ul_fitr: `🌙 ঈদ মোবারক! 🌙

প্রিয় Customer,

${variables.SHOP_NAME} এর পক্ষ থেকে ঈদুল ফিতরের শুভেচ্ছা!

🎁 ঈদ Special Offer:
${variables.OFFER}

🚚 ঈদের আগে ডেলিভারি নিশ্চিত!

⏰ অফার শেষ: ${variables.EXPIRY}

এখনই অর্ডার করুন!

ঈদ মোবারক! 🕌
- ${variables.SHOP_NAME}`,

eid_ul_adha: `🌙 ঈদ মোবারক! 🐐

প্রিয় Customer,

${variables.SHOP_NAME} এর পক্ষ থেকে ঈদুল আযহার শুভেচ্ছা!

🎁 কোরবানির ঈদে Special:
${variables.OFFER}

⏰ অফার শেষ: ${variables.EXPIRY}

ঈদ মোবারক! 🕋
- ${variables.SHOP_NAME}`,

pohela_boishakh: `🎉 শুভ নববর্ষ! 🌸

প্রিয় Customer,

বাংলা নতুন বছরের শুভেচ্ছা!

${variables.SHOP_NAME} এর পক্ষ থেকে পহেলা বৈশাখের অনেক অনেক শুভকামনা! 🎊

🎁 বৈশাখী Special:
${variables.OFFER}

⏰ অফার শেষ: ${variables.EXPIRY}

এসো হে বৈশাখ! 🌺
- ${variables.SHOP_NAME}`,

victory_day: `🇧🇩 বিজয় দিবসের শুভেচ্ছা! 🏆

প্রিয় Customer,

১৬ই ডিসেম্বর - মহান বিজয় দিবস!

${variables.SHOP_NAME} এর পক্ষ থেকে বিজয় দিবসের শুভেচ্ছা!

🎁 বিজয় দিবস Special:
${variables.OFFER}

🚚 সারা দেশে ডেলিভারি!

⏰ অফার শেষ: ${variables.EXPIRY}

জয় বাংলা! 🇧🇩
- ${variables.SHOP_NAME}`,

independence_day: `🇧🇩 স্বাধীনতা দিবসের শুভেচ্ছা! ✊

প্রিয় Customer,

২৬শে মার্চ - মহান স্বাধীনতা দিবস!

${variables.SHOP_NAME} এর পক্ষ থেকে স্বাধীনতা দিবসের শুভেচ্ছা!

🎁 Special Offer:
${variables.OFFER}

⏰ অফার শেষ: ${variables.EXPIRY}

জয় বাংলা! 🇧🇩
- ${variables.SHOP_NAME}`,

new_year: `🎆 Happy New Year! 🎊

প্রিয় Customer,

নতুন বছরের শুভেচ্ছা!

${variables.SHOP_NAME} এর পক্ষ থেকে নতুন বছরের অনেক শুভকামনা! 🎉

🎁 New Year Special:
${variables.OFFER}

⏰ অফার শেষ: ${variables.EXPIRY}

নতুন বছর, নতুন শুরু! ✨
- ${variables.SHOP_NAME}`
};

return templates[festivalKey] || templates.new_year;
},

// ============================================
// UPDATE MESSAGE (when inputs change)
// ============================================

updateMessage: async function(festivalKey) {
const offer = document.getElementById('festivalOffer')?.value || '';
const expiry = document.getElementById('festivalExpiry')?.value || '';

// Get shop name
let shopName = 'My Shop';
try {
const setting = await db.settings.get('shopName');
if (setting) shopName = setting.value;
} catch(e) {}

const newMessage = this.generateFestivalMessage(festivalKey, {
SHOP_NAME: shopName,
OFFER: offer,
EXPIRY: expiry
});

document.getElementById('festivalMessage').value = newMessage;
},

// ============================================
// COPY MESSAGE
// ============================================

copyMessage: async function() {
const message = document.getElementById('festivalMessage')?.value || '';

try {
await navigator.clipboard.writeText(message);
this.showToast('✅ Message copied!');
} catch(e) {
// Fallback
const textarea = document.getElementById('festivalMessage');
textarea.select();
document.execCommand('copy');
this.showToast('✅ Message copied!');
}
},

// ============================================
// SEND TO ALL CUSTOMERS
// ============================================

sendToAll: async function() {
const message = document.getElementById('festivalMessage')?.value || '';

// Get all customers
let customers = [];
try {
customers = await db.customers.toArray();
} catch(e) {}

if (customers.length === 0) {
alert('No customers found!');
return;
}

// Copy message first
await navigator.clipboard.writeText(message);

// Show customer list for sending
const customerListHTML = `
<div id="sendListModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
<div class="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-slide-up max-h-[80vh]">

<!-- Header -->
<div class="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
<h2 class="font-bold flex items-center gap-2">
<i class="ph-duotone ph-whatsapp-logo text-xl"></i>
Send to ${customers.length} Customers
</h2>
<p class="text-sm text-white/80">Message copied! Click each to send via WhatsApp</p>
</div>

<!-- Customer List -->
<div class="p-4 overflow-y-auto max-h-[50vh]">
<div class="space-y-2">
${customers.map(c => `
<div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
<div>
<p class="font-semibold text-slate-800">${c.name || 'Unknown'}</p>
<p class="text-xs text-slate-500">${c.phone}</p>
</div>
<button
onclick="FestivalCampaigns.openWhatsApp('${c.phone}')"
class="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-all flex items-center gap-1"
>
<i class="ph-bold ph-paper-plane-tilt"></i>
Send
</button>
</div>
`).join('')}
</div>
</div>

<!-- Footer -->
<div class="p-4 border-t border-slate-200 bg-slate-50">
<button onclick="FestivalCampaigns.closeSendList()" class="w-full py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all">
Done
</button>
</div>

</div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', customerListHTML);
},

// ============================================
// OPEN WHATSAPP
// ============================================

openWhatsApp: function(phone) {
const message = document.getElementById('festivalMessage')?.value || '';
const encodedMessage = encodeURIComponent(message);

// Clean phone number
let cleanPhone = phone.replace(/[^0-9]/g, '');

// Add Bangladesh code if needed
if (cleanPhone.startsWith('01')) {
cleanPhone = '88' + cleanPhone;
}

window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
},

// ============================================
// SHOW TOAST NOTIFICATION
// ============================================

showToast: function(message) {
const toast = document.createElement('div');
toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium z-50 animate-fade-in';
toast.textContent = message;
document.body.appendChild(toast);

setTimeout(() => {
toast.remove();
}, 2000);
},

// ============================================
// CLOSE FUNCTIONS
// ============================================

close: function() {
document.getElementById('festivalModal')?.remove();
},

closeBuilder: function() {
document.getElementById('festivalBuilder')?.remove();
},

closeSendList: function() {
document.getElementById('sendListModal')?.remove();
},

backToList: function() {
this.closeBuilder();
this.open();
}

};

// ============================================
// MAKE GLOBALLY AVAILABLE
// ============================================

window.FestivalCampaigns = FestivalCampaigns;

console.log('✅ FestivalCampaigns v1.0 loaded!');