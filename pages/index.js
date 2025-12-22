import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { PaystackButton } from 'react-paystack';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { 
  ShoppingCart, Zap, History, 
  ShieldCheck, Search, ChevronRight,
  Smartphone, CreditCard
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [phone, setPhone] = useState('');
  const [quantities, setQuantities] = useState({ WASSCE: 1, BECE: 1, PLACEMENT: 1 });
  const [retrievePhone, setRetrievePhone] = useState('');
  const [retrievedData, setRetrievedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stock, setStock] = useState({ WASSCE: 100, BECE: 100, PLACEMENT: 100 });

  useEffect(() => {
    setHasMounted(true);
    checkStock();
  }, []);

  const checkStock = async () => {
    try {
      const res = await axios.get('/api/public-stock');
      setStock(res.data);
    } catch (e) { console.error("Stock check failed"); }
  };

  const handleQtyChange = (id, delta) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.min(10, Math.max(1, prev[id] + delta))
    }));
  };

  const vouchers = [
    { id: 'WASSCE', name: 'WASSCE / NOVDEC', full: 'WASSCE & NOVDEC Results Checker', price: 30 },
    { id: 'BECE', name: 'BECE', full: 'BECE Results Checker Voucher', price: 30 },
    { id: 'PLACEMENT', name: 'CSSPS', full: 'School Placement Checker', price: 30 },
  ];

  const handleSuccess = async (ref, id) => {
    const t = toast.loading('Verifying payment & generating codes...');
    try {
      const res = await axios.post('/api/verify-payment', { 
        reference: ref.reference, 
        quantity: quantities[id], 
        type: id, 
        phone 
      });
      await checkStock();
      localStorage.setItem('lastOrder', JSON.stringify(res.data.vouchers));
      router.push(`/thank-you?ref=${ref.reference}`);
      toast.dismiss(t);
    } catch (e) {
      toast.error('Verification failed. Please contact support.');
      toast.dismiss(t);
    }
  };

  const handleRetrieve = async (e) => {
    e.preventDefault();
    if (retrievePhone.length < 10) return toast.error("Enter a valid phone number");
    setLoading(true);
    try {
      const res = await axios.post('/api/retrieve', { phone: retrievePhone });
      setRetrievedData(res.data);
    } catch (e) { toast.error("No purchase history found for this number"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      <Head>
        <title>WAEC Checkers | Buy WASSCE, BECE & Placement Vouchers Online</title>
        <meta name="description" content="Buy WASSCE, NOVDEC, BECE and School Placement vouchers instantly via Mobile Money." />
      </Head>
      <Toaster position="top-center" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">WAEC<span className="text-blue-600">Checkers</span></span>
          </div>
          <button 
            onClick={() => document.getElementById('history').scrollIntoView({behavior:'smooth'})} 
            className="text-[10px] font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]"
          >
            History
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-12 pb-24">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
            <ShieldCheck size={12} /> Secure Voucher Portal
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[0.95]">
            Instant WAEC <br className="hidden md:block"/> <span className="text-blue-600 italic">Result Checkers.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            Get your WASSCE, NOVDEC, and BECE serial and pins delivered to your phone via SMS immediately after payment.
          </p>
        </div>

        {/* Voucher Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {vouchers.map((v) => {
            const isOutOfStock = stock[v.id] <= 0;
            const currentQty = quantities[v.id];
            const totalPrice = v.price * currentQty;
            
            const paystackProps = {
              email: phone ? `${phone}@waeccheckers.com` : 'customer@waeccheckers.com',
              amount: Math.round(totalPrice * 100),
              publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
              text: `Buy Now — GHS ${totalPrice}`,
              onSuccess: (ref) => handleSuccess(ref, v.id),
              onClose: () => toast("Transaction paused", { icon: '⚠️' }),
              currency: "GHS",
              reference: `W-CH-${Math.floor(Math.random() * 1000000000)}`
            };

            return (
              <div key={v.id} className={`bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm transition-all hover:border-blue-600/30 flex flex-col justify-between ${isOutOfStock ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <ShoppingCart size={24} />
                    </div>
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">In Stock</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter mb-1">{v.name}</h3>
                  <p className="text-sm text-slate-400 font-bold mb-8 leading-tight">{v.full}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black ml-3 uppercase text-slate-400 tracking-widest">Qty</span>
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleQtyChange(v.id, -1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm font-black text-lg hover:bg-blue-600 hover:text-white transition-colors">-</button>
                      <span className="font-black text-base w-4 text-center">{currentQty}</span>
                      <button onClick={() => handleQtyChange(v.id, 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm font-black text-lg hover:bg-blue-600 hover:text-white transition-colors">+</button>
                    </div>
                  </div>

                  <input 
                    type="tel" 
                    placeholder="Phone Number (024...)" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 ring-blue-600/10 focus:bg-white transition-all placeholder:text-slate-300"
                  />

                  {hasMounted && (
                    <PaystackButton 
                      {...paystackProps} 
                      className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${phone.length >= 10 ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-slate-900' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                      disabled={phone.length < 10 || isOutOfStock}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* History Section */}
        <section id="history" className="mb-24 px-1">
          <div className="flex flex-col lg:grid lg:grid-cols-2 bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl">
            {/* Left Side: Form */}
            <div className="p-10 md:p-20 text-white border-b border-white/5 lg:border-b-0 lg:border-r lg:border-white/5">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
                <History size={28} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-6 leading-none">Voucher<br/>History</h2>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed">Purchased codes are sent via SMS, but you can also retrieve all your previous serials and pins here for free.</p>
              
              <form onSubmit={handleRetrieve} className="flex flex-col gap-4">
                <div className="relative">
                  <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                  <input 
                    type="tel" 
                    value={retrievePhone}
                    onChange={(e) => setRetrievePhone(e.target.value)}
                    placeholder="Enter Phone Number" 
                    className="w-full bg-white/5 border border-white/10 pl-14 pr-6 py-5 rounded-2xl outline-none focus:bg-white/10 focus:ring-2 ring-blue-500 transition-all font-bold text-lg" 
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-white hover:text-blue-600 transition-all text-xs uppercase tracking-[0.2em]"
                >
                  {loading ? 'Searching...' : 'Find My Vouchers'}
                </button>
              </form>
            </div>

            {/* Right Side: Results */}
            <div className="p-10 md:p-20 bg-white/[0.02] flex flex-col min-h-[400px]">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Purchase Records</span>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              </div>
              
              {!retrievedData ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] p-10 text-center">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className="text-white/20" />
                   </div>
                   <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Waiting for phone number</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
                  {retrievedData.map((item, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={i} 
                      className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 group hover:border-blue-500/50 transition-all"
                    >
                      <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase mb-2 tracking-widest">{item.type}</p>
                        <p className="text-[11px] font-mono text-white/40 break-all tracking-tighter">S/N: {item.serial}</p>
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        <p className="text-sm text-white/30 font-bold uppercase text-[9px] mb-1">PIN</p>
                        <p className="text-3xl font-black text-white tracking-tighter leading-none">{item.pin}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Support Section */}
        <div className="max-w-3xl mx-auto text-center">
          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Official Payment Partners</h4>
          <div className="flex flex-wrap justify-center items-center gap-8 grayscale opacity-40">
            <span className="font-black text-xl italic">MTN MOMO</span>
            <span className="font-black text-xl italic">VODACASH</span>
            <span className="font-black text-xl italic">AIRTELTIGO</span>
            <span className="font-black text-xl italic">VISA/MASTERCARD</span>
          </div>
        </div>
      </main>

      <footer className="py-20 text-center border-t border-slate-100 bg-white">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-8 bg-slate-200"></div>
          <ShieldCheck size={20} className="text-blue-600" />
          <div className="h-px w-8 bg-slate-200"></div>
        </div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">Secured by Paystack</p>
        <p className="text-[11px] font-bold text-slate-500">WAEC GH Checkers Official Distribution Portal</p>
        <p className="text-[10px] font-medium text-slate-400 mt-2 italic">© 2025 WAECcheckers.com. All Rights Reserved.</p>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
      `}</style>
    </div>
  );
}
