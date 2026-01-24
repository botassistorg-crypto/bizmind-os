// ============================================
// BIZMIND GROWTH OS - TEMPLATE PICKER v1.0
// Browse & use all message templates
// ============================================

const TemplatePicker = {

// Current state
selectedCategory: null,
selectedTemplate: null,
selectedCustomer: null,

// ============================================
// OPEN TEMPLATE PICKER MODAL
// ============================================

open: async function(preselectedCustomer = null) {
this.selectedCustomer = preselectedCustomer;
this.selectedCategory = 'welcome';
this.selectedTemplate = null;

const modalHTML = `
<div id="templatePickerModal" class="fixed inset-0 bg-black/50 z-50 flex items-end justify-center animate-fade-in">
<div class="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-hidden animate-slide-up">

<!-- Header -->
<div class="bg-gradient-to-r from-blue-600 to-cyan-600 p-5 text-white">
<div class="flex items-center justify-between">
<div>
<h2 class="text-xl font-bold flex items-center gap-2">
<i class="ph-duotone ph-chat-text"></i>
Message Templates
</h2>
<p class="text-white/80 text-sm">Ready-made Bangla messages</p>
</div>
<button onclick="TemplatePicker.close()" class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
<i class="ph-bold ph-x text-xl"></i>
</button>
</div>
</div>

<!-- Category Tabs -->
<div class="p-3 bg-slate-100 border-b border-slate-200 overflow-x-auto">
<div class="flex gap-2" id="categoryTabs">
${this.renderCategoryTabs()}
</div>
</div>

<!-- Template List -->
<div class="p-4 overflow-y-auto max-h-[50vh]" id="templateList">
${this.renderTemplateList('welcome')}
</div>

<!-- Footer -->
<div class="p-4 border-t border-slate-200 bg-slate-50" id="templateFooter">
<p class="text-center text-slate-500 text-sm">Select a template to continue</p>
</div>

</div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);
},

// ============================================
// RENDER CATEGORY TABS
// ============================================

renderCategoryTabs: function() {
const categories = [
{ id: 'welcome', name: 'Welcome', icon: '👋', bangla: 'স্বাগতম' },
{ id: 'thankYou', name: 'Thank You', icon: '🙏', bangla: 'ধন্যবাদ' },
{ id: 'reorderReminder', name: 'Reorder', icon: '🔄', bangla: 'পুনরায় অর্ডার' },
{ id: 'winBack', name: 'Win Back', icon: '💔', bangla: 'ফিরিয়ে আনুন' },
{ id: 'vipExclusive', name: 'VIP', icon: '👑', bangla: 'ভিআইপি' },
{ id: 'flashSale', name: 'Flash Sale', icon: '⚡', bangla: 'ফ্ল্যাশ সেল' },
{ id: 'orderStatus', name: 'Order Status', icon: '📦', bangla: 'অর্ডার আপডেট' },
{ id: 'lowStock', name: 'Low Stock', icon: '🔥', bangla: 'স্টক কম' },
{ id: 'referral', name: 'Referral', icon: '🤝', bangla: 'রেফারেল' }
];

return categories.map(cat => `
<button
onclick="TemplatePicker.selectCategory('${cat.id}')"
class="category-tab flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${this.selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'}"
data-category="${cat.id}"
>
<span>${cat.icon}</span>
<span>${cat.bangla}</span>
</button>
`).join('');
},

// ============================================
// SELECT CATEGORY
// ============================================

selectCategory: function(categoryId) {
this.selectedCategory = categoryId;
this.selectedTemplate = null;

// Update tab styles
document.querySelectorAll('.category-tab').forEach(tab => {
if (tab.dataset.category === categoryId) {
tab.className = 'category-tab flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all bg-blue-600 text-white';
} else {
tab.className = 'category-tab flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all bg-white text-slate-700 hover:bg-slate-200';
}
});

// Update template list
document.getElementById('templateList').innerHTML = this.renderTemplateList(categoryId);

// Reset footer
document.getElementById('templateFooter').innerHTML = `
<p class="text-center text-slate-500 text-sm">Select a template to continue</p>
`;
},

// ============================================
// RENDER TEMPLATE LIST
// ============================================

renderTemplateList: function(categoryId) {
const templates = TacticsEngine.messageTemplates[categoryId];

if (!templates || !templates.messages) {
return `
<div class="text-center py-8 text-slate-500">
<i class="ph-duotone ph-file-text text-4xl mb-2"></i>
<p>No templates in this category</p>
</div>
`;
}

return templates.messages.map((msg, index) => {
const previewText = msg.template.substring(0, 100).replace(/\[.*?\]/g, '___') + '...';

return `
<div
class="template-card p-4 bg-slate-50 rounded-xl mb-3 cursor-pointer hover:bg-blue-50 hover:border-blue-300 border-2 border-transparent transition-all"
onclick="TemplatePicker.selectTemplate('${categoryId}', ${index})"
data-index="${index}"
>
<div class="flex items-start gap-3">
<div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
<i class="ph-duotone ph-chat-text text-xl"></i>
</div>
<div class="flex-1 min-w-0">
<p class="font-semibold text-slate-800 mb-1">${msg.type.charAt(0).toUpperCase() + msg.type.slice(1).replace(/_/g, ' ')}</p>
<p class="text-sm text-slate-500 line-clamp-2">${previewText}</p>
<div class="flex gap-2 mt-2">
${msg.psychology ? msg.psychology.map(p => `
<span class="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">${p}</span>
`).join('') : ''}
</div>
</div>
</div>
</div>
`;
}).join('');
},

// ============================================
// SELECT TEMPLATE
// ============================================

selectTemplate: async function(categoryId, templateIndex) {
const templates = TacticsEngine.messageTemplates[categoryId];
if (!templates || !templates.messages[templateIndex]) return;

this.selectedTemplate = {
category: categoryId,
index: templateIndex,
data: templates.messages[templateIndex]
};

// Update card styles
document.querySelectorAll('.template-card').forEach((card, idx) => {
if (idx === templateIndex) {
card.className = 'template-card p-4 bg-blue-50 rounded-xl mb-3 cursor-pointer border-2 border-blue-500 transition-all';
} else {
card.className = 'template-card p-4 bg-slate-50 rounded-xl mb-3 cursor-pointer hover:bg-blue-50 hover:border-blue-300 border-2 border-transparent transition-all';
}
});

// Update footer with actions
document.getElementById('templateFooter').innerHTML = `
<button onclick="TemplatePicker.openEditor()" class="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
<i class="ph-bold ph-pencil-simple"></i>
Customize & Send
</button>
`;
},

// ============================================
// OPEN EDITOR (Customize Message)
// ============================================

openEditor: async function() {
if (!this.selectedTemplate) return;

const template = this.selectedTemplate.data;

// Get shop name
let shopName = 'My Shop';
try {
const setting = await db.settings.get('shopName');
if (setting) shopName = setting.value;
} catch(e) {}

// Get customers for dropdown
let customers = [];
try {
customers = await db.customers.toArray();
} catch(e) {}

// Find variables in template
const variables = this.extractVariables(template.template);

// Generate default values
const defaultValues = {
NAME: this.selectedCustomer?.name || 'ভাই/আপু',
SHOP_NAME: shopName,
PERCENT: '15',
CODE: TacticsEngine.generateCouponCode('offer', 15),
DAYS: '30',
EXPIRY: TacticsEngine.getExpiryDate(7),
OFFER: '১৫% ছাড়',
PRODUCT: 'প্রোডাক্ট',
AMOUNT: '1000',
ORDER_ID: '12345',
COURIER: 'Pathao',
HOURS: '24',
END_TIME: '১১:৫৯',
NUMBER: '5',
LAST_PRODUCT: 'প্রোডাক্ট',
YEAR: new Date().getFullYear().toString(),
PRICE: '999',
REGULAR: '1499',
FRIEND_AMOUNT: '100'
};

const editorHTML = `
<div id="templateEditorModal" class="fixed inset-0 bg-black/50 z-50 flex items-end justify-center animate-fade-in">
<div class="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-hidden animate-slide-up">

<!-- Header -->
<div class="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-white">
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<button onclick="TemplatePicker.closeEditor()" class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
<i class="ph-bold ph-arrow-left"></i>
</button>
<div>
<h2 class="font-bold">Customize Message</h2>
<p class="text-white/80 text-xs">${this.selectedTemplate.data.type}</p>
</div>
</div>
<button onclick="TemplatePicker.closeAll()" class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
<i class="ph-bold ph-x text-xl"></i>
</button>
</div>
</div>

<!-- Editor Body -->
<div class="p-4 overflow-y-auto max-h-[55vh]">

<!-- Customer Selector -->
<div class="mb-4">
<label class="text-sm font-semibold text-slate-700 mb-2 block">Select Customer:</label>
<select id="editorCustomer" class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" onchange="TemplatePicker.onCustomerChange()">
<option value="">-- General Message --</option>
${customers.map(c => `
<option value="${c.phone}" ${this.selectedCustomer?.phone === c.phone ? 'selected' : ''}>
${c.name || 'Unknown'} (${c.phone})
</option>
`).join('')}
</select>
</div>

<!-- Variable Inputs -->
<div class="mb-4">
<label class="text-sm font-semibold text-slate-700 mb-2 block">Fill Details:</label>
<div class="space-y-3" id="variableInputs">
${variables.map(v => `
<div class="flex items-center gap-3">
<label class="text-sm text-slate-600 w-24 flex-shrink-0">${this.getVariableLabel(v)}:</label>
<input
type="text"
id="var_${v}"
value="${defaultValues[v] || ''}"
class="flex-1 p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
onchange="TemplatePicker.updatePreview()"
>
</div>
`).join('')}
</div>
</div>

<!-- Message Preview -->
<div class="mb-4">
<label class="text-sm font-semibold text-slate-700 mb-2 block">Preview:</label>
<textarea
id="messagePreview"
rows="8"
class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm resize-none"
>${this.generatePreview(template.template, defaultValues)}</textarea>
</div>

</div>

<!-- Footer Actions -->
<div class="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
<button onclick="TemplatePicker.copyMessage()" class="w-full py-3 bg-slate-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all">
<i class="ph-bold ph-copy"></i>
Copy Message
</button>
<button onclick="TemplatePicker.sendWhatsApp()" class="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
<i class="ph-bold ph-whatsapp-logo"></i>
Send via WhatsApp
</button>
</div>

</div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', editorHTML);

// Update preview initially
this.updatePreview();
},

// ============================================
// EXTRACT VARIABLES FROM TEMPLATE
// ============================================

extractVariables: function(template) {
const matches = template.match(/\[([A-Z_]+)\]/g) || [];
const variables = [...new Set(matches.map(m => m.replace(/[\[\]]/g, '')))];
return variables;
},

// ============================================
// GET VARIABLE LABEL (Bangla friendly)
// ============================================

getVariableLabel: function(variable) {
const labels = {
NAME: 'নাম',
SHOP_NAME: 'Shop',
PERCENT: 'ছাড় %',
CODE: 'Code',
DAYS: 'দিন',
EXPIRY: 'মেয়াদ',
OFFER: 'অফার',
PRODUCT: 'প্রোডাক্ট',
AMOUNT: 'টাকা',
ORDER_ID: 'Order ID',
COURIER: 'Courier',
HOURS: 'ঘন্টা',
END_TIME: 'শেষ সময়',
NUMBER: 'সংখ্যা',
LAST_PRODUCT: 'Last Product',
YEAR: 'বছর',
PRICE: 'দাম',
REGULAR: 'Regular দাম',
FRIEND_AMOUNT: 'Friend Amount'
};
return labels[variable] || variable;
},

// ============================================
// GENERATE PREVIEW
// ============================================

generatePreview: function(template, values) {
let preview = template;
for (const [key, value] of Object.entries(values)) {
const regex = new RegExp(`\\[${key}\\]`, 'g');
preview = preview.replace(regex, value);
}
return preview;
},

// ============================================
// UPDATE PREVIEW (when inputs change)
// ============================================

updatePreview: function() {
if (!this.selectedTemplate) return;

const template = this.selectedTemplate.data.template;
const variables = this.extractVariables(template);

const values = {};
for (const v of variables) {
const input = document.getElementById(`var_${v}`);
values[v] = input ? input.value : '';
}

const preview = this.generatePreview(template, values);
document.getElementById('messagePreview').value = preview;
},

// ============================================
// ON CUSTOMER CHANGE
// ============================================

onCustomerChange: async function() {
const select = document.getElementById('editorCustomer');
const phone = select.value;

if (phone) {
try {
const customer = await db.customers.get(phone);
if (customer) {
this.selectedCustomer = customer;
const nameInput = document.getElementById('var_NAME');
if (nameInput) {
nameInput.value = customer.name || 'ভাই/আপু';
this.updatePreview();
}
}
} catch(e) {}
} else {
this.selectedCustomer = null;
const nameInput = document.getElementById('var_NAME');
if (nameInput) {
nameInput.value = 'ভাই/আপু';
this.updatePreview();
}
}
},

// ============================================
// COPY MESSAGE
// ============================================

copyMessage: async function() {
const message = document.getElementById('messagePreview')?.value || '';

try {
await navigator.clipboard.writeText(message);
this.showToast('✅ Message copied!');
} catch(e) {
const textarea = document.getElementById('messagePreview');
textarea.select();
document.execCommand('copy');
this.showToast('✅ Message copied!');
}
},

// ============================================
// SEND VIA WHATSAPP
// ============================================

sendWhatsApp: function() {
const message = document.getElementById('messagePreview')?.value || '';
const encodedMessage = encodeURIComponent(message);

if (this.selectedCustomer && this.selectedCustomer.phone) {
// Clean phone number
let cleanPhone = this.selectedCustomer.phone.replace(/[^0-9]/g, '');

// Add Bangladesh code if needed
if (cleanPhone.startsWith('01')) {
cleanPhone = '88' + cleanPhone;
}

window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
} else {
// Open WhatsApp without specific number
window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
}
},

// ============================================
// SHOW TOAST
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
document.getElementById('templatePickerModal')?.remove();
this.selectedCategory = null;
this.selectedTemplate = null;
},

closeEditor: function() {
document.getElementById('templateEditorModal')?.remove();
},

closeAll: function() {
this.closeEditor();
this.close();
this.selectedCustomer = null;
}

};

// ============================================
// MAKE GLOBALLY AVAILABLE
// ============================================

window.TemplatePicker = TemplatePicker;

console.log('✅ TemplatePicker v1.0 loaded!');