// ================================================
// abTesting.js - A/B Testing Tool v1.0
// ================================================

const ABTesting = (function() {
    'use strict';

    console.log('🧪 ABTesting: Loading...');

    // ============================================
    // CONFIGURATION
    // ============================================

    const CONFIG = {
        // Maximum active tests
        MAX_ACTIVE_TESTS: 10,
        
        // Test statuses
        STATUS: {
            ACTIVE: 'active',
            COMPLETED: 'completed',
            PAUSED: 'paused'
        },
        
        // Minimum interactions for valid result
        MIN_INTERACTIONS: 5
    };

    // ============================================
    // DATA STORAGE (Using localStorage)
    // ============================================

    const STORAGE_KEY = 'bizmind_ab_tests';

    // Get all tests from storage
    function getTests() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading tests:', error);
            return [];
        }
    }

    // Save tests to storage
    function saveTests(tests) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
            return true;
        } catch (error) {
            console.error('Error saving tests:', error);
            return false;
        }
    }

    // Generate unique ID
    function generateId() {
        return 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ============================================
    // CORE FUNCTIONS
    // ============================================

    // Create new A/B test
    function createTest(name, versionA, versionB, category = 'message') {
        const tests = getTests();

        // Check limit
        const activeTests = tests.filter(t => t.status === CONFIG.STATUS.ACTIVE);
        if (activeTests.length >= CONFIG.MAX_ACTIVE_TESTS) {
            return {
                success: false,
                message: 'সর্বোচ্চ ' + CONFIG.MAX_ACTIVE_TESTS + ' টি টেস্ট চালু রাখতে পারবেন'
            };
        }

        const newTest = {
            id: generateId(),
            name: name,
            category: category,
            createdAt: new Date().toISOString(),
            status: CONFIG.STATUS.ACTIVE,
            versionA: {
                content: versionA,
                clicks: 0,
                copies: 0,
                sends: 0,
                conversions: 0
            },
            versionB: {
                content: versionB,
                clicks: 0,
                copies: 0,
                sends: 0,
                conversions: 0
            },
            winner: null
        };

        tests.unshift(newTest);
        saveTests(tests);

        console.log('✅ New A/B test created:', name);
        return {
            success: true,
            test: newTest
        };
    }

    // Record interaction
    function recordInteraction(testId, version, interactionType) {
        const tests = getTests();
        const testIndex = tests.findIndex(t => t.id === testId);

        if (testIndex === -1) {
            console.error('Test not found:', testId);
            return false;
        }

        const test = tests[testIndex];
        
        if (test.status !== CONFIG.STATUS.ACTIVE) {
            console.log('Test is not active');
            return false;
        }

        const versionKey = version === 'A' ? 'versionA' : 'versionB';

        switch (interactionType) {
            case 'click':
                test[versionKey].clicks++;
                break;
            case 'copy':
                test[versionKey].copies++;
                break;
            case 'send':
                test[versionKey].sends++;
                break;
            case 'conversion':
                test[versionKey].conversions++;
                break;
            default:
                console.error('Unknown interaction type:', interactionType);
                return false;
        }

        tests[testIndex] = test;
        saveTests(tests);

        console.log(`📊 Recorded ${interactionType} for ${versionKey}`);
        return true;
    }

    // Get test by ID
    function getTest(testId) {
        const tests = getTests();
        return tests.find(t => t.id === testId) || null;
    }

    // Calculate winner
    function calculateWinner(test) {
        const aTotal = test.versionA.clicks + test.versionA.copies + test.versionA.sends;
        const bTotal = test.versionB.clicks + test.versionB.copies + test.versionB.sends;

        const aConversionRate = aTotal > 0 ? (test.versionA.conversions / aTotal) * 100 : 0;
        const bConversionRate = bTotal > 0 ? (test.versionB.conversions / bTotal) * 100 : 0;

        // Need minimum interactions
        if (aTotal < CONFIG.MIN_INTERACTIONS && bTotal < CONFIG.MIN_INTERACTIONS) {
            return {
                winner: null,
                message: 'আরও ডেটা দরকার',
                aRate: aConversionRate,
                bRate: bConversionRate,
                aTotal: aTotal,
                bTotal: bTotal
            };
        }

        let winner = null;
        if (aTotal >= CONFIG.MIN_INTERACTIONS && bTotal >= CONFIG.MIN_INTERACTIONS) {
            if (aConversionRate > bConversionRate) {
                winner = 'A';
            } else if (bConversionRate > aConversionRate) {
                winner = 'B';
            } else {
                winner = 'TIE';
            }
        } else if (aTotal >= CONFIG.MIN_INTERACTIONS) {
            winner = 'A';
        } else {
            winner = 'B';
        }

        return {
            winner: winner,
            message: winner === 'TIE' ? 'সমান ফলাফল' : `Version ${winner} ভালো করছে`,
            aRate: Math.round(aConversionRate * 10) / 10,
            bRate: Math.round(bConversionRate * 10) / 10,
            aTotal: aTotal,
            bTotal: bTotal
        };
    }

    // Complete a test
    function completeTest(testId) {
        const tests = getTests();
        const testIndex = tests.findIndex(t => t.id === testId);

        if (testIndex === -1) return false;

        const result = calculateWinner(tests[testIndex]);
        tests[testIndex].status = CONFIG.STATUS.COMPLETED;
        tests[testIndex].winner = result.winner;
        tests[testIndex].completedAt = new Date().toISOString();

        saveTests(tests);
        return true;
    }

    // Delete a test
    function deleteTest(testId) {
        const tests = getTests();
        const filtered = tests.filter(t => t.id !== testId);
        saveTests(filtered);
        return true;
    }

    // Pause/Resume test
    function toggleTestStatus(testId) {
        const tests = getTests();
        const testIndex = tests.findIndex(t => t.id === testId);

        if (testIndex === -1) return false;

        const test = tests[testIndex];
        if (test.status === CONFIG.STATUS.ACTIVE) {
            test.status = CONFIG.STATUS.PAUSED;
        } else if (test.status === CONFIG.STATUS.PAUSED) {
            test.status = CONFIG.STATUS.ACTIVE;
        }

        tests[testIndex] = test;
        saveTests(tests);
        return true;
    }

    console.log('✅ ABTesting: Part 1 loaded (Core Functions)');

    // ============================================
    // PART 2: UI COMPONENTS
    // ============================================

    // Format date in Bangla
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Render main dashboard
    function renderDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        const tests = getTests();
        const activeTests = tests.filter(t => t.status === CONFIG.STATUS.ACTIVE);
        const completedTests = tests.filter(t => t.status === CONFIG.STATUS.COMPLETED);

        container.innerHTML = `
            <div class="ab-testing-dashboard">
                
                <!-- Stats Cards -->
                <div class="grid grid-cols-3 gap-3 mb-6">
                    <div class="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                        <div class="text-2xl font-bold text-blue-600">${activeTests.length}</div>
                        <div class="text-xs text-blue-500">চলমান টেস্ট</div>
                    </div>
                    <div class="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                        <div class="text-2xl font-bold text-green-600">${completedTests.length}</div>
                        <div class="text-xs text-green-500">সম্পন্ন</div>
                    </div>
                    <div class="bg-purple-50 rounded-xl p-4 border border-purple-100 text-center">
                        <div class="text-2xl font-bold text-purple-600">${tests.length}</div>
                        <div class="text-xs text-purple-500">মোট টেস্ট</div>
                    </div>
                </div>

                <!-- Create New Test Button -->
                <button onclick="ABTesting.showCreateModal()" 
                        class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl mb-6 flex items-center justify-center gap-2 font-bold shadow-lg active:scale-[0.98] transition-transform">
                    <i class="ph ph-plus-circle text-xl"></i>
                    নতুন A/B টেস্ট তৈরি করুন
                </button>

                <!-- Active Tests -->
                <div class="mb-6">
                    <h3 class="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                        <i class="ph ph-play-circle text-green-500"></i>
                        চলমান টেস্ট (${activeTests.length})
                    </h3>
                    ${activeTests.length > 0 
                        ? activeTests.map(test => renderTestCard(test)).join('') 
                        : '<div class="bg-slate-50 rounded-xl p-6 text-center text-slate-400"><i class="ph ph-flask text-3xl mb-2"></i><p>কোনো চলমান টেস্ট নেই</p></div>'
                    }
                </div>

                <!-- Completed Tests -->
                ${completedTests.length > 0 ? `
                    <div>
                        <h3 class="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                            <i class="ph ph-check-circle text-blue-500"></i>
                            সম্পন্ন টেস্ট (${completedTests.length})
                        </h3>
                        ${completedTests.map(test => renderTestCard(test)).join('')}
                    </div>
                ` : ''}

            </div>
        `;
    }

    // Render single test card
    function renderTestCard(test) {
        const result = calculateWinner(test);
        const isActive = test.status === CONFIG.STATUS.ACTIVE;
        const isCompleted = test.status === CONFIG.STATUS.COMPLETED;

        const statusBadge = isActive 
            ? '<span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">চলমান</span>'
            : isCompleted 
                ? '<span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">সম্পন্ন</span>'
                : '<span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">বিরতি</span>';

        const winnerBadge = result.winner 
            ? `<span class="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">🏆 ${result.winner === 'TIE' ? 'সমান' : 'Winner: ' + result.winner}</span>`
            : '';

        return `
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm mb-3 overflow-hidden">
                <!-- Header -->
                <div class="p-4 border-b border-slate-100">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-bold text-slate-800">${test.name}</h4>
                        <div class="flex items-center gap-2">
                            ${winnerBadge}
                            ${statusBadge}
                        </div>
                    </div>
                    <div class="text-xs text-slate-400">
                        তৈরি: ${formatDate(test.createdAt)}
                    </div>
                </div>

                <!-- Versions Comparison -->
                <div class="grid grid-cols-2 divide-x divide-slate-100">
                    <!-- Version A -->
                    <div class="p-4 ${result.winner === 'A' ? 'bg-green-50' : ''}">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-bold text-indigo-600">Version A</span>
                            ${result.winner === 'A' ? '<i class="ph-fill ph-trophy text-yellow-500"></i>' : ''}
                        </div>
                        <div class="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg mb-3 line-clamp-2">
                            "${test.versionA.content.substring(0, 60)}${test.versionA.content.length > 60 ? '...' : ''}"
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div class="bg-white rounded p-2 text-center">
                                <div class="font-bold text-slate-700">${test.versionA.clicks}</div>
                                <div class="text-slate-400">ক্লিক</div>
                            </div>
                            <div class="bg-white rounded p-2 text-center">
                                <div class="font-bold text-slate-700">${test.versionA.copies}</div>
                                <div class="text-slate-400">কপি</div>
                            </div>
                            <div class="bg-white rounded p-2 text-center">
                                <div class="font-bold text-slate-700">${test.versionA.sends}</div>
                                <div class="text-slate-400">সেন্ড</div>
                            </div>
                            <div class="bg-white rounded p-2 text-center">
                                <div class="font-bold text-green-600">${test.versionA.conversions}</div>
                                <div class="text-slate-400">অর্ডার</div>
                            </div>
                        </div>
                        ${isActive ? `
                            <div class="mt-3 grid grid-cols-2 gap-2">
                                <button onclick="ABTesting.recordAndNotify('${test.id}', 'A', 'copy')" 
                                        class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2 rounded-lg transition-colors">
                                    <i class="ph ph-copy"></i> কপি
                                </button>
                                <button onclick="ABTesting.recordAndNotify('${test.id}', 'A', 'send')" 
                                        class="bg-green-100 hover:bg-green-200 text-green-700 text-xs py-2 rounded-lg transition-colors">
                                    <i class="ph ph-paper-plane-tilt"></i> সেন্ড
                                </button>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Version B -->
                    <div class="p-4 ${result.winner === 'B' ? 'bg-green-50' : ''}">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-bold text-purple-600">Version B</span>
                            ${result.winner === 'B' ? '<i class="ph-fill ph-trophy text-yellow-500"></i>' : ''}
                        </div>
                        <div class="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg mb-3 line-clamp-2">
                            "${test.versionB.content.substring(0, 60)}${test.versionB.content.length > 60 ? '...' : ''}"
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div class="bg-white rounded p-2 text-center">
                                <div class="font-bold text-slate-700">${test.versionB.clicks}</div>
                                <div class="text-slate-400">ক্লিক</div>
                            </div>
                            <div class="bg-white rounded p-2 text-center">
                                <div class="font-bold text-slate-700">${test.versionB.copies}</div>
                                <div class="text-slate-400">কপি</div>
                            </div>
                            <div class="bg-white rounded p-2 text-center">
                                <div class="font-bold text-slate-700">${test.versionB.sends}</div>
                                <div class="text-slate-400">সেন্ড</div>
                            </div>
                            <div class="bg-white rounded p-2 text-center">
                                <div class="font-bold text-green-600">${test.versionB.conversions}</div>
                                <div class="text-slate-400">অর্ডার</div>
                            </div>
                        </div>
                        ${isActive ? `
                            <div class="mt-3 grid grid-cols-2 gap-2">
                                <button onclick="ABTesting.recordAndNotify('${test.id}', 'B', 'copy')" 
                                        class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2 rounded-lg transition-colors">
                                    <i class="ph ph-copy"></i> কপি
                                </button>
                                <button onclick="ABTesting.recordAndNotify('${test.id}', 'B', 'send')" 
                                        class="bg-green-100 hover:bg-green-200 text-green-700 text-xs py-2 rounded-lg transition-colors">
                                    <i class="ph ph-paper-plane-tilt"></i> সেন্ড
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Actions -->
                <div class="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div class="text-xs text-slate-500">
                        ${result.message}
                    </div>
                    <div class="flex items-center gap-2">
                        ${isActive ? `
                            <button onclick="ABTesting.showConversionModal('${test.id}')" 
                                    class="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                                <i class="ph ph-plus"></i> অর্ডার যোগ
                            </button>
                            <button onclick="ABTesting.confirmComplete('${test.id}')" 
                                    class="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                                <i class="ph ph-check"></i> সম্পন্ন
                            </button>
                        ` : ''}
                        <button onclick="ABTesting.confirmDelete('${test.id}')" 
                                class="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-lg transition-colors">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    console.log('✅ ABTesting: Part 2 loaded (UI Components)');

    // ============================================
    // PART 3: MODALS & ACTIONS
    // ============================================

    // Show create test modal
    function showCreateModal() {
        const modalHTML = `
            <div id="ab-create-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-bold flex items-center gap-2">
                                <i class="ph ph-flask text-xl"></i>
                                নতুন A/B টেস্ট
                            </h3>
                            <button onclick="ABTesting.closeModal('ab-create-modal')" 
                                    class="text-white/80 hover:text-white">
                                <i class="ph ph-x text-2xl"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Form -->
                    <div class="p-4 overflow-y-auto max-h-[60vh]">
                        <!-- Test Name -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-slate-700 mb-2">
                                টেস্টের নাম
                            </label>
                            <input type="text" id="ab-test-name" 
                                   placeholder="যেমন: ঈদ অফার মেসেজ টেস্ট"
                                   class="w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        </div>

                        <!-- Version A -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-indigo-600 mb-2 flex items-center gap-2">
                                <span class="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold">A</span>
                                Version A
                            </label>
                            <textarea id="ab-version-a" rows="3"
                                      placeholder="প্রথম মেসেজ লিখুন..."
                                      class="w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                        </div>

                        <!-- Version B -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-purple-600 mb-2 flex items-center gap-2">
                                <span class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold">B</span>
                                Version B
                            </label>
                            <textarea id="ab-version-b" rows="3"
                                      placeholder="দ্বিতীয় মেসেজ লিখুন..."
                                      class="w-full border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"></textarea>
                        </div>

                                                <!-- Quick Templates -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-slate-700 mb-2">
                                🎯 দ্রুত টেমপ্লেট
                            </label>
                            <div class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                <button onclick="ABTesting.applyTemplate('discount')" 
                                        class="text-xs bg-slate-100 hover:bg-slate-200 p-2 rounded-lg text-left">
                                    💰 ডিসকাউন্ট
                                </button>
                                <button onclick="ABTesting.applyTemplate('urgency')" 
                                        class="text-xs bg-slate-100 hover:bg-slate-200 p-2 rounded-lg text-left">
                                    ⏰ আর্জেন্সি
                                </button>
                                <button onclick="ABTesting.applyTemplate('freebie')" 
                                        class="text-xs bg-slate-100 hover:bg-slate-200 p-2 rounded-lg text-left">
                                    🎁 ফ্রি গিফট
                                </button>
                                <button onclick="ABTesting.applyTemplate('emotional')" 
                                        class="text-xs bg-slate-100 hover:bg-slate-200 p-2 rounded-lg text-left">
                                    💝 ইমোশনাল
                                </button>
                                <button onclick="ABTesting.applyTemplate('bogo')" 
                                        class="text-xs bg-green-100 hover:bg-green-200 p-2 rounded-lg text-left">
                                    🏷️ Buy 1 Get 1
                                </button>
                                <button onclick="ABTesting.applyTemplate('freeDelivery')" 
                                        class="text-xs bg-green-100 hover:bg-green-200 p-2 rounded-lg text-left">
                                    🚚 ফ্রি ডেলিভারি
                                </button>
                                <button onclick="ABTesting.applyTemplate('eid')" 
                                        class="text-xs bg-purple-100 hover:bg-purple-200 p-2 rounded-lg text-left">
                                    🌙 ঈদ স্পেশাল
                                </button>
                                <button onclick="ABTesting.applyTemplate('vip')" 
                                        class="text-xs bg-yellow-100 hover:bg-yellow-200 p-2 rounded-lg text-left">
                                    👑 VIP অফার
                                </button>
                                <button onclick="ABTesting.applyTemplate('comeback')" 
                                        class="text-xs bg-red-100 hover:bg-red-200 p-2 rounded-lg text-left">
                                    😢 কামব্যাক
                                </button>
                                <button onclick="ABTesting.applyTemplate('newProduct')" 
                                        class="text-xs bg-blue-100 hover:bg-blue-200 p-2 rounded-lg text-left">
                                    🆕 নতুন প্রোডাক্ট
                                </button>
                                <button onclick="ABTesting.applyTemplate('review')" 
                                        class="text-xs bg-orange-100 hover:bg-orange-200 p-2 rounded-lg text-left">
                                    ⭐ রিভিউ অফার
                                </button>
                                <button onclick="ABTesting.applyTemplate('referral')" 
                                        class="text-xs bg-pink-100 hover:bg-pink-200 p-2 rounded-lg text-left">
                                    👥 রেফারাল
                                </button>
                            </div>
                        </div>

                        <!-- Custom/Own Offer Section - NEW -->
                        <div class="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                            <label class="block text-sm font-medium text-indigo-700 mb-2 flex items-center gap-2">
                                <i class="ph ph-pencil-simple-line"></i>
                                নিজের অফার লিখুন
                            </label>
                            <p class="text-xs text-slate-500 mb-2">
                                টেমপ্লেট ব্যবহার না করে নিজের মতো করে দুইটা ভার্সন লিখুন এবং টেস্ট করুন!
                            </p>
                            <div class="flex flex-wrap gap-2 text-xs text-slate-600">
                                <span class="bg-white px-2 py-1 rounded">💡 টিপস:</span>
                                <span class="bg-white px-2 py-1 rounded">ইমোজি ব্যবহার করুন</span>
                                <span class="bg-white px-2 py-1 rounded">ছোট রাখুন</span>
                                <span class="bg-white px-2 py-1 rounded">CTA দিন</span>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="p-4 border-t bg-slate-50 flex gap-3">
                        <button onclick="ABTesting.closeModal('ab-create-modal')" 
                                class="flex-1 px-4 py-3 border rounded-xl hover:bg-slate-100 transition-colors">
                            বাতিল
                        </button>
                        <button onclick="ABTesting.submitCreateTest()" 
                                class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl transition-colors font-bold">
                            তৈরি করুন
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Apply quick template
    function applyTemplate(type) {
        const templates = {
            // Original templates
            discount: {
                a: '🎉 বিশেষ অফার! আজকেই ২০% ছাড় পান! অর্ডার করতে রিপ্লাই দিন।',
                b: '💥 শুধুমাত্র আপনার জন্য ২৫% ছাড়! সীমিত সময়, এখনই অর্ডার করুন!'
            },
            urgency: {
                a: '⏰ শেষ সুযোগ! আজ রাত ১২টার মধ্যে অর্ডার করুন, ফ্রি ডেলিভারি পান!',
                b: '🚨 মাত্র ৫টি বাকি! এখনই অর্ডার না করলে স্টক শেষ হয়ে যাবে!'
            },
            freebie: {
                a: '🎁 অর্ডার করলেই ফ্রি গিফট! প্রতিটি অর্ডারে সারপ্রাইজ উপহার।',
                b: '✨ ফ্রি ডেলিভারি + ফ্রি গিফট! আজকের অর্ডারে দুটোই পাবেন!'
            },
            emotional: {
                a: '💝 আপনার কথা মনে পড়ছিল! অনেকদিন দেখা নেই, কেমন আছেন?',
                b: '🙏 আপনি আমাদের বিশেষ কাস্টমার। আপনার জন্য স্পেশাল কিছু রেখেছি!'
            },
            // NEW templates
            bogo: {
                a: '🏷️ Buy 1 Get 1 FREE! একটা কিনলে একটা ফ্রি! আজকেই অর্ডার করুন।',
                b: '🎯 ২টা নিন ১টার দামে! এই অফার শুধু আপনার জন্য!'
            },
            freeDelivery: {
                a: '🚚 ফ্রি ডেলিভারি! যেকোনো অর্ডারে ডেলিভারি চার্জ নেই!',
                b: '🏃 আজকেই ফ্রি ডেলিভারি + এক্সপ্রেস শিপিং! ২৪ ঘন্টায় পৌঁছে যাবে।'
            },
            eid: {
                a: '🌙 ঈদ মোবারক! ঈদ উপলক্ষে ৩০% ছাড়! পরিবারের জন্য কিনুন।',
                b: '✨ ঈদের বিশেষ অফার! ৫০০ টাকার বেশি অর্ডারে ফ্রি ঈদ গিফট!'
            },
            vip: {
                a: '👑 VIP কাস্টমার! আপনার জন্য এক্সক্লুসিভ ৪০% ছাড়!',
                b: '💎 প্রিমিয়াম মেম্বার অফার! সবার আগে নতুন প্রোডাক্ট + ২৫% ছাড়!'
            },
            comeback: {
                a: '😢 আপনাকে মিস করছি! ফিরে আসুন, ২০% ওয়েলকাম ব্যাক ছাড় পান!',
                b: '💔 অনেকদিন দেখা নেই! আপনার জন্য স্পেশাল ৩০% ছাড় রেখেছি।'
            },
            newProduct: {
                a: '🆕 নতুন প্রোডাক্ট এসেছে! প্রথম ১০ জন অর্ডারে ১৫% ছাড়!',
                b: '🔥 নতুন কালেকশন! সবার আগে দেখুন + লঞ্চ অফার ২০% ছাড়!'
            },
            review: {
                a: '⭐ রিভিউ দিন, ১০% ছাড় পান! আপনার মতামত আমাদের কাছে গুরুত্বপূর্ণ।',
                b: '📝 ফটো রিভিউ দিলে ১৫% ছাড়! পরের অর্ডারে ব্যবহার করুন।'
            },
            referral: {
                a: '👥 বন্ধুকে রেফার করুন, দুজনেই ১৫% ছাড় পান!',
                b: '🤝 শেয়ার করুন, সেভ করুন! প্রতি রেফারে ১০০ টাকা ক্রেডিট!'
            }
        };

        const template = templates[type];
        if (template) {
            document.getElementById('ab-version-a').value = template.a;
            document.getElementById('ab-version-b').value = template.b;
        }
    }

    // Submit create test
    function submitCreateTest() {
        const name = document.getElementById('ab-test-name').value.trim();
        const versionA = document.getElementById('ab-version-a').value.trim();
        const versionB = document.getElementById('ab-version-b').value.trim();

        if (!name) {
            showToast('টেস্টের নাম দিন', 'error');
            return;
        }

        if (!versionA || !versionB) {
            showToast('দুটো Version-ই লিখুন', 'error');
            return;
        }

        const result = createTest(name, versionA, versionB);

        if (result.success) {
            closeModal('ab-create-modal');
            showToast('✅ টেস্ট তৈরি হয়েছে!', 'success');
            refresh();
        } else {
            showToast(result.message, 'error');
        }
    }

    // Show conversion modal
    function showConversionModal(testId) {
        const test = getTest(testId);
        if (!test) return;

        const modalHTML = `
            <div id="ab-conversion-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
                    <div class="bg-green-600 text-white p-4 rounded-t-2xl">
                        <h3 class="font-bold flex items-center gap-2">
                            <i class="ph ph-shopping-cart text-xl"></i>
                            অর্ডার/কনভার্সন যোগ করুন
                        </h3>
                    </div>
                    <div class="p-4">
                        <p class="text-slate-600 mb-4">কোন Version থেকে অর্ডার এসেছে?</p>
                        <div class="grid grid-cols-2 gap-3">
                            <button onclick="ABTesting.addConversion('${testId}', 'A')" 
                                    class="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 p-4 rounded-xl font-bold transition-colors">
                                <i class="ph ph-check-circle text-2xl mb-1"></i>
                                <br>Version A
                            </button>
                            <button onclick="ABTesting.addConversion('${testId}', 'B')" 
                                    class="bg-purple-100 hover:bg-purple-200 text-purple-700 p-4 rounded-xl font-bold transition-colors">
                                <i class="ph ph-check-circle text-2xl mb-1"></i>
                                <br>Version B
                            </button>
                        </div>
                    </div>
                    <div class="p-4 border-t">
                        <button onclick="ABTesting.closeModal('ab-conversion-modal')" 
                                class="w-full py-2 border rounded-xl hover:bg-slate-50 transition-colors">
                            বাতিল
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Add conversion
    function addConversion(testId, version) {
        recordInteraction(testId, version, 'conversion');
        closeModal('ab-conversion-modal');
        showToast('✅ অর্ডার যোগ হয়েছে!', 'success');
        refresh();
    }

    // Record and notify
    function recordAndNotify(testId, version, type) {
        const test = getTest(testId);
        if (!test) return;

        const content = version === 'A' ? test.versionA.content : test.versionB.content;

        if (type === 'copy') {
            // Copy to clipboard
            if (navigator.clipboard && document.hasFocus()) {
                navigator.clipboard.writeText(content).then(() => {
                    recordInteraction(testId, version, 'copy');
                    showToast('✅ কপি হয়েছে!', 'success');
                    refresh();
                });
            } else {
                // Fallback
                const textarea = document.createElement('textarea');
                textarea.value = content;
                textarea.style.position = 'fixed';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                recordInteraction(testId, version, 'copy');
                showToast('✅ কপি হয়েছে!', 'success');
                refresh();
            }
        } else if (type === 'send') {
            recordInteraction(testId, version, 'send');
            showToast('📤 সেন্ড রেকর্ড হয়েছে!', 'success');
            refresh();
        }
    }

    // Confirm complete
    function confirmComplete(testId) {
        if (confirm('এই টেস্ট সম্পন্ন করতে চান? এরপর আর ডেটা যোগ করা যাবে না।')) {
            completeTest(testId);
            showToast('✅ টেস্ট সম্পন্ন হয়েছে!', 'success');
            refresh();
        }
    }

    // Confirm delete
    function confirmDelete(testId) {
        if (confirm('এই টেস্ট মুছে ফেলতে চান?')) {
            deleteTest(testId);
            showToast('🗑️ টেস্ট মুছে ফেলা হয়েছে', 'success');
            refresh();
        }
    }

    // Close modal
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    }

    // Show toast
    function showToast(message, type = 'info') {
        const existingToast = document.getElementById('ab-toast');
        if (existingToast) existingToast.remove();

        const bgColor = type === 'success' ? 'bg-green-500' : 
                       type === 'error' ? 'bg-red-500' : 'bg-blue-500';

        const toast = document.createElement('div');
        toast.id = 'ab-toast';
        toast.className = `fixed bottom-24 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg z-50`;
        toast.textContent = message;

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Container ID for refresh
    let currentContainerId = 'ab-testing-container';

    // Refresh dashboard
    function refresh() {
        renderDashboard(currentContainerId);
    }

    // Initialize
    function init(containerId = 'ab-testing-container') {
        console.log('🧪 ABTesting: Initializing...');
        currentContainerId = containerId;
        renderDashboard(containerId);
        console.log('✅ ABTesting: Dashboard rendered!');
    }

    console.log('✅ ABTesting: Part 3 loaded (Modals & Actions)');

       // ============================================
    // PUBLIC API
    // ============================================

    return {
        // Config
        CONFIG,

        // Core functions
        getTests,
        createTest,
        getTest,
        recordInteraction,
        calculateWinner,
        completeTest,
        deleteTest,
        toggleTestStatus,

        // UI functions
        renderDashboard,
        renderTestCard,
        init,
        refresh,

        // Modal functions
        showCreateModal,
        applyTemplate,
        submitCreateTest,
        showConversionModal,
        addConversion,
        recordAndNotify,
        confirmComplete,
        confirmDelete,
        closeModal,

        // Utilities
        showToast,
        formatDate
    };

})();

window.ABTesting = ABTesting;

console.log('🎉 ABTesting v1.0 fully loaded!');