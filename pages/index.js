import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { PaystackButton } from 'react-paystack';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { 
  ShoppingCart, Zap, X, CheckCircle2, 
  AlertCircle, History, ArrowRight, ShieldCheck, 
  Sparkles, ZapOff 
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState('');
  const [retrievePhone, setRetrievePhone] = useState('');
  const [retrievedData, setRetrievedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stock, setStock] = useState({ WASSCE: 0, BECE: 0, PLACEMENT: 0 });

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

  const vouchers = [
    { id: 'WASSCE', name: 'WASSCE', full: 'WASSCE Results Checker', color: 'text-blue-600', border: 'border-blue-100', bg: 'bg-blue-50', price: 30 },
    { id: 'BECE', name: 'BECE', full: 'BECE Results Checker', color: 'text-indigo-600', border: 'border-indigo-100', bg: 'bg-indigo-50', price: 30 },
    { id: 'PLACEMENT', name: 'CSSPS', full: 'School Placement Voucher', color: 'text-violet-600', border: 'border-violet-100', bg: 'bg-violet-50', price: 30 },
  ];

  const handleSuccess = async (ref) => {
    const t = toast.loading('Generating your codes...');
    try {
      const res = await axios.post('/api/verify-payment', { 
        reference: ref.reference, 
        quantity, 
        type: selectedVoucher?.id, 
        phone 
      });
      localStorage.setItem('lastOrder', JSON.stringify(res.data.vouchers));
      router.push(`/thank-you?ref=${ref.reference}`);
      toast.dismiss(t);
    } catch (e) {
      toast.error('Verification failed. Contact support.');
      toast.dismiss(t);
    }
  };

  const paystackProps = {
    email: phone ? `${phone}@neoncheck.com` : 'customer@neoncheck.com',
    amount: Math.round((selectedVoucher?.price || 0) * quantity * 100),
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
    text: "Confirm & Pay",
    onSuccess: (ref) => handleSuccess(ref),
    onClose: () => toast("Transaction paused", { icon: '⚠️' }),
    currency: "GHS",
    reference: `NC-${Math.floor(Math.random() * 1000000000)}`
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans selection:bg-blue-100">
      <Head><title>NeonCheck | Fast WAEC Vouchers</title></Head>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Modern Glass Nav */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-800 uppercase">Neon<span className="text-blue-600">Check</span></span>
          </div>
          <div className="flex items-center gap-8">
            <button onClick={() => document.getElementById('history').scrollIntoView({behavior:'smooth'})} className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest">
              <History size={14} /> History
            </button>
            <div className="h-4 w-[1px] bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">System Live</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-8">
            <Sparkles size={14} /> The Gold Standard in Results Checking
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9]">
            Results in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Seconds.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            Skip the stress. Official WAEC, BECE, and Placement vouchers delivered instantly to your device.
          </p>
        </div>

        {/* Voucher Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-40">
          {vouchers.map((v) => {
            const isOutOfStock = stock[v.id] <= 0;
            return (
              <motion.div
                key={v.id}
                whileHover={!isOutOfStock ? { y: -10 } : {}}
                onClick={() => !isOutOfStock && setSelectedVoucher(v)}
                className={`group p-10 rounded-[3rem] bg-white border ${isOutOfStock ? 'opacity-70 grayscale' : 'hover:shadow-3xl hover:shadow-blue-100/50'} border-slate-100 transition-all cursor-pointer relative overflow-hidden`}
              >
                {isOutOfStock && (
                  <div className="absolute top-6 right-6 px-4 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <ZapOff size={12} /> Out of Stock
                  </div>
                )}
                
                <div className={`w-14 h-14 ${v.bg} ${v.color} rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500`}>
                  <ShoppingCart size={28} />
                </div>
                
                <h3 className="text-3xl font-bold text-slate-800 mb-2">{v.name}</h3>
                <p className="text-slate-400 font-medium mb-12">{v.full}</p>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Price per unit</p>
                    <span className="text-4xl font-black text-slate-900">₵{v.price}</span>
                  </div>
                  <div className={`p-4 rounded-2xl ${isOutOfStock ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-xl shadow-blue-200'} group-hover:px-8 transition-all duration-300`}>
                    <ArrowRight size={20} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic History Section */}
        <section id="history" className="bg-slate-900 rounded-[4rem] p-12 md:p-24 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="relative z-10 grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Lost your code? <br/><span className="text-blue-400">No problem.</span></h2>
              <p className="text-slate-400 text-lg mb-10">Enter your phone number to retrieve every voucher you've ever purchased on NeonCheck.</p>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  const res = await axios.post('/api/retrieve', { phone: retrievePhone });
                  setRetrievedData(res.data);
                } catch (e) { toast.error("No records found for this number"); }
                setLoading(false);
              }} className="flex flex-col sm:flex-row gap-4 p-2 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10">
                <input 
                  type="tel" placeholder="Enter your phone number" value={retrievePhone}
                  onChange={(e) => setRetrievePhone(e.target.value)}
                  className="flex-1 bg-transparent px-8 py-5 outline-none font-bold text-lg"
                />
                <button className="bg-blue-600 text-white font-black px-10 py-5 rounded-[1.5rem] hover:bg-white hover:text-blue-600 transition-all text-sm uppercase tracking-widest">
                  {loading ? 'Fetching...' : 'Retrieve Now'}
                </button>
              </form>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {retrievedData?.map((item, i) => (
                <motion.div initial={{x:20, opacity:0}} animate={{x:0, opacity:1}} transition={{delay: i*0.1}} key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center group hover:bg-white/10 transition-all">
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">{item.type}</p>
                    <p className="font-mono text-slate-400 text-xs">{item.serial}</p>
                  </div>
                  <p className="text-2xl font-black tracking-tighter text-white">{item.pin}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Checkout Drawer */}
      <AnimatePresence>
        {selectedVoucher && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{type:'spring', damping:25, stiffness:200}} className="fixed bottom-0 inset-x-0 z-[60] p-6">
            <div className="max-w-5xl mx-auto bg-white border border-slate-200 p-8 md:p-10 rounded-[3.5rem] shadow-[0_-20px_80px_rgba(0,0,0,0.15)]">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 flex items-center gap-6">
                  <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shrink-0">
                    <ShoppingCart size={32}/>
                  </div>
                  <div>
                    <h4 className="font-black text-3xl text-slate-900 leading-none mb-2">{selectedVoucher?.name}</h4>
                    <div className="flex items-center gap-4">
                       <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Instant Delivery</span>
                       <span className="text-slate-300 font-bold">₵{selectedVoucher?.price} / unit</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6">
                  <div className="flex items-center bg-slate-50 rounded-2xl p-2 border border-slate-100">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center font-black text-xl hover:text-blue-600 transition">-</button>
                    <span className="w-12 text-center font-black text-xl text-slate-900">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="w-12 h-12 flex items-center justify-center font-black text-xl hover:text-blue-600 transition">+</button>
                  </div>
                  
                  <input 
                    type="tel" placeholder="Phone Number" value={phone} onChange={(e)=>setPhone(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-2xl px-8 py-4 w-56 font-black text-lg outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                  
                  {hasMounted && phone.length >= 10 ? (
                    <PaystackButton 
                      {...paystackProps}
                      className="bg-blue-600 text-white font-black px-12 py-5 rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-blue-200 uppercase text-xs tracking-[0.2em]"
                    />
                  ) : (
                    <button disabled className="bg-slate-100 text-slate-400 font-black px-12 py-5 rounded-2xl cursor-not-allowed uppercase text-xs tracking-[0.2em]">
                      {phone.length < 10 ? 'Enter Phone' : 'Loading...'}
                    </button>
                  )}
                  <button onClick={() => setSelectedVoucher(null)} className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-full"><X /></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-20 text-center">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">NeonCheck Infrastructure &copy; 2025</p>
      </footer>
    </div>
  );
}
