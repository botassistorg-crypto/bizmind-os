// campaignHistory.js v2.2 - Fixed for your schema

const CampaignHistory = {
    
    allCampaigns: [],
    
    async open() {
        const campaigns = await db.campaigns.orderBy('createdAt').reverse().toArray();
        
        const modalHTML = `
            <div id="campaign-history-modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <i class="ph ph-clock-counter-clockwise text-2xl"></i>
                                <h2 class="text-xl font-bold">Campaign History</h2>
                            </div>
                            <button onclick="CampaignHistory.close()" class="p-2 hover:bg-white/20 rounded-full transition">
                                <i class="ph ph-x text-xl"></i>
                            </button>
                        </div>
                        
                        <!-- Search Bar -->
                        <div class="mt-3 relative">
                            <i class="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-purple-200"></i>
                            <input 
                                type="text" 
                                id="campaign-search" 
                                placeholder="Search by name or phone..."
                                class="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 text-white placeholder-purple-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                                oninput="CampaignHistory.filterList(this.value)"
                            >
                        </div>
                    </div>
                    
                    <!-- Campaign List -->
                    <div id="campaign-list-container" class="p-4 overflow-y-auto max-h-[60vh]">
                        ${this.renderCampaignList(campaigns)}
                    </div>
                    
                    <!-- Footer Stats -->
                    <div class="border-t p-4 bg-gray-50">
                        <div class="flex justify-between text-sm text-gray-600">
                            <span><strong>${campaigns.length}</strong> total campaigns</span>
                            <span>Last 30 days: <strong>${this.getRecentCount(campaigns)}</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.allCampaigns = campaigns;
    },
    
    renderCampaignList(campaigns) {
        if (!campaigns || campaigns.length === 0) {
            return `
                <div class="text-center py-12 text-gray-500">
                    <i class="ph ph-paper-plane-tilt text-5xl mb-3 opacity-50"></i>
                    <p class="font-medium">No campaigns sent yet</p>
                    <p class="text-sm mt-1">Messages you send will appear here</p>
                </div>
            `;
        }
        
        return campaigns.map(campaign => {
            // ✅ Safe String conversion
            const phone = String(campaign.customerPhone || '');
            const maskedPhone = phone.length >= 11 
                ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') 
                : phone || 'N/A';
            
            const name = campaign.customerName || 'Unknown Customer';
            const date = campaign.createdAt 
                ? new Date(campaign.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })
                : 'N/A';
            const type = campaign.type || 'general';
            const message = campaign.message || 'No message';
            
            const typeConfig = {
                'offer': { bg: 'bg-green-100', text: 'text-green-700', icon: 'ph-gift' },
                'festival': { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'ph-confetti' },
                'reorder': { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'ph-repeat' },
                'winback': { bg: 'bg-red-100', text: 'text-red-700', icon: 'ph-heart' },
                'general': { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'ph-chat-circle' }
            };
            const config = typeConfig[type] || typeConfig['general'];
            
            return `
                <div class="campaign-item border rounded-xl p-4 mb-3 hover:shadow-md transition-all" 
                     data-name="${name.toLowerCase()}" 
                     data-phone="${phone}">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 ${config.bg} ${config.text} rounded-full flex items-center justify-center flex-shrink-0">
                            <i class="ph ${config.icon} text-lg"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                                <span class="font-semibold text-gray-800">${name}</span>
                                <span class="text-xs ${config.bg} ${config.text} px-2 py-0.5 rounded-full capitalize">${type}</span>
                            </div>
                            <p class="text-sm text-gray-500">${maskedPhone}</p>
                            <p class="text-sm text-gray-600 mt-2 line-clamp-2">${message}</p>
                        </div>
                        <div class="text-right flex-shrink-0">
                            <p class="text-xs text-gray-400">${date}</p>
                            <button onclick="CampaignHistory.resend('${phone}', \`${message.replace(/`/g, "'")}\`)" 
                                    class="mt-2 text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1">
                                <i class="ph ph-paper-plane-tilt"></i> Resend
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    filterList(query) {
        const q = query.toLowerCase().trim();
        const items = document.querySelectorAll('.campaign-item');
        
        items.forEach(item => {
            const name = item.dataset.name || '';
            const phone = item.dataset.phone || '';
            const match = name.includes(q) || phone.includes(q);
            item.style.display = match ? 'block' : 'none';
        });
    },
    
    getRecentCount(campaigns) {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        return campaigns.filter(c => c.createdAt && c.createdAt > thirtyDaysAgo).length;
    },
    
    resend(phone, message) {
        if (!phone) return alert('No phone number available');
        const cleanPhone = String(phone).replace(/\D/g, '');
        const encodedMsg = encodeURIComponent(message);
        window.open(`https://wa.me/88${cleanPhone}?text=${encodedMsg}`, '_blank');
    },
    
    close() {
        const modal = document.getElementById('campaign-history-modal');
        if (modal) modal.remove();
    }
};