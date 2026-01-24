// ============================================
// BIZMIND GROWTH OS - TACTICS ENGINE v2.0
// Complete AI Business Consultant Knowledge Base
// Part 1: Core Setup + Psychology Drivers
// ============================================

const TacticsEngine = {

// ============================================
// SECTION 1: PSYCHOLOGY DRIVERS (8 Drivers)
// Why people buy - from Copywriting Tactics
// ============================================

psychologyDrivers: {
survival: {
id: 'survival',
name: "Survival",
bangla: "বেঁচে থাকা",
wants: "Live longer, healthier, safer",
triggers: ["health", "safety", "protection"],
copyAngles: [
"আপনার স্বাস্থ্য রক্ষা করুন",
"পরিবারকে নিরাপদ রাখুন",
"সুস্থ থাকুন"
],
useWhen: "Selling health, safety, food products"
},
security: {
id: 'security',
name: "Security",
bangla: "নিরাপত্তা",
wants: "Money, stability, protection",
triggers: ["savings", "guarantee", "warranty", "risk-free"],
copyAngles: [
"টাকা বাঁচান",
"গ্যারান্টি সহ",
"ঝুঁকি নেই",
"নিশ্চিত রিটার্ন"
],
useWhen: "Offering guarantees, warranties, money-back"
},
pleasure: {
id: 'pleasure',
name: "Pleasure",
bangla: "আনন্দ",
wants: "Enjoyment, comfort, satisfaction",
triggers: ["comfortable", "enjoy", "relax", "treat yourself"],
copyAngles: [
"নিজেকে পুরস্কৃত করুন",
"আরাম উপভোগ করুন",
"মজা নিন"
],
useWhen: "Selling lifestyle, fashion, comfort products"
},
status: {
id: 'status',
name: "Status",
bangla: "মর্যাদা",
wants: "Recognition, respect, admiration",
triggers: ["exclusive", "VIP", "premium", "limited edition"],
copyAngles: [
"এক্সক্লুসিভ সংগ্রহ",
"শুধুমাত্র VIP দের জন্য",
"প্রিমিয়াম কোয়ালিটি",
"লিমিটেড এডিশন"
],
useWhen: "Selling premium products, VIP offers"
},
belonging: {
id: 'belonging',
name: "Belonging",
bangla: "সম্পর্ক",
wants: "Connection, love, community",
triggers: ["join", "community", "family", "together"],
copyAngles: [
"আমাদের পরিবারে যোগ দিন",
"একসাথে এগিয়ে যাই",
"কমিউনিটিতে স্বাগতম"
],
useWhen: "Building loyalty, repeat customers"
},
growth: {
id: 'growth',
name: "Growth",
bangla: "উন্নতি",
wants: "Learning, improvement, potential",
triggers: ["improve", "better", "upgrade", "new version"],
copyAngles: [
"আরও ভালো হোন",
"আপগ্রেড করুন",
"নতুন ভার্সন এসেছে"
],
useWhen: "Upselling, new product launches"
},
freedom: {
id: 'freedom',
name: "Freedom",
bangla: "স্বাধীনতা",
wants: "Independence, choices, escape",
triggers: ["easy", "hassle-free", "no restrictions", "your choice"],
copyAngles: [
"সহজেই করুন",
"ঝামেলা নেই",
"আপনার পছন্দ"
],
useWhen: "Offering convenience, easy returns"
},
purpose: {
id: 'purpose',
name: "Purpose",
bangla: "উদ্দেশ্য",
wants: "Meaning, contribution, legacy",
triggers: ["support local", "eco-friendly", "give back"],
copyAngles: [
"দেশীয় পণ্য কিনুন",
"পরিবেশ বাঁচান",
"সমাজে অবদান রাখুন"
],
useWhen: "Social causes, local business angle"
}
},

// ============================================
// SECTION 2: BUYER SEGMENTS (RFM Based)
// From Data Tracking document
// ============================================

buyerSegments: {
champions: {
id: 'champions',
name: "Champions",
bangla: "চ্যাম্পিয়ন",
icon: "🏆",
color: "#FFD700",
criteria: {
minOrders: 5,
minSpent: 15000,
maxDaysSinceOrder: 30
},
description: "Best buyers - buy often, spend most, bought recently",
strategy: "Loyalty rewards, early access, personal touch",
offerTypes: ["vip_exclusive", "early_access", "referral"],
discountRange: { min: 5, max: 15 },
priority: 1
},
loyal: {
id: 'loyal',
name: "Loyal",
bangla: "বিশ্বস্ত",
icon: "💚",
color: "#4CAF50",
criteria: {
minOrders: 4,
minSpent: 8000,
maxDaysSinceOrder: 45
},
description: "Regular buyers with good spending",
strategy: "Upsell, referral program, maintain relationship",
offerTypes: ["loyalty_reward", "bundle_deal", "referral"],
discountRange: { min: 10, max: 20 },
priority: 2
},
potential: {
id: 'potential',
name: "Potential Loyalist",
bangla: "সম্ভাবনাময়",
icon: "⭐",
color: "#2196F3",
criteria: {
minOrders: 2,
minSpent: 3000,
maxDaysSinceOrder: 30
},
description: "Recent buyers with potential to become loyal",
strategy: "Nurture, education, second purchase push",
offerTypes: ["bundle_deal", "free_delivery", "loyalty_reward"],
discountRange: { min: 10, max: 20 },
priority: 3
},
newBuyer: {
id: 'newBuyer',
name: "New Buyer",
bangla: "নতুন",
icon: "🆕",
color: "#9C27B0",
criteria: {
minOrders: 1,
maxOrders: 1,
maxDaysSinceOrder: 30
},
description: "First time buyer - critical period",
strategy: "Welcome sequence, first value, build habit",
offerTypes: ["first_order", "free_delivery", "welcome"],
discountRange: { min: 10, max: 15 },
priority: 4
},
promising: {
id: 'promising',
name: "Promising",
bangla: "আশাব্যঞ্জক",
icon: "💫",
color: "#00BCD4",
criteria: {
minOrders: 2,
minSpent: 2000,
maxDaysSinceOrder: 45
},
description: "Bought more than once, moderate value",
strategy: "Increase frequency, cross-sell",
offerTypes: ["bundle_deal", "flash_sale", "cross_sell"],
discountRange: { min: 15, max: 25 },
priority: 5
},
needsAttention: {
id: 'needsAttention',
name: "Needs Attention",
bangla: "মনোযোগ দরকার",
icon: "👀",
color: "#FF9800",
criteria: {
minOrders: 2,
minDaysSinceOrder: 30,
maxDaysSinceOrder: 60
},
description: "Above average buyers but slipping away",
strategy: "Reactivation offer, limited time deal",
offerTypes: ["win_back", "flash_sale", "free_delivery"],
discountRange: { min: 15, max: 25 },
priority: 6
},
atRisk: {
id: 'atRisk',
name: "At Risk",
bangla: "ঝুঁকিতে",
icon: "⚠️",
color: "#FF5722",
criteria: {
minOrders: 2,
minDaysSinceOrder: 60,
maxDaysSinceOrder: 90
},
description: "Spent good money but haven't returned",
strategy: "Win-back campaign, strong discount, urgency",
offerTypes: ["win_back", "clearance", "flash_sale"],
discountRange: { min: 20, max: 30 },
priority: 7
},
cantLose: {
id: 'cantLose',
name: "Can't Lose Them",
bangla: "হারানো যাবে না",
icon: "🚨",
color: "#D32F2F",
criteria: {
minOrders: 4,
minSpent: 10000,
minDaysSinceOrder: 60
},
description: "Big spenders who haven't bought recently - URGENT",
strategy: "Personal outreach, best offer, understand why",
offerTypes: ["win_back", "vip_exclusive", "personal"],
discountRange: { min: 20, max: 35 },
priority: 8
},
hibernating: {
id: 'hibernating',
name: "Hibernating",
bangla: "ঘুমন্ত",
icon: "😴",
color: "#795548",
criteria: {
minOrders: 1,
minDaysSinceOrder: 90,
maxDaysSinceOrder: 180
},
description: "Low spenders, haven't bought in long time",
strategy: "Reactivation with strong offer",
offerTypes: ["clearance", "flash_sale", "win_back"],
discountRange: { min: 25, max: 40 },
priority: 9
},
lost: {
id: 'lost',
name: "Lost",
bangla: "হারানো",
icon: "💔",
color: "#9E9E9E",
criteria: {
minOrders: 1,
minDaysSinceOrder: 180
},
description: "Haven't bought in very long time",
strategy: "Aggressive win-back or let go",
offerTypes: ["clearance", "win_back"],
discountRange: { min: 30, max: 50 },
priority: 10
}
},

// ============================================
// SECTION 3: OFFER TYPES (17 Types)
// From Offer Vault document
// ============================================

offerTypes: {
// --- FOR NEW BUYERS ---
godfather: {
id: 'godfather',
name: "Godfather Offer",
bangla: "অপ্রত্যাখ্যানযোগ্য অফার",
icon: "🎩",
description: "An offer so good they feel stupid saying no",
forSegments: ["newBuyer", "atRisk", "lost"],
psychology: ["security", "pleasure"],
components: ["huge_value_stack", "strong_guarantee", "real_urgency"],
example: "৳৫০০০ মূল্যের প্রোডাক্ট মাত্র ৳১৯৯৯ + ফ্রি ডেলিভারি + ১০০% মানি ব্যাক গ্যারান্টি"
},
tripwire: {
id: 'tripwire',
name: "Tripwire Offer",
bangla: "প্রবেশ অফার",
icon: "🪤",
description: "Turn strangers into buyers for almost nothing",
forSegments: ["newBuyer"],
psychology: ["pleasure", "security"],
priceRange: "৳৫০-২০০",
purpose: "Buyer creation, not profit",
example: "মাত্র ৳৯৯ তে ট্রায়াল প্যাক!"
},
freeShipping: {
id: 'freeShipping',
name: "Free + Shipping",
bangla: "ফ্রি + শিপিং",
icon: "🚚",
description: "Free product, charge only shipping",
forSegments: ["newBuyer", "potential"],
psychology: ["pleasure", "security"],
purpose: "Lead generation, upsell opportunity",
example: "প্রোডাক্ট ফ্রি! শুধু ডেলিভারি চার্জ ৳১২০"
},
invisibleDiscount: {
id: 'invisibleDiscount',
name: "Invisible Discount",
bangla: "লুকানো ছাড়",
icon: "🎁",
description: "Add bonuses instead of lowering price",
forSegments: ["all"],
psychology: ["pleasure", "status"],
principle: "Same price, MORE value",
example: "কিনলেই ফ্রি গিফট! (দাম একই, কিন্তু বেশি পাচ্ছেন)"
},
resultsFirst: {
id: 'resultsFirst',
name: "Results First",
bangla: "আগে রেজাল্ট",
icon: "🎯",
description: "Pay after they get results",
forSegments: ["atRisk", "cantLose"],
psychology: ["security"],
example: "সন্তুষ্ট না হলে টাকা ফেরত - কোনো প্রশ্ন নেই"
},
reasonWhy: {
id: 'reasonWhy',
name: "Reason Why",
bangla: "কারণ সহ অফার",
icon: "❓",
description: "Always explain WHY you're giving offer",
forSegments: ["all"],
psychology: ["security"],
reasons: ["overstocked", "anniversary", "festival", "first_100_customers"],
example: "স্টক ক্লিয়ারেন্স - তাই ৪০% ছাড়!"
},
partition: {
id: 'partition',
name: "Partition Offer",
bangla: "ভাগ করা দাম",
icon: "📊",
description: "Break big prices into small pieces",
forSegments: ["all"],
psychology: ["security", "pleasure"],
example: "মাত্র ৳৩৩/দিন! (বছরে ৳১২,০০০)"
},
decoy: {
id: 'decoy',
name: "Decoy Offer",
bangla: "ডিকয় অফার",
icon: "🎭",
description: "Use bad option to make good option obvious",
forSegments: ["all"],
psychology: ["security"],
structure: "Basic (too little) → Pro (target) → Premium (anchor)",
example: "Basic ৳৪৯ | Pro ৳৯৯ (BEST VALUE) | Premium ৳২৯৯"
},

// --- FOR EXISTING BUYERS ---
ascension: {
id: 'ascension',
name: "Ascension Offer",
bangla: "আপগ্রেড অফার",
icon: "📈",
description: "Always have a next level",
forSegments: ["loyal", "champions", "potential"],
psychology: ["growth", "status"],
example: "আপনি Regular কিনেছেন, Premium এ আপগ্রেড করুন মাত্র ৳৫০০ বেশিতে!"
},
downsell: {
id: 'downsell',
name: "Downsell Offer",
bangla: "বিকল্প অফার",
icon: "📉",
description: "Catch people on the way out",
forSegments: ["atRisk", "hibernating"],
psychology: ["security", "pleasure"],
example: "বড় প্যাক দামি? ছোট প্যাক নিন মাত্র ৳১৯৯!"
},
upsell: {
id: 'upsell',
name: "Upsell Offer",
bangla: "আপসেল",
icon: "⬆️",
description: "Offer more right after purchase",
forSegments: ["newBuyer", "potential", "loyal"],
psychology: ["pleasure", "growth"],
timing: "Immediately after purchase",
example: "এইমাত্র X কিনেছেন? Y যোগ করুন ৪০% ছাড়ে!"
},
crossSell: {
id: 'crossSell',
name: "Cross-Sell Offer",
bangla: "ক্রস-সেল",
icon: "↔️",
description: "Different product, same customer",
forSegments: ["loyal", "potential", "champions"],
psychology: ["pleasure", "growth"],
timing: "3-7 days after purchase",
example: "যারা X কিনেছেন তারা Y ও পছন্দ করেছেন!"
},
continuity: {
id: 'continuity',
name: "Continuity Offer",
bangla: "সাবস্ক্রিপশন",
icon: "🔄",
description: "Turn one sale into recurring revenue",
forSegments: ["loyal", "champions"],
psychology: ["security", "freedom"],
example: "মাসিক সাবস্ক্রিপশনে ২০% সাশ্রয়!"
},
reactivation: {
id: 'reactivation',
name: "Reactivation Offer",
bangla: "ফিরিয়ে আনা",
icon: "💔",
description: "Wake up dead customers",
forSegments: ["atRisk", "hibernating", "lost", "cantLose"],
psychology: ["belonging", "pleasure"],
timing: "60-180 days inactive",
example: "আপনাকে মিস করছি! ফিরে আসুন, ২৫% ছাড়!"
},
referral: {
id: 'referral',
name: "Referral Offer",
bangla: "রেফারেল",
icon: "🤝",
description: "Turn customers into salespeople",
forSegments: ["champions", "loyal"],
psychology: ["belonging", "pleasure"],
example: "বন্ধুকে আনুন, দুজনেই ৳২০০ ছাড় পান!"
},
vipExclusive: {
id: 'vipExclusive',
name: "VIP Exclusive",
bangla: "ভিআইপি এক্সক্লুসিভ",
icon: "👑",
description: "Make loyalty feel special",
forSegments: ["champions", "loyal", "cantLose"],
psychology: ["status", "belonging"],
example: "শুধুমাত্র VIP দের জন্য - ৪৮ ঘন্টা আগে অ্যাক্সেস!"
},
flashSale: {
id: 'flashSale',
name: "Flash Sale",
bangla: "ফ্ল্যাশ সেল",
icon: "⚡",
description: "Limited time, high urgency",
forSegments: ["all"],
psychology: ["security", "pleasure"],
duration: "6-24 hours",
example: "⚡ ৬ ঘন্টার ফ্ল্যাশ সেল - ৫০% পর্যন্ত ছাড়!"
}
},

// ============================================
// SECTION 4: PRICING TACTICS
// From Pricing document
// ============================================

pricingTactics: {
// --- CHARM PRICING ---
leftDigitDrop: {
id: 'leftDigitDrop',
name: "Left Digit Drop",
bangla: "বাম ডিজিট কমানো",
description: "৳400 → ৳399, ৳1000 → ৳997",
impact: "8-12% conversion increase",
useFor: "Mass market, impulse purchases"
},
magic7: {
id: 'magic7',
name: "Magic 7",
bangla: "ম্যাজিক ৭",
description: "Prices ending in 7 feel more calculated",
impact: "Works better for premium products",
useFor: "Premium contexts"
},
roundForLuxury: {
id: 'roundForLuxury',
name: "Round for Luxury",
bangla: "গোল সংখ্যা",
description: "৳5000 not ৳4997 for premium",
useFor: "Luxury, premium products"
},

// --- ANCHORING ---
highAnchor: {
id: 'highAnchor',
name: "High Anchor",
bangla: "উচ্চ অ্যাংকর",
description: "Show highest price FIRST",
implementation: "Show premium tier first, then regular",
example: "Premium ৳৫০০০ | Regular ৳২০০০ (৬০% সাশ্রয়!)"
},
externalAnchor: {
id: 'externalAnchor',
name: "External Anchor",
bangla: "বাইরের তুলনা",
description: "Compare to expensive things outside your category",
example: "একটা ডিনারে ৳১৫০০ খরচ, এই কোর্স সারাজীবনের জন্য মাত্র ৳২০০০"
},
valueStackAnchor: {
id: 'valueStackAnchor',
name: "Value Stack Anchor",
bangla: "ভ্যালু স্ট্যাক",
description: "List every component with values",
template: "মোট মূল্য: ৳[TOTAL]\nআজকের দাম: ৳[PRICE]"
},
originalPriceAnchor: {
id: 'originalPriceAnchor',
name: "Original Price Anchor",
bangla: "আগের দাম",
description: "Show crossed-out original price",
implementation: "৳১৫০০ → ৳৯৯৭",
warning: "Original price must be believable"
},

// --- FRAMING ---
perDayBreakdown: {
id: 'perDayBreakdown',
name: "Per-Day Breakdown",
bangla: "প্রতিদিনের হিসাব",
description: "Break to smallest unit",
examples: [
"৳১২,০০০/বছর = মাত্র ৳৩৩/দিন",
"চা এর দামে সারাদিনের সার্ভিস!"
]
},
comparisonFrame: {
id: 'comparisonFrame',
name: "Comparison Frame",
bangla: "তুলনামূলক",
description: "Compare to something they waste money on",
examples: [
"২টা পিজার দামে!",
"Netflix এর সাবস্ক্রিপশনের চেয়ে কম",
"একটা ডিনার বাদ দিন"
]
},
investmentVsCost: {
id: 'investmentVsCost',
name: "Investment vs Cost",
bangla: "বিনিয়োগ",
description: "Never say 'costs', say 'invest'",
wrong: "এটা ৳৫০০০ খরচ হবে",
right: "এটাতে ৳৫০০০ বিনিয়োগ করুন"
},
roiFrame: {
id: 'roiFrame',
name: "ROI Frame",
bangla: "রিটার্ন দেখান",
description: "Show the RETURN, not just price",
example: "৳১০,০০০ বিনিয়োগ করুন, ৳১,০০,০০০ আয় করুন"
},

// --- PAYMENT ---
paymentPlan: {
id: 'paymentPlan',
name: "Payment Plan",
bangla: "কিস্তি",
description: "Break into installments",
example: "৳৩০০০ একবারে বা ৳১১০০ x ৩ মাস"
},
prepayDiscount: {
id: 'prepayDiscount',
name: "Prepay Discount",
bangla: "অগ্রিম ছাড়",
description: "Discount for paying upfront",
example: "মাসিক ৳৫০০ বা বাৎসরিক ৳৫০০০ (৳১০০০ সাশ্রয়)"
},

// --- BUNDLING ---
pureBundle: {
id: 'pureBundle',
name: "Pure Bundle",
bangla: "বান্ডেল",
description: "Only sell as bundle, no individual",
benefit: "Harder to price compare"
},
mixedBundle: {
id: 'mixedBundle',
name: "Mixed Bundle",
bangla: "মিক্সড বান্ডেল",
description: "Individual AND bundle options",
example: "A: ৳৫০০ | B: ৳৫০০ | A+B Bundle: ৳৭৫০ (৳২৫০ সাশ্রয়!)"
},
bonusBundle: {
id: 'bonusBundle',
name: "Bonus Bundle",
bangla: "বোনাস বান্ডেল",
description: "Don't discount, ADD bonuses",
principle: "Value UP, price SAME",
example: "একই দামে এখন ফ্রি গিফট সাথে!"
},

// --- SCARCITY ---
deadlinePricing: {
id: 'deadlinePricing',
name: "Deadline Pricing",
bangla: "সময়সীমা",
description: "Price goes up after deadline",
example: "এই দাম আজ রাত পর্যন্ত! কাল থেকে ৳১৫০০",
warning: "Must be REAL"
},
quantityPricing: {
id: 'quantityPricing',
name: "Quantity Pricing",
bangla: "সংখ্যা সীমিত",
description: "Limited quantity at this price",
example: "প্রথম ৫০ জন: ৳৯৯৭ | এরপর: ৳১৪৯৭"
},

// --- GUARANTEE ---
riskReversal: {
id: 'riskReversal',
name: "Risk Reversal",
bangla: "ঝুঁকি নেই",
description: "Strong guarantee allows higher pricing",
levels: [
"৩০ দিনে টাকা ফেরত",
"১০০% সন্তুষ্টি গ্যারান্টি",
"ডাবল মানি ব্যাক যদি কাজ না করে"
]
}
},

// ============================================
// SECTION 5: RFM SCORING SYSTEM
// From Data Tracking document
// ============================================

rfmScoring: {
// Recency scoring (days since last order)
recency: {
5: { maxDays: 7, label: "সদ্য কিনেছেন" },
4: { maxDays: 30, label: "এই মাসে কিনেছেন" },
3: { maxDays: 60, label: "১-২ মাস আগে" },
2: { maxDays: 90, label: "২-৩ মাস আগে" },
1: { maxDays: 999, label: "অনেকদিন আগে" }
},

// Frequency scoring (total orders)
frequency: {
5: { minOrders: 10, label: "খুব ঘন ঘন" },
4: { minOrders: 6, label: "নিয়মিত" },
3: { minOrders: 4, label: "মাঝে মাঝে" },
2: { minOrders: 2, label: "কয়েকবার" },
1: { minOrders: 1, label: "একবার" }
},

// Monetary scoring (total spent in BDT)
monetary: {
5: { minSpent: 20000, label: "সবচেয়ে বেশি" },
4: { minSpent: 10000, label: "অনেক বেশি" },
3: { minSpent: 5000, label: "মধ্যম" },
2: { minSpent: 2000, label: "কম" },
1: { minSpent: 0, label: "সবচেয়ে কম" }
},

// Calculate RFM score for a buyer
calculateRFM: function(daysSinceLastOrder, totalOrders, totalSpent) {
let r = 1, f = 1, m = 1;

// Recency
for (let score = 5; score >= 1; score--) {
if (daysSinceLastOrder <= this.recency[score].maxDays) {
r = score;
break;
}
}

// Frequency
for (let score = 5; score >= 1; score--) {
if (totalOrders >= this.frequency[score].minOrders) {
f = score;
break;
}
}

// Monetary
for (let score = 5; score >= 1; score--) {
if (totalSpent >= this.monetary[score].minSpent) {
m = score;
break;
}
}

return {
r: r,
f: f,
m: m,
combined: `${r}${f}${m}`,
total: r + f + m
};
},

// Get segment from RFM
getSegmentFromRFM: function(rfm) {
const { r, f, m, total } = rfm;

// Champions: Best in everything
if (r >= 4 && f >= 4 && m >= 4) return 'champions';

// Can't Lose: High value but not buying recently
if (r <= 2 && f >= 3 && m >= 4) return 'cantLose';

// Loyal: Good frequency and monetary
if (f >= 4 && m >= 3) return 'loyal';

// At Risk: Were good, slipping away
if (r <= 2 && f >= 2 && m >= 2) return 'atRisk';

// Needs Attention: Above average but cooling
if (r === 3 && f >= 2 && m >= 2) return 'needsAttention';

// New Buyer: Only one purchase, recent
if (f === 1 && r >= 4) return 'newBuyer';

// Potential Loyalist: Recent with multiple purchases
if (r >= 4 && f >= 2) return 'potential';

// Promising: Some activity
if (r >= 3 && f >= 2) return 'promising';

// Hibernating: Low engagement
if (r <= 2 && f <= 2) return 'hibernating';

// Lost: Very low everything
if (total <= 5) return 'lost';

return 'promising'; // Default
}
},

// ============================================
// SECTION 6: URGENCY TRIGGERS
// ============================================

urgencyTriggers: {
time: [
"আজ রাত ১১:৫৯ পর্যন্ত",
"মাত্র ২৪ ঘন্টা বাকি",
"এই সপ্তাহে শেষ",
"আগামীকাল থেকে দাম বাড়বে",
"সীমিত সময়ের অফার",
"আজকেই শেষ সুযোগ"
],
stock: [
"মাত্র [NUMBER]টি বাকি!",
"স্টক শেষ হয়ে যাচ্ছে",
"শেষ [NUMBER]টি",
"Re-stock হবে না",
"Limited Edition",
"প্রথম [NUMBER] জন পাবেন",
"Almost Sold Out!"
],
social: [
"[NUMBER] জন এখন দেখছেন",
"গত ঘন্টায় [NUMBER]টি বিক্রি হয়েছে",
"[NUMBER]+ মানুষ কিনেছেন",
"Trending Now 🔥",
"Best Seller",
"সবার পছন্দের"
],
fear: [
"দেরি করলে মিস করবেন",
"এই সুযোগ আর আসবে না",
"অন্যরা নিয়ে নেবে",
"দাম বাড়ার আগেই নিন",
"স্টক থাকতেই অর্ডার করুন"
]
},

// ============================================
// SECTION 7: HEADLINE FORMULAS
// From Copywriting document
// ============================================

headlineFormulas: {
howTo: {
name: "How-To",
bangla: "কিভাবে",
template: "কিভাবে [OUTCOME]",
example: "কিভাবে ৫০% সাশ্রয় করবেন"
},
question: {
name: "Question",
bangla: "প্রশ্ন",
template: "[PROBLEM] নিয়ে চিন্তিত?",
example: "ওজন নিয়ে চিন্তিত?"
},
number: {
name: "Number List",
bangla: "সংখ্যা তালিকা",
template: "[NUMBER]টি উপায় [OUTCOME] এর",
example: "৫টি উপায় টাকা বাঁচানোর"
},
command: {
name: "Command",
bangla: "নির্দেশ",
template: "এখনই [ACTION] করুন",
example: "এখনই অর্ডার করুন"
},
warning: {
name: "Warning",
bangla: "সতর্কতা",
template: "সাবধান: [PROBLEM]",
example: "সাবধান: স্টক শেষ হয়ে যাচ্ছে!"
},
secret: {
name: "Secret",
bangla: "গোপন",
template: "[OUTCOME] এর গোপন রহস্য",
example: "সফল ব্যবসার গোপন রহস্য"
},
scarcity: {
name: "Scarcity",
bangla: "সীমিত",
template: "মাত্র [NUMBER]টি বাকি!",
example: "মাত্র ৫টি বাকি!"
},
exclusive: {
name: "Exclusive",
bangla: "এক্সক্লুসিভ",
template: "শুধুমাত্র [GROUP] এর জন্য",
example: "শুধুমাত্র VIP কাস্টমারদের জন্য"
},
discount: {
name: "Discount",
bangla: "ছাড়",
template: "[PERCENT]% ছাড় - [TIME] পর্যন্ত",
example: "৩০% ছাড় - আজ রাত পর্যন্ত!"
},
free: {
name: "Free",
bangla: "ফ্রি",
template: "ফ্রি [ITEM] সাথে [CONDITION]",
example: "ফ্রি ডেলিভারি ৳১০০০+ অর্ডারে"
},
guarantee: {
name: "Guarantee",
bangla: "গ্যারান্টি",
template: "[OUTCOME] গ্যারান্টি, নাহলে [PROMISE]",
example: "সন্তুষ্টি গ্যারান্টি, নাহলে টাকা ফেরত"
}
},

// ============================================
// SECTION 8: MESSAGE TEMPLATES (BANGLA)
// ============================================

messageTemplates: {
welcome: {
name: "Welcome",
bangla: "স্বাগতম",
messages: [
{
type: "warm",
template: "🎉 [NAME] ভাই/আপু, স্বাগতম!\n\nআপনার প্রথম অর্ডারের জন্য ধন্যবাদ।\n\n💝 পরবর্তী অর্ডারে [PERCENT]% ছাড় পেতে এই কোড ব্যবহার করুন: [CODE]\n\n- [SHOP_NAME]",
forSegment: "newBuyer",
psychology: ["belonging", "pleasure"]
},
{
type: "simple",
template: "Hi [NAME]! 👋\n\n[SHOP_NAME] এ স্বাগতম!\n\nআপনার অর্ডার কনফার্ম হয়েছে। শীঘ্রই ডেলিভারি পাবেন।\n\nধন্যবাদ! 💚",
forSegment: "newBuyer",
psychology: ["belonging"]
}
]
},

thankYou: {
name: "Thank You",
bangla: "ধন্যবাদ",
messages: [
{
type: "delivered",
template: "✅ [NAME] ভাই/আপু,\n\nআপনার অর্ডার ডেলিভারি হয়েছে!\n\nপ্রোডাক্ট পছন্দ হলে আমাদের জানাবেন। 😊\n\n⭐ Review দিলে পরবর্তী অর্ডারে [PERCENT]% ছাড়!\n\nধন্যবাদ,\n[SHOP_NAME]",
forSegment: "all",
psychology: ["belonging", "pleasure"]
}
]
},

reorderReminder: {
name: "Reorder Reminder",
bangla: "পুনরায় অর্ডার",
messages: [
{
type: "gentle",
template: "👋 [NAME] ভাই/আপু,\n\nকেমন আছেন? [DAYS] দিন হয়ে গেল আপনার অর্ডার নেই!\n\n[LAST_PRODUCT] আবার দরকার হলে জানাবেন।\n\n💝 আপনার জন্য [PERCENT]% ছাড়!\nCode: [CODE]\n\n- [SHOP_NAME]",
forSegment: ["needsAttention", "promising"],
psychology: ["belonging", "pleasure"]
},
{
type: "urgent",
template: "🤔 [NAME] ভাই/আপু,\n\nসব ঠিক আছে তো?\n\nগত [DAYS] দিন আপনার অর্ডার নেই। কোনো সমস্যা হলে জানাবেন।\n\n🎁 Special Offer: [OFFER]\n⏰ Valid: [EXPIRY]\n\n- [SHOP_NAME]",
forSegment: "atRisk",
psychology: ["belonging", "security"]
}
]
},

winBack: {
name: "Win Back",
bangla: "ফিরিয়ে আনুন",
messages: [
{
type: "miss_you",
template: "😢 [NAME] ভাই/আপু,\n\nআপনাকে মিস করছি!\n\n[DAYS] দিন হয়ে গেল আপনার অর্ডার নেই।\n\n🎁 ফিরে আসুন, [PERCENT]% ছাড় শুধু আপনার জন্য!\n\nCode: [CODE]\n⏰ Valid: [EXPIRY]\n\n- [SHOP_NAME]",
forSegment: ["atRisk", "hibernating"],
psychology: ["belonging", "pleasure"]
},
{
type: "last_chance",
template: "🚨 [NAME] ভাই/আপু,\n\nLAST CHANCE!\n\nআপনার জন্য [PERCENT]% ছাড় রেখেছিলাম। আজ রাতে Expire হয়ে যাবে!\n\n👉 Code: [CODE]\n⏰ শেষ সময়: আজ রাত ১১:৫৯\n\nমিস করবেন না!\n\n- [SHOP_NAME]",
forSegment: ["hibernating", "lost"],
psychology: ["security", "pleasure"]
},
{
type: "cantLose",
template: "🙏 [NAME] ভাই/আপু,\n\nআপনি আমাদের সবচেয়ে মূল্যবান কাস্টমারদের একজন।\n\nঅনেকদিন দেখা নেই। কোনো সমস্যা হলে প্লিজ জানাবেন।\n\n💎 আপনার জন্য Special VIP Offer:\n[OFFER]\n\n- [SHOP_NAME]",
forSegment: "cantLose",
psychology: ["status", "belonging"]
}
]
},

vipExclusive: {
name: "VIP Exclusive",
bangla: "ভিআইপি অফার",
messages: [
{
type: "exclusive",
template: "👑 [NAME] ভাই/আপু,\n\nআপনি আমাদের VIP Customer!\n\n🎁 শুধুমাত্র আপনার জন্য:\n[OFFER]\n\nএই অফার অন্য কাউকে দেওয়া হচ্ছে না।\n\n⏰ Valid: [EXPIRY]\n\n- [SHOP_NAME]",
forSegment: ["champions", "loyal"],
psychology: ["status", "pleasure"]
},
{
type: "early_access",
template: "🔓 [NAME] ভাই/আপু,\n\nVIP Early Access!\n\n[PRODUCT] সবার আগে আপনি দেখছেন।\n\n💎 VIP Price: ৳[PRICE] (Regular: ৳[REGULAR])\n\n⏰ Early Access শেষ: [EXPIRY]\n\n- [SHOP_NAME]",
forSegment: ["champions", "loyal"],
psychology: ["status", "growth"]
}
]
},

flashSale: {
name: "Flash Sale",
bangla: "ফ্ল্যাশ সেল",
messages: [
{
type: "announcement",
template: "⚡ FLASH SALE! ⚡\n\n[NAME] ভাই/আপু,\n\n🔥 [HOURS] ঘন্টার জন্য [PERCENT]% OFF!\n\n⏰ শুরু: এখনই!\n⏰ শেষ: আজ রাত [END_TIME]\n\n👉 এখনই অর্ডার করুন!\n\n- [SHOP_NAME]",
forSegment: "all",
psychology: ["pleasure", "security"]
},
{
type: "ending_soon",
template: "⏰ [NAME] ভাই/আপু!\n\nFlash Sale শেষ হয়ে যাচ্ছে!\n\n🔥 মাত্র [HOURS] ঘন্টা বাকি!\n\n[PERCENT]% ছাড় মিস করবেন?\n\n👉 এখনই অর্ডার করুন!\n\n- [SHOP_NAME]",
forSegment: "all",
psychology: ["security", "pleasure"]
}
]
},

festival: {
name: "Festival",
bangla: "উৎসব",
messages: [
{
type: "eid",
template: "🌙 ঈদ মোবারক [NAME] ভাই/আপু!\n\n[SHOP_NAME] এর পক্ষ থেকে ঈদের শুভেচ্ছা!\n\n🎁 ঈদ Special: [OFFER]\n\n🚚 ঈদের আগে ডেলিভারি নিশ্চিত!\n\n⏰ অফার শেষ: [EXPIRY]\n\nঈদ মোবারক! 🕌",
forSegment: "all",
psychology: ["belonging", "pleasure"]
},
{
type: "pohela_boishakh",
template: "🎉 শুভ নববর্ষ [NAME] ভাই/আপু!\n\nবাংলা নতুন বছরের শুভেচ্ছা! 🌸\n\n🎁 বৈশাখী অফার:\n[OFFER]\n\n- [SHOP_NAME]\nশুভ নববর্ষ! 🎊",
forSegment: "all",
psychology: ["belonging", "purpose"]
},
{
type: "victory_day",
template: "🇧🇩 বিজয় দিবসের শুভেচ্ছা!\n\n[NAME] ভাই/আপু,\n\n১৬ই ডিসেম্বর মহান বিজয় দিবস উপলক্ষে Special অফার!\n\n🎁 [OFFER]\n\n🚚 সারা দেশে ফ্রি ডেলিভারি!\n\nজয় বাংলা! 🇧🇩\n\n- [SHOP_NAME]",
forSegment: "all",
psychology: ["belonging", "purpose"]
},
{
type: "new_year",
template: "🎆 Happy New Year [NAME]!\n\n[YEAR] সালের শুভেচ্ছা!\n\nনতুন বছর, নতুন অফার! 🎉\n\n🎁 [OFFER]\n\nHappy New Year!\n- [SHOP_NAME]",
forSegment: "all",
psychology: ["growth", "pleasure"]
}
]
},

orderStatus: {
name: "Order Status",
bangla: "অর্ডার আপডেট",
messages: [
{
type: "confirmed",
template: "✅ অর্ডার কনফার্ম!\n\n[NAME] ভাই/আপু,\n\nআপনার অর্ডার #[ORDER_ID] কনফার্ম হয়েছে।\n\n📦 [PRODUCT]\n💰 Total: ৳[AMOUNT]\n\nশীঘ্রই শিপমেন্ট করা হবে।\n\nধন্যবাদ!\n- [SHOP_NAME]",
forSegment: "all",
psychology: ["security"]
},
{
type: "shipped",
template: "🚚 শিপমেন্ট হয়েছে!\n\n[NAME] ভাই/আপু,\n\nআপনার অর্ডার #[ORDER_ID] এখন পথে!\n\n📍 Courier: [COURIER]\n\n[DAYS] দিনের মধ্যে পৌঁছে যাবে।\n\n- [SHOP_NAME]",
forSegment: "all",
psychology: ["security"]
},
{
type: "delivered",
template: "📦 ডেলিভারি সম্পন্ন!\n\n[NAME] ভাই/আপু,\n\nআপনার অর্ডার পৌঁছে গেছে!\n\nপ্রোডাক্ট পছন্দ হলে আমাদের জানাবেন। 😊\n\n- [SHOP_NAME]",
forSegment: "all",
psychology: ["belonging", "pleasure"]
}
]
},

lowStock: {
name: "Low Stock Alert",
bangla: "স্টক কমছে",
messages: [
{
type: "urgency",
template: "🔥 [NAME] ভাই/আপু!\n\n[PRODUCT] প্রায় শেষ!\n\nমাত্র [NUMBER]টি বাকি আছে।\n\nদেরি করলে মিস করবেন!\n\n👉 এখনই অর্ডার করুন!\n\n- [SHOP_NAME]",
forSegment: "all",
psychology: ["security", "pleasure"]
}
]
},

referral: {
name: "Referral Request",
bangla: "রেফারেল",
messages: [
{
type: "request",
template: "🤝 [NAME] ভাই/আপু,\n\nআপনি কি আমাদের সার্ভিসে সন্তুষ্ট?\n\n💝 বন্ধুদের জানান!\n\nআপনার রেফারেল কোড: [CODE]\n\n🎁 প্রতি রেফারেলে আপনি পাবেন: ৳[AMOUNT]\n🎁 আপনার বন্ধুও পাবেন: ৳[FRIEND_AMOUNT]\n\n- [SHOP_NAME]",
forSegment: ["champions", "loyal"],
psychology: ["belonging", "pleasure"]
}
]
}
},

// ============================================
// SECTION 9: FESTIVAL CALENDAR (Bangladesh)
// ============================================

festivalCalendar: {
eid_ul_fitr: {
name: "Eid ul Fitr",
bangla: "ঈদুল ফিতর",
timing: "Variable (Islamic calendar)",
prepDays: 30,
peakDays: 7,
messageType: "eid",
defaultOffer: "২০% ছাড় + ফ্রি ডেলিভারি"
},
eid_ul_adha: {
name: "Eid ul Adha",
bangla: "ঈদুল আযহা",
timing: "Variable (Islamic calendar)",
prepDays: 21,
peakDays: 7,
messageType: "eid",
defaultOffer: "১৫% ছাড়"
},
pohela_boishakh: {
name: "Pohela Boishakh",
bangla: "পহেলা বৈশাখ",
date: "April 14",
prepDays: 14,
peakDays: 3,
messageType: "pohela_boishakh",
defaultOffer: "নববর্ষ Special ২৫% ছাড়"
},
victory_day: {
name: "Victory Day",
bangla: "বিজয় দিবস",
date: "December 16",
prepDays: 7,
peakDays: 1,
messageType: "victory_day",
defaultOffer: "১৬% ছাড় (বিজয়ের সম্মানে)"
},
independence_day: {
name: "Independence Day",
bangla: "স্বাধীনতা দিবস",
date: "March 26",
prepDays: 7,
peakDays: 1,
defaultOffer: "২৬% ছাড়"
},
new_year: {
name: "New Year",
bangla: "নতুন বছর",
date: "January 1",
prepDays: 14,
peakDays: 7,
messageType: "new_year",
defaultOffer: "New Year Sale ৩০% পর্যন্ত ছাড়"
}
},

// ============================================
// SECTION 10: HELPER FUNCTIONS
// ============================================

// Generate message from template
generateMessage: function(templateString, variables) {
let message = templateString;
for (const [key, value] of Object.entries(variables)) {
const regex = new RegExp(`\\[${key}\\]`, 'g');
message = message.replace(regex, value);
}
return message;
},

// Get random item from array
getRandomItem: function(array) {
return array[Math.floor(Math.random() * array.length)];
},

// Get urgency text
getUrgencyText: function(type) {
const triggers = this.urgencyTriggers[type] || this.urgencyTriggers.time;
return this.getRandomItem(triggers);
},

// Get segment data
getSegment: function(segmentId) {
return this.buyerSegments[segmentId] || null;
},

// Get offer type data
getOfferType: function(offerId) {
return this.offerTypes[offerId] || null;
},

// Get pricing tactic
getPricingTactic: function(tacticId) {
return this.pricingTactics[tacticId] || null;
},

// Get recommended offers for a segment
getRecommendedOffers: function(segmentId) {
const segment = this.buyerSegments[segmentId];
if (!segment) return [];
return segment.offerTypes.map(id => this.offerTypes[id]).filter(Boolean);
},

// Get recommended discount range for segment
getDiscountRange: function(segmentId) {
const segment = this.buyerSegments[segmentId];
return segment ? segment.discountRange : { min: 10, max: 20 };
},

// Calculate optimal discount
calculateOptimalDiscount: function(segmentId, urgencyLevel) {
const range = this.getDiscountRange(segmentId);
const urgencyMultiplier = {
low: 0,
medium: 0.5,
high: 0.8,
flash: 1
};
const multiplier = urgencyMultiplier[urgencyLevel] || 0.5;
const discount = Math.round(range.min + (range.max - range.min) * multiplier);
return discount;
},

// Get message template for segment
getMessageForSegment: function(segmentId, messageCategory) {
const templates = this.messageTemplates[messageCategory];
if (!templates) return null;

const message = templates.messages.find(m => {
if (Array.isArray(m.forSegment)) {
return m.forSegment.includes(segmentId);
}
return m.forSegment === segmentId || m.forSegment === 'all';
});

return message || templates.messages[0];
},

// Apply charm pricing (e.g., 1000 -> 997)
applyCharmPricing: function(price) {
if (price >= 1000) {
return Math.floor(price / 100) * 100 - 3;
} else if (price >= 100) {
return Math.floor(price / 10) * 10 - 1;
}
return price;
},

// Format price with anchoring
formatPriceWithAnchor: function(originalPrice, salePrice) {
const savings = originalPrice - salePrice;
const savingsPercent = Math.round((savings / originalPrice) * 100);
return {
original: originalPrice,
sale: salePrice,
savings: savings,
savingsPercent: savingsPercent,
display: `৳${originalPrice} → ৳${salePrice}`,
savingsText: `৳${savings} সাশ্রয় (${savingsPercent}%)`
};
},

// Get per-day breakdown
getPerDayBreakdown: function(totalPrice, days) {
const perDay = Math.round(totalPrice / (days || 365));
return `মাত্র ৳${perDay}/দিন`;
},

// Generate coupon code
generateCouponCode: function(type, value) {
const prefixes = {
welcome: 'WELCOME',
winback: 'BACK',
vip: 'VIP',
flash: 'FLASH',
eid: 'EID',
festival: 'FEST',
loyal: 'LOYAL',
ref: 'REF'
};
const prefix = prefixes[type] || 'SAVE';
return `${prefix}${value}`;
},

// Get expiry date string
getExpiryDate: function(daysFromNow) {
const date = new Date();
date.setDate(date.getDate() + daysFromNow);
const options = { day: 'numeric', month: 'short' };
return date.toLocaleDateString('bn-BD', options);
},

// Generate complete message with variables
generateCompleteMessage: function(category, type, variables) {
const templates = this.messageTemplates[category];
if (!templates) return null;

const template = templates.messages.find(m => m.type === type);
if (!template) return null;

return {
message: this.generateMessage(template.template, variables),
psychology: template.psychology,
forSegment: template.forSegment
};
}

};

// ============================================
// MAKE GLOBALLY AVAILABLE
// ============================================

window.TacticsEngine = TacticsEngine;

console.log('✅ TacticsEngine v2.0 loaded - Complete Knowledge Base!');