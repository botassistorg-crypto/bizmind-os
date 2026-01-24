// appGuide.js - Enhanced Money-Making Guide with Tier Luring

const AppGuide = {

    currentTier: 'STARTER', // Will be set dynamically

    open() {
        this.currentTier = window.currentTier || 'STARTER';
        
        const modalHTML = `
            <div id="app-guide-modal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
                    
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-blue-600 to-cyan-500 p-5 text-white relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <div class="relative">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <i class="ph ph-book-open text-2xl"></i>
                                    </div>
                                    <div>
                                        <h2 class="text-xl font-bold">BizMind গাইড</h2>
                                        <p class="text-white/80 text-sm">টাকা বাড়ানোর Complete Roadmap</p>
                                    </div>
                                </div>
                                <button onclick="AppGuide.close()" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
                                    <i class="ph ph-x text-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Tab Navigation -->
                    <div class="flex border-b bg-gray-50">
                        <button onclick="AppGuide.showTab('basics')" id="tab-basics" class="flex-1 py-3 text-sm font-semibold text-blue-600 border-b-2 border-blue-600">
                            🚀 শুরু করুন
                        </button>
                        <button onclick="AppGuide.showTab('daily')" id="tab-daily" class="flex-1 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700">
                            📅 Daily Tasks
                        </button>
                        <button onclick="AppGuide.showTab('money')" id="tab-money" class="flex-1 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700">
                            💰 টাকা বাড়ান
                        </button>
                        <button onclick="AppGuide.showTab('pro')" id="tab-pro" class="flex-1 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700">
                            👑 Pro Tips
                        </button>
                    </div>

                    <!-- Tab Content -->
                    <div id="guide-tab-content" class="p-5 overflow-y-auto max-h-[55vh]">
                        ${this.getBasicsContent()}
                    </div>

                    <!-- Footer CTA (Tier-based) -->
                    <div class="border-t p-4 bg-gradient-to-r from-gray-50 to-gray-100">
                        ${this.getFooterCTA()}
                    </div>

                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    showTab(tab) {
        // Update tab styles
        ['basics', 'daily', 'money', 'pro'].forEach(t => {
            const tabBtn = document.getElementById(`tab-${t}`);
            if (t === tab) {
                tabBtn.className = 'flex-1 py-3 text-sm font-semibold text-blue-600 border-b-2 border-blue-600';
            } else {
                tabBtn.className = 'flex-1 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 border-b-2 border-transparent';
            }
        });

        // Update content
        const content = document.getElementById('guide-tab-content');
        switch(tab) {
            case 'basics': content.innerHTML = this.getBasicsContent(); break;
            case 'daily': content.innerHTML = this.getDailyContent(); break;
            case 'money': content.innerHTML = this.getMoneyContent(); break;
            case 'pro': content.innerHTML = this.getProContent(); break;
        }
    },

    // ============================================
    // TAB 1: BASICS - Getting Started
    // ============================================
    getBasicsContent() {
        return `
            <div class="space-y-4">
                
                <!-- Welcome Message -->
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div class="flex items-start gap-3">
                        <div class="text-2xl">🎉</div>
                        <div>
                            <h4 class="font-bold text-blue-800">স্বাগতম!</h4>
                            <p class="text-sm text-blue-700">BizMind আপনাকে শুধু হিসাব রাখতে না, বিক্রি বাড়াতে সাহায্য করবে।</p>
                        </div>
                    </div>
                </div>

                <!-- Step 1: Products -->
                <div class="border rounded-xl p-4 hover:shadow-md transition">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800">প্রোডাক্ট যোগ করুন</h4>
                            <p class="text-sm text-gray-600 mt-1">Products ট্যাবে গিয়ে আপনার সব প্রোডাক্ট যোগ করুন।</p>
                            <div class="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
                                <p class="text-xs text-amber-700">💡 <strong>Important:</strong> Cost Price অবশ্যই দিন - এটা ছাড়া Profit হিসাব হবে না!</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 2: Orders -->
                <div class="border rounded-xl p-4 hover:shadow-md transition">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800">অর্ডার এন্ট্রি করুন</h4>
                            <p class="text-sm text-gray-600 mt-1">নিচের <strong>+ বাটনে</strong> ক্লিক করে অর্ডার যোগ করুন।</p>
                            <ul class="mt-2 text-xs text-gray-500 space-y-1">
                                <li>✓ কাস্টমার নাম ও ফোন দিন</li>
                                <li>✓ প্রোডাক্ট সিলেক্ট করুন</li>
                                <li>✓ Discount, Courier charge যোগ করুন</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Step 3: Customer Auto-Save -->
                <div class="border rounded-xl p-4 hover:shadow-md transition">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800">কাস্টমার অটো-সেভ</h4>
                            <p class="text-sm text-gray-600 mt-1">অর্ডার দিলেই কাস্টমার অটোমেটিক সেভ হয়ে যাবে। আলাদা করে কাস্টমার যোগ করতে হবে না!</p>
                            <div class="mt-2 flex items-center gap-2">
                                <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">VIP</span>
                                <span class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Regular</span>
                                <span class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">At-Risk</span>
                                <span class="text-xs text-gray-500">← অটো ট্যাগ হবে</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 4: Dashboard -->
                <div class="border rounded-xl p-4 hover:shadow-md transition">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">4</div>
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800">Dashboard চেক করুন</h4>
                            <p class="text-sm text-gray-600 mt-1">প্রতিদিন Dashboard এ আপনার বিজনেসের অবস্থা দেখুন।</p>
                            <ul class="mt-2 text-xs text-gray-500 space-y-1">
                                <li>📊 আজকের বিক্রি ও প্রফিট</li>
                                <li>📈 Weekly/Monthly trend</li>
                                <li>🔔 Customer Alerts</li>
                            </ul>
                        </div>
                    </div>
                </div>

                ${this.getLureBox('basics')}

            </div>
        `;
    },

    // ============================================
    // TAB 2: DAILY TASKS
    // ============================================
    getDailyContent() {
        return `
            <div class="space-y-4">

                <!-- Morning Routine -->
                <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                    <h4 class="font-bold text-amber-800 flex items-center gap-2">
                        <i class="ph ph-sun text-xl"></i> সকালের রুটিন (৫ মিনিট)
                    </h4>
                </div>

                <div class="border rounded-xl p-4">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                            <i class="ph ph-number-circle-one"></i>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800">Dashboard চেক করুন</h4>
                            <p class="text-sm text-gray-600 mt-1">গতকালের সেল ও প্রফিট দেখুন। Target এর কাছাকাছি আছেন কিনা চেক করুন।</p>
                        </div>
                    </div>
                </div>

                <div class="border rounded-xl p-4">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                            <i class="ph ph-number-circle-two"></i>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800">Customer Alert দেখুন</h4>
                            <p class="text-sm text-gray-600 mt-1">At-Risk কাস্টমার কারা দেখুন। এরা ৩০+ দিন অর্ডার করেনি!</p>
                            <div class="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
                                <p class="text-xs text-red-700">⚠️ এদের মেসেজ না করলে তারা চিরতরে হারিয়ে যাবে!</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="border rounded-xl p-4">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <i class="ph ph-number-circle-three"></i>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800">WhatsApp মেসেজ করুন</h4>
                            <p class="text-sm text-gray-600 mt-1">At-Risk কাস্টমারদের ফোন নম্বরে ক্লিক করে সরাসরি WhatsApp এ মেসেজ করুন।</p>
                            ${this.currentTier === 'STARTER' ? `
                                <div class="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-2">
                                    <p class="text-xs text-purple-700">🔒 <strong>GROWTH তে:</strong> AI আপনার জন্য Ready Message তৈরি করে দেবে!</p>
                                </div>
                            ` : `
                                <div class="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
                                    <p class="text-xs text-green-700">✅ Growth Hub → Templates থেকে Ready Message কপি করুন!</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                <!-- Evening Routine -->
                <div class="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 mt-6">
                    <h4 class="font-bold text-indigo-800 flex items-center gap-2">
                        <i class="ph ph-moon text-xl"></i> সন্ধ্যার রুটিন (২ মিনিট)
                    </h4>
                </div>

                <div class="border rounded-xl p-4">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                            <i class="ph ph-check-circle"></i>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800">আজকের সব অর্ডার এন্ট্রি করুন</h4>
                            <p class="text-sm text-gray-600 mt-1">ঘুমাতে যাওয়ার আগে সব অর্ডার এন্ট্রি করুন। একটাও মিস করবেন না!</p>
                        </div>
                    </div>
                </div>

                ${this.getLureBox('daily')}

            </div>
        `;
    },

    // ============================================
    // TAB 3: MONEY MAKING STRATEGIES
    // ============================================
    getMoneyContent() {
        return `
            <div class="space-y-4">

                <!-- Header -->
                <div class="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4">
                    <h4 class="font-bold flex items-center gap-2">
                        <i class="ph ph-money text-xl"></i> এই ৫টা কাজ করলেই বিক্রি বাড়বে!
                    </h4>
                    <p class="text-sm text-white/80 mt-1">প্রতিটা কাজ = Extra টাকা ইনকাম</p>
                </div>

                <!-- Strategy 1: At-Risk Recovery -->
                <div class="border-2 border-green-200 rounded-xl p-4 bg-green-50/50">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center font-bold">৳</div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-gray-800">At-Risk কাস্টমার ফেরান</h4>
                                <span class="px-2 py-0.5 bg-green-200 text-green-700 text-xs rounded-full">High Impact</span>
                            </div>
                            <p class="text-sm text-gray-600 mt-1">৩০+ দিন ধরে অর্ডার করেনি এমন কাস্টমারদের মেসেজ করুন।</p>
                            <div class="mt-3 bg-white border rounded-lg p-3">
                                <p class="text-xs text-gray-500 mb-1">Example Message:</p>
                                <p class="text-sm text-gray-700 italic">"আপা, অনেকদিন অর্ডার করেননি। আপনার জন্য special 15% discount রাখলাম! 🎁"</p>
                            </div>
                            <div class="mt-2 text-xs text-green-600 font-medium">
                                💰 প্রতি ফেরত আসা কাস্টমার = গড়ে ৳${this.getAvgOrderValue()} extra income
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Strategy 2: VIP Special Treatment -->
                <div class="border-2 border-amber-200 rounded-xl p-4 bg-amber-50/50">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center">
                            <i class="ph ph-crown"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-gray-800">VIP দের Special করুন</h4>
                                <span class="px-2 py-0.5 bg-amber-200 text-amber-700 text-xs rounded-full">Loyalty</span>
                            </div>
                            <p class="text-sm text-gray-600 mt-1">যারা বেশি কেনে তাদের VIP ট্রিটমেন্ট দিন। তারা আরও বেশি কিনবে!</p>
                            <ul class="mt-2 text-xs text-gray-600 space-y-1">
                                <li>✓ Early access to new products</li>
                                <li>✓ Free delivery offer</li>
                                <li>✓ Birthday wish with discount</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Strategy 3: Reorder Reminder -->
                <div class="border-2 border-blue-200 rounded-xl p-4 bg-blue-50/50">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center">
                            <i class="ph ph-repeat"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-gray-800">Reorder Reminder দিন</h4>
                                ${this.currentTier === 'STARTER' ? `
                                    <span class="px-2 py-0.5 bg-purple-200 text-purple-700 text-xs rounded-full">🔒 GROWTH</span>
                                ` : `
                                    <span class="px-2 py-0.5 bg-blue-200 text-blue-700 text-xs rounded-full">Available</span>
                                `}
                            </div>
                            <p class="text-sm text-gray-600 mt-1">যে প্রোডাক্ট ফুরিয়ে যাওয়ার সময় হয়েছে, সেটা remind করুন।</p>
                            ${this.currentTier === 'STARTER' ? `
                                <div class="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-2">
                                    <p class="text-xs text-purple-700">🔒 GROWTH Tier এ AI আপনাকে বলে দেবে কার কাছে কখন Reminder দিতে হবে!</p>
                                </div>
                            ` : `
                                <div class="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-2">
                                    <p class="text-xs text-blue-700">✅ Growth Hub → Reorder Predictor এ দেখুন!</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                <!-- Strategy 4: Festival Campaign -->
                <div class="border-2 border-orange-200 rounded-xl p-4 bg-orange-50/50">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center">
                            <i class="ph ph-confetti"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-gray-800">Festival এ Campaign চালান</h4>
                                ${this.currentTier === 'STARTER' ? `
                                    <span class="px-2 py-0.5 bg-purple-200 text-purple-700 text-xs rounded-full">🔒 GROWTH</span>
                                ` : `
                                    <span class="px-2 py-0.5 bg-orange-200 text-orange-700 text-xs rounded-full">Available</span>
                                `}
                            </div>
                            <p class="text-sm text-gray-600 mt-1">ঈদ, পূজা, ভালোবাসা দিবস - প্রতিটা উপলক্ষে অফার দিন!</p>
                            ${this.currentTier === 'STARTER' ? `
                                <div class="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-2">
                                    <p class="text-xs text-purple-700">🔒 GROWTH এ Ready-made Festival Campaigns পাবেন - শুধু Send করুন!</p>
                                </div>
                            ` : `
                                <div class="mt-2 bg-orange-50 border border-orange-100 rounded-lg p-2">
                                    <p class="text-xs text-orange-700">✅ Growth Hub → Festival Campaigns এ Ready Messages আছে!</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                <!-- Strategy 5: Bundle/Upsell -->
                <div class="border-2 border-purple-200 rounded-xl p-4 bg-purple-50/50">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-purple-500 text-white rounded-xl flex items-center justify-center">
                            <i class="ph ph-package"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-gray-800">Bundle Offer দিন</h4>
                                ${this.currentTier !== 'ELITE' ? `
                                    <span class="px-2 py-0.5 bg-amber-200 text-amber-700 text-xs rounded-full">👑 ELITE</span>
                                ` : `
                                    <span class="px-2 py-0.5 bg-purple-200 text-purple-700 text-xs rounded-full">Available</span>
                                `}
                            </div>
                            <p class="text-sm text-gray-600 mt-1">একসাথে বেশি প্রোডাক্ট কিনলে discount দিন। Per order value বাড়বে!</p>
                            ${this.currentTier !== 'ELITE' ? `
                                <div class="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
                                    <p class="text-xs text-amber-700">👑 ELITE তে AI বলে দেয় কোন প্রোডাক্টগুলো একসাথে বিক্রি হয় - Perfect Bundle তৈরি করুন!</p>
                                </div>
                            ` : `
                                <div class="mt-2 bg-purple-50 border border-purple-100 rounded-lg p-2">
                                    <p class="text-xs text-purple-700">✅ Growth Hub → Bundle Suggester এ দেখুন!</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                ${this.getLureBox('money')}

            </div>
        `;
    },

    // ============================================
    // TAB 4: PRO TIPS
    // ============================================
    getProContent() {
        return `
            <div class="space-y-4">

                <!-- Pro Tips Header -->
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-4">
                    <h4 class="font-bold flex items-center gap-2">
                        <i class="ph ph-lightbulb text-xl"></i> Pro Tips - সফল বিক্রেতাদের সিক্রেট!
                    </h4>
                </div>

                <!-- Tip 1 -->
                <div class="border rounded-xl p-4 hover:shadow-md transition">
                    <div class="flex items-start gap-3">
                        <div class="text-2xl">🎯</div>
                        <div>
                            <h4 class="font-bold text-gray-800">প্রতিদিন ৩ জন At-Risk কে মেসেজ করুন</h4>
                            <p class="text-sm text-gray-600 mt-1">মাসে ৯০ জন = কমপক্ষে ২০-৩০ জন ফিরে আসবে!</p>
                            <p class="text-xs text-green-600 mt-2 font-medium">💰 Monthly Extra: ৳${(25 * this.getAvgOrderValue()).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <!-- Tip 2 -->
                <div class="border rounded-xl p-4 hover:shadow-md transition">
                    <div class="flex items-start gap-3">
                        <div class="text-2xl">⏰</div>
                        <div>
                            <h4 class="font-bold text-gray-800">সন্ধ্যা ৭-৯টায় মেসেজ করুন</h4>
                            <p class="text-sm text-gray-600 mt-1">এই সময় মানুষ ফোন দেখে। Reply rate ৩X বেশি!</p>
                        </div>
                    </div>
                </div>

                <!-- Tip 3 -->
                <div class="border rounded-xl p-4 hover:shadow-md transition">
                    <div class="flex items-start gap-3">
                        <div class="text-2xl">📸</div>
                        <div>
                            <h4 class="font-bold text-gray-800">মেসেজে Product Photo দিন</h4>
                            <p class="text-sm text-gray-600 mt-1">শুধু টেক্সট না, প্রোডাক্টের ছবি দিলে ক্লিক ২X বাড়ে!</p>
                        </div>
                    </div>
                </div>

                <!-- Tip 4 -->
                <div class="border rounded-xl p-4 hover:shadow-md transition">
                    <div class="flex items-start gap-3">
                        <div class="text-2xl">🏷️</div>
                        <div>
                            <h4 class="font-bold text-gray-800">Discount এ সময়সীমা দিন</h4>
                            <p class="text-sm text-gray-600 mt-1">"শুধু আজকে!" বা "৪৮ ঘণ্টা" - Urgency বাড়ায় conversion!</p>
                            <div class="mt-2 bg-gray-50 rounded-lg p-2">
                                <p class="text-xs text-gray-600 italic">"আপা, শুধু আপনার জন্য 20% OFF - আজ রাত ১২টা পর্যন্ত! ⏰"</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tip 5 -->
                <div class="border rounded-xl p-4 hover:shadow-md transition">
                    <div class="flex items-start gap-3">
                        <div class="text-2xl">💬</div>
                        <div>
                            <h4 class="font-bold text-gray-800">নাম ধরে ডাকুন</h4>
                            <p class="text-sm text-gray-600 mt-1">"Dear Customer" না, "রুমানা আপা" বলুন - Personal feel আসে!</p>
                            ${this.currentTier !== 'STARTER' ? `
                                <div class="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
                                    <p class="text-xs text-green-700">✅ Templates এ {name} দিলে অটো নাম বসে যায়!</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- Tip 6: Profit Focus -->
                <div class="border-2 border-red-200 rounded-xl p-4 bg-red-50/50">
                    <div class="flex items-start gap-3">
                        <div class="text-2xl">🚨</div>
                        <div>
                            <h4 class="font-bold text-red-700">Low Profit Products চেক করুন!</h4>
                            <p class="text-sm text-gray-600 mt-1">কিছু প্রোডাক্টে হয়তো Margin কম। সেগুলোর দাম বাড়ান অথবা বিক্রি কমান।</p>
                            ${this.currentTier !== 'ELITE' ? `
                                <div class="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
                                    <p class="text-xs text-amber-700">👑 ELITE তে "Profit Leakage Detector" আপনাকে বলে দেয় কোথায় টাকা হারাচ্ছেন!</p>
                                </div>
                            ` : `
                                <div class="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
                                    <p class="text-xs text-green-700">✅ Growth Hub → Profit Leakage এ বিস্তারিত দেখুন!</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                ${this.getLureBox('pro')}

            </div>
        `;
    },

    // ============================================
    // TIER-BASED LURE BOXES
    // ============================================
    getLureBox(tab) {
        if (this.currentTier === 'ELITE') {
            // ELITE users - Thank them!
            return `
                <div class="mt-6 bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300 rounded-xl p-4">
                    <div class="flex items-center gap-3">
                        <div class="text-3xl">👑</div>
                        <div>
                            <h4 class="font-bold text-amber-800">আপনি ELITE Member!</h4>
                            <p class="text-sm text-amber-700">সব ফিচার আপনার কাছে আনলক আছে। Full ব্যবহার করুন!</p>
                        </div>
                    </div>
                </div>
            `;
        }

        if (this.currentTier === 'GROWTH') {
            // GROWTH users - Lure to ELITE
            const eliteLures = {
                basics: {
                    icon: '🌅',
                    title: 'প্রতিদিন সকালে AI Briefing পান!',
                    desc: 'ELITE তে AI প্রতিদিন সকালে বলে দেয় - আজকে কি করতে হবে, কার কাছে মেসেজ করতে হবে।',
                    saving: '2 ঘণ্টা/দিন সেভ'
                },
                daily: {
                    icon: '🔍',
                    title: 'কোথায় টাকা হারাচ্ছেন জানুন!',
                    desc: 'Profit Leakage Detector দেখায় - কোন প্রোডাক্টে লস হচ্ছে, কোন কাস্টমার হারিয়ে গেছে।',
                    saving: '৳৫,০০০+ recover/মাস'
                },
                money: {
                    icon: '📦',
                    title: 'AI Bundle Suggestions পান!',
                    desc: 'কোন প্রোডাক্টগুলো একসাথে বিক্রি হয় - AI বলে দেয়। Bundle offer দিন!',
                    saving: 'Per order value ৩০% বাড়ে'
                },
                pro: {
                    icon: '🚀',
                    title: 'Business Autopilot Mode!',
                    desc: 'ELITE features আপনার হয়ে চিন্তা করে। আপনি শুধু Action নিন!',
                    saving: 'Revenue 50%+ boost'
                }
            };

            const lure = eliteLures[tab];
            return `
                <div class="mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div class="relative">
                        <div class="flex items-start gap-3">
                            <div class="text-3xl">${lure.icon}</div>
                            <div class="flex-1">
                                <h4 class="font-bold">${lure.title}</h4>
                                <p class="text-sm text-white/80 mt-1">${lure.desc}</p>
                                <div class="mt-2 inline-block px-2 py-1 bg-white/20 rounded-full text-xs">
                                    💰 ${lure.saving}
                                </div>
                            </div>
                        </div>
                        <button onclick="AppGuide.close(); LuringSystem.initiateUpgrade('ELITE');" 
                                class="mt-3 w-full bg-white text-purple-600 py-2 rounded-lg font-bold text-sm hover:bg-purple-50 transition">
                            👑 ELITE তে আপগ্রেড করুন
                        </button>
                    </div>
                </div>
            `;
        }

        // STARTER users - Lure to GROWTH
        const growthLures = {
            basics: {
                icon: '🤖',
                title: 'AI দিয়ে Offer তৈরি করুন!',
                desc: 'GROWTH তে AI আপনার জন্য Perfect Offer Message তৈরি করে দেয়। শুধু Send করুন!',
                features: ['Offer Wizard AI', 'Ready Templates', 'Festival Campaigns']
            },
            daily: {
                icon: '📋',
                title: 'কপি-পেস্ট Ready Messages!',
                desc: 'প্রতিদিন মেসেজ লিখতে হবে না। ১০০+ Ready Template থেকে বেছে নিন!',
                features: ['WhatsApp Templates', 'SMS Templates', 'Occasion Messages']
            },
            money: {
                icon: '📊',
                title: 'Customer Segments দেখুন!',
                desc: 'VIP, Regular, At-Risk - প্রতিটা গ্রুপ আলাদা করে দেখুন ও Target করুন।',
                features: ['Smart Segments', 'RFM Analysis', 'Bulk Messaging']
            },
            pro: {
                icon: '🎯',
                title: 'Reorder Prediction পান!',
                desc: 'AI বলে দেয় কোন কাস্টমার কবে আবার অর্ডার করবে। সঠিক সময়ে মেসেজ করুন!',
                features: ['Reorder Predictor', 'Purchase Patterns', 'Smart Timing']
            }
        };

        const lure = growthLures[tab];
        return `
            <div class="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white relative overflow-hidden">
                <div class="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div class="relative">
                    <div class="flex items-start gap-3">
                        <div class="text-3xl">${lure.icon}</div>
                        <div class="flex-1">
                            <h4 class="font-bold">${lure.title}</h4>
                            <p class="text-sm text-white/80 mt-1">${lure.desc}</p>
                            <div class="mt-2 flex flex-wrap gap-1">
                                ${lure.features.map(f => `<span class="px-2 py-0.5 bg-white/20 rounded-full text-xs">${f}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <button onclick="AppGuide.close(); LuringSystem.initiateUpgrade('GROWTH');" 
                            class="mt-3 w-full bg-white text-green-600 py-2 rounded-lg font-bold text-sm hover:bg-green-50 transition">
                        ⭐ GROWTH তে আপগ্রেড করুন - ৳১,৪৯৯/মাস
                    </button>
                </div>
            </div>
        `;
    },

    // ============================================
    // FOOTER CTA (Always visible)
    // ============================================
    getFooterCTA() {
        if (this.currentTier === 'ELITE') {
            return `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">👑</span>
                        <span class="text-sm text-gray-600">ELITE Member</span>
                    </div>
                    <button onclick="AppGuide.close()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">
                        বুঝেছি, ধন্যবাদ!
                    </button>
                </div>
            `;
        }

        if (this.currentTier === 'GROWTH') {
            return `
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs text-gray-500">আরও Power চান?</p>
                        <p class="text-sm font-semibold text-purple-600">👑 ELITE - ৳২,৯৯৯/মাস</p>
                    </div>
                    <button onclick="AppGuide.close(); LuringSystem.initiateUpgrade('ELITE');" 
                            class="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:opacity-90 transition">
                        Upgrade করুন
                    </button>
                </div>
            `;
        }

        // STARTER
        return `
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs text-gray-500">AI Features চালু করুন</p>
                    <p class="text-sm font-semibold text-green-600">⭐ GROWTH - ৳১,৪৯৯/মাস</p>
                </div>
                <button onclick="AppGuide.close(); LuringSystem.initiateUpgrade('GROWTH');" 
                        class="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:opacity-90 transition">
                    Upgrade করুন
                </button>
            </div>
        `;
    },

    // ============================================
    // HELPERS
    // ============================================
    getAvgOrderValue() {
        // Return average order value or default
        return window.avgOrderValue || 850;
    },

    close() {
        const modal = document.getElementById('app-guide-modal');
        if (modal) modal.remove();
    }
};