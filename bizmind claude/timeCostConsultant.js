// timeCostConsultant.js - Complete Business Time Audit Tool

const TimeCostConsultant = {

    // Time categories with BD-specific suggestions
    categories: {
        strategic: {
            name: 'Strategic Thinking',
            icon: '🧠',
            examples: ['Business planning', 'New product ideas', 'Pricing strategy', 'Competitor analysis'],
            valueLevel: 'HIGH',
            color: 'emerald',
            advice: 'এই কাজে সময় বাড়ান! এটাই আপনার বিজনেস বড় করবে।',
            shouldIncrease: true
        },
        sales: {
            name: 'Sales & Negotiation',
            icon: '💰',
            examples: ['Customer calls', 'Closing deals', 'Wholesale negotiations', 'Pricing discussions'],
            valueLevel: 'HIGH',
            color: 'green',
            advice: 'বিক্রি বাড়াতে এই সময় বাড়ান।',
            shouldIncrease: true
        },
        marketing: {
            name: 'Marketing & Content',
            icon: '📱',
            examples: ['Facebook posts', 'Product photography', 'Ad campaigns', 'Customer engagement'],
            valueLevel: 'HIGH',
            color: 'blue',
            advice: 'মার্কেটিং এ সময় দিলে নতুন কাস্টমার আসবে।',
            shouldIncrease: true
        },
        customerService: {
            name: 'Customer Service',
            icon: '🤝',
            examples: ['Answering queries', 'Handling complaints', 'Order confirmations', 'Follow-ups'],
            valueLevel: 'MEDIUM',
            color: 'yellow',
            advice: 'Templates ব্যবহার করে সময় বাঁচান।',
            canOptimize: true,
            optimizeTip: 'BizMind এর Message Templates ব্যবহার করুন!'
        },
        operations: {
            name: 'Operations & Packing',
            icon: '📦',
            examples: ['Order packing', 'Inventory counting', 'Stock organizing', 'Quality check'],
            valueLevel: 'LOW',
            color: 'orange',
            advice: 'এই কাজ হেল্পার দিয়ে করান। আপনার সময় বেশি দামি!',
            shouldDelegate: true,
            delegateCost: 100, // ৳100/hour helper
            delegateTo: 'Helper/Staff'
        },
        admin: {
            name: 'Admin & Data Entry',
            icon: '📝',
            examples: ['Order entry', 'Accounting', 'Paperwork', 'Report making'],
            valueLevel: 'LOW',
            color: 'slate',
            advice: 'এই কাজ automate করুন বা assistant রাখুন।',
            shouldDelegate: true,
            delegateCost: 80,
            delegateTo: 'Assistant/App',
            automationTip: 'BizMind এ অটো রিপোর্ট আছে!'
        },
        delivery: {
            name: 'Personal Delivery',
            icon: '🚗',
            examples: ['Delivering orders yourself', 'Going to courier', 'Returns handling'],
            valueLevel: 'LOW',
            color: 'red',
            advice: 'কুরিয়ার ব্যবহার করুন! নিজে ডেলিভারি = টাকা নষ্ট।',
            shouldDelegate: true,
            delegateCost: 60, // Courier cost per delivery
            delegateTo: 'Pathao/Steadfast'
        },
        wasted: {
            name: 'Wasted Time',
            icon: '⏰',
            examples: ['Facebook scrolling', 'Unnecessary calls', 'Waiting', 'Unplanned activities'],
            valueLevel: 'ZERO',
            color: 'gray',
            advice: '⛔ এই সময় সম্পূর্ণ নষ্ট! কমিয়ে ফেলুন।',
            shouldEliminate: true
        }
    },

    // Store user's time audit data
    auditData: {},

    // ─────────────────────────────────────────────────────────────
    // OPEN TIME COST CONSULTANT
    // ─────────────────────────────────────────────────────────────
    open() {
        const modalHTML = `
            <div id="time-consultant-modal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
                    
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <div class="relative">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <i class="ph ph-clock-countdown text-2xl"></i>
                                    </div>
                                    <div>
                                        <h2 class="text-xl font-bold">Time Cost Consultant</h2>
                                        <p class="text-white/80 text-sm">আপনার সময় কোথায় যাচ্ছে?</p>
                                    </div>
                                </div>
                                <button onclick="TimeCostConsultant.close()" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
                                    <i class="ph ph-x text-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Steps Container -->
                    <div id="time-consultant-content" class="overflow-y-auto max-h-[65vh]">
                        ${this.getStep1HTML()}
                    </div>

                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // ─────────────────────────────────────────────────────────────
    // STEP 1: Your Hourly Value
    // ─────────────────────────────────────────────────────────────
    getStep1HTML() {
        return `
            <div class="p-5">
                
                <!-- Step Indicator -->
                <div class="flex items-center justify-center gap-2 mb-6">
                    <div class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div class="w-12 h-1 bg-gray-200 rounded"></div>
                    <div class="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div class="w-12 h-1 bg-gray-200 rounded"></div>
                    <div class="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                </div>

                <div class="text-center mb-6">
                    <h3 class="text-lg font-bold text-gray-800">আপনার সময়ের মূল্য কত?</h3>
                    <p class="text-sm text-gray-500">প্রথমে জানতে হবে আপনার ১ ঘণ্টার দাম কত</p>
                </div>

                <!-- Monthly Income Input -->
                <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                    <label class="block text-sm font-bold text-purple-700 mb-2">
                        আপনার মাসিক আয় (বা টার্গেট আয়)
                    </label>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 font-bold">৳</span>
                        <input type="number" id="monthly-income" placeholder="50000" value="50000"
                               class="w-full pl-10 pr-4 py-3 text-xl font-bold border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    </div>
                    <p class="text-xs text-purple-600 mt-2">
                        💡 যদি এখন ৳30,000 আয় হয় কিন্তু ৳1,00,000 চান, তাহলে ৳1,00,000 লিখুন!
                    </p>
                </div>

                <!-- Working Hours -->
                <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        দিনে কত ঘণ্টা কাজ করেন?
                    </label>
                    <div class="flex items-center gap-3">
                        <input type="range" id="daily-hours" min="4" max="16" value="10" 
                               class="flex-1" onchange="TimeCostConsultant.updateHoursDisplay()">
                        <span id="hours-display" class="text-xl font-bold text-gray-800 w-20 text-center">10 ঘণ্টা</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">
                        মাসে কাজের দিন: 26 দিন ধরা হয়েছে
                    </p>
                </div>

                <!-- Calculated Hourly Rate -->
                <div id="hourly-rate-preview" class="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-white/80">আপনার প্রতি ঘণ্টার মূল্য</p>
                            <p class="text-3xl font-bold" id="hourly-rate-value">৳192</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-white/80">প্রতি মিনিট</p>
                            <p class="text-xl font-bold" id="per-minute-value">৳3.2</p>
                        </div>
                    </div>
                </div>

                <!-- Important Message -->
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <div class="flex gap-3">
                        <div class="text-2xl">💡</div>
                        <div>
                            <p class="text-sm text-amber-800 font-medium">মনে রাখুন!</p>
                            <p class="text-xs text-amber-700 mt-1">
                                আপনি যখন ৳100/ঘণ্টায় কাজ করা যায় এমন কাজ নিজে করেন, 
                                তখন আপনি <strong>৳${192 - 100} = ৳92 প্রতি ঘণ্টায় লস</strong> করছেন!
                            </p>
                        </div>
                    </div>
                </div>

                <button onclick="TimeCostConsultant.goToStep2()" 
                        class="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2">
                    পরবর্তী ধাপ
                    <i class="ph ph-arrow-right"></i>
                </button>

            </div>
        `;
    },

    updateHoursDisplay() {
        const hours = document.getElementById('daily-hours').value;
        document.getElementById('hours-display').textContent = hours + ' ঘণ্টা';
        this.calculateHourlyRate();
    },

    calculateHourlyRate() {
        const monthlyIncome = parseFloat(document.getElementById('monthly-income').value) || 50000;
        const dailyHours = parseFloat(document.getElementById('daily-hours').value) || 10;
        const workingDays = 26;
        
        const hourlyRate = monthlyIncome / (dailyHours * workingDays);
        const perMinute = hourlyRate / 60;
        
        document.getElementById('hourly-rate-value').textContent = '৳' + Math.round(hourlyRate);
        document.getElementById('per-minute-value').textContent = '৳' + perMinute.toFixed(1);
        
        this.auditData.monthlyIncome = monthlyIncome;
        this.auditData.dailyHours = dailyHours;
        this.auditData.hourlyRate = hourlyRate;
    },

    // ─────────────────────────────────────────────────────────────
    // STEP 2: Time Audit
    // ─────────────────────────────────────────────────────────────
    goToStep2() {
        this.calculateHourlyRate();
        
        const container = document.getElementById('time-consultant-content');
        container.innerHTML = `
            <div class="p-5">
                
                <!-- Step Indicator -->
                <div class="flex items-center justify-center gap-2 mb-6">
                    <div class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                    <div class="w-12 h-1 bg-green-500 rounded"></div>
                    <div class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div class="w-12 h-1 bg-gray-200 rounded"></div>
                    <div class="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                </div>

                <div class="text-center mb-6">
                    <h3 class="text-lg font-bold text-gray-800">আপনার সময় কোথায় যায়?</h3>
                    <p class="text-sm text-gray-500">প্রতিদিন প্রতিটা কাজে কত সময় দেন?</p>
                    <p class="text-xs text-purple-600 mt-1 font-medium">
                        আপনার ঘণ্টার মূল্য: ৳${Math.round(this.auditData.hourlyRate)}
                    </p>
                </div>

                <!-- Time Allocation Form -->
                <div class="space-y-3 mb-6">
                    ${this.renderTimeInputs()}
                </div>

                <!-- Total Hours Check -->
                <div id="hours-check" class="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">মোট ঘণ্টা:</span>
                        <span id="total-hours-entered" class="font-bold text-gray-800">0 / ${this.auditData.dailyHours}</span>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="TimeCostConsultant.goToStep1()" 
                            class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition">
                        <i class="ph ph-arrow-left"></i> আগে
                    </button>
                    <button onclick="TimeCostConsultant.goToStep3()" 
                            class="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition">
                        বিশ্লেষণ দেখুন <i class="ph ph-arrow-right"></i>
                    </button>
                </div>

            </div>
        `;

        // Add input listeners
        this.setupTimeInputListeners();
    },

    renderTimeInputs() {
        return Object.entries(this.categories).map(([key, cat]) => {
            const colorClasses = {
                emerald: 'border-emerald-200 bg-emerald-50',
                green: 'border-green-200 bg-green-50',
                blue: 'border-blue-200 bg-blue-50',
                yellow: 'border-yellow-200 bg-yellow-50',
                orange: 'border-orange-200 bg-orange-50',
                slate: 'border-slate-200 bg-slate-50',
                red: 'border-red-200 bg-red-50',
                gray: 'border-gray-300 bg-gray-100'
            };
            
            const bgClass = colorClasses[cat.color] || 'border-gray-200 bg-gray-50';
            
            return `
                <div class="${bgClass} border rounded-xl p-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 flex-1">
                            <span class="text-xl">${cat.icon}</span>
                            <div>
                                <p class="font-medium text-gray-800 text-sm">${cat.name}</p>
                                <p class="text-[10px] text-gray-500">${cat.examples.slice(0, 2).join(', ')}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <input type="number" id="time-${key}" min="0" max="16" step="0.5" value="0"
                                   class="w-16 text-center border border-gray-300 rounded-lg py-2 font-bold text-gray-800"
                                   onchange="TimeCostConsultant.updateTotalHours()">
                            <span class="text-xs text-gray-500">ঘণ্টা</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    setupTimeInputListeners() {
        Object.keys(this.categories).forEach(key => {
            const input = document.getElementById(`time-${key}`);
            if (input) {
                input.addEventListener('input', () => this.updateTotalHours());
            }
        });
    },

    updateTotalHours() {
        let total = 0;
        Object.keys(this.categories).forEach(key => {
            const input = document.getElementById(`time-${key}`);
            if (input) {
                total += parseFloat(input.value) || 0;
            }
        });
        
        const checkEl = document.getElementById('total-hours-entered');
        const targetHours = this.auditData.dailyHours;
        
        if (total > targetHours) {
            checkEl.innerHTML = `<span class="text-red-600">${total} / ${targetHours} ⚠️ বেশি হয়ে গেছে!</span>`;
        } else if (total === targetHours) {
            checkEl.innerHTML = `<span class="text-green-600">${total} / ${targetHours} ✓</span>`;
        } else {
            checkEl.innerHTML = `${total} / ${targetHours}`;
        }
    },

    goToStep1() {
        const container = document.getElementById('time-consultant-content');
        container.innerHTML = this.getStep1HTML();
        
        // Restore values
        if (this.auditData.monthlyIncome) {
            document.getElementById('monthly-income').value = this.auditData.monthlyIncome;
        }
        if (this.auditData.dailyHours) {
            document.getElementById('daily-hours').value = this.auditData.dailyHours;
            this.updateHoursDisplay();
        }
        this.calculateHourlyRate();
    },

    // ─────────────────────────────────────────────────────────────
    // STEP 3: Analysis & Recommendations
    // ─────────────────────────────────────────────────────────────
    goToStep3() {
        // Collect time data
        const timeData = {};
        let totalHours = 0;
        
        Object.keys(this.categories).forEach(key => {
            const input = document.getElementById(`time-${key}`);
            const hours = parseFloat(input?.value) || 0;
            timeData[key] = hours;
            totalHours += hours;
        });
        
        this.auditData.timeData = timeData;
        this.auditData.totalHours = totalHours;
        
        // Calculate analysis
        const analysis = this.analyzeTime();
        
        const container = document.getElementById('time-consultant-content');
        container.innerHTML = `
            <div class="p-5">
                
                <!-- Step Indicator -->
                <div class="flex items-center justify-center gap-2 mb-6">
                    <div class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                    <div class="w-12 h-1 bg-green-500 rounded"></div>
                    <div class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                    <div class="w-12 h-1 bg-green-500 rounded"></div>
                    <div class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                </div>

                <div class="text-center mb-6">
                    <h3 class="text-lg font-bold text-gray-800">📊 আপনার Time Audit Report</h3>
                    <p class="text-sm text-gray-500">দেখুন কোথায় সময় নষ্ট হচ্ছে</p>
                </div>

                <!-- Time Value Summary -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div class="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-4 text-center">
                        <p class="text-xs text-white/80">HIGH VALUE কাজে</p>
                        <p class="text-2xl font-bold">${analysis.highValueHours} ঘণ্টা</p>
                        <p class="text-sm text-white/90">${analysis.highValuePercent}%</p>
                    </div>
                    <div class="bg-gradient-to-br from-red-500 to-orange-600 text-white rounded-xl p-4 text-center">
                        <p class="text-xs text-white/80">LOW VALUE কাজে</p>
                        <p class="text-2xl font-bold">${analysis.lowValueHours} ঘণ্টা</p>
                        <p class="text-sm text-white/90">${analysis.lowValuePercent}%</p>
                    </div>
                </div>

                <!-- Money Loss Card -->
                <div class="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl p-4 mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <span class="text-3xl">💸</span>
                        </div>
                        <div>
                            <p class="text-sm text-white/80">প্রতিদিন আপনি হারাচ্ছেন</p>
                            <p class="text-3xl font-bold">৳${analysis.dailyLoss.toLocaleString()}</p>
                            <p class="text-xs text-white/80">মাসে: ৳${(analysis.dailyLoss * 26).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <!-- Breakdown Chart -->
                <div class="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                    <h4 class="font-bold text-gray-700 mb-3">📊 সময়ের বিভাজন</h4>
                    ${this.renderTimeBreakdown(analysis)}
                </div>

                <!-- Recommendations -->
                <div class="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 mb-4">
                    <h4 class="font-bold text-purple-700 mb-3 flex items-center gap-2">
                        <i class="ph ph-lightbulb text-xl"></i>
                        আপনার জন্য পরামর্শ
                    </h4>
                    <div class="space-y-3">
                        ${this.renderRecommendations(analysis)}
                    </div>
                </div>

                <!-- Action Plan -->
                <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                    <h4 class="font-bold text-emerald-700 mb-3">🎯 Action Plan</h4>
                    <div class="space-y-2">
                        ${this.renderActionPlan(analysis)}
                    </div>
                </div>

                <!-- Potential Gain -->
                <div class="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl p-4 mb-6">
                    <div class="text-center">
                        <p class="text-sm text-white/90">এই পরিবর্তন করলে মাসে বাড়তি আয়</p>
                        <p class="text-4xl font-bold my-2">৳${analysis.potentialGain.toLocaleString()}</p>
                        <p class="text-xs text-white/80">শুধু সময় ঠিকমত ব্যবহার করে!</p>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="TimeCostConsultant.goToStep2()" 
                            class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition">
                        <i class="ph ph-arrow-left"></i> আগে
                    </button>
                    <button onclick="TimeCostConsultant.saveReport()" 
                            class="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2">
                        <i class="ph ph-download-simple"></i>
                        রিপোর্ট সেভ করুন
                    </button>
                </div>

            </div>
        `;
    },

    analyzeTime() {
        const hourlyRate = this.auditData.hourlyRate;
        const timeData = this.auditData.timeData;
        
        let highValueHours = 0;
        let lowValueHours = 0;
        let delegatableHours = 0;
        let wastedHours = 0;
        let dailyLoss = 0;
        
        Object.entries(timeData).forEach(([key, hours]) => {
            const cat = this.categories[key];
            
            if (cat.valueLevel === 'HIGH') {
                highValueHours += hours;
            } else if (cat.valueLevel === 'MEDIUM') {
                // Medium value - partial loss
                lowValueHours += hours * 0.5;
            } else if (cat.valueLevel === 'LOW') {
                lowValueHours += hours;
                delegatableHours += hours;
                // Loss = (your rate - helper rate) × hours
                const helperRate = cat.delegateCost || 100;
                dailyLoss += (hourlyRate - helperRate) * hours;
            } else if (cat.valueLevel === 'ZERO') {
                wastedHours += hours;
                dailyLoss += hourlyRate * hours; // Complete loss
            }
        });
        
        const totalHours = this.auditData.totalHours || 1;
        
        return {
            highValueHours: highValueHours.toFixed(1),
            highValuePercent: Math.round((highValueHours / totalHours) * 100),
            lowValueHours: lowValueHours.toFixed(1),
            lowValuePercent: Math.round((lowValueHours / totalHours) * 100),
            delegatableHours: delegatableHours.toFixed(1),
            wastedHours: wastedHours.toFixed(1),
            dailyLoss: Math.round(dailyLoss),
            potentialGain: Math.round(dailyLoss * 26 * 0.7), // 70% recoverable
            timeData: timeData
        };
    },

    renderTimeBreakdown(analysis) {
        const timeData = analysis.timeData;
        const totalHours = this.auditData.totalHours || 1;
        
        return Object.entries(timeData)
            .filter(([key, hours]) => hours > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([key, hours]) => {
                const cat = this.categories[key];
                const percent = Math.round((hours / totalHours) * 100);
                const cost = Math.round(hours * this.auditData.hourlyRate);
                
                const colorMap = {
                    emerald: 'bg-emerald-500',
                    green: 'bg-green-500',
                    blue: 'bg-blue-500',
                    yellow: 'bg-yellow-500',
                    orange: 'bg-orange-500',
                    slate: 'bg-slate-500',
                    red: 'bg-red-500',
                    gray: 'bg-gray-400'
                };
                
                return `
                    <div class="mb-2">
                        <div class="flex justify-between items-center text-sm mb-1">
                            <span class="flex items-center gap-1">
                                ${cat.icon} ${cat.name}
                            </span>
                            <span class="font-medium">${hours}h (${percent}%)</span>
                        </div>
                        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div class="${colorMap[cat.color] || 'bg-gray-400'} h-full rounded-full" style="width: ${percent}%"></div>
                        </div>
                        <p class="text-[10px] text-gray-500 mt-0.5">এই কাজে খরচ: ৳${cost}</p>
                    </div>
                `;
            }).join('');
    },

    renderRecommendations(analysis) {
        const recommendations = [];
        const timeData = analysis.timeData;
        
        // Check each category and give specific advice
        Object.entries(timeData).forEach(([key, hours]) => {
            if (hours <= 0) return;
            
            const cat = this.categories[key];
            
            if (cat.shouldEliminate && hours > 0) {
                recommendations.push({
                    type: 'danger',
                    icon: '⛔',
                    title: `${cat.name} কমান!`,
                    text: `${hours} ঘণ্টা নষ্ট হচ্ছে। ${cat.advice}`,
                    saving: Math.round(hours * this.auditData.hourlyRate)
                });
            }
            
            if (cat.shouldDelegate && hours >= 1) {
                recommendations.push({
                    type: 'warning',
                    icon: '💡',
                    title: `${cat.name} Delegate করুন`,
                    text: `${cat.delegateTo} দিয়ে করান। ${cat.advice}`,
                    saving: Math.round((this.auditData.hourlyRate - cat.delegateCost) * hours)
                });
            }
            
            if (cat.canOptimize && hours >= 2) {
                recommendations.push({
                    type: 'info',
                    icon: '⚡',
                    title: `${cat.name} Optimize করুন`,
                    text: cat.optimizeTip || cat.advice
                });
            }
        });
        
        // Add increase recommendations for high-value work
        const highValueTotal = (timeData.strategic || 0) + (timeData.sales || 0) + (timeData.marketing || 0);
        if (highValueTotal < 3) {
            recommendations.push({
                type: 'success',
                icon: '🚀',
                title: 'HIGH VALUE কাজে সময় বাড়ান!',
                text: 'Strategic thinking, Sales, Marketing এ দিনে কমপক্ষে ৩ ঘণ্টা দিন।'
            });
        }
        
        return recommendations.slice(0, 4).map(rec => {
            const bgColors = {
                danger: 'bg-red-50 border-red-200',
                warning: 'bg-amber-50 border-amber-200',
                info: 'bg-blue-50 border-blue-200',
                success: 'bg-green-50 border-green-200'
            };
            
            return `
                <div class="${bgColors[rec.type]} border rounded-lg p-3">
                    <div class="flex gap-2">
                        <span class="text-lg">${rec.icon}</span>
                        <div>
                            <p class="font-medium text-gray-800 text-sm">${rec.title}</p>
                            <p class="text-xs text-gray-600">${rec.text}</p>
                            ${rec.saving ? `<p class="text-xs text-green-600 font-medium mt-1">সম্ভাব্য সঞ্চয়: ৳${rec.saving}/দিন</p>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderActionPlan(analysis) {
        const timeData = analysis.timeData;
        const actions = [];
        
        if ((timeData.wasted || 0) > 0) {
            actions.push({
                priority: 1,
                action: `প্রতিদিন ${timeData.wasted} ঘণ্টা নষ্ট কমান`,
                result: 'ফোকাস বাড়বে, স্ট্রেস কমবে'
            });
        }
        
        if ((timeData.operations || 0) >= 2) {
            actions.push({
                priority: 2,
                action: 'Packing/Operations এর জন্য helper রাখুন',
                result: `মাসে ৳${Math.round((timeData.operations || 0) * (this.auditData.hourlyRate - 100) * 26)} বাঁচবে`
            });
        }
        
        if ((timeData.delivery || 0) >= 1) {
            actions.push({
                priority: 3,
                action: 'নিজে ডেলিভারি বন্ধ করুন - Courier ব্যবহার করুন',
                result: 'সময় ও energy বাঁচবে'
            });
        }
        
        actions.push({
            priority: actions.length + 1,
            action: 'প্রতিদিন ২ ঘণ্টা Marketing/Content এ দিন',
            result: 'নতুন কাস্টমার আসবে'
        });
        
        return actions.slice(0, 4).map((a, i) => `
            <div class="flex items-start gap-2">
                <span class="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">${i + 1}</span>
                <div>
                    <p class="text-sm font-medium text-gray-800">${a.action}</p>
                    <p class="text-xs text-emerald-600">${a.result}</p>
                </div>
            </div>
        `).join('');
    },

    saveReport() {
        // Simple alert for now - can be enhanced to save/share
        alert('✅ রিপোর্ট সেভ হয়েছে!\n\nএই পরামর্শগুলো মনে রাখুন এবং প্রতিদিন apply করুন।');
        this.close();
    },

    close() {
        const modal = document.getElementById('time-consultant-modal');
        if (modal) modal.remove();
    }
};