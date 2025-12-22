import { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { PaystackButton } from 'react-paystack';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { ShoppingCart, Search, Zap, X, History, ArrowRight } from 'lucide-react';

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
    { id: 'WASSCE', name: 'WASSCE', full: 'WASSCE Checker', color: 'text-cyan-400', border: 'border-cyan-400', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.4)]', price: 30, btn: 'bg-cyan-400' },
    { id: 'BECE', name: 'BECE', full: 'BECE Checker', color: 'text-fuchsia-500', border: 'border-fuchsia-500', glow: 'shadow-[0_0_20px_rgba(217,70,239,0.4)]', price: 30, btn: 'bg-fuchsia-500' },
    { id: 'PLACEMENT', name: 'CSSPS', full: 'Placement Voucher', color: 'text-lime-400', border: 'border-lime-400', glow: 'shadow-[0_0_20px_rgba(163,230,53,0.4)]', price: 30, btn: 'bg-lime-400' },
  ];

  const handlePaystackSuccess = async (ref) => {
    const t = toast.loading('FETCHING VOUCHERS...');
    try {
      const res = await axios.post('/api/verify-payment', { reference: ref.reference, quantity, type: selectedVoucher.id, phone });
      localStorage.setItem('lastOrder', JSON.stringify(res.data.vouchers));
      router.push(`/thank-you?ref=${ref.reference}`);
      toast.dismiss(t);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
      toast.dismiss(t);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black">
      <Head><title>NEONCHECK | WAEC PORTAL</title></Head>
      <Toaster position="top-right" />

      {/* Grid Overlay */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <header className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-2 group">
            <div className="p-2 bg-cyan-400 rounded-lg shadow-[0_0_15px_#22d3ee]">
              <Zap className="text-black fill-black" size={24} />
            </div>
            <span className="text-2xl font-black italic tracking-tighter">NEONCHECK</span>
          </div>
          <button onClick={() => document.getElementById('history').scrollIntoView({behavior:'smooth'})} className="px-6 py-2 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">History</button>
        </header>

        <div className="text-center mb-24">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase leading-none mb-6">
            INSTANT <br/> <span className="text-cyan-400 drop-shadow-[0_0_20px_#22d3ee]">ACCESS.</span>
          </h1>
          <p className="text-gray-500 font-mono tracking-[0.3em] uppercase text-xs">WAEC Result Checkers • Instant SMS Delivery</p>
        </div>

        {/* Voucher Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-40">
          {vouchers.map((v) => (
            <motion.div
              key={v.id}
              whileHover={{ y: -10 }}
              onClick={() => setSelectedVoucher(v)}
              className={`p-10 rounded-[2.5rem] bg-zinc-900/50 border-2 ${v.border} ${v.glow} cursor-pointer group transition-all`}
            >
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">OFFICIAL STOCK</p>
              <h3 className={`text-4xl font-black mb-6 italic ${v.color}`}>{v.name}</h3>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-black">Price</p>
                  <p className="text-3xl font-black italic">GHS {v.price}.00</p>
                </div>
                <div className={`p-4 rounded-2xl ${v.btn} text-black group-hover:rotate-12 transition-transform shadow-lg`}>
                  <ArrowRight />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Retrieve Section */}
        <section id="history" className="max-w-2xl mx-auto py-20 border-t border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <History className="text-fuchsia-500" />
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Retrieve Vouchers</h2>
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              const res = await axios.post('/api/retrieve', { phone: retrievePhone });
              setRetrievedData(res.data);
            } catch { toast.error("Error"); }
            setLoading(false);
          }} className="flex gap-2 mb-10">
            <input 
              type="tel" placeholder="ENTER PHONE NUMBER" value={retrievePhone}
              onChange={(e) => setRetrievePhone(e.target.value)}
              className="flex-1 bg-zinc-900 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-fuchsia-500 outline-none transition-all"
            />
            <button className="bg-fuchsia-500 text-black font-black px-8 rounded-2xl hover:bg-white transition-all">
              {loading ? "..." : "FIND"}
            </button>
          </form>

          <div className="space-y-4">
            {retrievedData?.map((item, i) => (
              <div key={i} className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-cyan-400 uppercase">{item.type}</p>
                  <p className="font-mono text-xs text-gray-500">SN: {item.serial}</p>
                </div>
                <p className="text-2xl font-black font-mono tracking-widest text-white">{item.pin}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Checkout Drawer */}
      <AnimatePresence>
        {selectedVoucher && (
          <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} className="fixed bottom-6 inset-x-6 z-50">
            <div className="max-w-5xl mx-auto bg-white text-black p-6 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${selectedVoucher.btn} text-black shadow-md`}><ShoppingCart/></div>
                <div>
                  <h4 className="font-black italic text-xl tracking-tighter">{selectedVoucher.full}</h4>
                  <p className="text-[10px] font-bold uppercase text-gray-500">GHS {(selectedVoucher.price * quantity).toFixed(2)} Total</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 font-black hover:text-cyan-500">-</button>
                  <span className="w-10 text-center font-black">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(50, quantity + 1))} className="w-8 h-8 font-black hover:text-cyan-500">+</button>
                </div>
                <input 
                  type="tel" placeholder="PHONE" value={phone} onChange={(e)=>setPhone(e.target.value)}
                  className="bg-gray-100 rounded-xl px-4 py-3 w-36 font-bold text-center outline-none ring-2 ring-transparent focus:ring-cyan-400 transition"
                />
                {phone.length >= 10 ? (
                  <PaystackButton 
                    className="bg-black text-white font-black px-10 py-3 rounded-xl hover:bg-cyan-400 hover:text-black transition-all shadow-lg"
                    email={generatedEmail}
                    amount={selectedVoucher.price * quantity * 100}
                    publicKey={process.env.NEXT_PUBLIC_PAYSTACK_KEY}
                    text="PURCHASE NOW"
                    onSuccess={handlePaystackSuccess}
                  />
                ) : (
                  <button disabled className="bg-gray-200 text-gray-400 font-black px-10 py-3 rounded-xl cursor-not-allowed">ENTER PHONE</button>
                )}
                <button onClick={() => setSelectedVoucher(null)} className="p-2 text-gray-400 hover:text-black"><X /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
