// ============================================
// BIZMIND - CUSTOMER NOTES v1.0
// ============================================

var CustomerNotes = {

currentPhone: null,

open: async function(phone) {
console.log('Opening notes for phone:', phone, typeof phone);

var customer = null;
var searchPhone = String(phone).replace(/^0+/, '');

try {
var allCustomers = await db.customers.toArray();

for (var i = 0; i < allCustomers.length; i++) {
var custPhone = String(allCustomers[i].phone).replace(/^0+/, '');

if (custPhone === searchPhone) {
customer = allCustomers[i];
break;
}
}
} catch(e) {
console.error('Error finding customer:', e);
}

if (!customer) {
console.error('Customer not found for phone:', phone);
alert('Customer not found!');
return;
}

var notes = customer.notes || '';
var customerName = customer.name || 'Customer';
var displayPhone = customer.phone;

var modalHTML = '<div id="customerNotesModal" class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fade-in">' +
'<div class="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-slide-up">' +

'<div class="bg-gradient-to-r from-slate-700 to-slate-800 p-4 text-white">' +
'<div class="flex items-center justify-between">' +
'<div>' +
'<h2 class="font-bold flex items-center gap-2">' +
'<i class="ph-duotone ph-note-pencil"></i> Customer Notes' +
'</h2>' +
'<p class="text-white/70 text-sm">' + customerName + ' - 0' + displayPhone + '</p>' +
'</div>' +
'<button onclick="CustomerNotes.close()" class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">' +
'<i class="ph-bold ph-x text-xl"></i>' +
'</button>' +
'</div>' +
'</div>' +

'<div class="p-4">' +
'<textarea id="customerNotesText" rows="6" class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 resize-none" placeholder="Add notes about this customer...">' + notes + '</textarea>' +
'<p class="text-xs text-slate-500 mt-2">Examples: Prefers COD, Asks for discount, VIP treatment, Referred by someone</p>' +
'</div>' +

'<div class="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">' +
'<button onclick="CustomerNotes.close()" class="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300">Cancel</button>' +
'<button onclick="CustomerNotes.save(' + displayPhone + ')" class="flex-1 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700">Save Notes</button>' +
'</div>' +

'</div>' +
'</div>';

document.body.insertAdjacentHTML('beforeend', modalHTML);
},

save: async function(phone) {
var notesText = document.getElementById('customerNotesText').value || '';
var searchPhone = String(phone).replace(/^0+/, '');

try {
var allCustomers = await db.customers.toArray();
var customerKey = null;

for (var i = 0; i < allCustomers.length; i++) {
var custPhone = String(allCustomers[i].phone).replace(/^0+/, '');
if (custPhone === searchPhone) {
customerKey = allCustomers[i].phone;
break;
}
}

if (customerKey !== null) {
await db.customers.update(customerKey, { notes: notesText });
this.showToast('Notes saved!');
this.close();
} else {
alert('Customer not found!');
}
} catch(e) {
console.error('Error saving notes:', e);
alert('Error saving notes');
}
},

// Close modal
close: function() {
var modal = document.getElementById('customerNotesModal');
if (modal) modal.remove();
},

// Show floating button
showFloatingButton: function(phone, customerName) {
this.hideFloatingButton();
this.currentPhone = phone;

var btn = document.createElement('div');
btn.id = 'floatingNotesBtn';
btn.className = 'fixed bottom-24 left-4 z-40 animate-fade-in';
btn.innerHTML = '<button onclick="CustomerNotes.open(\'' + phone + '\')" class="bg-slate-800 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-slate-700 transition-all">' +
'<i class="ph-duotone ph-note-pencil text-lg"></i>' +
'<span class="text-sm font-medium">Notes</span>' +
'</button>';

document.body.appendChild(btn);
},

// Hide floating button
hideFloatingButton: function() {
var btn = document.getElementById('floatingNotesBtn');
if (btn) btn.remove();
this.currentPhone = null;
},

// Show toast message
showToast: function(message) {
var toast = document.createElement('div');
toast.className = 'fixed bottom-32 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium z-50 animate-fade-in';
toast.textContent = message;
document.body.appendChild(toast);

setTimeout(function() {
toast.remove();
}, 2000);
}

};

window.CustomerNotes = CustomerNotes;
console.log('CustomerNotes v1.0 loaded!');