// ============================================
// 🚀 BIZMIND GROWTH OS - PART 1 (State & Dashboard)
// ============================================

// 1. STATE & ROUTER
const AppState = {
    currentView: 'dashboard',
    userTier: 'ELITE',
    currency: '৳'
};

// ============================================
// TIER FEATURES CONFIGURATION
// ============================================

const TIER_FEATURES = {
    STARTER: [
        'unlimited_orders',
        'unlimited_customers',
        'unlimited_products',
        'order_management',
        'invoice',
        'expense_tracking',
        'google_backup',
        'basic_customer_list',
        'basic_dashboard'
    ],
    GROWTH: [
        'customer_segments',
        'customer_health',
        'customer_alerts',
        'customer_notes',
        'offer_ai',
        'message_templates',
        'festival_campaigns',
        'campaign_history',
        'bulk_whatsapp'
    ],
    ELITE: [
        'revenue_prediction',
        'reorder_predictor',
        'ab_testing',
        'product_recommendations',
        'advanced_analytics',
        'whatsapp_support',
        // ═══════════════════════════════════════
        // NEW ELITE FEATURES (Dec 2024)
        // ═══════════════════════════════════════
        'daily_briefing',       // ✅ Just completed
        'profit_leakage',       // ⏳ Building next
        'bundle_suggester'      // ⏳ Coming soon
    ]
};

function hasFeature(featureName) {
    const currentTier = AppState.userTier || 'STARTER';
    
    if (currentTier === 'ELITE') {
        return true;
    }
    
    if (currentTier === 'GROWTH') {
        return TIER_FEATURES.STARTER.includes(featureName) || 
               TIER_FEATURES.GROWTH.includes(featureName);
    }
    
    return TIER_FEATURES.STARTER.includes(featureName);
}

function getRequiredTier(featureName) {
    if (TIER_FEATURES.STARTER.includes(featureName)) return 'STARTER';
    if (TIER_FEATURES.GROWTH.includes(featureName)) return 'GROWTH';
    if (TIER_FEATURES.ELITE.includes(featureName)) return 'ELITE';
    return 'ELITE';
}

function showUpgradePrompt(featureName, requiredTier = 'GROWTH') {
    
    // Feature display names
    const featureNames = {
        'revenue_prediction': 'Revenue Prediction',
        'reorder_predictor': 'Reorder Predictor',
        'ab_testing': 'A/B Testing',
        'product_recommendations': 'Product Recommendations',
        'daily_briefing': 'Daily Briefing',
        'profit_leakage': 'Profit Leakage',
        'bundle_suggester': 'Bundle Suggester',
        'customer_segments': 'Customer Segments',
        'customer_alerts': 'Customer Alerts',
        'offer_ai': 'Offer AI',
        'message_templates': 'Message Templates',
        'festival_campaigns': 'Festival Campaigns',
        'campaign_history': 'Campaign History'
    };
    
    // Determine required tier
    const eliteFeatures = ['revenue_prediction', 'reorder_predictor', 'ab_testing', 
                          'product_recommendations', 'daily_briefing', 'profit_leakage', 
                          'bundle_suggester', 'advanced_analytics'];
    
    const actualTier = eliteFeatures.includes(featureName) ? 'ELITE' : 'GROWTH';
    const displayName = featureNames[featureName] || featureName;
    
    // Remove existing modal
    const existingModal = document.getElementById('upgrade-modal');
    if (existingModal) existingModal.remove();
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.id = 'upgrade-modal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            
            <div class="w-16 h-16 ${actualTier === 'ELITE' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-purple-500 to-indigo-600'} rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl">${actualTier === 'ELITE' ? '👑' : '⭐'}</span>
            </div>
            
            <h3 class="text-xl font-bold text-gray-800">🔒 ${displayName}</h3>
            
            <p class="text-gray-600 mt-2">
                এই ফিচার ব্যবহার করতে <strong>${actualTier}</strong> প্ল্যানে আপগ্রেড করুন
            </p>
            
            <div class="bg-gray-50 rounded-xl p-4 mt-4 text-left">
                <p class="text-sm font-medium text-gray-700 mb-2">✨ ${actualTier} প্ল্যানে যা পাবেন:</p>
                <ul class="text-sm text-gray-600 space-y-1">
                    ${actualTier === 'ELITE' ? `
                        <li>✅ Daily Briefing - আজকের করণীয়</li>
                        <li>✅ Profit Leakage - টাকা কোথায় যাচ্ছে</li>
                        <li>✅ Revenue Prediction - আয়ের পূর্বাভাস</li>
                        <li>✅ A/B Testing - মেসেজ টেস্টিং</li>
                        <li>✅ Reorder Predictor - পুনরায় কেনার সময়</li>
                    ` : `
                        <li>✅ Customer Segments - VIP চিহ্নিত</li>
                        <li>✅ Smart Offers - AI অফার</li>
                        <li>✅ Message Templates - রেডি মেসেজ</li>
                        <li>✅ Festival Campaigns - উৎসব ক্যাম্পেইন</li>
                    `}
                </ul>
            </div>
            
            <div class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p class="text-red-700 text-sm">
                    ⚠️ এই ফিচার ছাড়া আপনি প্রতি মাসে টাকা হারাচ্ছেন!
                </p>
            </div>
            
            <div class="mt-6 space-y-3">
                <a href="https://wa.me/8801700524647?text=আমি%20Munafa Zen%20${actualTier}%20Plan%20নিতে%20চাই" 
                   target="_blank"
                   class="flex items-center justify-center gap-2 w-full ${actualTier === 'ELITE' ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-purple-500 to-indigo-600'} text-white py-3 rounded-xl font-bold hover:opacity-90 transition">
                    <i class="ph-bold ph-whatsapp-logo text-xl"></i>
                    ${actualTier} তে আপগ্রেড করুন
                </a>
                <button onclick="document.getElementById('upgrade-modal').remove()" 
                        class="block w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition">
                    পরে দেখব
                </button>
            </div>
            
            <p class="text-gray-400 text-xs mt-4">
                ${actualTier === 'ELITE' ? '৳2,999/মাস' : '৳1,499/মাস'}
            </p>
            
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function closeUpgradeModal() {
    const modal = document.getElementById('upgrade-modal');
    if (modal) modal.remove();
}

function initiateUpgrade(tier) {
    const message = `আসসালামু আলাইকুম!\n\nআমি Munafa Zen "${tier}" প্ল্যান নিতে চাই।\n\n📱 Current Plan: ${AppState.userTier || 'N/A'}`;
    
    // Replace with your WhatsApp number
    const whatsappNumber = '01700524647';
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    closeUpgradeModal();
}

console.log('✅ Tier Features System Loaded');

// ... rest of your existing code continues ...



// ✅ CORRECTED: No slashes at the start!
const AUTH_API = 'https://script.google.com/macros/s/AKfycbw3ozlur3z5Aoju9RgQkV0ml-LlfSDeH3hWX8GFI18YIWmoJ-lieg0_vq4dq50SY6H90Q/exec';

const BACKUP_API = 'https://script.google.com/macros/s/AKfycbxjf3tvL031yMSpidMqqTkrvim_G3euKOKAblHL5gfDcNNCIeWof06xWRpWDRs6jPrVFg/exec';

async function router(viewName) {
    // Growth Hub is accessible to GROWTH and ELITE users
    // STARTER users see everything locked inside
    // Individual features are locked/unlocked inside getGrowthHubHTML()

    AppState.currentView = viewName;
    
    // Update UI
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const icon = btn.querySelector('i');
        const text = btn.querySelector('span');
        if (btn.dataset.target === viewName) {
            btn.classList.add('active');
            if(text) text.classList.replace('text-slate-400', 'text-brand-600');
            if(icon) { icon.classList.remove('ph-bold', 'text-slate-400'); icon.classList.add('ph-fill', 'text-brand-600'); }
        } else {
            btn.classList.remove('active');
            if(text) text.classList.replace('text-brand-600', 'text-slate-400');
            if(icon) { icon.classList.remove('ph-fill', 'text-brand-600'); icon.classList.add('ph-bold', 'text-slate-400'); }
        }
    });

    renderView(viewName);
}

// 3. VIEW RENDERER (Fixed Logic)
async function renderView(viewName) {
    
    // ═══════════════════════════════════════════════════════════
    // MODAL ROUTES - Handle FIRST (no loading spinner needed)
    // ═══════════════════════════════════════════════════════════
    
    if (viewName === 'templates') {
        if (typeof TemplatePicker !== 'undefined') TemplatePicker.open();
        return;
    }
    
    if (viewName === 'festival_campaigns') {
        if (typeof FestivalCampaigns !== 'undefined') FestivalCampaigns.open();
        return;
    }
    
    if (viewName === 'campaign_history') {
        if (typeof CampaignHistory !== 'undefined') CampaignHistory.open();
        return;
    }
    
    if (viewName === 'offer_wizard') {
        if (typeof OfferWizard !== 'undefined') OfferWizard.open();
        return;
    }

if (viewName === 'ab_testing') {
    if (typeof ABTesting !== 'undefined') ABTesting.open();
    return;
}
    
    // ═══════════════════════════════════════════════════════════
    // PAGE ROUTES - Show loading spinner, then load content
    // ═══════════════════════════════════════════════════════════
    
    const content = document.getElementById('app-content');
    content.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-slate-400 fade-in"><i class="ph ph-spinner animate-spin text-3xl text-brand-600"></i></div>`;

    try {
        await new Promise(r => setTimeout(r, 50));
        let html = '';

        if (viewName === 'dashboard') {
            html = await getDashboardHTML();
            setTimeout(initDashboardScripts, 100);
            
        } else if (viewName === 'orders') {
            html = await getOrderListHTML();
            
        } else if (viewName === 'growth') {
            html = await getGrowthHubHTML();
            
        } else if (viewName === 'daily_briefing') {
            if (typeof DailyBriefing !== 'undefined') {
                html = `<div id="daily-briefing-container"></div>`;
                setTimeout(() => {
                    DailyBriefing.render();
                }, 10);
            } else {
                html = `<div class="p-4 text-center text-red-500">Daily Briefing module not loaded</div>`;
            }
            
        } else if (viewName === 'inventory') {
            html = await getInventoryHTML();
            
        } else if (viewName === 'customers') {
            html = await getCustomerListHTML();
            
        } else if (viewName === 'menu') {
            html = await getSettingsHTML();
            
        } else if (viewName === 'expenses_detail') {
            html = await getExpenseBreakdownHTML();
            
        } else if (viewName === 'reorder_predictor') {
            html = getReorderPredictorHTML();
            setTimeout(() => {
                if (typeof ReorderPredictor !== 'undefined') {
                    ReorderPredictor.init('reorder-predictor-container');
                } else {
                    console.error('ReorderPredictor not loaded yet!');
                    document.getElementById('reorder-predictor-container').innerHTML = `
                        <div class="text-center py-12 text-red-500">
                            <i class="ph ph-warning text-4xl mb-2"></i>
                            <p>Error: ReorderPredictor লোড হয়নি</p>
                            <button onclick="location.reload()" class="mt-4 bg-brand-600 text-white px-4 py-2 rounded-lg">
                                Reload করুন
                            </button>
                        </div>
                    `;
                }
            }, 100);
            
        } else if (viewName === 'customer_alerts') {
            html = await getCustomerAlertsHTML();
            
        } else if (viewName === 'product_recommendations') {
            html = getProductRecommendationsHTML();
            setTimeout(() => {
                if (typeof ProductRecommendations !== 'undefined') {
                    ProductRecommendations.init('product-recommendations-container');
                } else {
                    console.error('ProductRecommendations not loaded yet!');
                    document.getElementById('product-recommendations-container').innerHTML = `
                        <div class="text-center py-12 text-red-500">
                            <i class="ph ph-warning text-4xl mb-2"></i>
                            <p>Error: ProductRecommendations লোড হয়নি</p>
                            <button onclick="location.reload()" class="mt-4 bg-brand-600 text-white px-4 py-2 rounded-lg">
                                Reload করুন
                            </button>
                        </div>
                    `;
                }
            }, 100);
            
         } else if (viewName === 'ab_testing') {
            // Open A/B Testing as modal (don't change page)
            if (typeof ABTesting !== 'undefined') {
                ABTesting.open();
            } else {
                alert('❌ A/B Testing লোড হয়নি। Page reload করুন।');
            }
            return; // Exit function completely - don't render anything
            
	} else if (viewName === 'bundle_suggester') {
    if (typeof BundleSuggester !== 'undefined') {
        html = `<div id="bundle-suggester-container"></div>`;
        setTimeout(() => {
            BundleSuggester.render();
        }, 10);
    } else {
        html = `<div class="p-6 text-center text-red-500">Bundle Suggester module not loaded</div>`;
    }

} else if (viewName === 'profit_leakage') {
    	if (typeof ProfitLeakage !== 'undefined') {
        html = `<div id="profit-leakage-container"></div>`;
        setTimeout(() => {
            ProfitLeakage.render();
        }, 10);
    } else {
        html = `<div class="p-6 text-center text-red-500">Profit Leakage module not loaded</div>`;
    }

	} else if (viewName === 'revenue_prediction') {
            if (typeof RevenuePrediction !== 'undefined') {
                html = `<div id="revenue-prediction-container"></div>`;
                setTimeout(() => {
                    RevenuePrediction.init('revenue-prediction-container');
                }, 100);
            } else {
                html = `<div class="p-6 text-center text-red-500">Revenue Prediction module not loaded</div>`;
            }
            
        } else {
            html = `<div class="p-6 text-center">Page Not Found</div>`;
        }
        
        content.innerHTML = `<div class="fade-in">${html}</div>`;
        
    } catch (error) {
        console.error(error);
        content.innerHTML = `<div class="p-6 text-center text-red-500">Error: ${error.message}</div>`;
    }
}
// ============================================
// 📊 VIEW: DASHBOARD (WITH TIER LOCKING)
// ============================================

async function getDashboardHTML() {
    const period = AppState.dashboardPeriod || 'week';
    const currentTier = AppState.userTier || 'STARTER';
    let stats = { sales: 0, profit: 0, orders: 0, expenses: 0 };
    let bestSellers = [];
    
    try {
        if(typeof db !== 'undefined') {
            const allOrders = await db.orders.toArray();
            const allExpenses = await db.expenses.toArray(); 
            
            const filteredOrders = filterOrdersByDate(allOrders, period);
            const filteredExpenses = filterOrdersByDate(allExpenses, period); 
            
            filteredOrders.forEach(o => {
                stats.sales += (o.grandTotal || 0);
                stats.profit += (o.netProfit || 0);
            });
            
            filteredExpenses.forEach(e => stats.expenses += (e.amount || 0));
            stats.orders = filteredOrders.length;
            bestSellers = getBestSellers(filteredOrders);
        }
    } catch(e) {}

    const trueProfit = stats.profit - stats.expenses;

    // ═══════════════════════════════════════════════════════════
    // STARTER WIDGETS - Load data for widgets
    // ═══════════════════════════════════════════════════════════
    let dailySummaryWidget = '';
let limitedAlertWidget = '';
let expiryAlertWidget = '';  // ✅ ADD THIS LINE

if (typeof StarterFeatures !== 'undefined') {
    try {
        dailySummaryWidget = await StarterFeatures.renderDailySummaryWidget();
        limitedAlertWidget = await StarterFeatures.renderLimitedAlertWidget();
    } catch (e) {
        console.error('Error loading starter widgets:', e);
    }
}

// ✅ ADD THIS ENTIRE BLOCK
if (typeof ExpiryAlert !== 'undefined') {
    try {
        expiryAlertWidget = await ExpiryAlert.getWidgetHTML();
    } catch (e) {
        console.error('Error loading expiry widget:', e);
    }
} 

 // Helper: Generate locked card overlay
    function getLockedOverlay(featureName, requiredTier) {
        const tierEmoji = requiredTier === 'ELITE' ? '👑' : '⭐';
        return `
            <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center z-10 cursor-pointer" 
                 onclick="showUpgradePrompt('${featureName}')">
                <div class="bg-white/90 px-3 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <i class="ph ph-lock text-slate-600"></i>
                    <span class="text-xs font-bold text-slate-700">${tierEmoji} ${requiredTier}</span>
                </div>
            </div>
        `;
    }

    // Check feature access
    const hasSegments = hasFeature('customer_segments');
    const hasCampaignHistory = hasFeature('campaign_history');
    const hasAnalytics = hasFeature('advanced_analytics');
    const hasFestivalCampaigns = hasFeature('festival_campaigns');
    const hasMessageTemplates = hasFeature('message_templates');

    return `
        <div class="p-5 pb-24 space-y-5 animate-fade-in">
            
            <!-- HEADER -->
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Overview</h2>
                    <p class="text-slate-500 text-xs">Financial Health</p>
                </div>
                <div class="flex items-center gap-2">
                    <!-- Tier Badge -->
                    <div class="bg-gradient-to-r ${currentTier === 'ELITE' ? 'from-amber-500 to-orange-500' : currentTier === 'GROWTH' ? 'from-purple-500 to-indigo-500' : 'from-slate-500 to-slate-600'} text-white text-[10px] px-2 py-1 rounded-full font-bold">
                        ${currentTier === 'ELITE' ? '👑' : currentTier === 'GROWTH' ? '⭐' : '🌱'} ${currentTier}
                    </div>
                    <!-- Period Toggle -->
                    <div class="bg-white border border-slate-200 rounded-lg p-1 flex">
                        <button onclick="setDashPeriod('today')" class="px-3 py-1 text-[10px] font-bold rounded ${period==='today'?'bg-slate-900 text-white':'text-slate-500'}">Day</button>
                        <button onclick="setDashPeriod('week')" class="px-3 py-1 text-[10px] font-bold rounded ${period==='week'?'bg-slate-900 text-white':'text-slate-500'}">Week</button>
                        <button onclick="setDashPeriod('month')" class="px-3 py-1 text-[10px] font-bold rounded ${period==='month'?'bg-slate-900 text-white':'text-slate-500'}">Month</button>
                    </div>
                </div>
            </div>

            <!-- MAIN CHART (Top) - FREE FOR ALL -->
            <div class="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div id="sales-chart" class="w-full h-40"></div>
            </div>



<!-- ═══════════════════════════════════════════════════════════ -->
<!-- STARTER FEATURES: Daily Summary & Customer Alert -->
<!-- ═══════════════════════════════════════════════════════════ -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
    
    <!-- Daily Sales Summary -->
    ${dailySummaryWidget}
    
    <!-- Limited Customer Alert -->
    ${limitedAlertWidget}
    
</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- EXPIRY ALERT WIDGET (Shows only if products have expiry) -->
<!-- ═══════════════════════════════════════════════════════════ -->
${expiryAlertWidget ? `
<div class="mt-4">
    ${expiryAlertWidget}
</div>
` : ''}

            <!-- STATS GRID - FREE FOR ALL -->
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Sales</p>
                    <h3 class="text-xl font-bold text-slate-800">${AppState.currency} ${stats.sales}</h3>
                </div>
                
                <div class="bg-slate-800 p-4 rounded-2xl shadow-lg">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Net Profit</p>
                    <h3 class="text-xl font-bold ${trueProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}">
                        ${AppState.currency} ${trueProfit}
                    </h3>
                </div>

                <!-- BUYER SEGMENTS QUICK VIEW (GROWTH Feature) -->
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-2xl shadow-lg text-white relative overflow-hidden">
                    ${!hasSegments ? getLockedOverlay('customer_segments', 'GROWTH') : ''}
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                            <i class="ph-duotone ph-users-three text-xl"></i>
                            <span class="font-bold">Buyer Segments</span>
                        </div>
                        <button onclick="${hasSegments ? 'openSegmentDashboard()' : "showUpgradePrompt('customer_segments')"}" 
                                class="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-medium transition-all">
                            View All →
                        </button>
                    </div>
                    <div class="grid grid-cols-4 gap-2 text-center">
                        <div class="bg-white/10 rounded-xl p-2">
                            <p class="text-lg font-bold">👑</p>
                            <p class="text-[10px] opacity-80">VIP</p>
                        </div>
                        <div class="bg-white/10 rounded-xl p-2">
                            <p class="text-lg font-bold">⚠️</p>
                            <p class="text-[10px] opacity-80">At Risk</p>
                        </div>
                        <div class="bg-white/10 rounded-xl p-2">
                            <p class="text-lg font-bold">🆕</p>
                            <p class="text-[10px] opacity-80">New</p>
                        </div>
                        <div class="bg-white/10 rounded-xl p-2">
                            <p class="text-lg font-bold">💔</p>
                            <p class="text-[10px] opacity-80">Lost</p>
                        </div>
                    </div>
                </div>

                <!-- CAMPAIGN HISTORY (GROWTH Feature) -->
<div onclick="${hasFeature('campaign_history') ? 'CampaignHistory.open()' : "showUpgradePrompt('campaign_history', 'GROWTH')"}" 
     class="${hasFeature('campaign_history') ? 'bg-gradient-to-r from-indigo-600 to-blue-600' : 'bg-gradient-to-r from-gray-400 to-gray-500 opacity-80'} p-4 rounded-2xl shadow-lg text-white cursor-pointer hover:opacity-90 transition-all relative overflow-hidden">
    ${!hasFeature('campaign_history') ? `
        <span class="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[8px] px-2 py-0.5 rounded-full font-bold">🔒 GROWTH</span>
    ` : ''}
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <i class="ph-duotone ph-clock-counter-clockwise text-2xl"></i>
            <div>
                <p class="font-bold">Campaign History</p>
                <p class="text-white/70 text-xs">View sent offers & messages</p>
            </div>
        </div>
        <i class="ph-bold ph-caret-right"></i>
    </div>
</div>

                <!-- ANALYTICS DASHBOARD (ELITE Feature) -->
                <div onclick="${hasAnalytics ? 'AnalyticsDashboard.open()' : "showUpgradePrompt('advanced_analytics')"}" 
                     class="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-2xl shadow-lg text-white cursor-pointer hover:opacity-90 transition-all relative overflow-hidden">
                    ${!hasAnalytics ? getLockedOverlay('advanced_analytics', 'ELITE') : ''}
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <i class="ph-duotone ph-chart-line-up text-2xl"></i>
                            <div>
                                <p class="font-bold">Analytics Dashboard</p>
                                <p class="text-white/70 text-xs">Charts, trends & AI insights</p>
                            </div>
                        </div>
                        <i class="ph-bold ph-caret-right"></i>
                    </div>
                </div>

                <!-- Festival Campaigns - GROWTH FEATURE -->
${hasFeature('festival_campaigns') ? `
    <button onclick="router('festival_campaigns')" 
            class="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-xl shadow-md flex flex-col items-center gap-2 active:scale-[0.97] transition-transform text-white relative">
        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <i class="ph-duotone ph-confetti text-xl"></i>
        </div>
        <span class="font-bold text-xs">Festivals</span>
        <span class="text-white/60 text-[10px]">উৎসব ক্যাম্পেইন</span>
    </button>
` : `
    <button onclick="showUpgradePrompt('festival_campaigns', 'GROWTH')" 
            class="bg-gradient-to-br from-gray-400 to-gray-500 p-4 rounded-xl shadow-md flex flex-col items-center gap-2 active:scale-[0.97] transition-transform text-white relative opacity-80">
        <span class="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[8px] px-1.5 py-0.5 rounded-full font-bold shadow">🔒 GROWTH</span>
        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <i class="ph-duotone ph-confetti text-xl"></i>
        </div>
        <span class="font-bold text-xs">Festivals</span>
        <span class="text-white/60 text-[10px]">উৎসব ক্যাম্পেইন</span>
    </button>
`}

               <!-- Message Templates - GROWTH FEATURE -->
${hasFeature('message_templates') ? `
    <button onclick="router('templates')" 
            class="bg-gradient-to-br from-violet-500 to-purple-600 p-4 rounded-xl shadow-md flex flex-col items-center gap-2 active:scale-[0.97] transition-transform text-white relative">
        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <i class="ph-duotone ph-chat-text text-xl"></i>
        </div>
        <span class="font-bold text-xs">Templates</span>
        <span class="text-white/60 text-[10px]">মেসেজ টেমপ্লেট</span>
    </button>
` : `
    <button onclick="showUpgradePrompt('message_templates', 'GROWTH')" 
            class="bg-gradient-to-br from-gray-400 to-gray-500 p-4 rounded-xl shadow-md flex flex-col items-center gap-2 active:scale-[0.97] transition-transform text-white relative opacity-80">
        <span class="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[8px] px-1.5 py-0.5 rounded-full font-bold shadow">🔒 GROWTH</span>
        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <i class="ph-duotone ph-chat-text text-xl"></i>
        </div>
        <span class="font-bold text-xs">Templates</span>
        <span class="text-white/60 text-[10px]">মেসেজ টেমপ্লেট</span>
    </button>
`}

                <!-- SMART EXPENSE CARD (FREE for all) -->
                <button onclick="router('expenses_detail')" class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-left active:bg-slate-50 transition-colors group relative">
                    <div class="flex justify-between items-center mb-1">
                        <p class="text-[10px] font-bold text-slate-400 uppercase">Ads/Exp</p>
                        <i class="ph-bold ph-caret-right text-slate-300 group-hover:text-rose-500"></i>
                    </div>
                    <h3 class="text-xl font-bold text-rose-600">-${stats.expenses}</h3>
                    <div onclick="event.stopPropagation(); openModal('addExpense')" class="absolute bottom-3 right-3 w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 shadow-sm border border-rose-100 active:scale-95 hover:bg-rose-100">
                        <i class="ph-bold ph-plus"></i>
                    </div>
                </button>

                <!-- ORDERS COUNT (FREE for all) -->
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Orders</p>
                    <h3 class="text-xl font-bold text-slate-800">${stats.orders}</h3>
                </div>
            </div>

            <!-- TOP PRODUCTS (FREE for all) -->
            <div>
                <h3 class="font-bold text-slate-700 text-sm mb-3">🔥 Top Products</h3>
                ${bestSellers.length === 0 ? `<p class="text-xs text-slate-400">No sales yet.</p>` : 
                  bestSellers.map((p, i) => `
                    <div class="flex justify-between items-center mb-2 bg-white p-3 rounded-xl border border-slate-100">
                        <span class="text-sm font-bold text-slate-700">#${i+1} ${p[0]}</span>
                        <span class="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">${p[1]} sold</span>
                    </div>
                  `).join('')
                }
            </div>



        </div>
    `;
}

// SWITCH PERIOD
window.setDashPeriod = function(p) { AppState.dashboardPeriod = p; router('dashboard'); }

// ============================================
// 📊 REAL CHART ENGINE (Not Dummy)
// ============================================
async function initDashboardScripts() {
    if(!document.querySelector("#sales-chart")) return;

    // 1. Prepare Dates (Last 7 Days)
    const dates = [];
    const salesData = [0,0,0,0,0,0,0];
    const expenseData = [0,0,0,0,0,0,0];
    
    for(let i=6; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
    }

    // 2. Fetch Data from DB
    try {
        const orders = await db.orders.toArray();
        const expenses = await db.expenses.toArray();
        const today = new Date();
        
        // Sum Sales
        orders.forEach(o => {
            const diff = Math.floor((today - new Date(o.date)) / (1000 * 60 * 60 * 24));
            if(diff >= 0 && diff < 7) salesData[6 - diff] += (o.grandTotal || 0);
        });

        // Sum Expenses
        expenses.forEach(e => {
            const diff = Math.floor((today - new Date(e.date)) / (1000 * 60 * 60 * 24));
            if(diff >= 0 && diff < 7) expenseData[6 - diff] += (e.amount || 0);
        });

    } catch(e) { console.log("Chart Error", e); }

    // 3. Render
    const options = {
        series: [{ name: 'Income', data: salesData }, { name: 'Expense', data: expenseData }],
        chart: { type: 'bar', height: 180, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
        colors: ['#4f46e5', '#e11d48'],
        plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
        dataLabels: { enabled: false },
        xaxis: { categories: dates, labels: { style: { fontSize: '10px' } }, axisBorder: { show: false } },
        grid: { show: false, padding: { left: 0, right: 0, bottom: 0 } }
    };

    new ApexCharts(document.querySelector("#sales-chart"), options).render();
}
// ============================================
// 📋 VIEW: ORDER LIST (With Live Status Update)
// ============================================
async function getOrderListHTML() {
    let orders = [];
    try {
        if(typeof db !== 'undefined') {
            orders = await db.orders.reverse().toArray();
        }
    } catch(e) { console.error(e); }

    if (orders.length === 0) {
        return `
            <div class="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
                <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4"><i class="ph-duotone ph-shopping-cart text-4xl text-slate-300"></i></div>
                <h3 class="font-bold text-slate-700 text-lg">No Orders Yet</h3>
                <button onclick="prepareOrderModal()" class="mt-4 bg-brand-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg">+ Create First Order</button>
            </div>
        `;
    }

    const listHTML = orders.map(order => {
        // Color Logic based on Status
        let statusColor = 'bg-slate-100 text-slate-600 border-slate-200';
        if (order.status === 'Pending') statusColor = 'bg-orange-50 text-orange-600 border-orange-200';
        if (order.status === 'Confirmed') statusColor = 'bg-blue-50 text-blue-600 border-blue-200';
        if (order.status === 'Shipped') statusColor = 'bg-purple-50 text-purple-600 border-purple-200';
        if (order.status === 'Delivered') statusColor = 'bg-emerald-50 text-emerald-600 border-emerald-200';
        if (order.status === 'Returned') statusColor = 'bg-red-50 text-red-600 border-red-200';

        const dateStr = new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

        return `
            <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-3 animate-slide-up">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${order.orderId}</span>
                        <h4 class="font-bold text-slate-800">${order.customerName}</h4>
                    </div>
                    
                    <!-- 🛠️ LIVE STATUS CHANGER -->
                    <select onchange="updateOrderStatus(${order.id}, this.value)" 
                        class="text-[10px] font-bold px-2 py-1 rounded-lg border ${statusColor} focus:outline-none appearance-none cursor-pointer">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>🟠 Pending</option>
                        <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>🔵 Confirmed</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>🚚 Courier</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>✅ Delivered</option>
                        <option value="Returned" ${order.status === 'Returned' ? 'selected' : ''}>❌ Returned</option>
                    </select>
                </div>
                
                <div class="flex justify-between items-end border-t border-slate-50 pt-3">
                    <div class="text-xs text-slate-500 space-y-1">
                        <div class="flex items-center gap-1"><i class="ph-bold ph-phone"></i> ${order.customerPhone}</div>
                        <div class="flex items-center gap-1"><i class="ph-bold ph-calendar-blank"></i> ${dateStr}</div>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] text-slate-400 uppercase">Total Amount</p>
                        <p class="font-bold text-lg text-brand-600">${AppState.currency} ${order.grandTotal}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="p-4 pb-24">
            <h2 class="font-bold text-xl mb-4 flex items-center gap-2">Orders <span class="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">${orders.length}</span></h2>
            <div class="relative mb-4">
                <i class="ph-bold ph-magnifying-glass absolute left-3 top-3.5 text-slate-400"></i>
                <input type="text" placeholder="Search ID or Phone..." class="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500">
            </div>
            <div class="pb-20">${listHTML}</div>
        </div>
    `;
}

// 🛠️ LOGIC: Handle Status Change
// ============================================
// GROWTH HUB - WITH TIER LOCKING
// ============================================
async function getGrowthHubHTML() {
    // Get customer stats
    let stats = { lost: 0, atRisk: 0, needsAttention: 0, healthy: 0, newCustomers: 0, total: 0 };
    let alertCount = 0;
    const currentTier = AppState.userTier || 'STARTER';

    try {
        if (typeof db !== 'undefined') {
            const customers = await db.customers.toArray();
            const orders = await db.orders.toArray();
            const today = new Date();

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
                    stats.lost++;
                } else if (daysSince > 60) {
                    stats.atRisk++;
                } else if (daysSince > 30) {
                    stats.needsAttention++;
                } else {
                    stats.healthy++;
                    if (customerOrders.length === 1 && daysSince <= 7) {
                        stats.newCustomers++;
                    }
                }
                stats.total++;
            });

            alertCount = stats.lost + stats.atRisk + stats.needsAttention + stats.newCustomers;
        }
    } catch (e) {
        console.error("Stats Error:", e);
    }

    // Helper function to generate button based on tier access
    function generateToolButton(featureKey, title, subtitle, icon, gradient, route, isModal = false) {
        const hasAccess = hasFeature(featureKey);
        const requiredTier = getRequiredTier(featureKey);
        
        if (hasAccess) {
            // Unlocked - Normal button
            const onclickAction = isModal ? route : `router('${route}')`;
            return `
                <button onclick="${onclickAction}" 
                        class="bg-gradient-to-br ${gradient} p-4 rounded-xl shadow-md flex flex-col items-center gap-2 active:scale-[0.97] transition-transform text-white relative overflow-hidden">
                    <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <i class="ph-duotone ${icon} text-xl"></i>
                    </div>
                    <span class="font-bold text-xs">${title}</span>
                    <span class="text-white/60 text-[10px]">${subtitle}</span>
                </button>
            `;
     } else {
    // Locked - Check if feature has its own teaser page
    const tierBadge = requiredTier === 'ELITE' ? '👑 ELITE' : '⭐ GROWTH';
    const tierColor = requiredTier === 'ELITE' ? 'from-amber-500 to-orange-500' : 'from-purple-500 to-indigo-500';
    
    // Features that have their own teaser page
    const featuresWithTeaser = ['daily_briefing', 'profit_leakage', 'bundle_suggester'];
    
    // If feature has teaser, go to page. Otherwise show upgrade prompt.
    let onclickAction;
    if (isModal) {
        onclickAction = `showUpgradePrompt('${featureKey}')`;
    } else if (featuresWithTeaser.includes(featureKey)) {
        onclickAction = `router('${route}')`;
    } else {
        onclickAction = `showUpgradePrompt('${featureKey}')`;
    }
    
    return `
        <button onclick="${onclickAction}" 
                class="bg-gradient-to-br from-slate-400 to-slate-500 p-4 rounded-xl shadow-md flex flex-col items-center gap-2 active:scale-[0.97] transition-transform text-white relative overflow-hidden group">
            
            <!-- Lock Overlay -->
            <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i class="ph ph-lock-key text-2xl"></i>
            </div>
            
            <!-- Lock Badge -->
            <div class="absolute top-2 right-2">
                <span class="bg-gradient-to-r ${tierColor} text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                    🔒 ${tierBadge}
                </span>
            </div>
            
            <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <i class="ph-duotone ${icon} text-xl opacity-50"></i>
            </div>
            <span class="font-bold text-xs opacity-70">${title}</span>
            <span class="text-white/60 text-[10px]">${subtitle}</span>
        </button>
    `;
}
    }

    // Generate Customer Alerts button (GROWTH feature)
    function generateAlertsButton() {
        const hasAccess = hasFeature('customer_alerts');
        
        if (hasAccess) {
            return `
                <button onclick="renderView('customer_alerts')" 
                        class="w-full bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-xl shadow-lg flex items-center gap-4 active:scale-[0.98] transition-transform text-white">
                    <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <i class="ph-bold ph-warning text-2xl"></i>
                    </div>
                    <div class="text-left flex-1">
                        <span class="font-bold text-sm block">Customer Alerts</span>
                        <span class="text-white/70 text-xs">${alertCount} জন কাস্টমারের এ্যাকশন দরকার</span>
                    </div>
                    <div class="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                        ${alertCount}
                    </div>
                    <i class="ph ph-arrow-right text-xl text-white/50"></i>
                </button>
            `;
        } else {
            return `
                <button onclick="showUpgradePrompt('customer_alerts')" 
                        class="w-full bg-gradient-to-r from-slate-400 to-slate-500 p-4 rounded-xl shadow-lg flex items-center gap-4 active:scale-[0.98] transition-transform text-white relative overflow-hidden group">
                    
                    <!-- Lock Badge -->
                    <div class="absolute top-2 right-2">
                        <span class="bg-gradient-to-r from-purple-500 to-indigo-500 text-[9px] px-2 py-0.5 rounded-full font-bold">
                            🔒 ⭐ GROWTH
                        </span>
                    </div>
                    
                    <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <i class="ph-bold ph-warning text-2xl opacity-50"></i>
                    </div>
                    <div class="text-left flex-1">
                        <span class="font-bold text-sm block opacity-70">Customer Alerts</span>
                        <span class="text-white/70 text-xs">🔒 GROWTH প্ল্যানে আপগ্রেড করুন</span>
                    </div>
                    <i class="ph ph-lock text-xl text-white/50"></i>
                </button>
            `;
        }
    }

    return `
        <div class="p-5 pb-24">
            
            <!-- Header -->
            <div class="mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <i class="ph-fill ph-rocket-launch text-brand-600"></i>
                            Growth Hub
                        </h2>
                        <p class="text-slate-500 text-sm">আপনার বিজনেস বড় করার সব টুলস</p>
                    </div>
                    <div class="bg-gradient-to-r ${currentTier === 'ELITE' ? 'from-amber-500 to-orange-500' : currentTier === 'GROWTH' ? 'from-purple-500 to-indigo-500' : 'from-slate-500 to-slate-600'} text-white text-xs px-3 py-1.5 rounded-full font-bold">
                        ${currentTier === 'ELITE' ? '👑' : currentTier === 'GROWTH' ? '⭐' : '🌱'} ${currentTier}
                    </div>
                </div>
            </div>

            <!-- Customer Health Stats -->
            <div class="mb-6">
                <h3 class="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i class="ph ph-heart-half text-red-500"></i>
                    Customer Health
                </h3>
                <div class="grid grid-cols-4 gap-2">
                    <div class="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                        <div class="text-2xl font-bold text-red-600">${stats.lost}</div>
                        <div class="text-xs text-red-500 flex items-center justify-center gap-1">
                            <i class="ph ph-heart-break"></i> Lost
                        </div>
                    </div>
                    <div class="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
                        <div class="text-2xl font-bold text-orange-600">${stats.atRisk}</div>
                        <div class="text-xs text-orange-500 flex items-center justify-center gap-1">
                            <i class="ph ph-warning"></i> At Risk
                        </div>
                    </div>
                    <div class="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center">
                        <div class="text-2xl font-bold text-yellow-600">${stats.needsAttention}</div>
                        <div class="text-xs text-yellow-600 flex items-center justify-center gap-1">
                            <i class="ph ph-eye"></i> Attention
                        </div>
                    </div>
                    <div class="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                        <div class="text-2xl font-bold text-green-600">${stats.healthy}</div>
                        <div class="text-xs text-green-500 flex items-center justify-center gap-1">
                            <i class="ph ph-check-circle"></i> Healthy
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Center (GROWTH Feature) -->
            <div class="mb-6">
                <h3 class="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i class="ph ph-bell-ringing text-orange-500"></i>
                    Action Center
                </h3>
                ${generateAlertsButton()}
            </div>

            <!-- Growth Tools Grid -->
            <div class="mb-6">
                <h3 class="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i class="ph ph-toolbox text-indigo-500"></i>
                    Growth Tools
                </h3>
                <div class="grid grid-cols-2 gap-3">

 <!-- Daily Briefing (ELITE) -->
    ${generateToolButton(
        'daily_briefing',
        'Daily Briefing',
        'আজকের করণীয়',
        'ph-sun-horizon',
        'from-amber-500 to-orange-600',
        'daily_briefing'
    )}
                    
                    <!-- Revenue Prediction (ELITE) -->
                    ${generateToolButton(
                        'revenue_prediction',
                        'Revenue Prediction',
                        'আয়ের পূর্বাভাস',
                        'ph-chart-line-up',
                        'from-indigo-500 to-purple-600',
                        'revenue_prediction'
                    )}

                    <!-- Reorder Predictor (ELITE) -->
                    ${generateToolButton(
                        'reorder_predictor',
                        'Reorder Predictor',
                        'পুনরায় কেনার সময়',
                        'ph-arrows-clockwise',
                        'from-emerald-500 to-teal-600',
                        'reorder_predictor'
                    )}

                    <!-- A/B Testing (ELITE) -->
                    ${generateToolButton(
                        'ab_testing',
                        'A/B Testing',
                        'মেসেজ টেস্টিং',
                        'ph-flask',
                        'from-pink-500 to-rose-600',
                        'ab_testing'
                    )}

                    <!-- Offer AI (GROWTH) -->
                    ${generateToolButton(
                        'offer_ai',
                        'Offer AI',
                        'স্মার্ট অফার তৈরি',
                        'ph-brain',
                        'from-slate-700 to-slate-900',
                        "OfferWizard.open()",
                        true
                    )}

                    <!-- Time Cost Consultant (FREE for all - Enhanced!) -->
<button onclick="TimeCostConsultant.open()" 
        class="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-xl shadow-md flex flex-col items-center gap-2 active:scale-[0.97] transition-transform text-white relative overflow-hidden">
    <!-- Sparkle Effect -->
    <div class="absolute top-1 right-1 text-white/40 text-xs">✨</div>
    
    <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
        <i class="ph-duotone ph-clock-countdown text-xl"></i>
    </div>
    <span class="font-bold text-xs">Time Consultant</span>
    <span class="text-white/60 text-[10px]">সময়ের সঠিক মূল্য</span>
    
    <!-- New Badge -->
    <span class="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">NEW</span>
</button>

	<!-- Profit Leakage (ELITE) -->
	${generateToolButton(
    	'profit_leakage',
    	'Profit Leakage',
   	'টাকা কোথায় যাচ্ছে',
    	'ph-chart-pie-slice',
    	'from-red-500 to-red-700',
    	'profit_leakage'
	)}

	<!-- Bundle Suggester (ELITE) -->
${generateToolButton(
    'bundle_suggester',
    'Bundle Suggester',
    'একসাথে বিক্রি করুন',
    'ph-gift',
    'from-green-500 to-emerald-600',
    'bundle_suggester'
)}

                    <!-- Product Recommendations (ELITE) -->
                    ${generateToolButton(
                        'product_recommendations',
                        'Product Suggest',
                        'একসাথে কেনা',
                        'ph-sparkle',
                        'from-cyan-500 to-blue-600',
                        'product_recommendations'
                    )}

                </div>
            </div>

            <!-- Upgrade Banner (Show only if not ELITE) -->
            ${currentTier !== 'ELITE' ? `
                <div class="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <i class="ph ph-crown text-2xl"></i>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-bold">👑 ELITE তে আপগ্রেড করুন</h4>
                            <p class="text-white/80 text-xs">সব AI ফিচার আনলক করুন!</p>
                        </div>
                        <button onclick="showUpgradePrompt('revenue_prediction')" class="bg-white text-orange-600 px-4 py-2 rounded-lg font-bold text-sm">
                            আপগ্রেড
                        </button>
                    </div>
                </div>
            ` : ''}

        </div>
    `;
}



// ============================================
// CUSTOMER ALERTS PAGE - FIXED
// ============================================
async function getCustomerAlertsHTML() {
    let alerts = { lost: [], atRisk: [], needsAttention: [], newCustomers: [] };
    
    try {
        if (typeof db !== 'undefined') {
            const customers = await db.customers.toArray();
            const orders = await db.orders.toArray();
            const today = new Date();

            for (const customer of customers) {
                // Find orders for this customer
                const customerOrders = orders.filter(o => 
                    o.customerPhone === customer.phone || 
                    String(o.customerPhone) === String(customer.phone)
                );

                if (customerOrders.length === 0) continue;

                // Get most recent order date
                const lastOrderDate = customerOrders.reduce((latest, order) => {
                    const orderDate = new Date(order.date || order.createdAt);
                    return orderDate > latest ? orderDate : latest;
                }, new Date(0));

                const daysSince = Math.floor((today - lastOrderDate) / (1000 * 60 * 60 * 24));

                // Create alert object
                const alertData = {
                    name: customer.name || 'Unknown',
                    phone: customer.phone,
                    daysSince: daysSince,
                    totalOrders: customerOrders.length,
                    lastOrderDate: lastOrderDate
                };

                // Categorize
                if (daysSince > 90) {
                    alertData.type = 'Lost';
                    alertData.message = `🚨 ${customer.name} ভাই/আপু, LAST CHANCE! আপনার জন্য 40% ছাড় রেখেছিলাম। আজ রাতে Expire হয়ে যাবে!`;
                    alertData.action = 'Last Chance';
                    alerts.lost.push(alertData);
                } else if (daysSince > 60) {
                    alertData.type = 'At Risk';
                    alertData.message = `😢 ${customer.name} ভাই/আপু, আপনাকে মিস করছি! ${daysSince} দিন হয়ে গেল আপনার অর্ডার নেই। 🎁 ফিরে আসুন, স্পেশাল ছাড় পাবেন!`;
                    alertData.action = 'Win Back';
                    alerts.atRisk.push(alertData);
                } else if (daysSince > 30) {
                    alertData.type = 'Attention';
                    alertData.message = `👋 ${customer.name} ভাই/আপু, কেমন আছেন? ${daysSince} দিন হয়ে গেল আপনার অর্ডার নেই! প্রোডাক্ট দরকার হলে জানাবেন।`;
                    alertData.action = 'Send Reminder';
                    alerts.needsAttention.push(alertData);
                } else if (customerOrders.length === 1 && daysSince <= 7) {
                    alertData.type = 'New';
                    alertData.message = `🎉 ${customer.name} ভাই/আপু, স্বাগতম! আপনার প্রথম অর্ডারের জন্য ধন্যবাদ। 💝 পরবর্তী অর্ডারে 10% ছাড় পাবেন!`;
                    alertData.action = 'Send Welcome';
                    alerts.newCustomers.push(alertData);
                }
            }
        }
    } catch (e) {
        console.error("Alerts Error:", e);
    }

    // Total alerts
    const totalAlerts = alerts.lost.length + alerts.atRisk.length + alerts.needsAttention.length + alerts.newCustomers.length;

    // Generate cards HTML
    const generateCard = (alert, bgColor, borderColor, iconBg, icon) => `
        <div class="bg-white rounded-xl border shadow-sm mb-3 overflow-hidden">
            <div class="p-4 border-l-4 ${borderColor} ${bgColor}">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-full ${iconBg} flex items-center justify-center text-white shrink-0">
                        <i class="ph-fill ${icon} text-lg"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="font-bold text-slate-800 truncate">${alert.name}</h4>
                            <span class="text-xs px-2 py-0.5 rounded-full ${bgColor} ${borderColor.replace('border-', 'text-').replace('-500', '-700')}">${alert.type}</span>
                        </div>
                        <p class="text-xs text-slate-500 mb-2">NO ORDER FOR ${alert.daysSince} DAYS ${alert.type === 'Lost' ? '- URGENT' : alert.type === 'At Risk' ? '- ACT NOW' : ''}</p>
                        <div class="bg-white/80 p-2 rounded-lg text-xs text-slate-600 italic border mb-2 line-clamp-2">
                            "${alert.message.substring(0, 80)}..."
                        </div>
                        <button onclick="openWhatsApp('${encodeURIComponent(alert.message)}')" 
                                class="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 w-fit transition-colors">
                            <i class="ph-bold ph-whatsapp-logo"></i> ${alert.action}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Build all cards
    let cardsHTML = '';
    
    // Lost customers first
    alerts.lost.forEach(alert => {
        cardsHTML += generateCard(alert, 'bg-red-50', 'border-red-500', 'bg-red-500', 'ph-heart-break');
    });
    
    // At Risk customers
    alerts.atRisk.forEach(alert => {
        cardsHTML += generateCard(alert, 'bg-orange-50', 'border-orange-500', 'bg-orange-500', 'ph-warning');
    });
    
    // Needs Attention
    alerts.needsAttention.forEach(alert => {
        cardsHTML += generateCard(alert, 'bg-yellow-50', 'border-yellow-500', 'bg-yellow-500', 'ph-eye');
    });
    
    // New Customers
    alerts.newCustomers.forEach(alert => {
        cardsHTML += generateCard(alert, 'bg-green-50', 'border-green-500', 'bg-green-500', 'ph-user-plus');
    });

    return `
        <div class="p-4 pb-24">
            <!-- Back Button -->
            <button onclick="router('growth')" class="mb-4 flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors">
                <i class="ph ph-arrow-left text-xl"></i>
                <span class="font-medium">Growth Hub এ ফিরুন</span>
            </button>
            
            <!-- Header -->
            <div class="bg-gradient-to-r from-orange-500 to-red-500 text-white p-5 rounded-xl mb-6">
                <h2 class="text-xl font-bold flex items-center gap-2">
                    <i class="ph ph-bell-ringing text-2xl"></i>
                    Customer Alerts
                </h2>
                <p class="text-orange-100 text-sm mt-1">${totalAlerts} জন কাস্টমারের এ্যাকশন দরকার</p>
            </div>

            <!-- Filter Tabs -->
            <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button class="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap">
                    💔 Lost (${alerts.lost.length})
                </button>
                <button class="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap">
                    ⚠️ At Risk (${alerts.atRisk.length})
                </button>
                <button class="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap">
                    👀 Attention (${alerts.needsAttention.length})
                </button>
                <button class="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap">
                    🆕 New (${alerts.newCustomers.length})
                </button>
            </div>

            <!-- Alerts List -->
            <div>
                ${cardsHTML || `
                    <div class="text-center py-12 bg-green-50 rounded-2xl border border-green-200">
                        <i class="ph-duotone ph-check-circle text-4xl text-green-500 mb-2"></i>
                        <p class="text-green-700 font-bold">All Good! 🎉</p>
                        <p class="text-xs text-green-600">সব কাস্টমার সুস্থ আছে!</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

// ============================================
// 📦 VIEW: INVENTORY MANAGER (With Edit/Delete)
// ============================================
async function getInventoryHTML() {
    let products = [];
    try {
        if(typeof db !== 'undefined') {
            products = await db.products.reverse().toArray();
        }
    } catch(e) {}

    // 1. HEADER
    let html = `
        <div class="p-4 pb-24">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Inventory</h2>
                    <p class="text-slate-500 text-sm">Manage stock & prices</p>
                </div>
                <button onclick="prepareProductModal()" class="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2">
                    <i class="ph-bold ph-plus"></i> Add Item
                </button>
            </div>
    `;

    // 2. EMPTY STATE
    if (products.length === 0) {
        html += `
            <div class="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="ph-duotone ph-package text-3xl text-slate-400"></i>
                </div>
                <p class="text-slate-500 font-medium">No products found</p>
                <p class="text-xs text-slate-400 mb-4">Add items to start selling</p>
            </div>
        </div>`;
        return html;
    }

    // 3. PRODUCT LIST (With Edit/Delete Buttons)
    const list = products.map(p => {
        // Stock color coding
        let stockColor = 'bg-green-100 text-green-700';
        let stockIcon = '✓';
        if (p.stockQuantity <= (p.alertThreshold || 5)) {
            stockColor = 'bg-red-100 text-red-700 font-bold';
            stockIcon = '⚠️';
        }
        if (p.stockQuantity === 0) {
            stockColor = 'bg-slate-100 text-slate-500';
            stockIcon = '✗';
        }

        // Calculate profit
        const profit = (p.sellingPrice || 0) - (p.costPrice || 0);
        const margin = p.costPrice > 0 ? Math.round((profit / p.costPrice) * 100) : 0;

        // Expiry warning
        let expiryBadge = '';
        if (p.expiryDate) {
            const today = new Date();
            const expiry = new Date(p.expiryDate);
            const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            
            if (daysLeft < 0) {
                expiryBadge = `<span class="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">❌ Expired</span>`;
            } else if (daysLeft <= 7) {
                expiryBadge = `<span class="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">⏰ ${daysLeft}d left</span>`;
            } else if (daysLeft <= 30) {
                expiryBadge = `<span class="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">📅 ${daysLeft}d left</span>`;
            }
        }

        return `
            <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-3">
                
                <!-- Top Row: Product Info + Action Buttons -->
                <div class="flex justify-between items-start">
                    
                    <!-- Product Info -->
                    <div class="flex items-center gap-3 flex-1">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-2xl border border-slate-200">
                            📦
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-slate-800 text-sm truncate">${p.name}</h4>
                            <div class="flex flex-wrap gap-1 mt-1">
                                <span class="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded">SKU: ${p.sku || 'N/A'}</span>
                                ${p.category ? `<span class="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">${p.category}</span>` : ''}
                                ${expiryBadge}
                            </div>
                            ${p.sizes ? `<p class="text-[10px] text-slate-400 mt-1">📐 Sizes: ${p.sizes}</p>` : ''}
                            ${p.colors ? `<p class="text-[10px] text-slate-400">🎨 Colors: ${p.colors}</p>` : ''}
                        </div>
                    </div>
                    
                    <!-- ✅ NEW: Edit & Delete Buttons -->
                    <div class="flex items-center gap-1 ml-2">
                        <button onclick="ProductManager.edit(${p.id})" 
                                class="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-all"
                                title="Edit Product">
                            <i class="ph ph-pencil-simple text-lg"></i>
                        </button>
                        <button onclick="ProductManager.confirmDelete(${p.id})" 
                                class="w-9 h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all"
                                title="Delete Product">
                            <i class="ph ph-trash text-lg"></i>
                        </button>
                    </div>
                    
                </div>
                
                <!-- Bottom Row: Price, Stock, Profit -->
                <div class="mt-3 pt-3 border-t border-slate-100 grid grid-cols-4 gap-2">
                    
                    <!-- Cost -->
                    <div class="text-center">
                        <p class="text-[10px] text-slate-400 uppercase">Cost</p>
                        <p class="text-sm font-bold text-slate-600">${AppState.currency}${p.costPrice || 0}</p>
                    </div>
                    
                    <!-- Selling -->
                    <div class="text-center">
                        <p class="text-[10px] text-slate-400 uppercase">Selling</p>
                        <p class="text-sm font-bold text-green-600">${AppState.currency}${p.sellingPrice || 0}</p>
                    </div>
                    
                    <!-- Profit -->
                    <div class="text-center">
                        <p class="text-[10px] text-slate-400 uppercase">Profit</p>
                        <p class="text-sm font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}">
                            ${AppState.currency}${profit}
                            <span class="text-[9px] font-normal">(${margin}%)</span>
                        </p>
                    </div>
                    
                    <!-- Stock -->
                    <div class="text-center">
                        <p class="text-[10px] text-slate-400 uppercase">Stock</p>
                        <span class="text-xs px-2 py-1 rounded-full ${stockColor}">
                            ${stockIcon} ${p.stockQuantity || 0}
                        </span>
                    </div>
                    
                </div>
                
            </div>
        `;
    }).join('');

    // Summary Cards
    const totalValue = products.reduce((a, b) => a + ((b.sellingPrice || 0) * (b.stockQuantity || 0)), 0);
    const totalProfit = products.reduce((a, b) => a + (((b.sellingPrice || 0) - (b.costPrice || 0)) * (b.stockQuantity || 0)), 0);
    const lowStockCount = products.filter(p => (p.stockQuantity || 0) <= (p.alertThreshold || 5)).length;

    html += `
        <!-- Summary Cards -->
        <div class="grid grid-cols-3 gap-2 mb-4">
            <div class="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                <p class="text-[10px] text-slate-400 uppercase font-bold">Items</p>
                <p class="text-xl font-bold text-slate-800">${products.length}</p>
            </div>
            <div class="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                <p class="text-[10px] text-slate-400 uppercase font-bold">Value</p>
                <p class="text-lg font-bold text-brand-600">${AppState.currency}${totalValue.toLocaleString()}</p>
            </div>
            <div class="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                <p class="text-[10px] text-slate-400 uppercase font-bold">Low Stock</p>
                <p class="text-xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}">${lowStockCount}</p>
            </div>
        </div>
        
        <!-- Potential Profit Card -->
        <div class="bg-gradient-to-r from-emerald-500 to-green-600 p-4 rounded-xl text-white mb-4 shadow-lg">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs text-white/70 uppercase font-bold">Potential Profit</p>
                    <p class="text-2xl font-bold">${AppState.currency}${totalProfit.toLocaleString()}</p>
                    <p class="text-xs text-white/70">If all stock sells</p>
                </div>
                <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <i class="ph ph-chart-line-up text-2xl"></i>
                </div>
            </div>
        </div>
        
        <!-- Product List -->
        <div class="mb-4">
            <h3 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <i class="ph ph-package text-slate-400"></i>
                All Products (${products.length})
            </h3>
            ${list}
        </div>
        
    </div>`;

    return html;
}

// ============================================
// 👥 VIEW: CUSTOMERS & VIP CRM (Global Fix)
// ============================================

async function getCustomerListHTML() {
    let vipThreshold = 5000;
    try {
        const setting = await db.settings.get('vip_threshold');
        if (setting) vipThreshold = parseInt(setting.value);
    } catch(e) {}

    let customers = [];
    try {
        if(typeof db !== 'undefined') {
            customers = await db.customers.reverse().toArray();
        }
    } catch(e) {}

    const vips = customers.filter(c => c.totalSpent >= vipThreshold);
    const regulars = customers.filter(c => c.totalSpent < vipThreshold);

    return `
        <div class="p-4 pb-24 animate-fade-in">
            <!-- HEADER -->
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Customers</h2>
                    <p class="text-slate-500 text-sm">${customers.length} contacts found</p>
                </div>
                <button onclick="setVIPRule(${vipThreshold})" class="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-2 rounded-lg border border-brand-100 flex items-center gap-1 active:scale-95">
                    <i class="ph-bold ph-gear"></i> VIP > ${vipThreshold}৳
                </button>
            </div>

            <!-- TABS -->
            <div class="flex p-1 bg-slate-100 rounded-xl mb-4">
                <button onclick="switchCustomerTab('vip')" id="tab-vip" class="flex-1 py-2 text-xs font-bold rounded-lg bg-white text-slate-800 shadow-sm transition-all border border-slate-200">
                    👑 VIPs (${vips.length})
                </button>
                <button onclick="switchCustomerTab('all')" id="tab-all" class="flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 transition-all">
                    All Contacts
                </button>
            </div>

            <!-- LISTS -->
            <div id="list-vip" class="space-y-2">
                ${vips.length === 0 ? `<div class="text-center py-10 bg-amber-50 rounded-xl border border-amber-100 border-dashed"><p class="text-xs text-amber-600 font-bold">No VIPs Yet</p><p class="text-[10px] text-amber-500 mt-1">Keep selling to reach >${vipThreshold}৳</p></div>` : renderCustomerCards(vips, true)}
            </div>
            <div id="list-all" class="space-y-2 hidden">
                ${regulars.length === 0 ? `<p class="text-center text-xs text-slate-400 py-10">No customers found.</p>` : renderCustomerCards(regulars, false)}
            </div>
        </div>
    `;
}

// HELPER: Render Cards
function renderCustomerCards(list, isVip) {
    return list.map(c => `
        <div class="bg-white p-4 rounded-xl border ${isVip ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'} shadow-sm flex justify-between items-center animate-slide-up">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full ${isVip ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'} flex items-center justify-center text-lg font-bold">
                    ${c.name ? c.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                    <h4 class="font-bold text-slate-800 text-sm flex items-center gap-1">
                        ${c.name}
                        ${isVip ? '<i class="ph-fill ph-crown text-amber-500 text-xs"></i>' : ''}
                    </h4>
                    <p class="text-[10px] text-slate-400 font-mono">${c.phone}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-[10px] text-slate-400 uppercase">Spent</p>
                <p class="text-sm font-bold ${isVip ? 'text-amber-600' : 'text-slate-700'}">
                    ${AppState.currency} ${c.totalSpent}
                </p>
                <div class="flex gap-2 justify-end mt-2">
                    <button onclick="openEmail('${c.name}', '${c.email || ''}')" class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 font-bold flex items-center gap-1 active:scale-95">
                        <i class="ph-bold ph-envelope"></i>
                    </button>
                    <button onclick="openWhatsApp('Hello ${c.name}!', '${c.phone}')" class="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 font-bold flex items-center gap-1 active:scale-95">
                        <i class="ph-bold ph-whatsapp-logo"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 🌍 GLOBAL HELPER: Switch Tabs (This fixes the "Not Working" issue)
window.switchCustomerTab = function(tab) {
    const vipList = document.getElementById('list-vip');
    const allList = document.getElementById('list-all');
    const vipTab = document.getElementById('tab-vip');
    const allTab = document.getElementById('tab-all');

    if(!vipList || !allList) return;

    if (tab === 'vip') {
        vipList.classList.remove('hidden');
        allList.classList.add('hidden');
        vipTab.className = "flex-1 py-2 text-xs font-bold rounded-lg bg-white text-slate-800 shadow-sm transition-all border border-slate-200";
        allTab.className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 transition-all";
    } else {
        vipList.classList.add('hidden');
        allList.classList.remove('hidden');
        allTab.className = "flex-1 py-2 text-xs font-bold rounded-lg bg-white text-slate-800 shadow-sm transition-all border border-slate-200";
        vipTab.className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 transition-all";
    }
}

async function getSettingsHTML() {
    let config = { url: '', sheetId: '' };
    try {
        const idSetting = await db.settings.get('sheet_id');
        if(idSetting) config.sheetId = idSetting.value;
    } catch(e) {}

    return `
        <div class="p-5 pb-24 space-y-4 animate-fade-in">
            
            <!-- Header -->
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white">
                    <i class="ph-bold ph-gear text-xl"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-slate-800">Menu</h2>
                    <p class="text-xs text-slate-500">Settings & Tools</p>
                </div>
            </div>

            <!-- ============================================ -->
            <!-- 🔐 ACCOUNT SECTION (At Top!) -->
            <!-- ============================================ -->
            <div class="bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-xl text-white">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                        <i class="ph-bold ph-user text-2xl"></i>
                    </div>
                    <div class="flex-1">
                        <p class="font-bold">Munafa Zen User</p>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs px-2 py-0.5 rounded-full ${
                                AppState.userTier === 'ELITE' ? 'bg-amber-500' :
                                AppState.userTier === 'GROWTH' ? 'bg-purple-500' :
                                'bg-slate-600'
                            }">
                                ${AppState.userTier === 'ELITE' ? '👑' : AppState.userTier === 'GROWTH' ? '⭐' : '🌱'} ${AppState.userTier || 'STARTER'}
                            </span>
                        </div>
                    </div>
                    <button onclick="handleLogout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                        Logout
                    </button>
                </div>
            </div>

            <!-- ============================================ -->
            <!-- ⚙️ SETTINGS BUTTONS -->
            <!-- ============================================ -->
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6">Settings</p>

            <!-- 1. Shop Setup -->
            <button onclick="openModal('businessSettings')" class="w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center">
                        <i class="ph-bold ph-storefront text-xl"></i>
                    </div>
                    <div class="text-left">
                        <h3 class="font-bold text-slate-700 text-sm">Shop Setup</h3>
                        <p class="text-[10px] text-slate-400">Name, Address, Rates</p>
                    </div>
                </div>
                <i class="ph-bold ph-caret-right text-slate-300"></i>
            </button>

            <!-- 2. Staff & Payroll -->
            <button onclick="openStaffModal()" class="w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                        <i class="ph-bold ph-users-three text-xl"></i>
                    </div>
                    <div class="text-left">
                        <h3 class="font-bold text-slate-700 text-sm">Staff & Payroll</h3>
                        <p class="text-[10px] text-slate-400">Manage Team</p>
                    </div>
                </div>
                <i class="ph-bold ph-caret-right text-slate-300"></i>
            </button>

            <!-- 3. Fixed Costs -->
            <button onclick="openFixedCostModal()" class="w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
                        <i class="ph-bold ph-lightning text-xl"></i>
                    </div>
                    <div class="text-left">
                        <h3 class="font-bold text-slate-700 text-sm">Fixed Costs</h3>
                        <p class="text-[10px] text-slate-400">Rent, WiFi, Bills</p>
                    </div>
                </div>
                <i class="ph-bold ph-caret-right text-slate-300"></i>
            </button>

            <!-- ============================================ -->
            <!-- ☁️ CLOUD BACKUP -->
            <!-- ============================================ -->
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6">Cloud Backup</p>
            
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div class="flex items-center gap-2 mb-3">
                    <i class="ph-duotone ph-cloud-arrow-up text-brand-600 text-xl"></i>
                    <span class="text-xs text-slate-500">Google Sheet ID</span>
                </div>
                <form onsubmit="saveBackupConfig(event)" class="space-y-3">
                    <input type="text" name="sheetId" value="${config.sheetId}" placeholder="e.g. 1SK9el..." 
                           class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600">
                    <button type="submit" class="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-sm active:scale-95">
                        Connect Database
                    </button>
                </form>
                <div class="grid grid-cols-2 gap-3 mt-3">
                    <button onclick="performBackup()" class="bg-blue-50 text-blue-700 p-2.5 rounded-xl border border-blue-100 font-bold text-xs">
                        Backup Now
                    </button>
                    <button onclick="performRestore()" class="bg-orange-50 text-orange-700 p-2.5 rounded-xl border border-orange-100 font-bold text-xs">
                        Restore Data
                    </button>
                </div>
            </div>

            <!-- ============================================ -->
            <!-- ⚠️ DANGER ZONE -->
            <!-- ============================================ -->
            <div class="mt-6 pt-4 border-t border-slate-200">
                <button onclick="hardResetApp()" class="w-full text-red-400 text-xs font-medium py-3 hover:bg-red-50 rounded-xl transition-colors">
                    ⚠️ Reset App Data (Delete All)
                </button>
            </div>

            <!-- App Version -->
            <div class="mt-4 text-center pb-4">
                <p class="text-xs text-slate-400">Munafa Zen v2.0</p>
                <p class="text-[10px] text-slate-300">Made with ❤️ in Bangladesh</p>
            </div>

        </div>
    `;
}


// ============================================
// 👑 VIP SETTINGS LOGIC
// ============================================
window.setVIPRule = function(currentValue) {
    openModal('vipSettings');
    setTimeout(() => {
        const input = document.getElementById('vip-input');
        if(input) { input.value = currentValue; input.select(); }
    }, 50);
}

window.handleSaveVIPRule = async function(e) {
    e.preventDefault(); 
    const val = document.getElementById('vip-input').value;
    if(val && !isNaN(val)) {
        await db.settings.put({key: 'vip_threshold', value: parseInt(val)});
        closeModal();
        router('customers'); 
    }
}

// ============================================
// ☁️ BACKUP LOGIC (Deep Sync)
// ============================================

async function saveBackupConfig(e) {
    e.preventDefault();
    if (AppState.userTier === 'STARTER') { alert("🔒 Cloud Sync is for GROWTH/ELITE members."); return; }

    const form = e.target;
    const sheetId = form.sheetId.value.trim();
    if (!sheetId) { alert("Please enter a Sheet ID"); return; }

    const btn = form.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = "Initializing...";
    
    try {
        const response = await fetch(BACKUP_API, {
            method: 'POST',
            body: JSON.stringify({ action: 'SETUP', sheetId: sheetId })
        });
        const res = await response.json();
        
        if (res.status === 'success') {
            await db.settings.put({ key: 'sheet_id', value: sheetId });
            alert("✅ Connected! Database structure created.");
        } else { throw new Error(res.message); }
    } catch(err) { alert("Error: " + err.message); } 
    finally { btn.innerHTML = originalText; }
}

// ============================================
// ☁️ SYNC LOGIC (Visual Feedback Upgrade)
// ============================================

async function performBackup() {
    if (AppState.userTier === 'STARTER') {
        alert("🔒 Cloud Sync is a Paid Feature.\nUpgrade to GROWTH or ELITE.");
        return;
    }

    // 1. Grab the Floating Button UI
    const btn = document.getElementById('floating-sync-btn');
    const icon = document.getElementById('sync-icon');
    
    // Animation: Start Spinning
    if(icon) icon.classList.replace('ph-cloud-arrow-up', 'ph-spinner');
    if(icon) icon.classList.add('animate-spin');

    try {
        const sheetId = (await db.settings.get('sheet_id'))?.value;
        if(!sheetId) throw new Error("Please connect a Google Sheet in Settings first!");

        // 2. Prepare Data
        const payload = {
            orders: JSON.parse(JSON.stringify(await db.orders.toArray())),
            products: JSON.parse(JSON.stringify(await db.products.toArray())),
            customers: JSON.parse(JSON.stringify(await db.customers.toArray())),
            expenses: JSON.parse(JSON.stringify(await db.expenses.toArray())),
            staff: JSON.parse(JSON.stringify(await db.staff.toArray())),
            fixedCosts: JSON.parse(JSON.stringify(await db.fixedCosts.toArray())),
            couriers: JSON.parse(JSON.stringify(await db.couriers.toArray()))
        };

        // 3. Send
        const response = await fetch(BACKUP_API, {
            method: 'POST',
            body: JSON.stringify({ action: 'BACKUP_ALL', sheetId: sheetId, data: payload })
        });
        const res = await response.json();
        
        if(res.status === 'success') {
            // ✅ Success Animation
            if(icon) {
                icon.classList.remove('animate-spin');
                icon.classList.replace('ph-spinner', 'ph-check');
                icon.classList.replace('text-blue-600', 'text-green-600');
            }
            
            // Revert back to Cloud icon after 2 seconds
            setTimeout(() => {
                if(icon) {
                    icon.classList.replace('ph-check', 'ph-cloud-arrow-up');
                    icon.classList.replace('text-green-600', 'text-blue-600');
                }
            }, 2000);
            
            // Optional: Toast message instead of annoying Alert
            // alert("✅ Synced!"); 
        } else {
            throw new Error(res.message);
        }

    } catch(e) {
        alert("❌ Sync Failed: " + e.message);
        // Reset Icon on fail
        if(icon) {
            icon.classList.remove('animate-spin');
            icon.classList.replace('ph-spinner', 'ph-warning');
            icon.classList.replace('text-blue-600', 'text-red-500');
        }
    }
}

async function performRestore() {
    if(!confirm("Overwrite local data?")) return;
    const btn = document.querySelector('button[onclick="performRestore()"]');
    btn.innerHTML = `Downloading...`;

    try {
        const sheetId = (await db.settings.get('sheet_id'))?.value;
        const response = await fetch(BACKUP_API, { method: 'POST', body: JSON.stringify({ action: 'RESTORE_ALL', sheetId }) });
        const res = await response.json();

        if (res.status === 'success') {
            const d = res.data;
            // Clear & Fill
            await db.transaction('rw', db.orders, db.products, db.customers, db.expenses, db.staff, db.fixedCosts, async () => {
                await db.orders.clear(); await db.orders.bulkAdd(d.orders || []);
                await db.products.clear(); await db.products.bulkAdd(d.products || []);
                await db.customers.clear(); await db.customers.bulkAdd(d.customers || []);
                await db.expenses.clear(); await db.expenses.bulkAdd(d.expenses || []);
                await db.staff.clear(); await db.staff.bulkAdd(d.staff || []);
                await db.fixedCosts.clear(); await db.fixedCosts.bulkAdd(d.fixedCosts || []);
            });
            alert("✅ Data Restored!");
            location.reload();
        } else throw new Error(res.message);

    } catch(e) { alert("Restore Error: " + e.message); }
    finally { btn.innerHTML = originalText; }
}

function hardResetApp() {
    if(confirm("⚠️ DELETE EVERYTHING? This cannot be undone.")) {
        db.delete().then(() => location.reload());
    }
}



// ============================================
// ➕ MODALS & UI TEMPLATES (Complete Collection)
// ============================================

const Modals = {
    // ⚙️ FIXED COSTS MANAGER (This was missing!)
    manageFixedCosts: `
        <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-slide-up h-[80vh] flex flex-col">
            <div class="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
                <div><h3 class="font-bold text-lg">Fixed Costs</h3><p class="text-xs text-slate-400">Monthly Recurring</p></div>
                <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><i class="ph-bold ph-x"></i></button>
            </div>
            
            <form onsubmit="handleAddFixedCost(event)" class="p-4 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
                <div class="grid grid-cols-2 gap-2">
                    <input type="text" name="name" required placeholder="Name (e.g. WiFi)" class="w-full text-xs px-3 py-2 rounded-lg border border-slate-200">
                    <select name="category" class="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white">
                        <option value="Rent">Rent</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Marketing">Marketing Budget</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="flex gap-2">
                    <input type="number" name="amount" required placeholder="Amount" class="w-full text-xs px-3 py-2 rounded-lg border border-slate-200">
                    <button type="submit" class="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg whitespace-nowrap">+ Add</button>
                </div>
            </form>

            <div id="fixed-cost-list" class="flex-1 overflow-y-auto p-4 space-y-2">Loading...</div>

            <div class="p-4 bg-white border-t border-slate-100 shrink-0">
                <button onclick="applyMonthlyFixedCosts()" class="w-full bg-rose-600 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
                    <i class="ph-bold ph-lightning"></i> Apply All (৳<span id="fixed-total">0</span>)
                </button>
            </div>
        </div>
    `,

    // 👔 STAFF MANAGER
    manageStaff: `
        <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-slide-up h-[80vh] flex flex-col">
            <div class="bg-indigo-600 text-white p-4 flex justify-between items-center shrink-0">
                <div><h3 class="font-bold text-lg">Staff Manager</h3><p class="text-xs text-indigo-200">Payroll & Team</p></div>
                <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center"><i class="ph-bold ph-x"></i></button>
            </div>
            
            <form onsubmit="handleAddStaff(event)" class="p-4 bg-indigo-50/50 border-b border-indigo-100 shrink-0">
                <div class="grid grid-cols-2 gap-2 mb-2">
                    <input type="text" name="name" required placeholder="Name" class="w-full text-xs px-3 py-2 rounded-lg border border-slate-200">
                    <input type="text" name="role" required placeholder="Role" class="w-full text-xs px-3 py-2 rounded-lg border border-slate-200">
                </div>
                <div class="flex gap-2">
                    <input type="number" name="salary" required placeholder="Salary (৳)" class="w-full text-xs px-3 py-2 rounded-lg border border-slate-200">
                    <button type="submit" class="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg">+ Add</button>
                </div>
            </form>

            <div id="staff-list-container" class="flex-1 overflow-y-auto p-4 space-y-2">Loading...</div>

            <div class="p-4 bg-white border-t border-slate-100 shrink-0">
                <button onclick="runPayroll()" class="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg">Run Payroll (৳<span id="payroll-total">0</span>)</button>
            </div>
        </div>
    `,

   // 📦 ADD PRODUCT (Deep Inventory)
addProduct: `
    <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-slide-up h-[90vh] flex flex-col">
        <div class="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
            <div><h3 class="font-bold text-lg">Add Product</h3><p class="text-xs text-slate-400">Inventory</p></div>
            <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><i class="ph-bold ph-x"></i></button>
        </div>
        
        <form onsubmit="handleSaveProduct(event)" class="p-6 space-y-5 overflow-y-auto flex-1">
            <div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label><input type="text" name="name" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"></div>
            <div class="grid grid-cols-2 gap-3">
                <div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">SKU</label><input type="text" name="sku" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"></div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                    <input type="text" name="category" list="cat-options" placeholder="Select/Type" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold">
                    <datalist id="cat-options"><option value="Clothing"><option value="Electronics"><option value="Beauty"><option value="Cosmetics"><option value="Food"><option value="Medicine"></datalist>
                </div>
            </div>
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <p class="text-xs font-bold text-slate-400 uppercase">Variants</p>
                <div><label class="block text-[10px] font-bold text-slate-500">Sizes</label><input type="text" name="sizes" placeholder="S, M, L" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"></div>
                <div><label class="block text-[10px] font-bold text-slate-500">Colors</label><input type="text" name="colors" placeholder="Red, Blue" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cost</label><input type="number" name="costPrice" required class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"></div>
                <div><label class="block text-[10px] font-bold text-brand-600 uppercase mb-1">Selling</label><input type="number" name="sellingPrice" required class="w-full bg-white border-2 border-brand-200 rounded-xl px-3 py-2 text-sm font-bold text-brand-700"></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stock</label><input type="number" name="stock" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"></div>
                <div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alert</label><input type="number" name="alert" value="5" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"></div>
            </div>
            
            <!-- ✅ NEW: Expiry Date Field -->
            <div class="bg-orange-50 p-4 rounded-xl border border-orange-200">
                <label class="block text-[10px] font-bold text-orange-600 uppercase mb-1">
                    Expiry Date <span class="text-orange-400 font-normal">(Optional)</span>
                </label>
                <input type="date" name="expiryDate" class="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-sm font-bold">
                <p class="text-[10px] text-orange-500 mt-1">শুধু পচনশীল/মেয়াদ আছে এমন প্রোডাক্টের জন্য (Cosmetics, Food, Medicine)</p>
            </div>
            
            <button type="submit" class="w-full bg-brand-600 text-white font-bold py-4 rounded-xl shadow-lg mt-2">Save Product</button>
        </form>
    </div>
`,
    // 💸 ADD EXPENSE
    addExpense: `
        <div class="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div class="bg-slate-900 text-white p-4 flex justify-between items-center"><h3>Log Expense</h3><button onclick="closeModal()"><i class="ph-bold ph-x"></i></button></div>
            <form onsubmit="handleSaveExpense(event)" class="p-6 space-y-5">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                    <select name="category" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700">
                        <option value="Marketing">📢 Marketing</option><option value="Packaging">📦 Packaging</option><option value="Salary">👔 Salary</option><option value="Rent">🏠 Rent</option><option value="Utilities">💡 Utilities</option><option value="Purchase">🚚 Purchase</option><option value="Other">☕ Other</option>
                    </select>
                </div>
                <div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">Amount</label><input type="number" name="amount" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xl font-bold"></div>
                <div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">Note</label><input type="text" name="note" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"></div>
                <button type="submit" class="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl">Confirm</button>
            </form>
        </div>
    `,

    // ⚙️ BUSINESS SETTINGS
    businessSettings: `
        <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div class="bg-slate-900 text-white p-4 flex justify-between items-center"><h3>Settings</h3><button onclick="closeModal()"><i class="ph-bold ph-x"></i></button></div>
            <form onsubmit="saveBusinessProfile(event)" class="p-6 space-y-4">
                <div><label class="block text-[10px] font-bold text-slate-500 mb-1">Shop Name</label><input type="text" name="shopName" id="set-shopName" class="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm font-bold"></div>
                <div><label class="block text-[10px] font-bold text-slate-500 mb-1">Delivery</label><div class="grid grid-cols-2 gap-3"><input type="number" name="rateInside" id="set-rateInside" class="w-full border rounded-xl px-3 py-2 text-sm"><input type="number" name="rateOutside" id="set-rateOutside" class="w-full border rounded-xl px-3 py-2 text-sm"></div></div>
                <button type="submit" class="w-full bg-slate-900 text-white font-bold py-3 rounded-xl">Save</button>
            </form>
        </div>
    `,

        // 🛒 ADD ORDER (Deep Variant Support)
    addOrder: `
        <div class="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-slide-up h-[90vh] flex flex-col">
            <div class="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                <div><h3 class="font-bold text-lg">New Order</h3><p class="text-xs text-slate-400">Create Invoice</p></div>
                <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center"><i class="ph-bold ph-x"></i></button>
            </div>
            
            <form onsubmit="handleSaveOrder(event)" class="p-5 space-y-5 overflow-y-auto flex-1">
                
                <!-- CUSTOMER INFO -->
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Details</p>
                    <div class="grid grid-cols-2 gap-3">
                        <div><label class="text-[10px] font-bold text-slate-500">Phone</label><input type="tel" name="phone" required placeholder="017..." class="w-full border rounded-lg px-3 py-2 text-sm font-bold"></div>
                        <div><label class="text-[10px] font-bold text-slate-500">Name</label><input type="text" name="customerName" required placeholder="Mr. X" class="w-full border rounded-lg px-3 py-2 text-sm"></div>
                    </div>
                    <div><label class="text-[10px] font-bold text-slate-500">Address</label><textarea name="address" required placeholder="Full Address" rows="2" class="w-full border rounded-lg px-3 py-2 text-sm"></textarea></div>
                </div>

                <!-- PRODUCT SELECTION -->
                <div class="bg-white border-2 border-brand-100 p-3 rounded-xl space-y-3">
                    <div class="flex justify-between">
                        <label class="text-xs font-bold text-brand-600 uppercase">Item Selection</label>
                        <span id="stock-indicator" class="text-[10px]"></span>
                    </div>
                    
                    <select id="product-select" name="productSku" required onchange="updatePriceFromProduct(this)" class="w-full border border-slate-300 rounded-xl px-3 py-3 text-sm font-bold bg-white focus:border-brand-500"><option value="">-- Choose Product --</option></select>
                    
                    <!-- DYNAMIC VARIANTS (Hidden by default) -->
                    <div id="variant-section" class="hidden grid grid-cols-2 gap-3">
                        <div><label class="text-[10px] font-bold text-slate-500">Size</label><select name="size" id="size-select" class="w-full border rounded-lg px-2 py-2 text-sm"><option value="">N/A</option></select></div>
                        <div><label class="text-[10px] font-bold text-slate-500">Color</label><select name="color" id="color-select" class="w-full border rounded-lg px-2 py-2 text-sm"><option value="">N/A</option></select></div>
                    </div>

                    <!-- CUSTOM NOTE -->
                    <div><label class="text-[10px] font-bold text-slate-500">Custom Note / Size</label><input type="text" name="customNote" placeholder="e.g. Waist 34, Gift Wrap" class="w-full border rounded-lg px-3 py-2 text-sm text-slate-600"></div>

                    <!-- QTY & PRICE -->
                    <div class="grid grid-cols-3 gap-3 pt-2">
                        <div><label class="text-[10px] font-bold text-slate-500">Qty</label><input type="number" name="quantity" value="1" min="1" onchange="calculateTotal()" class="w-full border rounded-xl px-2 py-2 text-center font-bold"></div>
                        <div class="col-span-2"><label class="text-[10px] font-bold text-slate-500">Unit Price</label><input type="number" name="unitPrice" id="unit-price" required readonly class="w-full bg-slate-100 border rounded-xl px-3 py-2 text-right font-bold"></div>
                    </div>
                </div>

                <!-- DELIVERY -->
                <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase">Courier</label>
                        <!-- Editable Input (List) for flexibility -->
                        <input type="text" name="courier" list="courier-list" placeholder="Select/Type" class="w-full mt-1 border rounded-lg px-2 py-2 text-sm font-bold">
                        <datalist id="courier-list">
                            <option value="Pathao"><option value="Steadfast"><option value="Paperfly"><option value="RedX"><option value="Manual">
                        </datalist>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Delivery Fee</label>
                        <input type="number" name="deliveryCharge" id="delivery-input" value="120" onchange="calculateTotal()" 
                            class="w-full border rounded-lg px-2 py-2 text-sm font-bold text-center text-brand-600 focus:border-brand-500">
                    </div>
                </div>

                <!-- FOOTER -->
                <div class="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center shadow-lg sticky bottom-0">
                    <div><p class="text-[10px] text-slate-400 uppercase">Grand Total</p><h2 class="text-2xl font-bold">৳ <span id="grand-total">0</span></h2></div>
                    <button type="submit" class="bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-3 rounded-xl transition-colors">Confirm</button>
                </div>
            </form>
        </div>
    `,

    // 👑 VIP SETTINGS
    vipSettings: `
        <div class="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div class="bg-slate-900 text-white p-4 flex justify-between items-center">
                <h3 class="font-bold text-lg">VIP Settings</h3>
                <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><i class="ph-bold ph-x"></i></button>
            </div>
            <form onsubmit="handleSaveVIPRule(event)" class="p-6 text-center">
                <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500"><i class="ph-duotone ph-crown text-3xl"></i></div>
                <h4 class="font-bold text-slate-800 text-lg mb-2">Define VIPs</h4>
                <p class="text-sm text-slate-500 mb-6">Customers become VIP when spending crosses:</p>
                <div class="relative mb-6">
                    <span class="absolute left-4 top-3.5 font-bold text-slate-400">৳</span>
                    <input type="number" name="threshold" id="vip-input" required class="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-8 pr-4 py-3 text-xl font-bold text-center focus:border-brand-500 focus:outline-none">
                </div>
                <button type="submit" class="w-full bg-brand-600 text-white font-bold py-3 rounded-xl">Save Rule</button>
            </form>
        </div>
    `,

        // 💸 ADD EXPENSE (UPGRADED)
    addExpense: `
        <div class="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div class="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div><h3 class="font-bold text-lg">Log Expense</h3><p class="text-xs text-slate-400">Track your cashflow</p></div>
                <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><i class="ph-bold ph-x"></i></button>
            </div>
            <form onsubmit="handleSaveExpense(event)" class="p-6 space-y-5">
                
                <!-- Category Dropdown -->
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                    <select name="category" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-500">
                        <option value="Marketing">📢 Marketing (Ads/Influencer)</option>
                        <option value="Packaging">📦 Packaging Material</option>
                        <option value="Salary">👔 Staff Salary</option>
                        <option value="Rent">🏠 Office/Shop Rent</option>
                        <option value="Utilities">💡 Electricity/Internet</option>
                        <option value="Purchase">🚚 Bulk Product Purchase</option>
                        <option value="Other">☕ Other / Tea-Bill</option>
                    </select>
                </div>

                <!-- Amount -->
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Amount Spent</label>
                    <div class="relative">
                        <span class="absolute left-4 top-3.5 font-bold text-slate-400">৳</span>
                        <input type="number" name="amount" required placeholder="0" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-xl font-bold text-slate-800 focus:border-brand-500 focus:outline-none">
                    </div>
                </div>

                <!-- Note (Optional) -->
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Description (Optional)</label>
                    <input type="text" name="note" placeholder="e.g. Facebook Boost for Eid" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-600">
                </div>

                <button type="submit" class="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform">
                    Confirm Expense
                </button>
            </form>
        </div>
    `,

    // 👔 MANAGE STAFF (NEW!)
    manageStaff: `
        <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-slide-up h-[80vh] flex flex-col">
            <div class="bg-indigo-600 text-white p-4 flex justify-between items-center shrink-0">
                <div><h3 class="font-bold text-lg">Staff Manager</h3><p class="text-xs text-indigo-200">Payroll & Team</p></div>
                <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center"><i class="ph-bold ph-x"></i></button>
            </div>
            
            <!-- ADD STAFF FORM -->
            <form onsubmit="handleAddStaff(event)" class="p-4 bg-indigo-50/50 border-b border-indigo-100 shrink-0">
                <div class="grid grid-cols-2 gap-2 mb-2">
                    <input type="text" name="name" required placeholder="Name" class="w-full text-xs px-3 py-2 rounded-lg border border-slate-200">
                    <input type="text" name="role" required placeholder="Role (e.g. Packer)" class="w-full text-xs px-3 py-2 rounded-lg border border-slate-200">
                </div>
                <div class="flex gap-2">
                    <input type="number" name="salary" required placeholder="Salary (৳)" class="w-full text-xs px-3 py-2 rounded-lg border border-slate-200">
                    <button type="submit" class="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg whitespace-nowrap">+ Add</button>
                </div>
            </form>

            <!-- STAFF LIST -->
            <div id="staff-list-container" class="flex-1 overflow-y-auto p-4 space-y-2">
                <div class="text-center text-slate-400 text-xs py-10">Loading Team...</div>
            </div>

            <!-- PAYROLL ACTION -->
            <div class="p-4 bg-white border-t border-slate-100 shrink-0">
                <button onclick="runPayroll()" class="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    <i class="ph-bold ph-money"></i> Run Payroll (Total: ৳<span id="payroll-total">0</span>)
                </button>
                <p class="text-[10px] text-center text-slate-400 mt-2">Adds "Staff Salary" to Expenses</p>
            </div>
        </div>
    `,
    // 🪄 PRICE DOCTOR
    priceDoctor: `
        <div class="bg-slate-900 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-slide-up text-white">
            <div class="p-5 border-b border-white/10 flex justify-between items-center">
                <div><h3 class="font-bold text-lg">Price Doctor 🪄</h3><p class="text-xs text-slate-400">Based on Cost: ৳<span id="pd-cost-display">0</span></p></div>
                <button onclick="openModal('addProduct')" class="text-sm text-slate-400 hover:text-white">Back</button>
            </div>
            <div class="p-5 space-y-3">
                <div id="pd-card-a" class="bg-white/5 p-3 rounded-xl border border-white/10 cursor-pointer flex justify-between items-center hover:bg-white/10">
                    <div><p class="text-xs text-brand-400 font-bold uppercase">Charm Pricing</p><p class="text-[10px] text-slate-400">Volume Driver</p></div>
                    <div class="text-right"><h4 class="text-xl font-bold">৳ <span id="pd-price-a">0</span></h4><span id="pd-margin-a" class="text-[10px] text-green-400">0%</span></div>
                </div>
                <div id="pd-card-b" class="bg-brand-600 p-4 rounded-xl border border-brand-400 cursor-pointer flex justify-between items-center shadow-lg transform scale-105">
                    <div><p class="text-xs text-white font-bold uppercase">Profit Max</p><p class="text-[10px] text-brand-100">Recommended</p></div>
                    <div class="text-right"><h4 class="text-2xl font-bold">৳ <span id="pd-price-b">0</span></h4><span id="pd-margin-b" class="text-[10px] bg-white text-brand-700 px-1 rounded font-bold">0%</span></div>
                </div>
                <div id="pd-card-c" class="bg-white/5 p-3 rounded-xl border border-white/10 cursor-pointer flex justify-between items-center hover:bg-white/10">
                    <div><p class="text-xs text-purple-400 font-bold uppercase">Anchor / MRP</p><p class="text-[10px] text-slate-400">High Perception</p></div>
                    <div class="text-right"><h4 class="text-xl font-bold">৳ <span id="pd-price-c">0</span></h4><span id="pd-margin-c" class="text-[10px] text-purple-400">0%</span></div>
                </div>
            </div>
        </div>
    `,

    // 🧠 OFFER AI WIZARD
    offerWizard: `
        <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-slide-up h-[80vh] flex flex-col">
            <div class="bg-purple-900 text-white p-5">
                <div class="flex justify-between items-start">
                    <div><h3 class="font-bold text-lg flex items-center gap-2"><i class="ph-fill ph-brain"></i> Offer AI</h3><p class="text-xs text-purple-200 mt-1">Based on the 6-Step Value Formula.</p></div>
                    <button onclick="closeModal()" class="text-white/70 hover:text-white"><i class="ph-bold ph-x text-xl"></i></button>
                </div>
            </div>
            <form onsubmit="generatePerfectOffer(event)" class="p-6 space-y-6 overflow-y-auto flex-1">
                <div><label class="block text-xs font-bold text-purple-900 uppercase mb-2">1. What are you selling?</label><input type="text" name="product" required placeholder="e.g. Silk Saree" class="w-full bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 text-sm font-bold"></div>
                <div><label class="block text-xs font-bold text-purple-900 uppercase mb-2">2. The Dream Outcome?</label><p class="text-[10px] text-slate-500 mb-2">How will they FEEL?</p><input type="text" name="dream" required placeholder="e.g. Look like a Queen" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"></div>
                <div>
                    <label class="block text-xs font-bold text-purple-900 uppercase mb-2">3. The Main Fear?</label>
                    <select name="roadblock" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm">
                        <option value="risk">Risk ("What if quality is bad?")</option>
                        <option value="money">Money ("Too expensive")</option>
                        <option value="time">Time ("Need it urgently")</option>
                        <option value="effort">Effort ("Hard to use")</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-purple-900 uppercase mb-2">4. Stack the Value</label>
                    <div class="space-y-2">
                        <label class="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border"><input type="checkbox" name="bonus" value="Free Delivery" checked> 🚚 Free Delivery</label>
                        <label class="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border"><input type="checkbox" name="bonus" value="Premium Box"> 🎁 Premium Box</label>
                        <label class="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border"><input type="checkbox" name="bonus" value="7-Day Returns"> 🛡️ 7-Day Returns</label>
                    </div>
                </div>
                <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"><i class="ph-bold ph-magic-wand"></i> Generate Magic Offer</button>
            </form>
        </div>
    `,

    // 📄 RESULT MODAL
    offerResult: `
        <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div class="bg-emerald-600 text-white p-4 flex justify-between items-center">
                <h3 class="font-bold text-lg">Offer Generated! 🎉</h3>
                <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center"><i class="ph-bold ph-x"></i></button>
            </div>
            <div class="p-6">
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed mb-4 font-mono" id="offer-text-output">Generating...</div>
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="copyOfferText()" class="bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50">Copy Text</button>
                    <button onclick="sendOfferWA()" class="bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/30">Open WhatsApp</button>
                </div>
            </div>
        </div>
    `,


};
// ============================================
// 🛠️ HELPER FUNCTIONS (Logic Core)
// ============================================

function openModal(modalName) {
    const overlay = document.getElementById('modal-overlay');
    overlay.innerHTML = Modals[modalName];
    overlay.classList.remove('hidden', 'opacity-0');
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('opacity-0');
    setTimeout(() => { overlay.classList.add('hidden'); overlay.innerHTML = ''; }, 200);
}

// 📦 PRODUCT LOGIC (Deep Inventory)
async function prepareProductModal() {
    openModal('addProduct');
    // Note: We use <datalist> for categories now, so no need to manual populate select options.
    // The browser handles suggestions automatically if we saved them to settings.
    loadCategorySuggestions(); 
}

async function loadCategorySuggestions() {
    const dataList = document.getElementById('cat-options');
    if(!dataList) return;
    
    try {
        const profile = await db.settings.get('business_profile');
        if (profile && profile.value && profile.value.categories) {
            dataList.innerHTML = ''; // Clear defaults
            const cats = profile.value.categories.split(',').map(s => s.trim());
            cats.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                dataList.appendChild(opt);
            });
        }
    } catch(e) {}
}

async function handleSaveProduct(e) {
    e.preventDefault();
    const form = e.target;
    
    try {
        // 1. Save to Database (With Deep Data)
        await db.products.add({
            name: form.name.value,
            sku: form.sku.value,
            
            // Category & Variants
            category: form.category.value || 'General',
            sizes: form.sizes.value,
            colors: form.colors.value,
            
            // Pricing
            costPrice: parseFloat(form.costPrice.value),
            sellingPrice: parseFloat(form.sellingPrice.value),
            
            // Stock
            stockQuantity: parseInt(form.stock.value),
            alertThreshold: parseInt(form.alert.value),
            
            // ✅ NEW: Expiry Date (Optional)
            expiryDate: form.expiryDate.value || null,
            
            // Timestamps
            createdAt: Date.now()
        });
        
        // 2. Remember Category
        saveNewCategory(form.category.value);

        closeModal();
        alert("✅ Product Added!");
        
        // Refresh View
        if(AppState.currentView === 'inventory') router('inventory');
        else router('dashboard');

    } catch (err) { 
        console.error('Save product error:', err);
        alert("Error: " + err.message); 
    }
}
async function saveNewCategory(newCat) {
    if(!newCat) return;
    try {
        const profile = await db.settings.get('business_profile');
        let currentCats = "General"; 
        
        if (profile && profile.value && profile.value.categories) {
            currentCats = profile.value.categories;
        }
        
        if (!currentCats.includes(newCat)) {
            const updatedCats = currentCats + "," + newCat;
            await db.settings.put({ 
                key: 'business_profile', 
                value: { ...profile?.value, categories: updatedCats } 
            });
        }
    } catch(e) {}
}

// ============================================
// 🛒 ORDER LOGIC (Deep Variants & Rich Data)
// ============================================

async function prepareOrderModal() {
    openModal('addOrder');
    const products = await db.products.toArray();
    const select = document.getElementById('product-select');
    
    // Populate Products with Hidden Data
    select.innerHTML = '<option value="">-- Choose Product --</option>';
    products.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.sku;
        
        // Store hidden data in the HTML element itself
        opt.dataset.price = p.sellingPrice;
        opt.dataset.cost = p.costPrice;
        opt.dataset.stock = p.stockQuantity;
        opt.dataset.sizes = p.sizes || "";   // Stores "S, M, L"
        opt.dataset.colors = p.colors || ""; // Stores "Red, Blue"
        
        opt.text = `${p.name} (Stock: ${p.stockQuantity})`;
        select.appendChild(opt);
    });
}

function updatePriceFromProduct(select) {
    const option = select.options[select.selectedIndex];
    if(!option.value) return;

    // 1. Set Price & Stock UI
    document.getElementById('unit-price').value = option.dataset.price;
    const stock = option.dataset.stock;
    
    // Stock Indicator Color
    const indicator = document.getElementById('stock-indicator');
    if(indicator) {
        indicator.innerText = `In Stock: ${stock}`;
        indicator.className = stock < 5 ? 'text-red-500 font-bold ml-2 text-[10px]' : 'text-green-600 ml-2 text-[10px]';
    }

    // 2. Handle Variants (The Magic Part)
    const variantSection = document.getElementById('variant-section');
    const sizeSelect = document.getElementById('size-select');
    const colorSelect = document.getElementById('color-select');
    
    // Read from the dataset we stored earlier
    const sizes = option.dataset.sizes ? option.dataset.sizes.split(',') : [];
    const colors = option.dataset.colors ? option.dataset.colors.split(',') : [];

    // Show/Hide section based on data
    if (sizes.length > 0 || colors.length > 0) {
        variantSection.classList.remove('hidden');
        
        // Fill Size Dropdown
        sizeSelect.innerHTML = sizes.length 
            ? sizes.map(s => `<option value="${s.trim()}">${s.trim()}</option>`).join('') 
            : '<option value="">N/A</option>';
        
        // Fill Color Dropdown
        colorSelect.innerHTML = colors.length 
            ? colors.map(c => `<option value="${c.trim()}">${c.trim()}</option>`).join('') 
            : '<option value="">N/A</option>';
    } else {
        variantSection.classList.add('hidden');
    }

    calculateTotal();
}

function calculateTotal() {
    const qty = document.querySelector('input[name="quantity"]').value || 0;
    const price = document.querySelector('input[name="unitPrice"]').value || 0;
    const delivery = document.querySelector('input[name="deliveryCharge"]').value || 0;
    const total = (qty * price) + parseFloat(delivery);
    
    const grandEl = document.getElementById('grand-total');
    if(grandEl) grandEl.innerText = total;
}

async function handleSaveOrder(e) {
    e.preventDefault();
    const form = e.target;
    
    // Basic Calculations
    const qty = parseInt(form.quantity.value);
    const price = parseFloat(form.unitPrice.value);
    const delivery = parseFloat(form.deliveryCharge.value);
    const total = (qty * price) + delivery;
    
    // Profit Calculation
    const select = document.getElementById('product-select');
    const cost = parseFloat(select.options[select.selectedIndex].dataset.cost || 0);
    const profit = total - ((qty * cost) + delivery);

    // Get Variant Info
    const size = form.size ? form.size.value : "";
    const color = form.color ? form.color.value : "";
    const note = form.customNote.value;
    
    // Construct Rich Name for Sheet (e.g. "Panjabi (L Red)")
    let productName = select.options[select.selectedIndex].text.split(' (')[0];
    if(size || color) productName += ` (${size} ${color})`;
    if(note) productName += ` [${note}]`;

    try {
        await db.orders.add({
            orderId: 'ORD-' + Date.now().toString().slice(-5),
            date: new Date(),
            customerName: form.customerName.value,
            customerPhone: form.phone.value,
            address: form.address.value,
            grandTotal: total,
            netProfit: profit,
            deliveryCharge: delivery,
            courier: form.courier.value, 
            status: 'Pending',
            items: [{ 
                sku: form.productSku.value, 
                productName: productName, // ✅ Saves the specific size/color name
                qty: qty,
                price: price
            }]
        });
        
        // Stock Update
        const p = await db.products.where('sku').equals(form.productSku.value).first();
        if(p) await db.products.update(p.id, { stockQuantity: p.stockQuantity - qty });

        // Customer Update
        const customer = await db.customers.get(form.phone.value);
        if(customer) {
            await db.customers.update(form.phone.value, { totalSpent: customer.totalSpent + total });
        } else {
            await db.customers.add({
                phone: form.phone.value,
                name: form.customerName.value,
                totalSpent: total,
                totalOrders: 1,
                riskScore: 0,
                tier: 'Bronze'
            });
        }

        closeModal();
        alert("🎉 Order Saved!");
        router('dashboard');
        
    } catch (err) { alert("Error: " + err.message); }
}

// ============================================
// 💬 WHATSAPP HELPER
// ============================================
function openWhatsApp(text, phoneNumber = null) {
    const safeText = encodeURIComponent(text.trim());
    let url = '';
    if (phoneNumber) {
        let cleanPhone = phoneNumber.replace(/\D/g, '');
        if (!cleanPhone.startsWith('880')) cleanPhone = '880' + cleanPhone.replace(/^0+/, '');
        url = `https://wa.me/${cleanPhone}?text=${safeText}`;
    } else {
        url = `https://wa.me/?text=${safeText}`;
    }
    window.open(url, '_blank');
}



// ============================================
// 🧠 PERFECT OFFER GENERATOR LOGIC
// ============================================

let currentGeneratedOffer = "";

function generatePerfectOffer(e) {
    e.preventDefault();
    const form = e.target;
    
    // 1. Capture Inputs
    const product = form.product.value;
    const dream = form.dream.value; // "Look like a Queen"
    const roadblockType = form.roadblock.value;
    
    // Get Checked Bonuses
    const bonuses = Array.from(document.querySelectorAll('input[name="bonus"]:checked'))
        .map(cb => cb.value);
    
    // 2. Apply The Formula (Logic)
    
    // A. Roadblock Solution
    let guarantee = "";
    if (roadblockType === 'risk') guarantee = "Don't like it? Instant Return Policy. No questions asked.";
    if (roadblockType === 'money') guarantee = "Best Price Guarantee for this quality.";
    if (roadblockType === 'time') guarantee = "Order now, Get it within 24 Hours!";
    if (roadblockType === 'effort') guarantee = "Ready to wear. No styling needed.";

    // B. The Value Stack String
    const stack = bonuses.length > 0 
        ? "\n\n🎁 BONUSES INCLUDED:\n" + bonuses.map(b => `✅ ${b}`).join("\n") 
        : "";

    // C. Construct the Copy (The Script)
    const copy = `
✨ THE ${product.toUpperCase()} DREAM DEAL ✨

Want to ${dream}? 
Now you can, without worrying about ${roadblockType}!

Introducing the ${product} Premium Edition.
${guarantee}

${stack}

⏰ URGENCY: Only 5 units left at this price!
👇 Reply "YES" to book yours now!
    `.trim();

    // 3. Show Result
    currentGeneratedOffer = copy;
    openModal('offerResult'); // Switch modals
    
    // Wait for modal to open then inject text
    setTimeout(() => {
        document.getElementById('offer-text-output').innerText = copy;
    }, 100);
}

// Helper: Copy to Clipboard
function copyOfferText() {
    const textElement = document.getElementById('offer-text-output');
    const text = textElement ? textElement.innerText : '';
    
    // Method 1: Try modern clipboard API
    if (navigator.clipboard && document.hasFocus()) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showToast('✅ কপি হয়েছে!', 'success');
            })
            .catch(err => {
                console.log('Clipboard API failed, using fallback');
                fallbackCopy(text);
            });
    } else {
        // Method 2: Fallback for unfocused window
        fallbackCopy(text);
    }
}

// Fallback copy method
function fallbackCopy(text) {
    try {
        // Create temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        
        // Select and copy
        textarea.focus();
        textarea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (successful) {
            showToast('✅ কপি হয়েছে!', 'success');
        } else {
            showToast('❌ কপি করতে পারেনি', 'error');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showToast('❌ কপি করতে পারেনি', 'error');
    }
}

// Helper: Send
function sendOfferWA() {
    openWhatsApp(currentGeneratedOffer);
}


// ============================================
// 🔐 SECURITY & LOGIN LOGIC
// ============================================

// GENERATE DEVICE FINGERPRINT (Simple version)
function getDeviceID() {
    let id = localStorage.getItem('biz_device_id');
    if (!id) {
        id = 'DEV-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
        localStorage.setItem('biz_device_id', id);
    }
    return id;
}
// ============================================
// 🪄 PRICE DOCTOR LOGIC (With Security Check)
// ============================================

function calculatePricing(cost) {
    cost = parseFloat(cost);
    if (!cost || isNaN(cost)) return null;

    // A: Charm (Ends in 90)
    let priceA = Math.ceil((cost * 1.6) / 10) * 10; 
    if (priceA % 100 === 0) priceA -= 10; 

    // B: Balanced (2.5x)
    let priceB = Math.ceil((cost * 2.5) / 50) * 50; 

    // C: Premium Anchor (4x Markup for "Fake MRP")
    let priceC = Math.ceil((cost * 4.0) / 100) * 100; 

    return {
        a: { price: priceA, margin: Math.round(((priceA - cost)/priceA)*100), label: "Charm Price", desc: "Ends in 90/99" },
        b: { price: priceB, margin: Math.round(((priceB - cost)/priceB)*100), label: "Profit Max", desc: "Recommended" },
        c: { price: priceC, margin: Math.round(((priceC - cost)/priceC)*100), label: "Anchor / MRP", desc: "Use as 'Regular Price'" }
    };
}

window.openPriceDoctor = function() {
    // 🔒 SECURITY CHECK (Added)
    // Only ELITE and GROWTH can use this
    if (AppState.userTier !== 'ELITE' && AppState.userTier !== 'GROWTH') {
        alert("🔒 Price Doctor is a paid feature.\nAvailable in GROWTH & ELITE plans.");
        return;
    }

    const costInput = document.querySelector('input[name="costPrice"]');
    const cost = costInput ? costInput.value : 0;

    if (!cost || cost <= 0) {
        alert("Please enter Cost Price first!");
        return;
    }

    const s = calculatePricing(cost);
    openModal('priceDoctor'); // Uses the modal template below

    setTimeout(() => {
        document.getElementById('pd-cost-display').innerText = cost;
        
        ['a', 'b', 'c'].forEach(key => {
            document.getElementById(`pd-price-${key}`).innerText = s[key].price;
            document.getElementById(`pd-margin-${key}`).innerText = s[key].margin + '% Margin';
            
            // Fix click handler to pass cost correctly
            document.getElementById(`pd-card-${key}`).onclick = function() {
                applyPrice(s[key].price, cost);
            };
        });
    }, 50);
}

function applyPrice(price, originalCost) {
    closeModal(); // Close Doctor
    openModal('addProduct'); // Re-open Form
    
    // Fill values back in
    setTimeout(() => {
        const costInput = document.querySelector('input[name="costPrice"]');
        const priceInput = document.querySelector('input[name="sellingPrice"]');
        
        if(costInput) costInput.value = originalCost;
        if(priceInput) priceInput.value = price;
    }, 50);
}

// ============================================
// 🛠️ LOGIC HANDLERS (Forced Global Scope)
// ============================================

window.openModal = function(name) {
    const overlay = document.getElementById('modal-overlay');
    overlay.innerHTML = Modals[name];
    overlay.classList.remove('hidden', 'opacity-0');
}

window.closeModal = function() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('opacity-0');
    setTimeout(() => { overlay.classList.add('hidden'); overlay.innerHTML = ''; }, 200);
}

// ⚙️ FIXED COSTS
window.openFixedCostModal = async function() {
    openModal('manageFixedCosts');
    loadFixedCosts();
}

window.handleAddFixedCost = async function(e) {
    e.preventDefault();
    await db.fixedCosts.add({
        name: e.target.name.value,
        category: e.target.category.value,
        amount: parseFloat(e.target.amount.value)
    });
    e.target.reset();
    loadFixedCosts();
}

window.loadFixedCosts = async function() {
    const list = document.getElementById('fixed-cost-list');
    if(!list) return;
    const costs = await db.fixedCosts.toArray();
    const totalEl = document.getElementById('fixed-total');
    if(totalEl) totalEl.innerText = costs.reduce((a,c)=>a+c.amount,0);
    
    if(costs.length === 0) list.innerHTML = '<p class="text-xs text-center text-slate-400 py-4">No fixed costs.</p>';
    else list.innerHTML = costs.map(c => `<div class="flex justify-between p-2 border mb-1"><b>${c.name}</b> <span>৳${c.amount} <button onclick="deleteFixedCost(${c.id})" class="text-red-500 ml-2">x</button></span></div>`).join('');
}

window.deleteFixedCost = async function(id) {
    if(confirm("Delete?")) { await db.fixedCosts.delete(id); loadFixedCosts(); }
}

window.applyMonthlyFixedCosts = async function() {
    const costs = await db.fixedCosts.toArray();
    if(costs.length === 0) return alert("Add costs first!");
    
    if(confirm("Charge Monthly Costs?")) {
        const month = new Date().toLocaleString('default', { month: 'short' });
        for(const c of costs) {
            await db.expenses.add({ date: new Date(), category: c.category, amount: c.amount, note: 'Auto: '+c.name });
        }
        closeModal(); alert("✅ Done!"); router('dashboard');
    }
}

// 💸 EXPENSES
window.handleSaveExpense = async function(e) {
    e.preventDefault();
    const form = e.target;
    await db.expenses.add({
        date: new Date(), category: form.category.value, amount: parseFloat(form.amount.value), note: form.note.value
    });
    closeModal(); router('dashboard');
}

// 👔 STAFF
window.openStaffModal = async function() {
    openModal('manageStaff');
    loadStaffList();
}

window.handleAddStaff = async function(e) {
    e.preventDefault();
    await db.staff.add({ name: e.target.name.value, role: e.target.role.value, salary: parseInt(e.target.salary.value), joinDate: new Date() });
    e.target.reset(); loadStaffList();
}

window.loadStaffList = async function() {
    const list = document.getElementById('staff-list-container');
    if(!list) return;
    const staff = await db.staff.toArray();
    document.getElementById('payroll-total').innerText = staff.reduce((a,s)=>a+s.salary,0);
    
    if(staff.length===0) list.innerHTML = '<p class="text-xs text-center text-slate-400 py-4">No staff.</p>';
    else list.innerHTML = staff.map(s => `<div class="flex justify-between p-2 border mb-1"><b>${s.name}</b> <span>৳${s.salary} <button onclick="deleteStaff(${s.id})" class="text-red-500 ml-2">x</button></span></div>`).join('');
}

window.deleteStaff = async function(id) {
    if(confirm("Remove?")) { await db.staff.delete(id); loadStaffList(); }
}

window.runPayroll = async function() {
    const staff = await db.staff.toArray();
    const total = staff.reduce((a,s)=>a+s.salary,0);
    if(total>0 && confirm(`Pay ৳${total}?`)) {
        await db.expenses.add({ date: new Date(), category: 'Salary', amount: total, note: 'Payroll' });
        closeModal(); router('dashboard');
    }
}

// ============================================
// 🔐 LOGOUT FUNCTION
// ============================================
async function handleLogout() {
    // Confirm logout
    const confirmed = confirm('আপনি কি লগআউট করতে চান?');
    
    if (!confirmed) return;
    
    try {
        // Clear session from database
        await db.settings.delete('user_session');
        
        // Clear AppState
        AppState.userTier = null;
        AppState.userSession = null;
        
        // Show success message
        alert('✅ সফলভাবে লগআউট হয়েছে!');
        
        // Reload to show login screen
        location.reload();
        
    } catch (error) {
        console.error('Logout error:', error);
        alert('❌ লগআউট করতে সমস্যা হয়েছে।');
    }
}

// APP STARTUP
document.addEventListener('DOMContentLoaded', async () => {
    
    // Get loader and app elements
    const loader = document.getElementById('initial-loader');
    const appContent = document.getElementById('app-content');
    const appHeader = document.getElementById('app-header');
    
    try {
        const session = await db.settings.get('user_session');
        
        if (session && session.value) {
            // ✅ USER IS LOGGED IN
            
            // 1. Set State from Local Storage FIRST
            AppState.userTier = session.value.tier; 
            console.log("Local Tier Loaded:", AppState.userTier);

            // 2. Hide loader, Show app
            if (loader) loader.style.display = 'none';
            if (appContent) appContent.style.display = 'block';
            if (appHeader) appHeader.style.display = 'flex';
            document.body.style.backgroundColor = '#f8fafc';
            
            // 3. Load App
            router('dashboard');
            
            // 4. FORCE RE-VALIDATE ONLINE (To catch downgrades)
            if (navigator.onLine) {
                validateSession(session.value);
            }
            
            // 5. Initialize Floating Menu
            if (typeof FloatingMenu !== 'undefined') {
                FloatingMenu.init();
            }
            
        } else {
            // ❌ USER IS NOT LOGGED IN
            
            // Hide loader, Show login
            if (loader) loader.style.display = 'none';
            if (appContent) appContent.style.display = 'block';
            
            // Show login screen
            showLoginScreen();
        }
        
    } catch (error) {
        console.error('Startup error:', error);
        
        // On error, show login screen
        if (loader) loader.style.display = 'none';
        if (appContent) appContent.style.display = 'block';
        showLoginScreen();
    }
});

function showLoginScreen() {
    document.getElementById('app-content').innerHTML = `
        <div class="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-6 animate-fade-in">
            <div class="w-24 h-24 bg-gradient-to-tr from-brand-600 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-brand-500/20">
                <i class="ph-bold ph-rocket text-5xl text-white"></i>
            </div>
            
            <h1 class="text-3xl font-bold text-white mb-2">Munafa Zen</h1>
            <p class="text-slate-400 text-sm mb-10">The Growth OS for Modern Business</p>
            
            <form onsubmit="handleLogin(event)" class="w-full max-w-xs space-y-4">
                <div>
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Mobile Number</label>
                    <input type="tel" name="mobile" placeholder="017..." required
                        class="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3.5 rounded-xl focus:border-brand-500 focus:outline-none transition-colors">
                </div>
                
                <div>
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">License Key</label>
                    <input type="text" name="key" placeholder="BIZ-XXXX" required
                        class="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3.5 rounded-xl font-mono focus:border-brand-500 focus:outline-none uppercase transition-colors">
                </div>

                <button type="submit" id="login-btn" class="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/20 active:scale-95 transition-transform mt-4">
                    Secure Login
                </button>
            </form>
            
            <div class="mt-8 text-center">
    <p class="text-xs text-gray-400">Don't have a key?</p>
    <a href="https://wa.me/8801700524647?text=I%20need%20a%20Munafa Zen%20license%20key" 
       target="_blank"
       class="text-sm font-bold text-green-400 hover:text-green-300 flex items-center justify-center gap-2 mt-2">
        <i class="ph ph-whatsapp-logo text-lg"></i>
        Contact Support
    </a>
</div>
        </div>
    `;
    
    // Hide navigation
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    if (nav) nav.classList.add('hidden');
    if (header) header.classList.add('hidden');
    
// ✅ Hide ALL floating elements on login screen
const floatingElements = [
    'floating-fab-container',
    'floating-sync-btn',
    'fab-menu',
    'fab-backdrop',
    'whatsapp-btn',
    'whatsapp-float',
    'contact-float',
    'floating-contact-btn'
];

floatingElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
});

// ✅ Fix white space - make entire page dark
document.body.style.backgroundColor = '#0f172a';
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.minHeight = '100vh';
document.body.style.overflow = 'auto';

// Fix app-content container
const appContent = document.getElementById('app-content');
if (appContent) {
    appContent.style.backgroundColor = '#0f172a';
    appContent.style.minHeight = '100vh';
    appContent.style.margin = '0';
    appContent.style.padding = '0';
}

// Hide header and nav completely
const footer = document.querySelector('footer');

if (header) header.style.display = 'none';
if (nav) nav.style.display = 'none';
if (footer) footer.style.display = 'none';
    
    // ✅ NEW: Also hide any elements with these classes
    document.querySelectorAll('.floating-btn, .fab-container, .sync-button').forEach(el => {
        el.style.display = 'none';
    });


}

async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const mobile = e.target.mobile.value.trim();
    const key = e.target.key.value.trim();
    const deviceId = getDeviceID();
    
    btn.innerHTML = `<i class="ph-bold ph-spinner animate-spin"></i> Verifying...`;
    
    try {
        const url = `${AUTH_API}?mobile=${mobile}&key=${key}&deviceId=${deviceId}`;
        const response = await fetch(url);
        const res = await response.json();
        
        if (res.valid) {
            // SAVE SESSION LOCALLY
            await db.settings.put({ 
                key: 'user_session', 
                value: { mobile, key, tier: res.tier, deviceId } 
            });
            
            alert(`🎉 ${res.message}\nTier: ${res.tier}`);
            location.reload(); // Reload to load full app
        } else {
            alert("❌ Access Denied:\n" + res.message);
            btn.innerHTML = "Try Again";
        }
    } catch (err) {
        alert("⚠️ Internet Error. Check connection.");
        btn.innerHTML = "Try Again";
    }
}

async function validateSession(session) {
    try {
        const url = `${AUTH_API}?mobile=${session.mobile}&key=${session.key}&deviceId=${session.deviceId}`;
        const response = await fetch(url);
        const res = await response.json();
        
        if (!res.valid) {
            await db.settings.delete('user_session');
            alert("⛔ Access Revoked.");
            location.reload();
        } else {
            // ✅ CRITICAL FIX: If sheet says STARTER but App says ELITE -> Downgrade immediately
            if(res.tier !== session.tier) {
                console.log(`Downgrading from ${session.tier} to ${res.tier}`);
                
                // Update Local Object
                session.tier = res.tier;
                AppState.userTier = res.tier;
                
                // Save to DB
                await db.settings.put({ key: 'user_session', value: session });
                
                // Alert User
                alert("ℹ️ Your plan has updated to: " + res.tier);
            }
        }
    } catch(e) { console.log("Offline Check Skipped"); }
}

// ============================================
// 📊 ANALYTICS HELPERS
// ============================================

function filterOrdersByDate(orders, period) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.filter(o => {
        const d = new Date(o.date);
        if (period === 'today') return d >= today;
        if (period === 'week') {
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return d >= weekAgo;
        }
        if (period === 'month') {
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        return true; // All time
    });
}

function getBestSellers(orders) {
    let counts = {};
    orders.forEach(o => {
        if(o.items) {
            o.items.forEach(i => {
                const name = i.productName || i.sku; 
                counts[name] = (counts[name] || 0) + i.qty;
            });
        }
    });
    return Object.entries(counts)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 3);
}

function openEmail(name, email) {
    if (AppState.userTier === 'STARTER') {
        alert("🔒 Email Marketing is locked for STARTER.\nUpgrade to engage customers!");
        return;
    }
    if (!email) {
        alert("⚠️ No email address found for this customer.");
        return;
    }
    const subject = encodeURIComponent(`Special Offer for ${name}`);
    const body = encodeURIComponent(`Hi ${name},\n\nWe noticed you haven't visited us in a while...\n\n(Type your offer here)`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

// ============================================
// ⚙️ BUSINESS PROFILE LOGIC
// ============================================

window.openBusinessSettings = async function() {
    openModal('businessSettings');
    try {
        const profile = await db.settings.get('business_profile');
        if(profile && profile.value) {
            const p = profile.value;
            setTimeout(() => {
                document.getElementById('set-shopName').value = p.shopName || '';
                document.getElementById('set-shopAddress').value = p.address || '';
                document.getElementById('set-rateInside').value = p.rateInside || 60;
                document.getElementById('set-rateOutside').value = p.rateOutside || 120;
                document.getElementById('set-categories').value = p.categories || 'General, Clothing, Electronics';
            }, 50);
        }
    } catch(e) {}
}

window.saveBusinessProfile = async function(e) {
    e.preventDefault();
    const form = e.target;
    
    const profile = {
        shopName: form.shopName.value,
        address: form.shopAddress.value,
        rateInside: parseFloat(form.rateInside.value) || 60,
        rateOutside: parseFloat(form.rateOutside.value) || 120,
        categories: form.categories.value
    };
    
    await db.settings.put({ key: 'business_profile', value: profile });
    closeModal();
    alert("✅ Shop Profile Updated!");
}

// ============================================
// 🚚 SMART DELIVERY LOGIC
// ============================================

async function setZone(zone) {
    const input = document.getElementById('delivery-input');
    
    // Get Settings
    let rates = { inside: 60, outside: 120 };
    try {
        const profile = await db.settings.get('business_profile');
        if(profile && profile.value) {
            rates.inside = profile.value.rateInside;
            rates.outside = profile.value.rateOutside;
        }
    } catch(e) {}

    // Update Input
    if(zone === 'inside') input.value = rates.inside;
    else input.value = rates.outside;
    
    calculateTotal();
}

// ============================================
// 📉 VIEW: EXPENSE BREAKDOWN (Fixed Math)
// ============================================

async function getExpenseBreakdownHTML() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    let expenses = [];
    try {
        if(typeof db !== 'undefined') expenses = await db.expenses.toArray();
    } catch(e) {}

    // Filter for THIS MONTH
    const monthlyExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Dynamic Grouping (Fixes the NaN error)
    let totals = { 
        Marketing: 0, Salary: 0, Rent: 0, Packaging: 0, 
        Purchase: 0, Utilities: 0, Other: 0 
    };
    let totalSum = 0;

    monthlyExpenses.forEach(e => {
        const cat = e.category || 'Other';
        // If the category exists in our list, add to it. If not, add to Other.
        if (totals.hasOwnProperty(cat)) {
            totals[cat] += (e.amount || 0);
        } else {
            totals['Other'] += (e.amount || 0);
        }
        totalSum += (e.amount || 0);
    });

    // Helper to draw bars
    const renderBar = (label, amount, color) => {
        if (!amount || amount === 0) return ''; // Hide empty bars
        const percent = totalSum > 0 ? (amount / totalSum) * 100 : 0;
        return `
            <div class="mb-4 animate-slide-up">
                <div class="flex justify-between text-sm mb-1">
                    <span class="text-slate-600 font-bold">${label}</span>
                    <span class="font-bold text-slate-800">৳${amount}</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5">
                    <div class="h-2.5 rounded-full ${color}" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    };

    return `
        <div class="p-5 pb-24 animate-fade-in">
            <!-- Header -->
            <div class="flex items-center gap-3 mb-6">
                <button onclick="router('dashboard')" class="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 active:scale-95"><i class="ph-bold ph-arrow-left"></i></button>
                <div>
                    <h2 class="text-xl font-bold text-slate-800">Monthly Expenses</h2>
                    <p class="text-xs text-slate-500">${monthNames[currentMonth]} ${currentYear} Overview</p>
                </div>
            </div>

            <!-- Summary Card -->
            <div class="bg-rose-50 border border-rose-100 p-6 rounded-2xl mb-6 text-center">
                <p class="text-xs text-rose-500 uppercase font-bold mb-1">Total Spent This Month</p>
                <h1 class="text-4xl font-bold text-rose-600">৳${totalSum}</h1>
            </div>

            <!-- Breakdown -->
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="font-bold text-slate-800 text-sm mb-4 border-b pb-2">Category Breakdown</h3>
                
                ${totalSum === 0 ? '<p class="text-xs text-slate-400 text-center py-4">No expenses yet.</p>' : ''}

                ${renderBar('📢 Marketing / Ads', totals.Marketing, 'bg-blue-500')}
                ${renderBar('👔 Staff Salaries', totals.Salary, 'bg-indigo-500')}
                ${renderBar('📦 Packaging', totals.Packaging, 'bg-amber-500')}
                ${renderBar('🏠 Rent / Fixed', totals.Rent, 'bg-purple-500')}
                ${renderBar('🚚 Stock Purchase', totals.Purchase, 'bg-slate-500')}
                ${renderBar('💡 Utilities', totals.Utilities, 'bg-yellow-400')}
                ${renderBar('☕ Other', totals.Other, 'bg-gray-400')}
            </div>
            
            <!-- List Recent -->
            <div class="mt-6">
                 <h3 class="font-bold text-slate-800 text-sm mb-3">Recent Transactions</h3>
                 ${monthlyExpenses.reverse().slice(0, 5).map(e => `
                    <div class="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                        <div>
                            <p class="text-xs font-bold text-slate-700">${e.category}</p>
                            <p class="text-[10px] text-slate-400">${new Date(e.date).toLocaleDateString()}</p>
                        </div>
                        <span class="text-sm font-bold text-rose-600">-৳${e.amount}</span>
                    </div>
                 `).join('')}
            </div>
        </div>
    `;
}

// ============================================
// REORDER PREDICTOR PAGE
// ============================================
function getReorderPredictorHTML() {
    return `
        <div class="p-4">
            <!-- Back Button -->
            <button onclick="router('growth')" class="mb-4 flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors">
                <i class="ph ph-arrow-left text-xl"></i>
                <span class="font-medium">Growth Hub এ ফিরুন</span>
            </button>
            
            <!-- Predictor Container -->
            <div id="reorder-predictor-container">
                <div class="flex flex-col items-center justify-center py-12 text-slate-400">
                    <i class="ph ph-spinner animate-spin text-3xl text-brand-600 mb-3"></i>
                    <p>লোড হচ্ছে...</p>
                </div>
            </div>
        </div>
    `;
}

// Open Segment Dashboard Modal
async function openSegmentDashboard() {
const dashboardHTML = await SegmentDashboard.render();

const modalHTML = `
<div id="segmentDashboardModal" class="fixed inset-0 bg-black/50 z-50 flex items-end justify-center animate-fade-in">
<div class="bg-slate-100 w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-hidden animate-slide-up">
<div class="flex items-center justify-between p-4 bg-white border-b border-slate-200">
<h2 class="text-lg font-bold text-slate-800">📊 Buyer Segments</h2>
<button onclick="document.getElementById('segmentDashboardModal').remove()" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
<i class="ph-bold ph-x text-xl"></i>
</button>
</div>
<div class="overflow-y-auto max-h-[80vh]">
${dashboardHTML}
</div>
</div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ============================================
// REVENUE PREDICTION PAGE
// ============================================
function getRevenuePredictionHTML() {
    return `
        <div class="p-4 pb-24">
            <!-- Back Button -->
            <button onclick="router('growth')" class="mb-4 flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors">
                <i class="ph ph-arrow-left text-xl"></i>
                <span class="font-medium">Growth Hub এ ফিরুন</span>
            </button>
            
            <!-- Header -->
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-xl mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-bold flex items-center gap-2">
                            <i class="ph ph-chart-line-up text-2xl"></i>
                            রেভিনিউ প্রেডিকশন
                        </h2>
                        <p class="text-indigo-200 text-sm mt-1">AI দিয়ে ভবিষ্যতের আয় জানুন</p>
                    </div>
                    <button onclick="RevenuePrediction.refresh('revenue-prediction-container')" 
                            class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                        <i class="ph ph-arrows-clockwise"></i>
                        রিফ্রেশ
                    </button>
                </div>
            </div>
            
            <!-- Prediction Container -->
            <div id="revenue-prediction-container">
                <div class="flex flex-col items-center justify-center py-12 text-slate-400">
                    <i class="ph ph-spinner animate-spin text-3xl text-indigo-600 mb-3"></i>
                    <p>লোড হচ্ছে...</p>
                </div>
            </div>
        </div>
    `;
}
// ============================================
// A/B TESTING PAGE
// ============================================
function getABTestingHTML() {
    return `
        <div class="p-4 pb-24">
            <!-- Back Button -->
            <button onclick="router('growth')" class="mb-4 flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors">
                <i class="ph ph-arrow-left text-xl"></i>
                <span class="font-medium">Growth Hub এ ফিরুন</span>
            </button>
            
            <!-- Header -->
            <div class="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-5 rounded-xl mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-bold flex items-center gap-2">
                            <i class="ph ph-flask text-2xl"></i>
                            A/B টেস্টিং
                        </h2>
                        <p class="text-pink-200 text-sm mt-1">কোন মেসেজ বেশি কাজ করে পরীক্ষা করুন</p>
                    </div>
                    <button onclick="ABTesting.refresh()" 
                            class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                        <i class="ph ph-arrows-clockwise"></i>
                        রিফ্রেশ
                    </button>
                </div>
            </div>
            
            <!-- Testing Container -->
            <div id="ab-testing-container">
                <div class="flex flex-col items-center justify-center py-12 text-slate-400">
                    <i class="ph ph-spinner animate-spin text-3xl text-pink-600 mb-3"></i>
                    <p>লোড হচ্ছে...</p>
                </div>
            </div>
        </div>
    `;
}
// ============================================
// PRODUCT RECOMMENDATIONS PAGE
// ============================================
function getProductRecommendationsHTML() {
    return `
        <div class="p-4 pb-24">
            <!-- Back Button -->
            <button onclick="router('growth')" class="mb-4 flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors">
                <i class="ph ph-arrow-left text-xl"></i>
                <span class="font-medium">Growth Hub এ ফিরুন</span>
            </button>
            
            <!-- Header -->
            <div class="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-5 rounded-xl mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-bold flex items-center gap-2">
                            <i class="ph ph-sparkle text-2xl"></i>
                            Product Recommendations
                        </h2>
                        <p class="text-cyan-100 text-sm mt-1">যারা এটা কিনেছে তারা এটাও কিনেছে</p>
                    </div>
                    <button onclick="ProductRecommendations.refresh('product-recommendations-container')" 
                            class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                        <i class="ph ph-arrows-clockwise"></i>
                        রিফ্রেশ
                    </button>
                </div>
            </div>
            
            <!-- Recommendations Container -->
            <div id="product-recommendations-container">
                <div class="flex flex-col items-center justify-center py-12 text-slate-400">
                    <i class="ph ph-spinner animate-spin text-3xl text-cyan-600 mb-3"></i>
                    <p>লোড হচ্ছে...</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// FLOATING CONTACT BUTTON
// ============================================

function showContactOptions() {
    const currentTier = AppState.userTier || 'STARTER';
    
    const modalHTML = `
        <div id="contact-modal" class="fixed inset-0 bg-black/60 flex items-end justify-center z-50 p-4" onclick="if(event.target.id === 'contact-modal') closeContactModal()">
            <div class="bg-white rounded-t-2xl w-full max-w-md shadow-2xl animate-slide-up">
                
                <!-- Header -->
                <div class="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-t-2xl text-white">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <i class="ph ph-headset text-xl"></i>
                            </div>
                            <div>
                                <h3 class="font-bold">যোগাযোগ করুন</h3>
                                <p class="text-green-100 text-xs">আমরা সাহায্য করতে প্রস্তুত!</p>
                            </div>
                        </div>
                        <button onclick="closeContactModal()" class="text-white/80 hover:text-white">
                            <i class="ph ph-x text-xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Contact Options -->
                <div class="p-4 space-y-3">
                    
                    <!-- WhatsApp -->
                    <button onclick="contactViaWhatsApp('support')" 
                            class="w-full bg-green-50 hover:bg-green-100 border border-green-200 p-4 rounded-xl flex items-center gap-4 transition-all">
                        <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <i class="ph-bold ph-whatsapp-logo text-white text-xl"></i>
                        </div>
                        <div class="flex-1 text-left">
                            <p class="font-bold text-slate-800">WhatsApp</p>
                            <p class="text-xs text-slate-500">দ্রুত রিপ্লাই পান</p>
                        </div>
                        <i class="ph ph-arrow-right text-green-500"></i>
                    </button>

                    <!-- Call -->
                    <button onclick="contactViaCall()" 
                            class="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 p-4 rounded-xl flex items-center gap-4 transition-all">
                        <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <i class="ph-bold ph-phone text-white text-xl"></i>
                        </div>
                        <div class="flex-1 text-left">
                            <p class="font-bold text-slate-800">ফোন করুন</p>
                            <p class="text-xs text-slate-500">01700-524647</p>
                        </div>
                        <i class="ph ph-arrow-right text-blue-500"></i>
                    </button>

                    <!-- Email -->
                    <button onclick="contactViaEmail()" 
                            class="w-full bg-purple-50 hover:bg-purple-100 border border-purple-200 p-4 rounded-xl flex items-center gap-4 transition-all">
                        <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                            <i class="ph-bold ph-envelope text-white text-xl"></i>
                        </div>
                        <div class="flex-1 text-left">
                            <p class="font-bold text-slate-800">ইমেইল</p>
                            <p class="text-xs text-slate-500">botassist.org@gmail.com</p>
                        </div>
                        <i class="ph ph-arrow-right text-purple-500"></i>
                    </button>

                    <!-- Upgrade Plan -->
                    ${currentTier !== 'ELITE' ? `
                        <button onclick="contactViaWhatsApp('upgrade')" 
                                class="w-full bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-xl flex items-center gap-4 text-white hover:opacity-90 transition-all">
                            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <i class="ph-bold ph-crown text-xl"></i>
                            </div>
                            <div class="flex-1 text-left">
                                <p class="font-bold">প্ল্যান আপগ্রেড করুন</p>
                                <p class="text-xs text-white/70">ELITE এ যান, সব ফিচার পান</p>
                            </div>
                            <i class="ph ph-arrow-right text-white/70"></i>
                        </button>
                    ` : ''}

                </div>

                <!-- Footer -->
                <div class="p-4 bg-slate-50 border-t text-center">
                    <p class="text-xs text-slate-500">📞 সাপোর্ট টাইম: সকাল ১০টা - রাত ১০টা</p>
                </div>

            </div>
        </div>
    `;

    closeContactModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeContactModal() {
    const modal = document.getElementById('contact-modal');
    if (modal) modal.remove();
}

function contactViaWhatsApp(type) {
    const currentTier = AppState.userTier || 'STARTER';
    let message = '';
    
    if (type === 'upgrade') {
        message = `আসসালামু আলাইকুম!\n\nআমি Munafa Zen প্ল্যান আপগ্রেড করতে চাই।\n\n📱 বর্তমান প্ল্যান: ${currentTier}\n\nধন্যবাদ!`;
    } else {
        message = `আসসালামু আলাইকুম!\n\nMunafa Zen App সম্পর্কে সাহায্য দরকার।\n\n📱 আমার প্ল্যান: ${currentTier}\n\nধন্যবাদ!`;
    }
    
    window.open(`https://wa.me/8801700524647?text=${encodeURIComponent(message)}`, '_blank');
    closeContactModal();
}

function contactViaCall() {
    window.open('tel:+8801700524647', '_self');
    closeContactModal();
}

function contactViaEmail() {
    const currentTier = AppState.userTier || 'STARTER';
    const subject = encodeURIComponent('Munafa Zen App Support');
    const body = encodeURIComponent(`আসসালামু আলাইকুম!\n\nআমার প্ল্যান: ${currentTier}\n\n[আপনার সমস্যা লিখুন]\n\nধন্যবাদ!`);
    window.open(`mailto:botassist.org@gmail.com?subject=${subject}&body=${body}`, '_blank');
    closeContactModal();
}
