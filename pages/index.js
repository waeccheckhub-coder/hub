import { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { PaystackButton } from 'react-paystack';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { ShoppingCart, Search, Zap, X, History, Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState('');
  const [retrievePhone, setRetrievePhone] = useState('');
  const [retrievedData, setRetrievedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatedEmail = phone ? `${phone}@neoncheck.com` : 'customer@neoncheck.com';

  const vouchers = [
    { id: 'WASSCE', name: 'WASSCE', full: 'WASSCE Results', color: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', btn: 'bg-cyan-500', shadow: 'shadow-cyan-100', price: 30 },
    { id: 'BECE', name: 'BECE', full: 'BECE Results', color: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', btn: 'bg-pink-500', shadow: 'shadow-pink-100', price: 30 },
    { id: 'PLACEMENT', name: 'CSSPS', full: 'School Placement', color: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', btn: 'bg-emerald-500', shadow: 'shadow-emerald-100', price: 30 },
  ];

  const handleSuccess = async (ref) => {
    const t = toast.loading('VERIFYING...');
    try {
      const res = await axios.post('/api/verify-payment', { reference: ref.reference, quantity, type: selectedVoucher.id, phone });
      localStorage.setItem('lastOrder', JSON.stringify(res.data.vouchers));
      router.push(`/thank-you?ref=${ref.reference}`);
      toast.dismiss(t);
    } catch (e) {
      toast.error('Check Stock or Connection');
      toast.dismiss(t);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <Head><title>NEONCHECK | Bright WAEC Portal</title></Head>
      <Toaster />

      {/* Bright Header Decor */}
      <div className="h-2 w-full bg-gradient-to-r from-cyan-400 via-pink-500 to-emerald-400"></div>

      <div className="max-w-6xl mx-auto px-6 pt-12">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-xl shadow-lg border border-slate-100">
              <Zap className="text-cyan-500 fill-cyan-500" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-800 uppercase italic">Neon<span className="text-cyan-500">Check</span></span>
          </div>
          <button onClick={() => document.getElementById('history').scrollIntoView({behavior:'smooth'})} className="px-5 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:text-cyan-500 transition-all shadow-sm">VIEW HISTORY</button>
        </header>

        <div className="text-center mb-20">
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-4">
              Instant <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Results.</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto uppercase tracking-widest text-sm">Official WAEC Result Checkers & Placement Vouchers</p>
          </motion.div>
        </div>

        {/* Colorful Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {vouchers.map((v) => (
            <motion.div
              key={v.id}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => setSelectedVoucher(v)}
              className={`p-10 rounded-[2.5rem] ${v.color} border-2 ${v.border} ${v.shadow} shadow-2xl cursor-pointer transition-all relative overflow-hidden group`}
            >
              <Sparkles className={`absolute -right-4 -top-4 opacity-10 ${v.text}`} size={120} />
              <p className={`text-xs font-black uppercase tracking-widest mb-2 ${v.text} opacity-70`}>OFFICIAL STOCK</p>
              <h3 className="text-4xl font-black mb-10 text-slate-900 italic tracking-tighter">{v.name}</h3>
              <div className="flex justify-between items-center bg-white/50 p-4 rounded-3xl backdrop-blur-sm">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black">Price</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">GHS {v.price}.00</p>
                </div>
                <div className={`p-3 rounded-2xl ${v.btn} text-white shadow-lg shadow-black/10`}>
                  <ShoppingCart size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* History Section - Integrated Bright Theme */}
        <section id="history" className="max-w-2xl mx-auto py-20 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <History className="text-pink-500" />
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">Retrieve Previous Vouchers</h2>
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              const res = await axios.post('/api/retrieve', { phone: retrievePhone });
              setRetrievedData(res.data);
            } catch { toast.error("Check Connection"); }
            setLoading(false);
          }} className="flex gap-3 mb-12">
            <input 
              type="tel" placeholder="Enter Phone Number" value={retrievePhone}
              onChange={(e) => setRetrievePhone(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-3xl px-8 py-5 text-lg font-bold text-slate-700 focus:border-cyan-400 outline-none shadow-inner"
            />
            <button className="bg-slate-900 text-white font-black px-10 rounded-3xl hover:bg-cyan-500 transition-all shadow-xl">
              {loading ? "..." : "SEARCH"}
            </button>
          </form>

          <div className="space-y-4">
            {retrievedData?.map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm">
                <div>
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-[10px] font-black rounded-full uppercase mb-2 block w-fit">{item.type}</span>
                  <p className="font-mono text-xs text-slate-400 tracking-tighter uppercase font-bold">SN: {item.serial}</p>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black font-mono tracking-widest text-slate-800">{item.pin}</p>
                   <p className="text-[10px] text-slate-300 font-bold">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bright Checkout Bar */}
      <AnimatePresence>
        {selectedVoucher && (
          <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} className="fixed bottom-6 inset-x-6 z-50">
            <div className="max-w-5xl mx-auto bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${selectedVoucher.btn} text-white shadow-lg`}><ShoppingCart/></div>
                <div>
                  <h4 className="font-black italic text-xl text-slate-800">{selectedVoucher.full}</h4>
                  <p className="font-black text-cyan-500">Total: GHS {(selectedVoucher.price * quantity).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 font-black hover:text-cyan-500 text-slate-400 transition">-</button>
                  <span className="w-12 text-center font-black text-slate-700">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(50, quantity + 1))} className="w-10 h-10 font-black hover:text-cyan-500 text-slate-400 transition">+</button>
                </div>
                <input 
                  type="tel" placeholder="YOUR PHONE" value={phone} onChange={(e)=>setPhone(e.target.value)}
                  className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 w-44 font-bold text-center outline-none focus:ring-2 ring-cyan-400 transition"
                />
                {phone.length >= 10 ? (
                  <PaystackButton 
                    className="bg-slate-900 text-white font-black px-12 py-4 rounded-2xl hover:bg-cyan-500 transition-all shadow-xl uppercase tracking-tighter"
                    email={generatedEmail}
                    amount={selectedVoucher.price * quantity * 100}
                    publicKey={process.env.NEXT_PUBLIC_PAYSTACK_KEY}
                    text="PAY NOW"
                    onSuccess={handleSuccess}
                  />
                ) : (
                  <button disabled className="bg-slate-100 text-slate-300 font-black px-12 py-4 rounded-2xl cursor-not-allowed uppercase tracking-tighter">Enter Phone</button>
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
