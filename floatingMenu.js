/**
 * ═══════════════════════════════════════════════════════════════
 * FLOATING ACTION BUTTON (FAB) MENU
 * BizMind GrowthOS
 * ═══════════════════════════════════════════════════════════════
 * Features:
 * 1. App Guide
 * 2. Loss Calculator
 * 3. ELITE Features Preview
 * 4. Upgrade Button
 * ═══════════════════════════════════════════════════════════════
 */

const FloatingMenu = {

    isOpen: false,

    // ─────────────────────────────────────────────────────────────
// Initialize FAB - Call this on app load
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// Initialize FAB - Call this on app load
// ─────────────────────────────────────────────────────────────
init() {
    // Don't add if already exists
    if (document.getElementById('floating-fab-container')) return;
    
    const fabHTML = `
        <div id="floating-fab-container" class="fixed bottom-44 right-4 z-40 cursor-move touch-none">
            
            <!-- FAB Menu (Hidden by default) -->
            <div id="fab-menu" class="hidden mb-3 space-y-2">
                
                <!-- App Guide -->
                <button onclick="FloatingMenu.openAppGuide()" 
                        class="fab-menu-item flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100 w-52 hover:bg-gray-50 transition-all transform translate-x-4 opacity-0">
                    <div class="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                        <span class="text-lg">📚</span>
                    </div>
                    <div class="text-left">
                        <p class="font-bold text-gray-800 text-xs">App Guide</p>
                        <p class="text-[10px] text-gray-500">কিভাবে ব্যবহার করবেন</p>
                    </div>
                </button>
                
                <!-- Loss Calculator -->
                <button onclick="FloatingMenu.openLossCalculator()" 
                        class="fab-menu-item flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100 w-52 hover:bg-gray-50 transition-all transform translate-x-4 opacity-0">
                    <div class="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                        <span class="text-lg">💸</span>
                    </div>
                    <div class="text-left">
                        <p class="font-bold text-gray-800 text-xs">Loss Calculator</p>
                        <p class="text-[10px] text-gray-500">কত টাকা হারাচ্ছেন</p>
                    </div>
                </button>
                
                <!-- ELITE Features -->
                <button onclick="FloatingMenu.openEliteFeatures()" 
                        class="fab-menu-item flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100 w-52 hover:bg-gray-50 transition-all transform translate-x-4 opacity-0">
                    <div class="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
                        <span class="text-lg">👑</span>
                    </div>
                    <div class="text-left">
                        <p class="font-bold text-gray-800 text-xs">ELITE Features</p>
                        <p class="text-[10px] text-gray-500">কি কি পাবেন</p>
                    </div>
                </button>
                
                <!-- Upgrade Button -->
                <button onclick="FloatingMenu.openUpgrade()" 
                        class="fab-menu-item flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 rounded-xl shadow-lg w-52 hover:opacity-90 transition-all transform translate-x-4 opacity-0">
                    <div class="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                        <span class="text-lg">🚀</span>
                    </div>
                    <div class="text-left">
                        <p class="font-bold text-white text-xs">Upgrade</p>
                        <p class="text-[10px] text-white/80">ELITE তে যান</p>
                    </div>
                </button>
                
            </div>
            
            <!-- FAB Button with Label -->
            <button id="fab-button" 
                    class="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg pl-3 pr-4 py-2 hover:scale-105 transition-all select-none">
                <span id="fab-icon" class="text-white text-base transition-transform duration-300">📚</span>
                <span class="text-white text-xs font-medium" id="fab-label">Guide</span>
            </button>
            
        </div>
        
        <!-- Backdrop (Hidden by default) -->
        <div id="fab-backdrop" class="hidden fixed inset-0 bg-black/30 z-30" onclick="FloatingMenu.close()"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', fabHTML);
    
    // Initialize drag functionality
    this.initDrag();
},

// ─────────────────────────────────────────────────────────────
// Initialize Drag Functionality
// ─────────────────────────────────────────────────────────────
initDrag() {
    const fab = document.getElementById('floating-fab-container');
    const fabButton = document.getElementById('fab-button');
    
    if (!fab || !fabButton) return;
    
    let isDragging = false;
    let hasMoved = false;
    let startX, startY;
    let initialX, initialY;
    let currentX, currentY;
    
    // Get saved position from localStorage
    const savedPos = localStorage.getItem('fab_position');
    if (savedPos) {
        try {
            const pos = JSON.parse(savedPos);
            fab.style.left = pos.x + 'px';
            fab.style.top = pos.y + 'px';
            fab.style.right = 'auto';
            fab.style.bottom = 'auto';
        } catch (e) {}
    }
    
    // Touch Start
    fabButton.addEventListener('touchstart', (e) => {
        isDragging = true;
        hasMoved = false;
        
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        
        const rect = fab.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        
        fab.style.transition = 'none';
    }, { passive: true });
    
    // Touch Move
    fabButton.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        
        // Only start dragging after moving 10px
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            hasMoved = true;
        }
        
        if (hasMoved) {
            currentX = initialX + deltaX;
            currentY = initialY + deltaY;
            
            // Keep within screen bounds
            const maxX = window.innerWidth - fab.offsetWidth - 10;
            const maxY = window.innerHeight - fab.offsetHeight - 80; // Above bottom nav
            
            currentX = Math.max(10, Math.min(currentX, maxX));
            currentY = Math.max(10, Math.min(currentY, maxY));
            
            fab.style.left = currentX + 'px';
            fab.style.top = currentY + 'px';
            fab.style.right = 'auto';
            fab.style.bottom = 'auto';
        }
    }, { passive: true });
    
    // Touch End
    fabButton.addEventListener('touchend', (e) => {
        isDragging = false;
        fab.style.transition = 'all 0.2s ease';
        
        // Save position
        if (hasMoved) {
            localStorage.setItem('fab_position', JSON.stringify({ x: currentX, y: currentY }));
        } else {
            // It was a tap, not drag - open menu
            this.toggle();
        }
        
        hasMoved = false;
    });
    
    // Mouse events for desktop testing
    fabButton.addEventListener('mousedown', (e) => {
        isDragging = true;
        hasMoved = false;
        
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = fab.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        
        fab.style.transition = 'none';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            hasMoved = true;
        }
        
        if (hasMoved) {
            currentX = initialX + deltaX;
            currentY = initialY + deltaY;
            
            const maxX = window.innerWidth - fab.offsetWidth - 10;
            const maxY = window.innerHeight - fab.offsetHeight - 80;
            
            currentX = Math.max(10, Math.min(currentX, maxX));
            currentY = Math.max(10, Math.min(currentY, maxY));
            
            fab.style.left = currentX + 'px';
            fab.style.top = currentY + 'px';
            fab.style.right = 'auto';
            fab.style.bottom = 'auto';
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        
        isDragging = false;
        fab.style.transition = 'all 0.2s ease';
        
        if (hasMoved) {
            localStorage.setItem('fab_position', JSON.stringify({ x: currentX, y: currentY }));
        } else {
            this.toggle();
        }
        
        hasMoved = false;
    });
},

   // ─────────────────────────────────────────────────────────────
// Toggle Menu Open/Close (Called only by initDrag now)
// ─────────────────────────────────────────────────────────────
toggle() {
    if (this.isOpen) {
        this.close();
    } else {
        this.open();
    }
},

 // ─────────────────────────────────────────────────────────────
// Open Menu
// ─────────────────────────────────────────────────────────────
open() {
    this.isOpen = true;
    
    const menu = document.getElementById('fab-menu');
    const backdrop = document.getElementById('fab-backdrop');
    const fabIcon = document.getElementById('fab-icon');
    const fabLabel = document.getElementById('fab-label');
    const menuItems = document.querySelectorAll('.fab-menu-item');
    
    // Show menu and backdrop
    menu.classList.remove('hidden');
    backdrop.classList.remove('hidden');
    
    // Change FAB icon to close
    fabIcon.style.transform = 'rotate(45deg)';
    fabIcon.textContent = '✕';
    fabLabel.style.display = 'none';
    
    // Animate menu items
    menuItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.remove('translate-x-4', 'opacity-0');
            item.classList.add('translate-x-0', 'opacity-100');
        }, index * 50);
    });
},

// ─────────────────────────────────────────────────────────────
// Close Menu
// ─────────────────────────────────────────────────────────────
close() {
    this.isOpen = false;
    
    const menu = document.getElementById('fab-menu');
    const backdrop = document.getElementById('fab-backdrop');
    const fabIcon = document.getElementById('fab-icon');
    const fabLabel = document.getElementById('fab-label');
    const menuItems = document.querySelectorAll('.fab-menu-item');
    
    // Animate menu items out
    menuItems.forEach((item, index) => {
        item.classList.add('translate-x-4', 'opacity-0');
        item.classList.remove('translate-x-0', 'opacity-100');
    });
    
    // Reset FAB icon
    fabIcon.style.transform = 'rotate(0deg)';
    fabIcon.textContent = '📚';
    fabLabel.style.display = 'inline';
    
    // Hide menu and backdrop after animation
    setTimeout(() => {
        menu.classList.add('hidden');
        backdrop.classList.add('hidden');
    }, 200);
},

// ─────────────────────────────────────────────────────────────
// ACTION: Open App Guide (Enhanced Version)
// ─────────────────────────────────────────────────────────────
openAppGuide() {
    this.close();
    AppGuide.open();
},

// ─────────────────────────────────────────────────────────────
// ACTION: Open Loss Calculator
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// ACTION: Open Loss Calculator (Time Cost Consultant)
// ─────────────────────────────────────────────────────────────
openLossCalculator() {
    this.close();
    TimeCostConsultant.open();
},
    // ─────────────────────────────────────────────────────────────
    // ACTION: Open ELITE Features Preview
    // ─────────────────────────────────────────────────────────────
    openEliteFeatures() {
        this.close();
        
        const currentTier = (typeof AppState !== 'undefined' && AppState.userTier) ? AppState.userTier : 'STARTER';
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.id = 'elite-features-modal';
        
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl">
                
                <!-- Header -->
                <div class="bg-gradient-to-r from-amber-500 to-orange-600 p-5 text-white">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-bold flex items-center gap-2">
                            👑 ELITE Features
                        </h2>
                        <button onclick="document.getElementById('elite-features-modal').remove()" 
                                class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            ✕
                        </button>
                    </div>
                    <p class="text-white/80 text-sm mt-1">আপনার বর্তমান প্ল্যান: ${currentTier}</p>
                </div>
                
                <!-- Content -->
                <div class="p-5 overflow-y-auto max-h-[60vh] space-y-3">
                    
                    <!-- STARTER Features -->
                    <div class="border border-gray-200 rounded-xl p-4">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-xl">🌱</span>
                            <h3 class="font-bold text-gray-800">STARTER (৳499)</h3>
                            ${currentTier === 'STARTER' ? '<span class="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Current</span>' : ''}
                        </div>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li>✅ Unlimited Orders</li>
                            <li>✅ Unlimited Customers</li>
                            <li>✅ Invoice Generate</li>
                            <li>✅ Daily Summary</li>
                            <li>✅ 1 Customer Alert</li>
                        </ul>
                    </div>
                    
                    <!-- GROWTH Features -->
                    <div class="border-2 border-purple-200 rounded-xl p-4 bg-purple-50/30">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-xl">⭐</span>
                            <h3 class="font-bold text-purple-800">GROWTH (৳1,499)</h3>
                            ${currentTier === 'GROWTH' ? '<span class="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">Current</span>' : ''}
                        </div>
                        <p class="text-xs text-purple-600 mb-2">Everything in STARTER plus:</p>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li>✅ Customer Segments (VIP, At-Risk)</li>
                            <li>✅ All Customer Alerts</li>
                            <li>✅ Offer AI - স্মার্ট অফার</li>
                            <li>✅ Message Templates</li>
                            <li>✅ Festival Campaigns</li>
                            <li>✅ Campaign History</li>
                        </ul>
                    </div>
                    
                    <!-- ELITE Features -->
                    <div class="border-2 border-amber-300 rounded-xl p-4 bg-gradient-to-br from-amber-50 to-orange-50">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-xl">👑</span>
                            <h3 class="font-bold text-amber-800">ELITE (৳2,999)</h3>
                            ${currentTier === 'ELITE' ? '<span class="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">Current</span>' : ''}
                        </div>
                        <p class="text-xs text-amber-600 mb-2">Everything in GROWTH plus:</p>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li>✅ Daily Briefing - আজকের করণীয়</li>
                            <li>✅ Profit Leakage - টাকা কোথায় যাচ্ছে</li>
                            <li>✅ Bundle Suggester - বান্ডেল অফার</li>
                            <li>✅ Revenue Prediction - আয়ের পূর্বাভাস</li>
                            <li>✅ Reorder Predictor</li>
                            <li>✅ A/B Testing</li>
                            <li>✅ Product Recommendations</li>
                        </ul>
                    </div>
                    
                </div>
                
                <!-- Footer CTA -->
                ${currentTier !== 'ELITE' ? `
                    <div class="p-5 border-t bg-gray-50">
                        <button onclick="document.getElementById('elite-features-modal').remove(); FloatingMenu.openUpgrade();" 
                                class="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2">
                            <span>🚀</span>
                            Upgrade করুন
                        </button>
                    </div>
                ` : ''}
                
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    // ─────────────────────────────────────────────────────────────
    // ACTION: Open Upgrade
    // ─────────────────────────────────────────────────────────────
    openUpgrade() {
        this.close();
        
        const currentTier = (typeof AppState !== 'undefined' && AppState.userTier) ? AppState.userTier : 'STARTER';
        const nextTier = currentTier === 'STARTER' ? 'GROWTH' : 'ELITE';
        const price = nextTier === 'GROWTH' ? '1,499' : '2,999';
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.id = 'upgrade-modal-fab';
        
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
                
                <!-- Header -->
                <div class="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white text-center">
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span class="text-4xl">👑</span>
                    </div>
                    <h2 class="text-2xl font-bold">${nextTier} Plan</h2>
                    <p class="text-white/80 mt-1">AI দিয়ে বিজনেস বড় করুন</p>
                </div>
                
                <!-- Pricing -->
                <div class="p-6 text-center">
                    <div class="bg-gray-50 rounded-xl p-4 mb-6">
                        <p class="text-gray-500 text-sm">মাসিক খরচ</p>
                        <p class="text-4xl font-bold text-gray-800">৳${price}</p>
                        <p class="text-green-600 text-sm mt-1">= দিনে মাত্র ৳${Math.round(parseInt(price.replace(',', '')) / 30)}!</p>
                    </div>
                    
                    <!-- WhatsApp Button -->
                    <a href="https://wa.me/8801700524647?text=${encodeURIComponent(`আমি BizMind ${nextTier} Plan নিতে চাই।\n\nআমার বর্তমান প্ল্যান: ${currentTier}`)}" 
                       target="_blank"
                       class="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-4 rounded-xl font-bold hover:bg-green-600 transition mb-3">
                        <i class="ph-bold ph-whatsapp-logo text-xl"></i>
                        WhatsApp এ যোগাযোগ করুন
                    </a>
                    
                    <button onclick="document.getElementById('upgrade-modal-fab').remove()" 
                            class="w-full text-gray-500 py-2 text-sm hover:text-gray-700">
                        পরে দেখব
                    </button>
                </div>
                
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

};

// Make globally available
window.FloatingMenu = FloatingMenu;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    FloatingMenu.init();
});