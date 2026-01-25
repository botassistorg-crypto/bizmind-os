// ============================================
// 🧪 A/B TESTING MODULE
// Complete A/B Testing with Coupon Tracking
// ============================================

const ABTesting = {

    // ─────────────────────────────────────────────────────────────
    // OPEN A/B TESTING DASHBOARD
    // ─────────────────────────────────────────────────────────────
    async open() {
        const tests = await db.abTests.orderBy('createdAt').reverse().toArray();
        
        const modalHTML = `
            <div id="ab-testing-modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
                    
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <i class="ph ph-flask text-xl"></i>
                                </div>
                                <div>
                                    <h2 class="text-lg font-bold">A/B Testing</h2>
                                    <p class="text-white/70 text-xs">কোন অফার বেশি কাজ করে?</p>
                                </div>
                            </div>
                            <button onclick="ABTesting.close()" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <i class="ph ph-x"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Content -->
                    <div class="p-4 overflow-y-auto max-h-[65vh]">
                        
                        <!-- Create New Test Button -->
                        <button onclick="ABTesting.showCreateForm()" 
                                class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 mb-4 hover:opacity-90 transition">
                            <i class="ph ph-plus-circle text-xl"></i>
                            <span class="font-bold">নতুন A/B Test তৈরি করুন</span>
                        </button>
                        
                        <!-- Existing Tests -->
                        <div id="ab-tests-list">
                            ${tests.length === 0 ? this.getEmptyState() : this.renderTestsList(tests)}
                        </div>
                        
                    </div>
                    
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // ─────────────────────────────────────────────────────────────
    // EMPTY STATE
    // ─────────────────────────────────────────────────────────────
    getEmptyState() {
        return `
            <div class="text-center py-8">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="ph ph-flask text-3xl text-purple-500"></i>
                </div>
                <h3 class="font-bold text-gray-700 mb-2">কোনো Test নেই</h3>
                <p class="text-sm text-gray-500 mb-4">A/B Test করে দেখুন কোন অফার বেশি কাজ করে!</p>
                <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 text-left">
                    <p class="text-sm text-purple-700 font-medium mb-2">💡 A/B Test কি?</p>
                    <p class="text-xs text-purple-600">
                        দুইটা ভিন্ন অফার দুই গ্রুপ কাস্টমারকে পাঠান।
                        দেখুন কোনটা বেশি বিক্রি আনে!
                    </p>
                </div>
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER TESTS LIST
    // ─────────────────────────────────────────────────────────────
    renderTestsList(tests) {
        return tests.map(test => {
            const statusColors = {
                'running': 'bg-green-100 text-green-700',
                'completed': 'bg-blue-100 text-blue-700',
                'cancelled': 'bg-gray-100 text-gray-700'
            };
            const statusText = {
                'running': '🔄 চলছে',
                'completed': '✅ শেষ',
                'cancelled': '❌ বাতিল'
            };
            
            const versionA = test.versionA || {};
            const versionB = test.versionB || {};
            
            return `
                <div class="bg-white border border-gray-200 rounded-xl p-4 mb-3 hover:shadow-md transition">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <h4 class="font-bold text-gray-800">${test.name}</h4>
                            <p class="text-xs text-gray-500">${this.formatDate(test.createdAt)}</p>
                        </div>
                        <span class="text-xs px-2 py-1 rounded-full ${statusColors[test.status] || 'bg-gray-100'}">
                            ${statusText[test.status] || test.status}
                        </span>
                    </div>
                    
                    <!-- Quick Stats -->
                    <div class="grid grid-cols-2 gap-2 mb-3">
                        <div class="bg-purple-50 rounded-lg p-2 text-center">
                            <p class="text-[10px] text-purple-600 uppercase">Version A</p>
                            <p class="text-sm font-bold text-purple-700">${versionA.results?.totalOrders || 0} orders</p>
                            <p class="text-xs text-purple-600">৳${versionA.results?.revenue || 0}</p>
                        </div>
                        <div class="bg-indigo-50 rounded-lg p-2 text-center">
                            <p class="text-[10px] text-indigo-600 uppercase">Version B</p>
                            <p class="text-sm font-bold text-indigo-700">${versionB.results?.totalOrders || 0} orders</p>
                            <p class="text-xs text-indigo-600">৳${versionB.results?.revenue || 0}</p>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex gap-2">
                        <button onclick="ABTesting.viewTest(${test.id})" 
                                class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
                            <i class="ph ph-eye"></i> বিস্তারিত
                        </button>
                        ${test.status === 'running' ? `
                            <button onclick="ABTesting.markResults(${test.id})" 
                                    class="flex-1 bg-purple-100 text-purple-700 py-2 rounded-lg text-xs font-medium hover:bg-purple-200 transition">
                                <i class="ph ph-check-circle"></i> Mark Results
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    },

    // ─────────────────────────────────────────────────────────────
    // SHOW CREATE TEST FORM
    // ─────────────────────────────────────────────────────────────
    async showCreateForm() {
        // Get customer segments for targeting
        const customers = await db.customers.toArray();
        const atRiskCount = customers.filter(c => this.isAtRisk(c)).length;
        const vipCount = customers.filter(c => c.tier === 'VIP').length;
        
        const formHTML = `
            <div id="ab-create-modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
                    
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <i class="ph ph-plus-circle text-xl"></i>
                                </div>
                                <div>
                                    <h2 class="text-lg font-bold">নতুন A/B Test</h2>
                                    <p class="text-white/70 text-xs">দুইটা অফার টেস্ট করুন</p>
                                </div>
                            </div>
                            <button onclick="ABTesting.closeCreateForm()" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <i class="ph ph-x"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Form -->
                    <div class="p-4 overflow-y-auto max-h-[70vh]">
                        
                        <!-- Test Name -->
                        <div class="mb-4">
                            <label class="block text-sm font-bold text-gray-700 mb-1">Test এর নাম</label>
                            <input type="text" id="ab-test-name" placeholder="যেমন: Discount Test" 
                                   class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                        </div>
                        
                        <!-- Target Segment -->
                        <div class="mb-4">
                            <label class="block text-sm font-bold text-gray-700 mb-1">কাদের কাছে পাঠাবেন?</label>
                            <select id="ab-target-segment" class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500">
                                <option value="at-risk">🔴 At-Risk Customers (${atRiskCount} জন)</option>
                                <option value="vip">👑 VIP Customers (${vipCount} জন)</option>
                                <option value="all">👥 All Customers (${customers.length} জন)</option>
                            </select>
                        </div>
                        
                        <!-- VERSION A -->
<div class="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
    <h3 class="font-bold text-purple-700 mb-3 flex items-center gap-2">
        <span class="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">A</span>
        Version A
    </h3>
    
    <div class="mb-3">
        <label class="block text-xs font-medium text-purple-600 mb-1">Discount %</label>
        <input type="number" id="ab-discount-a" value="10" min="1" max="50"
               class="w-full border border-purple-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
               onchange="ABTesting.updatePreview('a')">
    </div>
    
    <div class="mb-3">
        <label class="block text-xs font-medium text-purple-600 mb-1">Coupon Code</label>
        <div class="flex gap-2">
            <input type="text" id="ab-code-a" value="TESTA10" 
                   class="flex-1 border border-purple-300 rounded-lg px-3 py-2 font-mono uppercase focus:ring-2 focus:ring-purple-500">
            <button onclick="ABTesting.generateCode('a')" class="px-3 py-2 bg-purple-200 text-purple-700 rounded-lg text-xs">
                🔄
            </button>
        </div>
    </div>
    
    <div>
        <label class="block text-xs font-medium text-purple-600 mb-1">✏️ Message (Edit করতে পারবেন)</label>
        <textarea id="ab-message-a" rows="4" 
                  class="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
>আপনার জন্য special 10% ছাড়! 🎁
Code: TESTA10
⏰ শুধু ৪৮ ঘণ্টা!</textarea>
        <p class="text-[10px] text-purple-500 mt-1">💡 নিজের মতো মেসেজ লিখুন</p>
    </div>
</div>

<!-- VERSION B -->
<div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
    <h3 class="font-bold text-indigo-700 mb-3 flex items-center gap-2">
        <span class="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">B</span>
        Version B
    </h3>
    
    <div class="mb-3">
        <label class="block text-xs font-medium text-indigo-600 mb-1">Discount %</label>
        <input type="number" id="ab-discount-b" value="15" min="1" max="50"
               class="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
               onchange="ABTesting.updatePreview('b')">
    </div>
    
    <div class="mb-3">
        <label class="block text-xs font-medium text-indigo-600 mb-1">Coupon Code</label>
        <div class="flex gap-2">
            <input type="text" id="ab-code-b" value="TESTB15" 
                   class="flex-1 border border-indigo-300 rounded-lg px-3 py-2 font-mono uppercase focus:ring-2 focus:ring-indigo-500">
            <button onclick="ABTesting.generateCode('b')" class="px-3 py-2 bg-indigo-200 text-indigo-700 rounded-lg text-xs">
                🔄
            </button>
        </div>
    </div>
    
    <div>
        <label class="block text-xs font-medium text-indigo-600 mb-1">✏️ Message (Edit করতে পারবেন)</label>
        <textarea id="ab-message-b" rows="4" 
                  class="w-full border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
>আপনার জন্য special 15% ছাড়! 🎁
Code: TESTB15
⏰ শুধু ৪৮ ঘণ্টা!</textarea>
        <p class="text-[10px] text-indigo-500 mt-1">💡 নিজের মতো মেসেজ লিখুন</p>
    </div>
</div>
                        
                        <!-- Test Duration -->
                        <div class="mb-4">
                            <label class="block text-sm font-bold text-gray-700 mb-1">Test চলবে কতদিন?</label>
                            <select id="ab-duration" class="w-full border border-gray-300 rounded-xl px-4 py-3">
                                <option value="3">৩ দিন</option>
                                <option value="7" selected>৭ দিন</option>
                                <option value="14">১৪ দিন</option>
                            </select>
                        </div>
                        
                        <!-- Create Button -->
                        <button onclick="ABTesting.createTest()" 
                                class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2">
                            <i class="ph ph-rocket"></i>
                            Test শুরু করুন
                        </button>
                        
                    </div>
                    
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHTML);
    },

    // ─────────────────────────────────────────────────────────────
    // UPDATE MESSAGE PREVIEW
    // ─────────────────────────────────────────────────────────────
    updatePreview(version) {
    const discount = document.getElementById(`ab-discount-${version}`).value;
    const code = document.getElementById(`ab-code-${version}`).value;
    const textarea = document.getElementById(`ab-message-${version}`);
    
    if (!textarea) return;
    
    // Get current message
    let message = textarea.value;
    
    // Auto-update discount percentage in message
    message = message.replace(/\d+%/, `${discount}%`);
    
    // Auto-update code in message
    message = message.replace(/Code:\s*\w+/i, `Code: ${code}`);
    
    // Update textarea
    textarea.value = message;
},

    // ─────────────────────────────────────────────────────────────
    // GENERATE RANDOM COUPON CODE
    // ─────────────────────────────────────────────────────────────
    generateCode(version) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = version.toUpperCase();
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        document.getElementById(`ab-code-${version}`).value = code;
        this.updatePreview(version);
    },

    // ─────────────────────────────────────────────────────────────
    // CREATE NEW TEST
    // ─────────────────────────────────────────────────────────────
    async createTest() {
        const name = document.getElementById('ab-test-name').value.trim();
        const segment = document.getElementById('ab-target-segment').value;
        const discountA = document.getElementById('ab-discount-a').value;
        const discountB = document.getElementById('ab-discount-b').value;
        const codeA = document.getElementById('ab-code-a').value.toUpperCase();
        const codeB = document.getElementById('ab-code-b').value.toUpperCase();
        const duration = parseInt(document.getElementById('ab-duration').value);
        
        // Validation
        if (!name) {
            alert('❌ Test এর নাম দিন!');
            return;
        }
        if (codeA === codeB) {
            alert('❌ দুইটা আলাদা Coupon Code দিন!');
            return;
        }
        
        // Get target customers
        const allCustomers = await db.customers.toArray();
        let targetCustomers = [];
        
        if (segment === 'at-risk') {
            targetCustomers = allCustomers.filter(c => this.isAtRisk(c));
        } else if (segment === 'vip') {
            targetCustomers = allCustomers.filter(c => c.tier === 'VIP');
        } else {
            targetCustomers = allCustomers;
        }
        
        if (targetCustomers.length < 2) {
            alert('❌ কমপক্ষে ২ জন কাস্টমার দরকার!');
            return;
        }
        
        // Split customers into two groups
        const shuffled = targetCustomers.sort(() => 0.5 - Math.random());
        const half = Math.ceil(shuffled.length / 2);
        const groupA = shuffled.slice(0, half);
        const groupB = shuffled.slice(half);
        
        // Create test object
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);
        
        const test = {
            name: name,
            status: 'running',
            segment: segment,
            
            versionA: {
                name: `${discountA}% Discount`,
                discountPercent: parseInt(discountA),
                couponCode: codeA,
                message: document.getElementById('ab-message-a').value,
                customers: groupA.map(c => c.phone),
                results: {
                    sent: 0,
                    viaCode: 0,
                    manual: 0,
                    totalOrders: 0,
                    revenue: 0
                }
            },
            
            versionB: {
                name: `${discountB}% Discount`,
                discountPercent: parseInt(discountB),
                couponCode: codeB,
                message: document.getElementById('ab-message-b').value,
                customers: groupB.map(c => c.phone),
                results: {
                    sent: 0,
                    viaCode: 0,
                    manual: 0,
                    totalOrders: 0,
                    revenue: 0
                }
            },
            
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            createdAt: Date.now()
        };
        
        // Save to database
        const testId = await db.abTests.add(test);
        
        alert(`✅ Test তৈরি হয়েছে!\n\nVersion A: ${groupA.length} জন\nVersion B: ${groupB.length} জন\n\nএখন Messages পাঠান!`);
        
        this.closeCreateForm();
        this.close();
        
        // Open send messages screen
        this.showSendMessages(testId);
    },

    // ─────────────────────────────────────────────────────────────
    // SHOW SEND MESSAGES SCREEN
    // ─────────────────────────────────────────────────────────────
    async showSendMessages(testId) {
        const test = await db.abTests.get(testId);
        if (!test) return;
        
        const allCustomers = await db.customers.toArray();
        const customerMap = {};
        allCustomers.forEach(c => customerMap[c.phone] = c);
        
        const modalHTML = `
            <div id="ab-send-modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
                    
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <i class="ph ph-paper-plane-tilt text-xl"></i>
                                </div>
                                <div>
                                    <h2 class="text-lg font-bold">Messages পাঠান</h2>
                                    <p class="text-white/70 text-xs">${test.name}</p>
                                </div>
                            </div>
                            <button onclick="ABTesting.closeSendModal()" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <i class="ph ph-x"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Content -->
                    <div class="p-4 overflow-y-auto max-h-[70vh]">
                        
                        <!-- VERSION A -->
                        <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="font-bold text-purple-700 flex items-center gap-2">
                                    <span class="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">A</span>
                                    Version A (${test.versionA.customers.length} জন)
                                </h3>
                                <span class="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                                    Code: ${test.versionA.couponCode}
                                </span>
                            </div>
                            
                            <div class="space-y-2 max-h-40 overflow-y-auto">
                                ${test.versionA.customers.map((phone, i) => {
                                    const customer = customerMap[phone] || { name: 'Unknown' };
                                    return `
                                        <div class="flex items-center justify-between bg-white rounded-lg p-2">
                                            <div>
                                                <p class="text-sm font-medium text-gray-800">${customer.name}</p>
                                                <p class="text-xs text-gray-500">${phone}</p>
                                            </div>
                                            <button onclick="ABTesting.sendWhatsApp('${phone}', 'a', ${testId})" 
                                                    class="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600">
                                                <i class="ph ph-whatsapp-logo"></i> Send
                                            </button>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        
                        <!-- VERSION B -->
                        <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="font-bold text-indigo-700 flex items-center gap-2">
                                    <span class="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">B</span>
                                    Version B (${test.versionB.customers.length} জন)
                                </h3>
                                <span class="text-xs bg-indigo-200 text-indigo-700 px-2 py-1 rounded-full">
                                    Code: ${test.versionB.couponCode}
                                </span>
                            </div>
                            
                            <div class="space-y-2 max-h-40 overflow-y-auto">
                                ${test.versionB.customers.map((phone, i) => {
                                    const customer = customerMap[phone] || { name: 'Unknown' };
                                    return `
                                        <div class="flex items-center justify-between bg-white rounded-lg p-2">
                                            <div>
                                                <p class="text-sm font-medium text-gray-800">${customer.name}</p>
                                                <p class="text-xs text-gray-500">${phone}</p>
                                            </div>
                                            <button onclick="ABTesting.sendWhatsApp('${phone}', 'b', ${testId})" 
                                                    class="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600">
                                                <i class="ph ph-whatsapp-logo"></i> Send
                                            </button>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        
                        <!-- Done Button -->
                        <button onclick="ABTesting.closeSendModal(); ABTesting.open();" 
                                class="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition">
                            Done - Dashboard এ যান
                        </button>
                        
                    </div>
                    
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // ─────────────────────────────────────────────────────────────
    // SEND WHATSAPP MESSAGE
    // ─────────────────────────────────────────────────────────────
    async sendWhatsApp(phone, version, testId) {
        const test = await db.abTests.get(testId);
        if (!test) return;
        
        const versionData = version === 'a' ? test.versionA : test.versionB;
        const message = encodeURIComponent(versionData.message);
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Open WhatsApp
        window.open(`https://wa.me/88${cleanPhone}?text=${message}`, '_blank');
        
        // Update sent count
        versionData.results.sent++;
        await db.abTests.put(test);
    },

    // ─────────────────────────────────────────────────────────────
    // VIEW TEST DETAILS
    // ─────────────────────────────────────────────────────────────
    async viewTest(testId) {
        const test = await db.abTests.get(testId);
        if (!test) return;
        
        const vA = test.versionA;
        const vB = test.versionB;
        const totalA = vA.results?.totalOrders || 0;
        const totalB = vB.results?.totalOrders || 0;
        const revenueA = vA.results?.revenue || 0;
        const revenueB = vB.results?.revenue || 0;
        
        let winner = 'TBD';
        let winnerColor = 'gray';
        if (test.status === 'completed' || (totalA > 0 || totalB > 0)) {
            if (revenueA > revenueB) {
                winner = 'Version A 🏆';
                winnerColor = 'purple';
            } else if (revenueB > revenueA) {
                winner = 'Version B 🏆';
                winnerColor = 'indigo';
            } else {
                winner = 'Tie';
                winnerColor = 'gray';
            }
        }
        
        const modalHTML = `
            <div id="ab-view-modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
                    
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 class="text-lg font-bold">${test.name}</h2>
                                <p class="text-white/70 text-xs">${this.formatDate(test.createdAt)}</p>
                            </div>
                            <button onclick="document.getElementById('ab-view-modal').remove()" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <i class="ph ph-x"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Content -->
                    <div class="p-4 overflow-y-auto max-h-[70vh]">
                        
                        <!-- Winner Banner -->
                        <div class="bg-${winnerColor}-100 border border-${winnerColor}-200 rounded-xl p-4 mb-4 text-center">
                            <p class="text-sm text-${winnerColor}-600 mb-1">Winner</p>
                            <p class="text-2xl font-bold text-${winnerColor}-700">${winner}</p>
                        </div>
                        
                        <!-- Comparison -->
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            
                            <!-- Version A -->
                            <div class="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                <div class="flex items-center gap-2 mb-3">
                                    <span class="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">A</span>
                                    <span class="font-bold text-purple-700 text-sm">${vA.name}</span>
                                </div>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Code:</span>
                                        <span class="font-mono font-bold text-purple-700">${vA.couponCode}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Sent:</span>
                                        <span class="font-bold">${vA.results?.sent || 0}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Orders:</span>
                                        <span class="font-bold text-green-600">${totalA}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Revenue:</span>
                                        <span class="font-bold text-green-600">৳${revenueA}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Version B -->
                            <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                                <div class="flex items-center gap-2 mb-3">
                                    <span class="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">B</span>
                                    <span class="font-bold text-indigo-700 text-sm">${vB.name}</span>
                                </div>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Code:</span>
                                        <span class="font-mono font-bold text-indigo-700">${vB.couponCode}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Sent:</span>
                                        <span class="font-bold">${vB.results?.sent || 0}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Orders:</span>
                                        <span class="font-bold text-green-600">${totalB}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Revenue:</span>
                                        <span class="font-bold text-green-600">৳${revenueB}</span>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                        
                        <!-- Actions -->
                        <div class="flex gap-2">
                            ${test.status === 'running' ? `
                                <button onclick="ABTesting.markResults(${test.id})" 
                                        class="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition">
                                    <i class="ph ph-check-circle"></i> Mark Results
                                </button>
                                <button onclick="ABTesting.completeTest(${test.id})" 
                                        class="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
                                    <i class="ph ph-flag-checkered"></i> Complete Test
                                </button>
                            ` : `
                                <button onclick="document.getElementById('ab-view-modal').remove()" 
                                        class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition">
                                    Close
                                </button>
                            `}
                        </div>
                        
                    </div>
                    
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // ─────────────────────────────────────────────────────────────
    // MARK RESULTS (Manual Tracking)
    // ─────────────────────────────────────────────────────────────
    async markResults(testId) {
        const test = await db.abTests.get(testId);
        if (!test) return;
        
        const allCustomers = await db.customers.toArray();
        const customerMap = {};
        allCustomers.forEach(c => customerMap[c.phone] = c);
        
        const modalHTML = `
            <div id="ab-mark-modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
                    
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <i class="ph ph-check-circle text-xl"></i>
                                </div>
                                <div>
                                    <h2 class="text-lg font-bold">Mark Results</h2>
                                    <p class="text-white/70 text-xs">কারা অর্ডার করেছে মার্ক করুন</p>
                                </div>
                            </div>
                            <button onclick="document.getElementById('ab-mark-modal').remove()" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <i class="ph ph-x"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Content -->
                    <div class="p-4 overflow-y-auto max-h-[70vh]">
                        
                        <!-- VERSION A Customers -->
                        <div class="mb-4">
                            <h3 class="font-bold text-purple-700 mb-2 flex items-center gap-2">
                                <span class="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">A</span>
                                Version A - ${test.versionA.couponCode}
                            </h3>
                            <div class="space-y-2 max-h-48 overflow-y-auto">
                                ${test.versionA.customers.map(phone => {
                                    const customer = customerMap[phone] || { name: 'Unknown' };
                                    return `
                                        <div class="flex items-center justify-between bg-purple-50 rounded-lg p-3">
                                            <div>
                                                <p class="text-sm font-medium text-gray-800">${customer.name}</p>
                                                <p class="text-xs text-gray-500">${phone}</p>
                                            </div>
                                            <button onclick="ABTesting.markCustomerOrdered(${testId}, '${phone}', 'a')" 
                                                    class="px-3 py-2 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 flex items-center gap-1">
                                                <i class="ph ph-check"></i> Ordered
                                            </button>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        
                        <!-- VERSION B Customers -->
                        <div class="mb-4">
                            <h3 class="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                                <span class="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">B</span>
                                Version B - ${test.versionB.couponCode}
                            </h3>
                            <div class="space-y-2 max-h-48 overflow-y-auto">
                                ${test.versionB.customers.map(phone => {
                                    const customer = customerMap[phone] || { name: 'Unknown' };
                                    return `
                                        <div class="flex items-center justify-between bg-indigo-50 rounded-lg p-3">
                                            <div>
                                                <p class="text-sm font-medium text-gray-800">${customer.name}</p>
                                                <p class="text-xs text-gray-500">${phone}</p>
                                            </div>
                                            <button onclick="ABTesting.markCustomerOrdered(${testId}, '${phone}', 'b')" 
                                                    class="px-3 py-2 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 flex items-center gap-1">
                                                <i class="ph ph-check"></i> Ordered
                                            </button>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        
                        <!-- Done -->
                        <button onclick="document.getElementById('ab-mark-modal').remove(); ABTesting.open();" 
                                class="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition">
                            Done
                        </button>
                        
                    </div>
                    
                </div>
            </div>
        `;
        
        // Close other modals first
        this.close();
        const viewModal = document.getElementById('ab-view-modal');
        if (viewModal) viewModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // ─────────────────────────────────────────────────────────────
    // MARK CUSTOMER AS ORDERED
    // ─────────────────────────────────────────────────────────────
    async markCustomerOrdered(testId, phone, version) {
        const amount = prompt('অর্ডার এমাউন্ট কত ছিল? (৳)');
        if (!amount || isNaN(amount)) return;
        
        const test = await db.abTests.get(testId);
        if (!test) return;
        
        const versionData = version === 'a' ? test.versionA : test.versionB;
        versionData.results.manual++;
        versionData.results.totalOrders++;
        versionData.results.revenue += parseInt(amount);
        
        await db.abTests.put(test);
        
        alert(`✅ Marked! ${version.toUpperCase()} Version এ ৳${amount} অর্ডার যোগ হয়েছে।`);
        
        // Refresh the mark modal
        document.getElementById('ab-mark-modal').remove();
        this.markResults(testId);
    },

    // ─────────────────────────────────────────────────────────────
    // COMPLETE TEST
    // ─────────────────────────────────────────────────────────────
    async completeTest(testId) {
        if (!confirm('Test শেষ করতে চান? এরপর আর results যোগ করা যাবে না।')) return;
        
        const test = await db.abTests.get(testId);
        if (!test) return;
        
        test.status = 'completed';
        await db.abTests.put(test);
        
        alert('✅ Test সম্পন্ন হয়েছে!');
        
        document.getElementById('ab-view-modal')?.remove();
        this.open();
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Check if customer is at-risk
    // ─────────────────────────────────────────────────────────────
    isAtRisk(customer) {
        if (!customer.lastOrderDate) return false;
        const daysSinceOrder = Math.floor((Date.now() - new Date(customer.lastOrderDate)) / (1000 * 60 * 60 * 24));
        return daysSinceOrder >= 30;
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Format date
    // ─────────────────────────────────────────────────────────────
    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    },

    // ─────────────────────────────────────────────────────────────
    // CLOSE MODALS
    // ─────────────────────────────────────────────────────────────
    close() {
        document.getElementById('ab-testing-modal')?.remove();
    },
    
    closeCreateForm() {
        document.getElementById('ab-create-modal')?.remove();
    },
    
    closeSendModal() {
        document.getElementById('ab-send-modal')?.remove();
    }
};
