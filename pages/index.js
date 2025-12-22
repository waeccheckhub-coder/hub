import { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { PaystackButton } from 'react-paystack';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { ShoppingCart, Search, Zap, X, Check, ArrowRight, History } from 'lucide-react';

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
    { id: 'WASSCE', name: 'WASSCE', full: 'WASSCE Checker', color: '#00f3ff', bg: 'bg-cyan-500', border: 'border-cyan-400', shadow: 'shadow-[0_0_30px_rgba(0,243,255,0.4)]', price: 30 },
    { id: 'BECE', name: 'BECE', full: 'BECE Checker', color: '#ff00ff', bg: 'bg-fuchsia-500', border: 'border-fuchsia-400', shadow: 'shadow-[0_0_30px_rgba(255,0,255,0.4)]', price: 30 },
    { id: 'PLACEMENT', name: 'CSSPS', full: 'Placement Voucher', color: '#00ff41', bg: 'bg-green-500', border: 'border-green-400', shadow: 'shadow-[0_0_30px_rgba(0,255,65,0.4)]', price: 30 },
  ];

  const handlePaystackSuccess = async (reference) => {
    const loadingToast = toast.loading('FETCHING VOUCHERS...');
    try {
      const res = await axios.post('/api/verify-payment', {
        reference: reference.reference,
        quantity,
        type: selectedVoucher.id,
        phone
      });
      toast.dismiss(loadingToast);
      localStorage.setItem('lastOrder', JSON.stringify(res.data.vouchers));
      router.push(`/thank-you?ref=${reference.reference}`);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || 'Verification Failed');
    }
  };

  const handleRetrieve = async (e) => {
    e.preventDefault();
    if (!retrievePhone) return toast.error("Enter phone number");
    setLoading(true);
    try {
      const res = await axios.post('/api/retrieve', { phone: retrievePhone });
      setRetrievedData(res.data);
      if(res.data.length === 0) toast.error("No records found");
    } catch (err) {
      toast.error("Error connecting to database");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-cyan-500 selection:text-black">
      <Head><title>NEONCHECK | WAEC PORTAL</title></Head>
      <Toaster position="top-right" />

      {/* Futuristic Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-cyan-500/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-32">
        {/* Navbar */}
        <nav className="flex justify-between items-center mb-24">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="p-2 bg-cyan-500 rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.8)] transition-transform group-hover:rotate-12">
              <Zap className="text-black fill-black" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter italic bg-gradient-to-r from-white via-cyan-400 to-white bg-clip-text text-transparent">NEONCHECK</span>
          </div>
          <button onClick={() => document.getElementById('retrieve-sec').scrollIntoView({behavior:'smooth'})} className="px-6 py-2 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            History
          </button>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-24">
          <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} transition={{duration:0.5}}>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-4 italic uppercase">
              Instant <span className="text-cyan-400 drop-shadow-[0_0_30px_rgba(0,243,255,0.8)]">Access.</span>
            </h1>
            <p className="text-gray-500 font-mono text-lg max-w-xl mx-auto border-y border-white/5 py-4 uppercase tracking-[0.3em]">
              Premium Result Checkers • SMS Delivery
            </p>
          </motion.div>
        </div>

        {/* Voucher Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-40">
          {vouchers.map((v, idx) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => setSelectedVoucher(v)}
              className={`relative p-10 rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent border-2 ${v.border} ${v.shadow} group cursor-pointer overflow-hidden transition-all`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${v.bg} blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block">Official WAEC</span>
              <h3 className="text-4xl font-black mb-2 italic tracking-tighter uppercase">{v.name}</h3>
              <p className="text-gray-500 text-sm mb-8 font-medium">Verify your results with our high-speed automated delivery.</p>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500">Unit Price</p>
                  <p className="text-3xl font-black italic tracking-tighter">GHS {v.price}.00</p>
                </div>
                <div className={`p-4 rounded-2xl ${v.bg} text-black shadow-lg shadow-black/50 group-hover:rotate-12 transition-transform`}>
                  <ArrowRight />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Retrieve History Section */}
        <section id="retrieve-sec" className="max-w-3xl mx-auto py-20 border-t border-white/10 relative">
          <div className="absolute -left-20 top-40 w-40 h-40 bg-fuchsia-500/10 blur-[100px]"></div>
          <div className="flex items-center gap-4 mb-10">
            <History className="text-fuchsia-500" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Retrieve Vouchers</h2>
          </div>
          
          <form onSubmit={handleRetrieve} className="flex gap-4 mb-12">
            <input 
              type="tel" placeholder="ENTER PHONE NUMBER" value={retrievePhone}
              onChange={(e) => setRetrievePhone(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-xl font-bold focus:border-fuchsia-500 outline-none transition-all focus:ring-4 ring-fuchsia-500/20"
            />
            <button className="bg-fuchsia-500 text-black font-black px-10 rounded-2xl hover:bg-white transition-all active:scale-95 shadow-lg shadow-fuchsia-500/20">
              {loading ? "..." : "SEARCH"}
            </button>
          </form>

          <div className="space-y-4">
            {retrievedData?.map((item, i) => (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} key={i} className="bg-white/5 p-6 rounded-3xl border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all">
                <div>
                  <p className="text-[10px] font-black text-fuchsia-500 uppercase">{new Date(item.created_at).toDateString()}</p>
                  <h4 className="text-xl font-black tracking-tighter italic">{item.type}</h4>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-mono">SERIAL: {item.serial}</p>
                  <p className="text-2xl font-black font-mono tracking-widest text-white group-hover:text-cyan-400 transition-colors">{item.pin}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Floating Action Checkout Bar */}
      <AnimatePresence>
        {selectedVoucher && (
          <motion.div 
            initial={{ y: 150, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 150, opacity: 0 }} 
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 px-4"
          >
            <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-6 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-t-white/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Left: Product Info */}
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-2xl ${selectedVoucher.bg} flex items-center justify-center text-black shadow-lg`}>
                    <ShoppingCart size={28} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black italic tracking-tighter">{selectedVoucher.full}</h4>
                    <p className="text-cyan-400 font-black text-sm uppercase tracking-widest">Total: GHS {(selectedVoucher.price * quantity).toFixed(2)}</p>
                  </div>
                </div>

                {/* Center: Controls */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="flex items-center bg-black/60 rounded-2xl p-1 border border-white/10">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 hover:text-cyan-400 font-bold transition">-</button>
                    <span className="w-12 text-center font-black text-xl italic">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(50, quantity + 1))} className="w-10 h-10 hover:text-cyan-400 font-bold transition">+</button>
                  </div>

                  <input 
                    type="tel" placeholder="PHONE" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-black/60 border border-white/10 rounded-2xl px-6 py-4 w-44 focus:outline-none focus:border-cyan-400 font-black text-center tracking-widest transition"
                  />

                  {/* Right: Payment Action */}
                  <div className="flex items-center gap-2">
                    {phone.length >= 10 ? (
                      <PaystackButton 
                        className="bg-cyan-500 text-black font-black px-12 py-4 rounded-2xl hover:bg-white transition-all shadow-lg shadow-cyan-500/20 uppercase italic tracking-tighter"
                        email={generatedEmail}
                        amount={selectedVoucher.price * quantity * 100}
                        publicKey={process.env.NEXT_PUBLIC_PAYSTACK_KEY}
                        text="PAY NOW"
                        onSuccess={handlePaystackSuccess}
                      />
                    ) : (
                      <button disabled className="bg-white/5 text-gray-600 font-black px-12 py-4 rounded-2xl cursor-not-allowed uppercase italic tracking-tighter italic">Enter Phone</button>
                    )}
                    <button onClick={() => setSelectedVoucher(null)} className="p-4 text-gray-500 hover:text-white transition-colors"><X /></button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
