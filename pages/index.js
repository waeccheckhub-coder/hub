import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { PaystackButton } from 'react-paystack';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { ShoppingCart, Zap, X, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState('');
  const [retrievePhone, setRetrievePhone] = useState('');
  const [retrievedData, setRetrievedData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Critical: Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const generatedEmail = phone ? `${phone}@neoncheck.com` : 'customer@neoncheck.com';

  const vouchers = [
    { id: 'WASSCE', name: 'WASSCE', full: 'WASSCE Results', color: 'text-blue-600', border: 'border-blue-100', bg: 'bg-blue-50', price: 30 },
    { id: 'BECE', name: 'BECE', full: 'BECE Results', color: 'text-indigo-600', border: 'border-indigo-100', bg: 'bg-indigo-50', price: 30 },
    { id: 'PLACEMENT', name: 'CSSPS', full: 'Placement Voucher', color: 'text-violet-600', border: 'border-violet-100', bg: 'bg-violet-50', price: 30 },
  ];

  const handleSuccess = async (ref) => {
    const t = toast.loading('Syncing with WAEC...');
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

  const handleClose = () => { 
    toast("Payment session closed.", { icon: 'ℹ️' }); 
  };

  // 2. Prepare Paystack Props safely
  const paystackProps = {
    email: generatedEmail,
    amount: (selectedVoucher?.price || 0) * quantity * 100,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY || '',
    text: "Buy Now",
    onSuccess: (reference) => handleSuccess(reference),
    onClose: handleClose,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Head><title>NEONCHECK | Premium WAEC Portal</title></Head>
      <Toaster position="top-center" />

      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">NEON<span className="text-blue-600">CHECK</span></span>
          </div>
          <button onClick={() => document.getElementById('history').scrollIntoView({behavior:'smooth'})} className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider">History</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-32">
        <div className="max-w-3xl mb-20">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
            The faster way to check your <span className="text-blue-600 underline decoration-blue-100 underline-offset-8">results.</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium">Official WAEC vouchers delivered instantly via SMS and on-screen.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {vouchers.map((v) => (
            <motion.div
              key={v.id}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedVoucher(v)}
              className={`p-8 rounded-[2rem] bg-white border ${v.border} hover:shadow-2xl hover:shadow-blue-100 transition-all cursor-pointer relative group`}
            >
              <div className={`w-12 h-12 ${v.bg} ${v.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                <ShoppingCart size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-1">{v.name}</h3>
              <p className="text-slate-400 text-sm font-medium mb-10">{v.full}</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-slate-900">GHS {v.price}</span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase">
                  <CheckCircle2 size={12} /> Instant
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <section id="history" className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Retrieve your vouchers</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                const res = await axios.post('/api/retrieve', { phone: retrievePhone });
                setRetrievedData(res.data);
              } catch (e) { toast.error("Error fetching records."); }
              setLoading(false);
            }} className="flex flex-col sm:flex-row gap-4">
              <input 
                type="tel" placeholder="050 000 0000" value={retrievePhone}
                onChange={(e) => setRetrievePhone(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
              />
              <button className="bg-slate-900 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-100">
                {loading ? 'Searching...' : 'Find My Codes'}
              </button>
            </form>

            <div className="mt-12 space-y-4">
              {retrievedData?.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{item.type}</p>
                    <p className="text-sm font-bold text-slate-400">{item.serial}</p>
                  </div>
                  <p className="text-2xl font-mono font-bold text-slate-800">{item.pin}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selectedVoucher && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-8 inset-x-6 z-50">
            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl border border-slate-200 p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><ShoppingCart size={22}/></div>
                <div>
                  <h4 className="font-bold text-lg text-slate-800 leading-none">{selectedVoucher?.full}</h4>
                  <p className="text-blue-600 font-bold mt-1 uppercase text-xs tracking-wider">Total: GHS {((selectedVoucher?.price || 0) * quantity).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 font-bold hover:text-blue-600 transition">-</button>
                  <span className="w-10 text-center font-bold text-slate-700">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="w-10 h-10 font-bold hover:text-blue-600 transition">+</button>
                </div>
                <input 
                  type="tel" placeholder="Your Phone" value={phone} onChange={(e)=>setPhone(e.target.value)}
                  className="bg-slate-100 border border-slate-200 rounded-xl px-5 py-3 w-40 font-bold text-center outline-none focus:ring-2 ring-blue-500/20"
                />
                
                {/* 3. Check for isMounted and phone length */}
                {isMounted && phone.length >= 10 ? (
                  <PaystackButton 
                    {...paystackProps}
                    className="bg-blue-600 text-white font-bold px-10 py-3 rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-blue-100 uppercase text-sm tracking-wider"
                  />
                ) : (
                  <button disabled className="bg-slate-200 text-slate-400 font-bold px-10 py-3 rounded-xl cursor-not-allowed uppercase text-sm tracking-wider">
                    {phone.length < 10 ? 'Enter Phone' : 'Loading...'}
                  </button>
                )}
                <button onClick={() => setSelectedVoucher(null)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><X /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
