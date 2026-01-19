import React, { useState, useEffect, useMemo } from 'react';
import { 
  House, Package, ShoppingCart, ChartLineUp, User, 
  Plus, Trash, Printer, CloudArrowUp, Warning, CheckCircle, 
  Spinner, CurrencyDollar, Lightbulb, Gear, MagnifyingGlass,
  MagicWand, Wallet, Translate, Truck, SignOut, TrendUp, 
  Megaphone, Users, Storefront, ArchiveBox, Receipt
} from 'phosphor-react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { db, verifyLicense, getSession, saveSession, clearSession, seedDatabase } from './services/db';
import { generateMarketingOffer, runPriceDoctor } from './services/ai';
import { Tier, Order, Product, OrderStatus, UserSession, Expense } from './types';
import { useLiveQuery } from 'dexie-react-hooks';

// --- Localization & Constants ---
const TRANSLATIONS = {
  en: {
    dashboard: "Command Center",
    orders: "Orders",
    stock: "Inventory",
    growth: "Growth Engine",
    settings: "Settings",
    netProfit: "Net Profit",
    sales: "Total Sales",
    expenses: "Expenses",
    newOrder: "New Order",
    confirm: "Confirm",
    shipped: "Shipped",
    delivered: "Delivered",
    upgrade: "Upgrade Plan",
    search: "Search orders...",
    backup: "Cloud Backup",
    syncing: "Syncing...",
    locked: "Locked",
    save: "Save Changes",
    cancel: "Cancel",
    today: "Today",
    week: "This Week",
    month: "This Month",
    addExpense: "Log Expense",
    shopSetup: "Store Configuration",
    googleBackup: "Google Drive Sync",
    customCats: "Product Categories",
    logout: "Sign Out",
    welcome: "Welcome back,"
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    orders: "অর্ডার",
    stock: "ইনভেন্টরি",
    growth: "গ্রোথ",
    settings: "সেটিংস",
    netProfit: "নিট লাভ",
    sales: "মোট বিক্রয়",
    expenses: "খরচ",
    newOrder: "নতুন অর্ডার",
    confirm: "কনফার্ম করুন",
    shipped: "শিপড",
    delivered: "ডেলিভারড",
    upgrade: "আপগ্রেড করুন",
    search: "অর্ডার খুঁজুন...",
    backup: "ব্যাকআপ",
    syncing: "সিঙ্ক হচ্ছে...",
    locked: "লক করা",
    save: "সেভ করুন",
    cancel: "বাতিল",
    today: "আজ",
    week: "এই সপ্তাহ",
    month: "এই মাস",
    addExpense: "খরচ যোগ করুন",
    shopSetup: "দোকান সেটআপ",
    googleBackup: "গুগল ড্রাইভ",
    customCats: "ক্যাটাগরি",
    logout: "লগ আউট",
    welcome: "স্বাগতম,"
  }
};

const EXPENSE_CATEGORIES = [
  { id: 'Ads', label: 'Ad Spend', icon: Megaphone, color: 'text-purple-600 bg-purple-100/50' },
  { id: 'Courier', label: 'Courier', icon: Truck, color: 'text-orange-600 bg-orange-100/50' },
  { id: 'Salary', label: 'Salary', icon: Users, color: 'text-blue-600 bg-blue-100/50' },
  { id: 'Rent', label: 'Rent', icon: Storefront, color: 'text-emerald-600 bg-emerald-100/50' },
  { id: 'Packaging', label: 'Packaging', icon: ArchiveBox, color: 'text-yellow-600 bg-yellow-100/50' },
  { id: 'Other', label: 'Other', icon: Receipt, color: 'text-slate-600 bg-slate-100/50' },
];

// --- Premium Helper Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'magic' | 'success', isLoading?: boolean }> = ({ 
  children, variant = 'primary', className = '', isLoading, ...props 
}) => {
  const baseStyle = "px-5 py-3.5 rounded-2xl font-semibold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 text-sm tracking-wide shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-indigo-500/30 border border-white/10",
    secondary: "bg-white/60 backdrop-blur-md text-slate-700 border border-white/60 hover:bg-white/80 shadow-slate-200/50",
    danger: "bg-gradient-to-br from-red-50 to-red-100 text-red-600 border border-red-200 hover:from-red-100 hover:to-red-200",
    success: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30",
    ghost: "bg-transparent text-slate-500 hover:bg-white/40 shadow-none hover:shadow-sm",
    magic: "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 text-white shadow-fuchsia-500/40 border border-white/20"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading} {...props}>
      {isLoading && <Spinner className="animate-spin" size={20} weight="bold" />}
      {children}
    </button>
  );
};

const Card: React.FC<{ children: React.ReactNode, className?: string, title?: string, action?: React.ReactNode, noPadding?: boolean }> = ({ children, className = "", title, action, noPadding }) => (
  <div className={`bg-white/70 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-xl shadow-slate-200/40 transition-all duration-300 ${noPadding ? '' : 'p-6'} ${className}`}>
    {(title || action) && (
      <div className={`flex justify-between items-center mb-4 ${noPadding ? 'p-6 pb-0' : ''}`}>
        {title && <h3 className="text-slate-400 text-[11px] font-extrabold uppercase tracking-widest">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode, color?: string }> = ({ children, color = "blue" }) => (
  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-${color}-100/80 text-${color}-700 border border-${color}-200/50 backdrop-blur-sm`}>
    {children}
  </span>
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input ref={ref} className="w-full bg-white/50 backdrop-blur-md border border-white/60 focus:border-brand-300 rounded-2xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-brand-500/10 transition-all placeholder:text-slate-400 text-slate-800 shadow-inner" {...props} />
));

// --- Views ---

const LoginScreen: React.FC<{ onLogin: (s: UserSession) => void }> = ({ onLogin }) => {
  const [mobile, setMobile] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const session = await verifyLicense(mobile, key);
      await saveSession(session);
      await seedDatabase();
      onLogin(session);
    } catch (err) {
      setError('Invalid License or Network Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 animate-slide-up">
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-gradient-to-tr from-brand-600 to-violet-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-brand-500/40 transform rotate-3 ring-4 ring-white/30">
          <Package size={48} color="white" weight="duotone" className="-rotate-3" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight drop-shadow-sm">BizMind<span className="text-brand-600">.</span></h1>
        <p className="text-slate-500 font-medium">Enterprise Grade Growth OS</p>
      </div>
      
      <Card className="shadow-2xl shadow-brand-900/10 border-white/80">
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-2 block tracking-wider">Mobile Number</label>
            <Input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="017..." required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-2 block tracking-wider">License Key</label>
            <Input type="text" value={key} onChange={e => setKey(e.target.value)} placeholder="STARTER-..." required />
          </div>
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100 flex items-center justify-center gap-2"><Warning /> {error}</div>}
          <Button type="submit" className="w-full text-base h-12 shadow-xl shadow-brand-500/20" isLoading={loading}>Access Dashboard</Button>
        </form>
      </Card>
      <p className="text-center text-[10px] text-slate-400 mt-10 uppercase tracking-widest opacity-60">Secure Environment v2.0.1</p>
    </div>
  );
};

const Settings: React.FC<{ session: UserSession, onUpdate: () => void, onLogout: () => void, lang: 'en' | 'bn' }> = ({ session, onUpdate, onLogout, lang }) => {
  const t = TRANSLATIONS[lang];
  const [formData, setFormData] = useState({
    storeName: session.settings.storeName,
    storeAddress: session.settings.storeAddress,
    googleSheetId: session.settings.googleSheetId,
    newCat: ''
  });

  const saveSettings = async () => {
    const updated = { ...session, settings: { ...session.settings, ...formData } };
    await saveSession(updated);
    onUpdate();
    alert("Settings Saved!");
  };

  const addCategory = async () => {
    if (!formData.newCat) return;
    const cats = [...session.settings.customCategories, formData.newCat];
    const updated = { ...session, settings: { ...session.settings, customCategories: cats } };
    await saveSession(updated);
    setFormData({...formData, newCat: ''});
    onUpdate();
  };

  const removeCategory = async (cat: string) => {
    const cats = session.settings.customCategories.filter(c => c !== cat);
    const updated = { ...session, settings: { ...session.settings, customCategories: cats } };
    await saveSession(updated);
    onUpdate();
  }

  return (
    <div className="pb-32 animate-slide-up space-y-6">
      <h2 className="text-3xl font-bold text-slate-800 px-1 tracking-tight">{t.settings}</h2>

      <Card title={t.shopSetup}>
        <div className="space-y-4">
          <div>
             <label className="text-xs font-bold text-slate-400 mb-1.5 ml-1 block">Shop Name</label>
             <Input value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 ml-1 block">Invoice Address</label>
            <Input value={formData.storeAddress} onChange={e => setFormData({...formData, storeAddress: e.target.value})} />
          </div>
        </div>
      </Card>

      <Card title={t.customCats}>
        <div className="flex gap-3 mb-5">
          <Input placeholder="Add category..." value={formData.newCat} onChange={e => setFormData({...formData, newCat: e.target.value})} />
          <Button onClick={addCategory} className="!px-4"><Plus weight="bold" /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {session.settings.customCategories.map(cat => (
            <span key={cat} className="bg-white/50 border border-white/60 text-slate-600 px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 shadow-sm backdrop-blur-md">
              {cat} <button onClick={() => removeCategory(cat)} className="hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full">×</button>
            </span>
          ))}
        </div>
      </Card>

      <Card title={t.googleBackup}>
        <div className="space-y-3">
          <Input 
            placeholder={session.tier === Tier.STARTER ? "Upgrade to GROWTH for Backup" : "Enter Google Sheet ID"} 
            value={formData.googleSheetId} 
            onChange={e => setFormData({...formData, googleSheetId: e.target.value})}
            disabled={session.tier === Tier.STARTER}
          />
          {session.tier === Tier.STARTER && <p className="text-xs text-red-500 bg-red-50/50 border border-red-100 p-3 rounded-xl flex items-center gap-2"><Warning weight="fill" /> Available on Growth Plan</p>}
        </div>
      </Card>

      <div className="pt-4 space-y-3">
        <Button onClick={saveSettings} className="w-full h-12 text-base">{t.save}</Button>
        <Button onClick={onLogout} variant="danger" className="w-full h-12"><SignOut size={20} /> {t.logout}</Button>
      </div>
      
      <div className="text-center text-[10px] text-slate-400 pb-4 font-mono">
         ID: {session.deviceId} • {session.licenseKey}
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ tier: Tier, lang: 'en'|'bn' }> = ({ tier, lang }) => {
  const t = TRANSLATIONS[lang];
  const orders = useLiveQuery(() => db.orders.toArray()) || [];
  const expenses = useLiveQuery(() => db.expenses.toArray()) || [];
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: 'Ads', amount: '', desc: '' });

  // Charts Config
  const chartOptions: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent', sparkline: { enabled: true } },
    stroke: { curve: 'smooth', width: 3, colors: ['#fff'] },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.0, stops: [0, 100] } },
    colors: ['#fff'],
    tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => 'Sales: ' } }, marker: { show: false } }
  };

  const donutOptions: ApexOptions = {
    chart: { type: 'donut', background: 'transparent' },
    labels: EXPENSE_CATEGORIES.map(c => c.label),
    colors: ['#9333ea', '#ea580c', '#2563eb', '#10b981', '#ca8a04', '#64748b'],
    legend: { show: false },
    plotOptions: { pie: { donut: { size: '75%', labels: { show: false } } } },
    dataLabels: { enabled: false },
    stroke: { show: false }
  };

  const availableRanges = useMemo(() => {
    if (tier === Tier.STARTER) return ['today'];
    if (tier === Tier.GROWTH) return ['today', 'week'];
    return ['today', 'week', 'month'];
  }, [tier]);

  const filteredData = useMemo(() => {
    const now = new Date();
    const start = new Date();
    if (timeRange === 'today') start.setHours(0,0,0,0);
    if (timeRange === 'week') start.setDate(now.getDate() - 7);
    if (timeRange === 'month') start.setDate(now.getDate() - 30);

    const fOrders = orders.filter(o => new Date(o.date) >= start);
    const fExpenses = expenses.filter(e => new Date(e.date) >= start);

    // Prepare chart data
    const chartSeries = [{
      name: 'Sales',
      data: fOrders.map(o => ({ x: o.date, y: o.totalAmount })).sort((a,b) => new Date(a.x).getTime() - new Date(b.x).getTime())
    }];
    
    // Fix for empty chart
    if(chartSeries[0].data.length === 0) chartSeries[0].data = [{x: new Date().toISOString(), y: 0}];

    const expenseSeries = EXPENSE_CATEGORIES.map(cat => 
       fExpenses.filter(e => e.category === cat.id).reduce((sum, e) => sum + e.amount, 0)
    );

    return {
      sales: fOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      count: fOrders.length,
      expenseTotal: fExpenses.reduce((sum, e) => sum + e.amount, 0),
      netProfit: fOrders.reduce((sum, o) => sum + o.totalAmount, 0) - fExpenses.reduce((sum, e) => sum + e.amount, 0),
      chartSeries,
      expenseSeries
    };
  }, [orders, expenses, timeRange]);

  const addExpense = async () => {
    if(!newExpense.amount) return;
    await db.expenses.add({
      date: new Date().toISOString(),
      category: newExpense.category,
      amount: Number(newExpense.amount),
      description: newExpense.desc
    });
    setNewExpense({ category: 'Ads', amount: '', desc: '' });
    setShowExpenseModal(false);
  };

  return (
    <div className="space-y-6 pb-32 animate-slide-up relative">
      <header className="flex justify-between items-center mb-2 px-1">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{t.dashboard}</h2>
          <p className="text-sm text-slate-500 font-medium">Business Overview</p>
        </div>
        <div className="flex gap-2">
           <select 
              className="bg-white/60 backdrop-blur-md border border-white/60 text-xs font-bold rounded-xl px-3 py-2 outline-none shadow-sm text-slate-600 focus:ring-2 focus:ring-brand-500/20"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <option value="today">{t.today}</option>
              {availableRanges.includes('week') && <option value="week">{t.week}</option>}
              {availableRanges.includes('month') && <option value="month">{t.month}</option>}
            </select>
            <Badge color={tier === Tier.ELITE ? 'purple' : tier === Tier.GROWTH ? 'green' : 'blue'}>{tier}</Badge>
        </div>
      </header>

      {/* Main Stats Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-indigo-600 to-violet-700 text-white shadow-2xl shadow-brand-500/40 border border-white/10 group">
        <div className="absolute -top-10 -right-10 text-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform rotate-12"><ChartLineUp size={200} weight="fill" /></div>
        <div className="p-7 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest mb-1 opacity-80">{tier === Tier.STARTER ? t.sales : t.netProfit}</p>
              <h3 className="text-4xl font-extrabold tracking-tight drop-shadow-md">৳{(tier === Tier.STARTER ? filteredData.sales : filteredData.netProfit).toLocaleString()}</h3>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10">
               <TrendUp size={24} className="text-emerald-300" weight="bold" />
            </div>
          </div>
          
          <div className="h-28 -mx-3 -mb-6 opacity-90 mix-blend-overlay">
             {tier === Tier.STARTER ? (
                <div className="h-full flex items-center justify-center text-white/50 text-xs italic bg-black/10 rounded-xl mx-6 mb-4 backdrop-blur-sm">Upgrade to see trends</div>
             ) : (
                <Chart options={chartOptions} series={filteredData.chartSeries} type="area" height="100%" />
             )}
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5 mt-2">
            <div>
              <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">{t.sales}</p>
              <p className="font-semibold text-lg flex items-center gap-1"><span className="text-emerald-300">↑</span> ৳{filteredData.sales.toLocaleString()}</p>
            </div>
            {tier !== Tier.STARTER && (
              <div>
                <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">{t.expenses}</p>
                <p className="font-semibold text-lg text-pink-200 flex items-center gap-1"><span className="text-pink-300">↓</span> ৳{filteredData.expenseTotal.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Stats & Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col justify-center items-center gap-2" noPadding>
          <div className="p-5 text-center w-full">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1 tracking-wider">Orders</span>
            <span className="text-3xl font-extrabold text-slate-800">{filteredData.count}</span>
            <div className="text-[10px] text-emerald-600 font-bold mt-2 bg-emerald-50 inline-block px-2 py-0.5 rounded-full border border-emerald-100">
               {timeRange === 'today' ? 'Today' : 'Total'}
            </div>
          </div>
        </Card>

        {tier === Tier.STARTER ? (
          <Card className="flex flex-col justify-center items-center gap-2 opacity-60 relative" noPadding>
             <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 backdrop-blur-[2px] rounded-3xl z-10 border border-white/20">
               <div className="bg-white/80 p-2 rounded-full shadow-lg"><Warning size={20} className="text-slate-400" /></div>
             </div>
             <div className="p-5 text-center w-full">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1 tracking-wider">Expenses</span>
                <span className="text-2xl font-bold text-slate-800">Locked</span>
             </div>
          </Card>
        ) : (
          <Button variant="secondary" onClick={() => setShowExpenseModal(true)} className="flex-col h-full !items-center justify-center !py-0 !shadow-sm !bg-white/60 hover:!bg-white/80 border-dashed !border-slate-300">
             <div className="bg-red-50 p-3 rounded-full mb-2 shadow-inner"><Wallet size={24} className="text-red-500" weight="duotone" /></div>
             <span className="text-xs font-bold text-slate-600">{t.addExpense}</span>
           </Button>
        )}
      </div>

      {/* Expense Breakdown (Growth/Elite) */}
      {tier !== Tier.STARTER && filteredData.expenseTotal > 0 && (
        <Card title="Expense Breakdown">
           <div className="flex items-center">
             <div className="w-1/2 h-36 relative">
                <Chart options={donutOptions} series={filteredData.expenseSeries} type="donut" height="100%" />
             </div>
             <div className="w-1/2 pl-2 space-y-2.5">
               {EXPENSE_CATEGORIES.map((cat, idx) => {
                 const amt = filteredData.expenseSeries[idx];
                 if(amt === 0) return null;
                 return (
                   <div key={cat.id} className="flex justify-between text-xs items-center">
                     <span className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${cat.color.split(' ')[0].replace('text', 'bg')}`}></div> {cat.label}</span>
                     <span className="font-bold text-slate-600">৳{amt}</span>
                   </div>
                 )
               })}
             </div>
           </div>
        </Card>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-sm animate-slide-up bg-white/90" title={t.addExpense}>
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                 {EXPENSE_CATEGORIES.map(cat => (
                   <button 
                     key={cat.id}
                     onClick={() => setNewExpense({...newExpense, category: cat.id})}
                     className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 ${newExpense.category === cat.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
                   >
                     <div className={`p-2 rounded-full mb-1 ${cat.color}`}>
                       <cat.icon size={20} weight={newExpense.category === cat.id ? 'fill' : 'regular'} />
                     </div>
                     <span className="text-[10px] font-bold text-slate-600">{cat.label}</span>
                   </button>
                 ))}
              </div>
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-wider">Amount</label>
                <div className="flex items-center gap-2">
                   <span className="text-3xl font-bold text-slate-300">৳</span>
                   <input 
                      type="number" 
                      className="bg-transparent text-4xl font-extrabold text-slate-800 w-full outline-none" 
                      placeholder="0" 
                      autoFocus
                      value={newExpense.amount} 
                      onChange={e => setNewExpense({...newExpense, amount: e.target.value})} 
                    />
                </div>
              </div>

              <Input placeholder="Note (Optional)" value={newExpense.desc} onChange={e => setNewExpense({...newExpense, desc: e.target.value})} />
              
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={() => setShowExpenseModal(false)} className="flex-1">{t.cancel}</Button>
                <Button onClick={addExpense} className="flex-1 shadow-lg shadow-brand-500/30">{t.save}</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const OrderManager: React.FC<{ session: UserSession, lang: 'en'|'bn' }> = ({ session, lang }) => {
  const t = TRANSLATIONS[lang];
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const products = useLiveQuery(() => db.products.toArray()) || [];
  const orders = useLiveQuery(() => db.orders.orderBy('date').reverse().toArray()) || [];
  
  // New Order Form State
  const [cart, setCart] = useState<{product: Product, qty: number}[]>([]);
  const [customer, setCustomer] = useState({ name: '', mobile: '', address: '' });
  const [isOutsideDhaka, setIsOutsideDhaka] = useState(false);

  // Invoice Logic
  const handlePrint = (order: Order) => {
    const w = window.open('', '', 'width=600,height=800');
    if(w) {
      w.document.write(`
        <html>
          <head>
            <title>Invoice #${order.id}</title>
            <style>
              body { font-family: 'Helvetica Neue', sans-serif; padding: 40px; color: #333; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
              .store-name { font-size: 24px; font-weight: bold; color: #000; margin: 0; }
              .meta { font-size: 14px; color: #666; margin-top: 5px; }
              .customer-box { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; font-size: 14px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th { text-align: left; padding: 12px; border-bottom: 2px solid #ddd; font-size: 12px; text-transform: uppercase; color: #666; }
              td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
              .total-box { text-align: right; }
              .total-row { font-size: 18px; font-weight: bold; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="store-name">${session.settings.storeName}</h1>
              <p class="meta">${session.settings.storeAddress}</p>
            </div>
            <div class="customer-box">
              <strong>BILL TO:</strong><br>
              ${order.customerName}<br>
              ${order.customerMobile}<br>
              ${order.customerAddress}
              <br><br>
              <strong>Order #${order.id}</strong><br>
              Date: ${new Date(order.date).toLocaleDateString()}
            </div>
            <table>
              <tr><th>Item</th><th>Qty</th><th style="text-align:right;">Total</th></tr>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td style="text-align:right;">৳${item.total}</td>
                </tr>
              `).join('')}
            </table>
            <div class="total-box">
              <p>Subtotal: ৳${order.totalAmount - order.deliveryCharge}</p>
              <p>Delivery: ৳${order.deliveryCharge}</p>
              <div class="total-row">Total: ৳${order.totalAmount}</div>
            </div>
            <div style="text-align:center; margin-top: 50px; font-size: 12px; color: #aaa;">
              Thank you for your business!
            </div>
          </body>
        </html>
      `);
      w.document.close();
      w.print();
    }
  };

  const addToCart = (productId: string) => {
    const p = products.find(x => x.id === Number(productId));
    if (p) setCart([...cart, { product: p, qty: 1 }]);
  };

  const saveOrder = async () => {
    if(!customer.name || !customer.mobile || cart.length === 0) return;
    const deliveryCharge = isOutsideDhaka ? session.settings.deliveryOutside : session.settings.deliveryInside;
    
    await db.orders.add({
      date: new Date().toISOString(),
      customerName: customer.name,
      customerMobile: customer.mobile,
      customerAddress: customer.address,
      isOutsideDhaka,
      items: cart.map(c => ({
        productId: c.product.id!,
        name: c.product.name,
        quantity: c.qty,
        unitPrice: c.product.sellingPrice,
        total: c.product.sellingPrice * c.qty
      })),
      deliveryCharge,
      totalAmount: cart.reduce((s, i) => s + (i.product.sellingPrice * i.qty), 0) + deliveryCharge,
      status: OrderStatus.PENDING
    });
    
    // Decrease stock
    for (const item of cart) {
       if (item.product.id) {
         await db.products.update(item.product.id, { stock: item.product.stock - item.qty });
       }
    }
    setIsCreating(false);
    setCart([]);
    setCustomer({ name: '', mobile: '', address: '' });
  };

  const updateStatus = async (id: number, status: OrderStatus) => {
    await db.orders.update(id, { status });
  };

  const filteredOrders = orders.filter(o => o.customerMobile.includes(searchTerm) || o.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isCreating) {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.qty), 0);
    const delivery = isOutsideDhaka ? session.settings.deliveryOutside : session.settings.deliveryInside;
    
    return (
      <div className="pb-32 animate-slide-up">
        <header className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={() => setIsCreating(false)} className="!p-2"><House /></Button>
          <h2 className="text-xl font-bold text-slate-800">{t.newOrder}</h2>
        </header>
        
        <div className="space-y-4">
           <Card title="Customer">
             <div className="space-y-3">
               <Input placeholder="Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
               <Input placeholder="Mobile" value={customer.mobile} onChange={e => setCustomer({...customer, mobile: e.target.value})} />
               <Input placeholder="Address" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
             </div>
           </Card>

           <Card title="Items">
             <div className="space-y-3 mb-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm p-3.5 bg-white/60 border border-white/50 rounded-xl shadow-sm backdrop-blur-sm">
                    <span className="font-semibold text-slate-700">{item.product.name} <span className="text-slate-400">x{item.qty}</span></span>
                    <span className="font-bold text-slate-900">৳{item.product.sellingPrice * item.qty}</span>
                  </div>
                ))}
             </div>
             <div className="relative">
                <select className="w-full p-4 bg-white/60 border border-white/60 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm backdrop-blur-md transition-all text-slate-600 font-medium" onChange={(e) => addToCart(e.target.value)} value="">
                    <option value="" disabled>+ Add Product</option>
                    {products.filter(p => p.stock > 0).map(p => (
                    <option key={p.id} value={p.id}>{p.name} (৳{p.sellingPrice})</option>
                    ))}
                </select>
                <div className="absolute right-4 top-4 pointer-events-none text-slate-400"><Plus weight="bold"/></div>
             </div>
           </Card>

           <Card>
             <div className="flex justify-between items-center mb-4">
                <span className="text-slate-600 font-bold text-sm">Outside Dhaka?</span>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" checked={isOutsideDhaka} onChange={e => setIsOutsideDhaka(e.target.checked)}/>
                    <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${isOutsideDhaka ? 'bg-brand-500' : 'bg-slate-300'}`}></label>
                </div>
             </div>
             <div className="border-t border-dashed border-slate-200 pt-4 space-y-2">
               <div className="flex justify-between text-sm text-slate-500 font-medium"><span>Subtotal</span><span>৳{subtotal}</span></div>
               <div className="flex justify-between text-sm text-slate-500 font-medium"><span>Delivery</span><span>৳{delivery}</span></div>
               <div className="flex justify-between font-extrabold text-xl mt-3 text-brand-900"><span>Total</span><span>৳{subtotal + delivery}</span></div>
             </div>
           </Card>

           <div className="flex gap-3">
             <Button variant="secondary" className="flex-1" onClick={() => setIsCreating(false)}>{t.cancel}</Button>
             <Button className="flex-1" onClick={saveOrder}>{t.confirm}</Button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 animate-slide-up h-full flex flex-col">
       <div className="flex justify-between items-center mb-5 px-1">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{t.orders}</h2>
          <Button onClick={() => setIsCreating(true)} className="!px-5 py-2 !rounded-full shadow-lg shadow-brand-500/20"><Plus weight="bold" /> {t.newOrder}</Button>
       </div>

       <div className="mb-6 relative group px-1">
          <MagnifyingGlass className="absolute left-5 top-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
          <input 
            className="w-full bg-white/70 border border-white/60 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300 transition-all shadow-sm backdrop-blur-md"
            placeholder={t.search}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
       </div>

       <div className="flex-1 overflow-y-auto glass-scroll space-y-4 pr-1 pb-4">
          {filteredOrders.length === 0 && <div className="text-center text-slate-400 mt-10 font-medium bg-white/30 p-6 rounded-2xl mx-4 border border-white/40">No orders found</div>}
          {filteredOrders.map(order => (
            <Card key={order.id} className="relative !p-0 overflow-hidden group hover:scale-[1.01]">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-0.5">{order.customerName}</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">#{order.id} • {new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <Badge color={order.status === OrderStatus.DELIVERED ? 'green' : order.status === OrderStatus.SHIPPED ? 'blue' : order.status === OrderStatus.CONFIRMED ? 'purple' : 'orange'}>{order.status}</Badge>
                </div>
                <div className="flex justify-between items-end border-t border-slate-50 pt-3">
                    <div className="text-xs text-slate-500 font-medium">{order.items.length} Items</div>
                    <div className="font-extrabold text-xl text-slate-900">৳{order.totalAmount}</div>
                </div>
              </div>
              
              {/* Action Bar */}
              <div className="bg-slate-50/80 backdrop-blur-sm border-t border-slate-100 p-2.5 flex gap-2.5">
                <Button variant="ghost" className="!p-2.5 flex-1 text-xs bg-white border border-slate-100 shadow-sm" onClick={() => handlePrint(order)}><Printer size={16} /> Invoice</Button>
                
                {order.status === OrderStatus.PENDING && (
                    <Button variant="primary" className="!py-2.5 !px-4 text-xs flex-1" onClick={() => updateStatus(order.id!, OrderStatus.CONFIRMED)}>Confirm</Button>
                )}
                {order.status === OrderStatus.CONFIRMED && (
                    <Button variant="primary" className="!py-2.5 !px-4 text-xs flex-1 bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/30" onClick={() => updateStatus(order.id!, OrderStatus.SHIPPED)}>Ship</Button>
                )}
                {order.status === OrderStatus.SHIPPED && (
                    <Button variant="success" className="!py-2.5 !px-4 text-xs flex-1" onClick={() => updateStatus(order.id!, OrderStatus.DELIVERED)}>Deliver</Button>
                )}
                 {order.status === OrderStatus.DELIVERED && (
                    <div className="flex-1 flex justify-center items-center text-emerald-600 text-xs font-bold gap-1 bg-emerald-50 rounded-xl border border-emerald-100"><CheckCircle weight="fill"/> Complete</div>
                )}
              </div>
            </Card>
          ))}
       </div>
    </div>
  );
};

const InventoryManager: React.FC<{ session: UserSession, lang: 'en'|'bn' }> = ({ session, lang }) => {
  const products = useLiveQuery(() => db.products.toArray()) || [];
  const [isEditing, setIsEditing] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<Product>>({});
  const [aiLoading, setAiLoading] = useState(false);

  const handleSave = async () => {
    if (!editProduct.name) return;
    if (editProduct.id) {
      await db.products.update(editProduct.id, editProduct);
    } else {
      await db.products.add(editProduct as Product);
    }
    setIsEditing(false);
    setEditProduct({});
  };

  const applyPriceDoctor = async () => {
    if(!editProduct.costPrice || !editProduct.name || session.tier !== Tier.ELITE) return;
    setAiLoading(true);
    try {
      const res = await runPriceDoctor(editProduct.costPrice, editProduct.name);
      if(res.profit?.price) {
        setEditProduct({...editProduct, sellingPrice: res.profit.price});
        alert(`AI Suggestion: ৳${res.profit.price} (${res.profit.strategy})`);
      }
    } catch(e) { alert("AI Error"); }
    setAiLoading(false);
  };

  return (
    <div className="pb-32 animate-slide-up">
       <div className="flex justify-between items-center mb-6 px-1">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{TRANSLATIONS[lang].stock}</h2>
          <Button onClick={() => { setEditProduct({}); setIsEditing(true); }} className="!px-5 !py-2 !rounded-full shadow-lg shadow-brand-500/20"><Plus weight="bold" /> Add</Button>
       </div>

       {isEditing ? (
         <div className="space-y-4">
           <Card title="Product Details">
             <div className="space-y-4">
               <Input placeholder="Product Name" value={editProduct.name || ''} onChange={e => setEditProduct({...editProduct, name: e.target.value})} />
               <div className="relative">
                <select className="w-full p-4 bg-white/60 border border-white/60 rounded-xl outline-none shadow-sm backdrop-blur-md transition-all text-slate-600 font-medium appearance-none" value={editProduct.category || ''} onChange={e => setEditProduct({...editProduct, category: e.target.value})}>
                    <option value="" disabled>Select Category</option>
                    {session.settings.customCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute right-4 top-4 pointer-events-none text-slate-400">▼</div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1.5 block uppercase tracking-wider">Cost Price</label>
                    <Input type="number" placeholder="0" value={editProduct.costPrice || ''} onChange={e => setEditProduct({...editProduct, costPrice: Number(e.target.value)})} />
                 </div>
                 <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1.5 block uppercase tracking-wider">Selling Price</label>
                    <Input type="number" placeholder="0" value={editProduct.sellingPrice || ''} onChange={e => setEditProduct({...editProduct, sellingPrice: Number(e.target.value)})} />
                    {session.tier === Tier.ELITE && editProduct.costPrice && (
                       <button onClick={applyPriceDoctor} className="absolute right-2 top-9 p-1.5 bg-brand-100 text-brand-600 rounded-lg animate-pulse hover:bg-brand-200" title="AI Price Doctor">
                         {aiLoading ? <Spinner className="animate-spin"/> : <MagicWand size={18} weight="fill" />}
                       </button>
                    )}
                 </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1.5 block uppercase tracking-wider">Initial Stock</label>
                  <Input type="number" placeholder="0" value={editProduct.stock || ''} onChange={e => setEditProduct({...editProduct, stock: Number(e.target.value)})} />
               </div>
             </div>
           </Card>
           <div className="flex gap-3">
             <Button variant="secondary" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>
             <Button className="flex-1" onClick={handleSave}>Save Product</Button>
           </div>
         </div>
       ) : (
         <div className="space-y-3">
           {products.map(p => (
             <Card key={p.id} className="flex justify-between items-center group cursor-pointer hover:bg-white/80" onClick={() => { setEditProduct(p); setIsEditing(true); }}>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-indigo-50 flex items-center justify-center text-brand-600 shadow-sm border border-white/50">
                    <Package weight="duotone" size={24} />
                 </div>
                 <div>
                    <div className="font-bold text-slate-800 text-lg mb-0.5">{p.name}</div>
                    <div className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md inline-block">{p.category}</div>
                 </div>
               </div>
               <div className="text-right">
                 <div className="font-extrabold text-lg text-slate-900">৳{p.sellingPrice}</div>
                 <div className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md inline-block mt-1 ${p.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                    {p.stock} Left
                 </div>
               </div>
             </Card>
           ))}
         </div>
       )}
    </div>
  );
};

const GrowthTools: React.FC<{ tier: Tier, lang: 'en'|'bn' }> = ({ tier, lang }) => {
  const [offerInputs, setOfferInputs] = useState({ product: '', dream: '', fear: '' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (tier !== Tier.ELITE) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 animate-slide-up">
         <div className="bg-gradient-to-tr from-brand-100 to-white p-8 rounded-full mb-8 shadow-2xl shadow-brand-200/50 ring-4 ring-white/40">
            <Lightbulb size={64} className="text-brand-500" weight="duotone" />
         </div>
         <h2 className="text-3xl font-extrabold mb-3 text-slate-900 tracking-tight">Elite Feature</h2>
         <p className="text-slate-500 mb-8 max-w-xs leading-relaxed text-sm">Unlock AI Copywriting and Advanced Analytics by upgrading to the Elite Plan.</p>
         <Button variant="primary" className="shadow-xl shadow-brand-500/20 px-8">Upgrade Now</Button>
      </div>
    );
  }

  const handleOfferGen = async () => {
    setLoading(true);
    try {
      const text = await generateMarketingOffer(offerInputs.product, offerInputs.dream, offerInputs.fear);
      setResult(text);
    } catch(e) { setResult("Error generating offer."); }
    setLoading(false);
  };

  return (
    <div className="pb-32 animate-slide-up">
       <h2 className="text-3xl font-extrabold mb-6 text-slate-800 tracking-tight px-1">{TRANSLATIONS[lang].growth}</h2>
       
       <Card title="Marketing AI Wizard">
         <div className="space-y-5">
           <div>
             <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1.5 block uppercase tracking-wider">Product</label>
             <Input placeholder="e.g. Silk Saree" value={offerInputs.product} onChange={e => setOfferInputs({...offerInputs, product: e.target.value})} />
           </div>
           <div>
             <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1.5 block uppercase tracking-wider">Customer's Dream</label>
             <Input placeholder="e.g. Look elegant at weddings" value={offerInputs.dream} onChange={e => setOfferInputs({...offerInputs, dream: e.target.value})} />
           </div>
           <div>
             <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1.5 block uppercase tracking-wider">Customer's Fear</label>
             <Input placeholder="e.g. Looking outdated" value={offerInputs.fear} onChange={e => setOfferInputs({...offerInputs, fear: e.target.value})} />
           </div>
           <Button variant="magic" className="w-full mt-2 h-14 text-lg" onClick={handleOfferGen} isLoading={loading}><MagicWand size={24} weight="fill"/> Generate Ad Script</Button>
         </div>
       </Card>
       {result && (
        <Card className="mt-6 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100" title="AI Output">
            <pre className="whitespace-pre-wrap text-sm font-sans text-slate-700 leading-loose">{result}</pre>
            <Button variant="secondary" className="w-full mt-6 text-xs h-10" onClick={() => navigator.clipboard.writeText(result)}>Copy to Clipboard</Button>
        </Card>
       )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [tab, setTab] = useState<'home' | 'orders' | 'inventory' | 'growth' | 'settings'>('home');
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    getSession().then(s => { if (s) setSession(s); });
  }, []);

  const handleSync = async () => {
    if (!session || !session.settings.googleSheetId) return;
    setSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    setSyncing(false);
    alert("Data Synced to Google Sheets!");
  };

  const refreshSession = async () => {
    const s = await getSession();
    if(s) setSession(s);
  };

  const handleLogout = async () => {
    await clearSession();
    setSession(null);
  }

  if (!session) return <LoginScreen onLogin={setSession} />;

  return (
    <div className="max-w-md mx-auto min-h-screen relative shadow-2xl shadow-slate-400/20 overflow-hidden text-slate-800 border-x border-white/60 bg-white/30 backdrop-blur-3xl">
      
      {/* Top Header */}
      <div className="bg-white/70 backdrop-blur-xl sticky top-0 z-20 px-6 py-4 flex justify-between items-center border-b border-white/50 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2.5">
           <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 ring-2 ring-white/50">
             <Package weight="fill" size={20} />
           </div>
           <span className="font-extrabold text-xl text-slate-900 tracking-tight">BizMind<span className="text-brand-500">.</span></span>
           <button onClick={() => setLang(lang === 'en' ? 'bn' : 'en')} className="ml-2 text-[10px] font-extrabold bg-slate-100/80 px-2 py-1 rounded-md text-slate-500 uppercase tracking-wide hover:bg-slate-200 transition-colors">
             {lang}
           </button>
        </div>
        <div className="flex gap-3 items-center">
          {session.tier !== Tier.STARTER && (
            <button onClick={handleSync} disabled={!session.settings.googleSheetId} className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-white/60 shadow-sm ${syncing ? 'text-brand-500' : 'text-slate-400'} hover:bg-white hover:text-brand-600 transition-all duration-300`}>
              <CloudArrowUp size={20} weight={syncing ? 'fill' : 'regular'} className={syncing ? 'animate-bounce' : ''} />
            </button>
          )}
          <button onClick={() => setTab('settings')} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-white/60 shadow-sm text-slate-400 hover:bg-white hover:text-slate-600 transition-all duration-300"><Gear size={20} /></button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="p-5 min-h-screen pt-4 pb-24">
        {tab === 'home' && <Dashboard tier={session.tier} lang={lang} />}
        {tab === 'orders' && <OrderManager session={session} lang={lang} />}
        {tab === 'inventory' && <InventoryManager session={session} lang={lang} />}
        {tab === 'growth' && <GrowthTools tier={session.tier} lang={lang} />}
        {tab === 'settings' && <Settings session={session} onUpdate={refreshSession} onLogout={handleLogout} lang={lang} />}
      </main>

      {/* Premium Floating Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 max-w-[400px] mx-auto bg-white/80 backdrop-blur-2xl border border-white/40 rounded-3xl z-30 shadow-2xl shadow-slate-900/10 ring-1 ring-white/50">
        <div className="flex justify-around items-center p-1.5">
          <button onClick={() => setTab('home')} className={`relative p-3.5 rounded-2xl transition-all duration-300 ${tab === 'home' ? 'text-brand-600 bg-brand-50' : 'text-slate-300 hover:text-slate-500'}`}>
            <House size={26} weight={tab === 'home' ? 'fill' : 'regular'} />
            {tab === 'home' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-600 rounded-full shadow-lg shadow-brand-500/50"></span>}
          </button>
          <button onClick={() => setTab('orders')} className={`relative p-3.5 rounded-2xl transition-all duration-300 ${tab === 'orders' ? 'text-brand-600 bg-brand-50' : 'text-slate-300 hover:text-slate-500'}`}>
            <ShoppingCart size={26} weight={tab === 'orders' ? 'fill' : 'regular'} />
            {tab === 'orders' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-600 rounded-full shadow-lg shadow-brand-500/50"></span>}
          </button>
          
          <button className="flex flex-col items-center -mt-10 mx-1" onClick={() => setTab('orders')}>
             <div className="bg-gradient-to-br from-brand-500 to-indigo-600 text-white p-4 rounded-3xl shadow-xl shadow-brand-500/40 active:scale-95 transition-all duration-300 hover:shadow-brand-500/60 ring-4 ring-white/90">
               <Plus size={28} weight="bold" />
             </div>
          </button>

          <button onClick={() => setTab('inventory')} className={`relative p-3.5 rounded-2xl transition-all duration-300 ${tab === 'inventory' ? 'text-brand-600 bg-brand-50' : 'text-slate-300 hover:text-slate-500'}`}>
            <Package size={26} weight={tab === 'inventory' ? 'fill' : 'regular'} />
            {tab === 'inventory' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-600 rounded-full shadow-lg shadow-brand-500/50"></span>}
          </button>
          <button onClick={() => setTab('growth')} className={`relative p-3.5 rounded-2xl transition-all duration-300 ${tab === 'growth' ? 'text-brand-600 bg-brand-50' : 'text-slate-300 hover:text-slate-500'}`}>
            <TrendUp size={26} weight={tab === 'growth' ? 'fill' : 'regular'} />
            {tab === 'growth' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-600 rounded-full shadow-lg shadow-brand-500/50"></span>}
          </button>
        </div>
      </nav>
    </div>
  );
}