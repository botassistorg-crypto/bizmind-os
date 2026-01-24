// ================================================
// luringSystem.js - Conversion & Luring System v1.0
// Make STARTER users WANT to upgrade!
// ================================================

const LuringSystem = (function() {
    'use strict';

    console.log('🎯 LuringSystem: Loading...');

    // ============================================
    // CONFIGURATION
    // ============================================

    const CONFIG = {
        averageOrderValue: 500,
        averageCustomerLifetime: 12, // months
        conversionRates: {
            lostCustomerRecovery: 0.3,      // 30% can be recovered
            atRiskPrevention: 0.5,          // 50% can be saved
            reorderReminder: 0.4,           // 40% will reorder
            crossSellSuccess: 0.25          // 25% buy suggested products
        }
    };

    // ============================================
    // TEASER DATA GENERATOR
    // ============================================

    // Generate fake but realistic preview data
    async function generateTeaserData() {
        let realStats = { customers: 0, orders: 0, revenue: 0 };
        
        try {
            if (typeof db !== 'undefined') {
                const customers = await db.customers.toArray();
                const orders = await db.orders.toArray();
                
                realStats.customers = customers.length;
                realStats.orders = orders.length;
                realStats.revenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
            }
        } catch(e) {
            console.log('Using demo data');
        }

        // Generate teaser numbers based on real data (or demo)
        const baseCustomers = realStats.customers || 25;
        const baseOrders = realStats.orders || 50;
        const baseRevenue = realStats.revenue || 50000;

        return {
            // Revenue Prediction Teaser
            revenuePrediction: {
                nextMonth: Math.round(baseRevenue * 1.15),
                nextMonthLow: Math.round(baseRevenue * 0.9),
                nextMonthHigh: Math.round(baseRevenue * 1.4),
                confidence: Math.floor(Math.random() * 20) + 70, // 70-90%
                likelyBuyers: Math.floor(baseCustomers * 0.3),
                hiddenValue: '৳XX,XXX'
            },

            // Reorder Predictor Teaser
            reorderPredictor: {
                dueSoon: Math.floor(baseCustomers * 0.25),
                overdue: Math.floor(baseCustomers * 0.15),
                potentialRevenue: Math.round(baseCustomers * 0.4 * CONFIG.averageOrderValue),
                topProduct: 'XXXXX',
                hiddenCustomers: 'X জন'
            },

            // Customer Segments Teaser
            customerSegments: {
                vip: Math.floor(baseCustomers * 0.1),
                atRisk: Math.floor(baseCustomers * 0.2),
                lost: Math.floor(baseCustomers * 0.15),
                new: Math.floor(baseCustomers * 0.1),
                champions: Math.floor(baseCustomers * 0.08)
            },

            // A/B Testing Teaser
            abTesting: {
                potentialIncrease: '25-40%',
                messagesSent: Math.floor(Math.random() * 100) + 50,
                winningRate: '67%'
            },

            // Product Recommendations Teaser
            productRecommendations: {
                pairsFound: Math.floor(baseOrders * 0.1),
                potentialUpsell: Math.round(baseOrders * 0.15 * CONFIG.averageOrderValue * 0.3),
                topPair: 'XXXXX + XXXXX'
            }
        };
    }

    // ============================================
    // LOSS CALCULATOR
    // ============================================

    async function calculatePotentialLoss() {
        let stats = { 
            lostCustomers: 0, 
            atRiskCustomers: 0, 
            missedReorders: 0,
            totalCustomers: 0,
            avgOrderValue: CONFIG.averageOrderValue
        };

        try {
            if (typeof db !== 'undefined') {
                const customers = await db.customers.toArray();
                const orders = await db.orders.toArray();
                const today = new Date();

                // Calculate average order value from real data
                if (orders.length > 0) {
                    stats.avgOrderValue = Math.round(
                        orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0) / orders.length
                    );
                }

                stats.totalCustomers = customers.length;

                // Count at-risk and lost customers
                customers.forEach(customer => {
                    const customerOrders = orders.filter(o => 
                        o.customerPhone === customer.phone || 
                        String(o.customerPhone) === String(customer.phone)
                    );

                    if (customerOrders.length === 0) return;

                    const lastOrderDate = customerOrders.reduce((latest, order) => {
                        const orderDate = new Date(order.date || order.createdAt);
                        return orderDate > latest ? orderDate : latest;
                    }, new Date(0));

                    const daysSince = Math.floor((today - lastOrderDate) / (1000 * 60 * 60 * 24));

                    if (daysSince > 90) {
                        stats.lostCustomers++;
                    } else if (daysSince > 60) {
                        stats.atRiskCustomers++;
                    } else if (daysSince > 30) {
                        stats.missedReorders++;
                    }
                });
            }
        } catch(e) {
            // Use demo data
            stats = {
                lostCustomers: 6,
                atRiskCustomers: 8,
                missedReorders: 5,
                totalCustomers: 30,
                avgOrderValue: 500
            };
        }

        // Calculate potential losses
        const lostRevenue = stats.lostCustomers * stats.avgOrderValue * CONFIG.conversionRates.lostCustomerRecovery;
        const atRiskRevenue = stats.atRiskCustomers * stats.avgOrderValue * CONFIG.conversionRates.atRiskPrevention;
        const reorderRevenue = stats.missedReorders * stats.avgOrderValue * CONFIG.conversionRates.reorderReminder;

        const monthlyLoss = Math.round(lostRevenue + atRiskRevenue + reorderRevenue);
        const yearlyLoss = monthlyLoss * 12;

        return {
            stats,
            losses: {
                fromLostCustomers: Math.round(lostRevenue),
                fromAtRiskCustomers: Math.round(atRiskRevenue),
                fromMissedReorders: Math.round(reorderRevenue),
                totalMonthly: monthlyLoss,
                totalYearly: yearlyLoss
            },
            recovery: {
                withGrowth: Math.round(monthlyLoss * 0.6),
                withElite: Math.round(monthlyLoss * 0.85)
            }
        };
    }

    // ============================================
    // BENEFITS DATA
    // ============================================

    const PLAN_BENEFITS = {
        STARTER: {
            name: 'Starter',
            price: 499,
            emoji: '🌱',
            color: 'from-slate-500 to-slate-600',
            tagline: 'বেসিক ব্যবসা ম্যানেজমেন্ট',
            features: [
                { icon: 'ph-shopping-cart', text: 'আনলিমিটেড অর্ডার', included: true },
                { icon: 'ph-users', text: 'আনলিমিটেড কাস্টমার', included: true },
                { icon: 'ph-package', text: 'ইনভেন্টরি ম্যানেজমেন্ট', included: true },
                { icon: 'ph-receipt', text: 'ইনভয়েস জেনারেশন', included: true },
                { icon: 'ph-cloud-arrow-up', text: 'Google Backup', included: true },
                { icon: 'ph-users-three', text: 'Customer Segments', included: false },
                { icon: 'ph-brain', text: 'AI Offer Generator', included: false },
                { icon: 'ph-chart-line-up', text: 'Revenue Prediction', included: false }
            ],
            limitations: [
                'Customer Segments দেখতে পারবেন না',
                'AI Features ব্যবহার করতে পারবেন না',
                'Lost Customer Alert পাবেন না'
            ]
        },
        GROWTH: {
            name: 'Growth',
            price: 1499,
            emoji: '⭐',
            color: 'from-purple-500 to-indigo-600',
            tagline: 'বিজনেস গ্রোথের জন্য পারফেক্ট',
            features: [
                { icon: 'ph-check-circle', text: 'Starter এর সবকিছু', included: true },
                { icon: 'ph-users-three', text: 'Customer Segments (VIP, Lost, At Risk)', included: true },
                { icon: 'ph-bell-ringing', text: 'Customer Alerts', included: true },
                { icon: 'ph-brain', text: 'AI Offer Generator', included: true },
                { icon: 'ph-envelope', text: 'Message Templates', included: true },
                { icon: 'ph-confetti', text: 'Festival Campaigns', included: true },
                { icon: 'ph-clock-counter-clockwise', text: 'Campaign History', included: true },
                { icon: 'ph-chart-line-up', text: 'Revenue Prediction', included: false },
                { icon: 'ph-flask', text: 'A/B Testing', included: false }
            ],
            benefits: [
                '৬০% Lost Customer ফিরিয়ে আনুন',
                'At Risk Customer সেভ করুন',
                'স্মার্ট অফার দিয়ে বিক্রি বাড়ান'
            ]
        },
        ELITE: {
            name: 'Elite',
            price: 2999,
            emoji: '👑',
            color: 'from-amber-500 to-orange-500',
            tagline: 'সম্পূর্ণ AI-Powered Growth',
            features: [
                { icon: 'ph-check-circle', text: 'Growth এর সবকিছু', included: true },
                { icon: 'ph-chart-line-up', text: 'Revenue Prediction', included: true },
                { icon: 'ph-arrows-clockwise', text: 'Reorder Predictor', included: true },
                { icon: 'ph-flask', text: 'A/B Testing', included: true },
                { icon: 'ph-sparkle', text: 'Product Recommendations', included: true },
                { icon: 'ph-chart-bar', text: 'Advanced Analytics', included: true },
                { icon: 'ph-whatsapp-logo', text: 'WhatsApp Support', included: true },
                { icon: 'ph-phone', text: 'Priority Support', included: true }
            ],
            benefits: [
                '৮৫% পর্যন্ত Revenue Recovery',
                'AI দিয়ে ভবিষ্যৎ জানুন',
                'কে কখন কিনবে প্রেডিক্ট করুন',
                'A/B Testing দিয়ে বেস্ট মেসেজ খুঁজুন'
            ]
        }
    };

    // ============================================
    // APP GUIDE DATA
    // ============================================

    const APP_GUIDE = {
        gettingStarted: {
            title: '🚀 শুরু করুন',
            steps: [
                {
                    title: 'প্রোডাক্ট যোগ করুন',
                    description: 'Stock ট্যাবে গিয়ে আপনার প্রোডাক্ট যোগ করুন',
                    icon: 'ph-package'
                },
                {
                    title: 'অর্ডার নিন',
                    description: 'নিচের + বাটনে ক্লিক করে নতুন অর্ডার তৈরি করুন',
                    icon: 'ph-plus-circle'
                },
                {
                    title: 'ড্যাশবোর্ড দেখুন',
                    description: 'Home ট্যাবে আপনার বিক্রি ও প্রফিট দেখুন',
                    icon: 'ph-chart-pie'
                }
            ]
        },
        features: {
            title: '✨ ফিচার গাইড',
            sections: [
                {
                    name: 'Order Management',
                    description: 'অর্ডার নিন, ট্র্যাক করুন, ইনভয়েস পাঠান',
                    tier: 'STARTER',
                    steps: [
                        'নিচের + বাটনে ক্লিক করুন',
                        'কাস্টমার ও প্রোডাক্ট সিলেক্ট করুন',
                        'অর্ডার সেভ করুন',
                        'WhatsApp এ ইনভয়েস পাঠান'
                    ]
                },
                {
                    name: 'Customer Segments',
                    description: 'VIP, At Risk, Lost Customer চিনুন',
                    tier: 'GROWTH',
                    steps: [
                        'Dashboard এ Buyer Segments দেখুন',
                        'VIP Customer দের স্পেশাল অফার দিন',
                        'At Risk Customer দের ফলো-আপ করুন',
                        'Lost Customer দের Win-back মেসেজ পাঠান'
                    ]
                },
                {
                    name: 'Revenue Prediction',
                    description: 'AI দিয়ে আগামী মাসের আয় জানুন',
                    tier: 'ELITE',
                    steps: [
                        'Growth Hub এ যান',
                        'Revenue Prediction ক্লিক করুন',
                        'পরের ৩ মাসের পূর্বাভাস দেখুন',
                        'কোন কাস্টমার কিনবে জানুন'
                    ]
                },
                {
                    name: 'A/B Testing',
                    description: 'কোন মেসেজ ভালো কাজ করে পরীক্ষা করুন',
                    tier: 'ELITE',
                    steps: [
                        'Growth Hub > A/B Testing যান',
                        'নতুন টেস্ট তৈরি করুন',
                        'দুটি ভার্সন লিখুন',
                        'ট্র্যাক করুন কোনটা বেশি কাজ করে'
                    ]
                }
            ]
        },
        tips: {
            title: '💡 প্রো টিপস',
            items: [
                {
                    tip: 'প্রতিদিন Dashboard চেক করুন',
                    benefit: 'বিক্রি ট্র্যাক করুন, সমস্যা আগে ধরুন'
                },
                {
                    tip: 'Customer Alerts এ অ্যাকশন নিন',
                    benefit: 'Lost Customer ফেরান, At Risk সেভ করুন'
                },
                {
                    tip: 'Reorder Predictor ব্যবহার করুন',
                    benefit: 'কাস্টমার আগে মেসেজ পাঠান, বিক্রি বাড়ান'
                },
                {
                    tip: 'A/B Test করে মেসেজ অপটিমাইজ করুন',
                    benefit: '২-৩ গুণ বেশি রেসপন্স পান'
                }
            ]
        },
        faq: {
            title: '❓ সাধারণ প্রশ্ন',
            items: [
                {
                    q: 'ডেটা কি নিরাপদ?',
                    a: 'হ্যাঁ, সব ডেটা আপনার ফোনে ও Google Drive এ সেভ থাকে।'
                },
                {
                    q: 'প্ল্যান আপগ্রেড করলে ডেটা থাকবে?',
                    a: 'হ্যাঁ, আপনার সব ডেটা ঠিক থাকবে।'
                },
                {
                    q: 'রিফান্ড পলিসি কি?',
                    a: '৭ দিনের মধ্যে ফুল রিফান্ড।'
                },
                {
                    q: 'সাপোর্ট কিভাবে পাব?',
                    a: 'WhatsApp এ মেসেজ করুন, ২৪ ঘন্টায় রিপ্লাই পাবেন।'
                }
            ]
        }
    };

    console.log('✅ LuringSystem: Part 1 loaded (Data & Config)');

console.log('✅ LuringSystem: Part 1 loaded (Data & Config)');

    // ============================================
    // PART 2: UI COMPONENTS
    // ============================================

    // ============================================
    // TEASER PREVIEW MODALS
    // ============================================

    // Show Revenue Prediction Teaser
    async function showRevenuePredictionTeaser() {
        const teaser = await generateTeaserData();
        const data = teaser.revenuePrediction;
        const lossData = await calculatePotentialLoss();

        const modalHTML = `
            <div id="teaser-modal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onclick="if(event.target.id === 'teaser-modal') LuringSystem.closeTeaser()">
                <div class="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
                    
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <i class="ph ph-chart-line-up text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold">Revenue Prediction</h3>
                                <p class="text-indigo-200 text-sm">👑 ELITE Feature</p>
                            </div>
                        </div>
                    </div>

                    <!-- Preview Content (Blurred) -->
                    <div class="p-5">
                        <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4 relative overflow-hidden">
                            <!-- Blur Overlay -->
                            <div class="absolute inset-0 backdrop-blur-sm bg-white/50 flex items-center justify-center z-10">
                                <div class="text-center">
                                    <i class="ph ph-lock-key text-3xl text-indigo-600 mb-2"></i>
                                    <p class="text-sm font-bold text-slate-700">আনলক করুন</p>
                                </div>
                            </div>
                            
                            <!-- Teaser Data Behind Blur -->
                            <div class="text-center">
                                <p class="text-sm text-slate-600 mb-1">পরের মাসের সম্ভাব্য আয়</p>
                                <p class="text-3xl font-bold text-indigo-600">${data.hiddenValue}</p>
                                <p class="text-xs text-slate-500">${data.confidence}% কনফিডেন্স</p>
                            </div>
                        </div>

                        <!-- What You'll Get -->
                        <div class="mb-4">
                            <h4 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <i class="ph ph-sparkle text-amber-500"></i>
                                এই ফিচারে যা পাবেন:
                            </h4>
                            <ul class="space-y-2">
                                <li class="flex items-start gap-2 text-sm">
                                    <i class="ph ph-check-circle text-green-500 mt-0.5"></i>
                                    <span>পরের ৩ মাসের আয় পূর্বাভাস</span>
                                </li>
                                <li class="flex items-start gap-2 text-sm">
                                    <i class="ph ph-check-circle text-green-500 mt-0.5"></i>
                                    <span><strong>${data.likelyBuyers} জন</strong> কাস্টমার এই মাসে কিনতে পারে</span>
                                </li>
                                <li class="flex items-start gap-2 text-sm">
                                    <i class="ph ph-check-circle text-green-500 mt-0.5"></i>
                                    <span>গ্রোথ ট্রেন্ড ও সিজনাল প্যাটার্ন</span>
                                </li>
                                <li class="flex items-start gap-2 text-sm">
                                    <i class="ph ph-check-circle text-green-500 mt-0.5"></i>
                                    <span>সম্ভাব্য ক্রেতাদের লিস্ট</span>
                                </li>
                            </ul>
                        </div>

                        <!-- Loss Alert -->
                        <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                            <div class="flex items-start gap-3">
                                <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                    <i class="ph ph-warning text-red-600 text-xl"></i>
                                </div>
                                <div>
                                    <p class="font-bold text-red-800">আপনি হারাচ্ছেন!</p>
                                    <p class="text-sm text-red-700">এই ফিচার ছাড়া প্রতি মাসে আনুমানিক <strong>৳${lossData.losses.totalMonthly}</strong> মিস করছেন।</p>
                                </div>
                            </div>
                        </div>

                        <!-- Pricing -->
                        <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-4 text-center border border-amber-200">
                            <p class="text-slate-600 text-sm mb-1">ELITE প্ল্যান</p>
                            <div class="flex items-center justify-center gap-2">
                                <span class="text-slate-400 line-through text-lg">৳৪,৯৯৯</span>
                                <span class="text-3xl font-bold text-amber-600">৳২,৯৯৯</span>
                                <span class="text-slate-500">/মাস</span>
                            </div>
                            <p class="text-green-600 text-sm font-medium mt-1">🎉 ৪০% ছাড়!</p>
                        </div>

                        <!-- CTA Buttons -->
                        <div class="space-y-2">
                            <button onclick="LuringSystem.initiateUpgrade('ELITE')" 
                                    class="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                <i class="ph ph-rocket-launch"></i>
                                এখনই আপগ্রেড করুন
                            </button>
                            <button onclick="LuringSystem.closeTeaser()" 
                                    class="w-full text-slate-500 py-2 text-sm hover:text-slate-700">
                                পরে দেখব
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        `;

        closeTeaser();
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Show Customer Segments Teaser
    async function showSegmentsTeaser() {
        const teaser = await generateTeaserData();
        const data = teaser.customerSegments;
        const lossData = await calculatePotentialLoss();

        const modalHTML = `
            <div id="teaser-modal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onclick="if(event.target.id === 'teaser-modal') LuringSystem.closeTeaser()">
                <div class="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
                    
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <i class="ph ph-users-three text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold">Customer Segments</h3>
                                <p class="text-purple-200 text-sm">⭐ GROWTH Feature</p>
                            </div>
                        </div>
                    </div>

                    <!-- Preview Content -->
                    <div class="p-5">
                        <!-- Segment Preview -->
                        <div class="grid grid-cols-4 gap-2 mb-4">
                            <div class="bg-amber-50 rounded-xl p-3 text-center border border-amber-200 relative">
                                <div class="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                    <i class="ph ph-lock text-white text-xs"></i>
                                </div>
                                <p class="text-xl mb-1">👑</p>
                                <p class="text-lg font-bold text-amber-600">${data.vip}</p>
                                <p class="text-[10px] text-slate-500">VIP</p>
                            </div>
                            <div class="bg-orange-50 rounded-xl p-3 text-center border border-orange-200 relative">
                                <div class="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                    <i class="ph ph-lock text-white text-xs"></i>
                                </div>
                                <p class="text-xl mb-1">⚠️</p>
                                <p class="text-lg font-bold text-orange-600">${data.atRisk}</p>
                                <p class="text-[10px] text-slate-500">At Risk</p>
                            </div>
                            <div class="bg-red-50 rounded-xl p-3 text-center border border-red-200 relative">
                                <div class="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                    <i class="ph ph-lock text-white text-xs"></i>
                                </div>
                                <p class="text-xl mb-1">💔</p>
                                <p class="text-lg font-bold text-red-600">${data.lost}</p>
                                <p class="text-[10px] text-slate-500">Lost</p>
                            </div>
                            <div class="bg-green-50 rounded-xl p-3 text-center border border-green-200 relative">
                                <div class="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                    <i class="ph ph-lock text-white text-xs"></i>
                                </div>
                                <p class="text-xl mb-1">🆕</p>
                                <p class="text-lg font-bold text-green-600">${data.new}</p>
                                <p class="text-[10px] text-slate-500">New</p>
                            </div>
                        </div>

                        <!-- What You're Missing -->
                        <div class="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 mb-4 border border-red-100">
                            <h4 class="font-bold text-red-800 mb-2 flex items-center gap-2">
                                <i class="ph ph-warning-circle"></i>
                                আপনি যা মিস করছেন:
                            </h4>
                            <ul class="space-y-2 text-sm text-red-700">
                                <li class="flex items-start gap-2">
                                    <span>💔</span>
                                    <span><strong>${data.lost} জন Lost Customer</strong> - ফেরানো সম্ভব!</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <span>⚠️</span>
                                    <span><strong>${data.atRisk} জন At Risk</strong> - এখনই অ্যাকশন নিন!</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <span>💰</span>
                                    <span>প্রতি মাসে <strong>৳${lossData.losses.totalMonthly}</strong> হারাচ্ছেন!</span>
                                </li>
                            </ul>
                        </div>

                        <!-- Benefits -->
                        <div class="mb-4">
                            <h4 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <i class="ph ph-sparkle text-purple-500"></i>
                                GROWTH প্ল্যানে পাবেন:
                            </h4>
                            <ul class="space-y-2">
                                <li class="flex items-start gap-2 text-sm">
                                    <i class="ph ph-check-circle text-green-500 mt-0.5"></i>
                                    <span>সব Customer Segment দেখুন ও ম্যানেজ করুন</span>
                                </li>
                                <li class="flex items-start gap-2 text-sm">
                                    <i class="ph ph-check-circle text-green-500 mt-0.5"></i>
                                    <span>VIP দের স্পেশাল অফার পাঠান</span>
                                </li>
                                <li class="flex items-start gap-2 text-sm">
                                    <i class="ph ph-check-circle text-green-500 mt-0.5"></i>
                                    <span>At Risk দের সেভ করুন</span>
                                </li>
                                <li class="flex items-start gap-2 text-sm">
                                    <i class="ph ph-check-circle text-green-500 mt-0.5"></i>
                                    <span>Lost Customer ফিরিয়ে আনুন</span>
                                </li>
                            </ul>
                        </div>

                        <!-- Pricing -->
                        <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-4 text-center border border-purple-200">
                            <p class="text-slate-600 text-sm mb-1">GROWTH প্ল্যান</p>
                            <div class="flex items-center justify-center gap-2">
                                <span class="text-slate-400 line-through text-lg">৳২,৪৯৯</span>
                                <span class="text-3xl font-bold text-purple-600">৳১,৪৯৯</span>
                                <span class="text-slate-500">/মাস</span>
                            </div>
                            <p class="text-green-600 text-sm font-medium mt-1">🎉 ৪০% ছাড়!</p>
                        </div>

                        <!-- CTA -->
                        <div class="space-y-2">
                            <button onclick="LuringSystem.initiateUpgrade('GROWTH')" 
                                    class="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                <i class="ph ph-rocket-launch"></i>
                                GROWTH তে আপগ্রেড করুন
                            </button>
                            <button onclick="LuringSystem.closeTeaser()" 
                                    class="w-full text-slate-500 py-2 text-sm hover:text-slate-700">
                                পরে দেখব
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        `;

        closeTeaser();
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // ============================================
    // LOSS CALCULATOR MODAL
    // ============================================

    async function showLossCalculator() {
        const lossData = await calculatePotentialLoss();
        const currentTier = AppState.userTier || 'STARTER';

        const modalHTML = `
            <div id="teaser-modal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onclick="if(event.target.id === 'teaser-modal') LuringSystem.closeTeaser()">
                <div class="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
                    
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-red-600 to-rose-600 p-5 text-white">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <i class="ph ph-chart-line-down text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold">Loss Calculator</h3>
                                <p class="text-red-200 text-sm">আপনি প্রতি মাসে কত হারাচ্ছেন?</p>
                            </div>
                        </div>
                    </div>

                    <!-- Loss Breakdown -->
                    <div class="p-5">
                        <!-- Big Loss Number -->
                        <div class="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 mb-4 text-center border-2 border-red-200">
                            <p class="text-slate-600 text-sm mb-2">আপনার মাসিক সম্ভাব্য ক্ষতি</p>
                            <p class="text-4xl font-bold text-red-600">৳${lossData.losses.totalMonthly.toLocaleString()}</p>
                            <p class="text-slate-500 text-sm mt-2">বছরে: <span class="font-bold text-red-600">৳${lossData.losses.totalYearly.toLocaleString()}</span></p>
                        </div>

                        <!-- Breakdown -->
                        <div class="space-y-3 mb-4">
                            <h4 class="font-bold text-slate-800 flex items-center gap-2">
                                <i class="ph ph-list-bullets"></i>
                                কিভাবে হারাচ্ছেন:
                            </h4>
                            
                            <div class="bg-red-50 rounded-xl p-4 border border-red-100">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        💔 Lost Customers (${lossData.stats.lostCustomers} জন)
                                    </span>
                                    <span class="font-bold text-red-600">৳${lossData.losses.fromLostCustomers.toLocaleString()}</span>
                                </div>
                                <p class="text-xs text-slate-500">৩০% ফেরানো সম্ভব Customer Alerts দিয়ে</p>
                            </div>

                            <div class="bg-orange-50 rounded-xl p-4 border border-orange-100">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        ⚠️ At Risk Customers (${lossData.stats.atRiskCustomers} জন)
                                    </span>
                                    <span class="font-bold text-orange-600">৳${lossData.losses.fromAtRiskCustomers.toLocaleString()}</span>
                                </div>
                                <p class="text-xs text-slate-500">৫০% সেভ করা সম্ভব সময়মত ফলো-আপে</p>
                            </div>

                            <div class="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        🔄 Missed Reorders (${lossData.stats.missedReorders} জন)
                                    </span>
                                    <span class="font-bold text-yellow-600">৳${lossData.losses.fromMissedReorders.toLocaleString()}</span>
                                </div>
                                <p class="text-xs text-slate-500">৪০% Reorder করবে রিমাইন্ডার পেলে</p>
                            </div>
                        </div>

                        <!-- Recovery Potential -->
                        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-200">
                            <h4 class="font-bold text-green-800 mb-3 flex items-center gap-2">
                                <i class="ph ph-trend-up"></i>
                                Recovery Potential:
                            </h4>
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-slate-700">⭐ GROWTH প্ল্যানে:</span>
                                    <span class="font-bold text-green-600">+৳${lossData.recovery.withGrowth.toLocaleString()}/মাস</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-slate-700">👑 ELITE প্ল্যানে:</span>
                                    <span class="font-bold text-green-600">+৳${lossData.recovery.withElite.toLocaleString()}/মাস</span>
                                </div>
                            </div>
                        </div>

                        <!-- ROI Calculation -->
                        <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-4 border border-amber-200">
                            <h4 class="font-bold text-amber-800 mb-2 flex items-center gap-2">
                                <i class="ph ph-calculator"></i>
                                ROI ক্যালকুলেশন:
                            </h4>
                            <div class="text-sm text-slate-700 space-y-1">
                                <p>👑 ELITE Cost: ৳২,৯৯৯/মাস</p>
                                <p>💰 Recovery: ৳${lossData.recovery.withElite.toLocaleString()}/মাস</p>
                                <p class="font-bold text-green-600 text-lg pt-2 border-t border-amber-200">
                                    📈 Net Gain: ৳${(lossData.recovery.withElite - 2999).toLocaleString()}/মাস
                                </p>
                            </div>
                        </div>

                        <!-- CTA -->
                        <div class="space-y-2">
                            <button onclick="LuringSystem.initiateUpgrade('ELITE')" 
                                    class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                <i class="ph ph-trend-up"></i>
                                ক্ষতি বন্ধ করুন - আপগ্রেড করুন
                            </button>
                            <button onclick="LuringSystem.closeTeaser()" 
                                    class="w-full text-slate-500 py-2 text-sm hover:text-slate-700">
                                পরে দেখব
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        `;

        closeTeaser();
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // ============================================
    // APP GUIDE MODAL
    // ============================================

    function showAppGuide() {
        const guide = APP_GUIDE;
        const currentTier = AppState.userTier || 'STARTER';

        const modalHTML = `
            <div id="teaser-modal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onclick="if(event.target.id === 'teaser-modal') LuringSystem.closeTeaser()">
                <div class="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
                    
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-blue-600 to-cyan-600 p-5 text-white">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <i class="ph ph-book-open text-2xl"></i>
                                </div>
                                <div>
                                    <h3 class="text-xl font-bold">App Guide</h3>
                                    <p class="text-blue-200 text-sm">কিভাবে ব্যবহার করবেন</p>
                                </div>
                            </div>
                            <button onclick="LuringSystem.closeTeaser()" class="text-white/80 hover:text-white">
                                <i class="ph ph-x text-2xl"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Guide Content -->
                    <div class="p-5 max-h-[60vh] overflow-y-auto">
                        
                        <!-- Getting Started -->
                        <div class="mb-6">
                            <h4 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <i class="ph ph-rocket text-blue-500"></i>
                                ${guide.gettingStarted.title}
                            </h4>
                            <div class="space-y-3">
                                ${guide.gettingStarted.steps.map((step, i) => `
                                    <div class="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                            <span class="text-blue-600 font-bold text-sm">${i + 1}</span>
                                        </div>
                                        <div>
                                            <p class="font-medium text-slate-800">${step.title}</p>
                                            <p class="text-sm text-slate-500">${step.description}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Features Guide -->
                        <div class="mb-6">
                            <h4 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <i class="ph ph-star text-amber-500"></i>
                                ${guide.features.title}
                            </h4>
                            <div class="space-y-3">
                                ${guide.features.sections.map(section => {
                                    const isLocked = (section.tier === 'GROWTH' && currentTier === 'STARTER') ||
                                                    (section.tier === 'ELITE' && currentTier !== 'ELITE');
                                    const tierBadge = section.tier === 'ELITE' ? '👑' : section.tier === 'GROWTH' ? '⭐' : '🌱';
                                    
                                    return `
                                        <div class="bg-slate-50 rounded-xl p-4 ${isLocked ? 'opacity-70' : ''}">
                                            <div class="flex items-center justify-between mb-2">
                                                <p class="font-bold text-slate-800">${section.name}</p>
                                                <span class="text-xs px-2 py-0.5 rounded-full ${
                                                    section.tier === 'ELITE' ? 'bg-amber-100 text-amber-700' :
                                                    section.tier === 'GROWTH' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-green-100 text-green-700'
                                                }">${tierBadge} ${section.tier}</span>
                                            </div>
                                            <p class="text-sm text-slate-500 mb-2">${section.description}</p>
                                            ${isLocked ? `
                                                <button onclick="LuringSystem.showUpgradeForFeature('${section.tier}')" 
                                                        class="text-xs text-purple-600 font-medium flex items-center gap-1">
                                                    <i class="ph ph-lock"></i> আনলক করুন
                                                </button>
                                            ` : `
                                                <details class="text-sm">
                                                    <summary class="text-blue-600 cursor-pointer font-medium">স্টেপ দেখুন</summary>
                                                    <ol class="mt-2 ml-4 list-decimal text-slate-600 space-y-1">
                                                        ${section.steps.map(step => `<li>${step}</li>`).join('')}
                                                    </ol>
                                                </details>
                                            `}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <!-- Pro Tips -->
                        <div class="mb-6">
                            <h4 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <i class="ph ph-lightbulb text-yellow-500"></i>
                                ${guide.tips.title}
                            </h4>
                            <div class="space-y-2">
                                ${guide.tips.items.map(item => `
                                    <div class="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                                        <p class="font-medium text-slate-800 text-sm">${item.tip}</p>
                                        <p class="text-xs text-slate-500 mt-1">💡 ${item.benefit}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- FAQ -->
                        <div class="mb-6">
                            <h4 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <i class="ph ph-question text-green-500"></i>
                                ${guide.faq.title}
                            </h4>
                            <div class="space-y-2">
                                ${guide.faq.items.map(item => `
                                    <details class="bg-slate-50 rounded-xl p-3">
                                        <summary class="font-medium text-slate-800 cursor-pointer">${item.q}</summary>
                                        <p class="text-sm text-slate-600 mt-2">${item.a}</p>
                                    </details>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Support -->
                        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                            <h4 class="font-bold text-green-800 mb-2 flex items-center gap-2">
                                <i class="ph ph-headset"></i>
                                সাহায্য দরকার?
                            </h4>
                            <p class="text-sm text-slate-600 mb-3">আমাদের সাপোর্ট টিম ২৪ ঘন্টা আপনার পাশে আছে!</p>
                            <button onclick="LuringSystem.contactSupport()" 
                                    class="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                <i class="ph ph-whatsapp-logo"></i>
                                WhatsApp এ যোগাযোগ
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        `;

        closeTeaser();
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // ============================================
    // BENEFITS SHOWCASE MODAL
    // ============================================

    function showBenefitsShowcase(targetTier = 'GROWTH') {
        const benefits = PLAN_BENEFITS[targetTier];
        const currentTier = AppState.userTier || 'STARTER';

        const modalHTML = `
            <div id="teaser-modal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onclick="if(event.target.id === 'teaser-modal') LuringSystem.closeTeaser()">
                <div class="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
                    
                    <!-- Header -->
                    <div class="bg-gradient-to-r ${benefits.color} p-5 text-white">
                        <div class="flex items-center gap-3">
                            <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
                                ${benefits.emoji}
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold">${benefits.name}</h3>
                                <p class="text-white/80 text-sm">${benefits.tagline}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-5 max-h-[60vh] overflow-y-auto">
                        
                        <!-- Price -->
                        <div class="text-center mb-6">
                            <div class="flex items-center justify-center gap-2">
                                <span class="text-slate-400 line-through text-xl">৳${Math.round(benefits.price * 1.7)}</span>
                                <span class="text-4xl font-bold text-slate-800">৳${benefits.price}</span>
                                <span class="text-slate-500">/মাস</span>
                            </div>
                            <p class="text-green-600 font-medium mt-1">🎉 ৪০% ছাড়!</p>
                        </div>

                        <!-- Features List -->
                        <div class="mb-6">
                            <h4 class="font-bold text-slate-800 mb-3">যা যা পাবেন:</h4>
                            <div class="space-y-2">
                                ${benefits.features.map(f => `
                                    <div class="flex items-center gap-3 ${f.included ? '' : 'opacity-40'}">
                                        <i class="ph ${f.included ? 'ph-check-circle text-green-500' : 'ph-x-circle text-slate-400'}"></i>
                                        <i class="ph ${f.icon} text-slate-600"></i>
                                        <span class="text-sm ${f.included ? 'text-slate-700' : 'text-slate-400 line-through'}">${f.text}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        ${benefits.benefits ? `
                            <!-- Key Benefits -->
                            <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                                <h4 class="font-bold text-green-800 mb-2 flex items-center gap-2">
                                    <i class="ph ph-trend-up"></i>
                                    মূল সুবিধা:
                                </h4>
                                <ul class="space-y-2">
                                    ${benefits.benefits.map(b => `
                                        <li class="flex items-start gap-2 text-sm text-green-700">
                                            <i class="ph ph-check text-green-600 mt-0.5"></i>
                                            <span>${b}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        ${benefits.limitations ? `
                            <!-- Limitations -->
                            <div class="bg-red-50 rounded-xl p-4 mb-6 border border-red-100">
                                <h4 class="font-bold text-red-800 mb-2 flex items-center gap-2">
                                    <i class="ph ph-warning"></i>
                                    সীমাবদ্ধতা:
                                </h4>
                                <ul class="space-y-1">
                                    ${benefits.limitations.map(l => `
                                        <li class="flex items-start gap-2 text-sm text-red-700">
                                            <i class="ph ph-x text-red-500 mt-0.5"></i>
                                            <span>${l}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        <!-- Plan Comparison -->
                        <div class="flex gap-2 mb-6">
                            ${['STARTER', 'GROWTH', 'ELITE'].map(tier => {
                                const plan = PLAN_BENEFITS[tier];
                                const isCurrentView = tier === targetTier;
                                const isCurrent = tier === currentTier;
                                return `
                                    <button onclick="LuringSystem.showBenefitsShowcase('${tier}')" 
                                            class="flex-1 p-3 rounded-xl text-center border-2 transition-all ${
                                                isCurrentView 
                                                    ? 'border-slate-800 bg-slate-800 text-white' 
                                                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                                            }">
                                        <p class="text-lg">${plan.emoji}</p>
                                        <p class="text-xs font-bold">${plan.name}</p>
                                        <p class="text-[10px]">৳${plan.price}</p>
                                        ${isCurrent ? '<p class="text-[9px] mt-1 text-green-500">বর্তমান</p>' : ''}
                                    </button>
                                `;
                            }).join('')}
                        </div>

                        <!-- CTA -->
                        ${currentTier !== targetTier && (
                            (currentTier === 'STARTER') || 
                            (currentTier === 'GROWTH' && targetTier === 'ELITE')
                        ) ? `
                            <button onclick="LuringSystem.initiateUpgrade('${targetTier}')" 
                                    class="w-full bg-gradient-to-r ${benefits.color} text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                <i class="ph ph-rocket-launch"></i>
                                ${targetTier} এ আপগ্রেড করুন
                            </button>
                        ` : `
                            <div class="text-center text-green-600 font-bold py-3">
                                ✅ আপনি এই প্ল্যানে আছেন!
                            </div>
                        `}

                    </div>

                </div>
            </div>
        `;

        closeTeaser();
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function closeTeaser() {
        const modal = document.getElementById('teaser-modal');
        if (modal) modal.remove();
    }

    function initiateUpgrade(tier) {
        const message = `আসসালামু আলাইকুম!\n\nআমি BizMind "${tier}" প্ল্যান নিতে চাই।\n\n📱 Current Plan: ${AppState.userTier || 'N/A'}`;
        const whatsappNumber = '8801XXXXXXXXX'; // Replace with your number
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
        closeTeaser();
    }

    function showUpgradeForFeature(tier) {
        closeTeaser();
        showBenefitsShowcase(tier);
    }

    function contactSupport() {
        const message = `আসসালামু আলাইকুম!\n\nBizMind App সম্পর্কে সাহায্য দরকার।`;
        const whatsappNumber = '8801XXXXXXXXX'; // Replace with your number
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    }

    console.log('✅ LuringSystem: Part 2 loaded (UI Components)');

    // ============================================
    // PUBLIC API
    // ============================================

    return {
        // Config
        CONFIG,
        PLAN_BENEFITS,
        APP_GUIDE,

        // Data Functions
        generateTeaserData,
        calculatePotentialLoss,

        // Teaser Modals
        showRevenuePredictionTeaser,
        showSegmentsTeaser,

        // Main Modals
        showLossCalculator,
        showAppGuide,
        showBenefitsShowcase,

        // Helpers
        closeTeaser,
        initiateUpgrade,
        showUpgradeForFeature,
        contactSupport
    };

})();

// Make globally available
window.LuringSystem = LuringSystem;

console.log('🎯 LuringSystem v1.0 fully loaded!');