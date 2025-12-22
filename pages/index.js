import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { PaystackButton } from 'react-paystack';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { ShoppingCart, Search, History, Check, X, Zap, Download } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState('');
  const [retrievePhone, setRetrievePhone] = useState('');
  const [retrievedData, setRetrievedData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Automatic Fake Email Generation for Paystack
  const generatedEmail = phone ? `${phone}@neoncheck.com` : 'customer@neoncheck.com';

  const vouchers = [
    { id: 'WASSCE', name: 'WASSCE Checker', color: 'from-cyan-400 to-blue-600', shadow: 'shadow-cyan-500/50', border: 'border-cyan-400', price: 30 },
    { id: 'BECE', name: 'BECE Checker', color: 'from-fuchsia-500 to-purple-600', shadow: 'shadow-fuchsia-500/50', border: 'border-fuchsia-400', price: 30 },
    { id: 'PLACEMENT', name: 'Placement Voucher', color: 'from-lime-400 to-green-600', shadow: 'shadow-green-500/50', border: 'border-lime-400', price: 30 },
  ];

  const handlePaystackSuccess = async (reference) => {
    const loadingToast = toast.loading('Syncing with WAEC Database...');
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
    if (!retrievePhone) return toast.error("Enter your phone number");
    setLoading(true);
    try {
      const res = await axios.post('/api/retrieve', { phone: retrievePhone });
      setRetrievedData(res.data);
    } catch (err) {
      toast.error("Records not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      <Head><title>NEONCHECK | Premium WAEC Services</title></Head>
      <Toaster position="top-right" />

      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-2">
            <Zap className="text-cyan-400 fill-cyan-400" size={32} />
            <span className="text-3xl font-black italic tracking-tighter bg-gradient-to-r from-cyan-400 via-white to-fuchsia-500 bg-clip-text text-transparent">
              NEONCHECK
            </span>
          </motion.div>
          
          <div className="flex bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10 shadow-2xl">
            <button className="px-8 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg">Buy Vouchers</button>
            <a href="#retrieve" className="px-8 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition">Retrieve History</a>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-[0.9]"
          >
            GET RESULTS <br/> <span className="text-cyan-400">INSTANTLY.</span>
          </motion.h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl">
            The fastest way to get your WASSCE, BECE & Placement checkers. 
            Pay with MoMo and receive your PIN via SMS immediately.
          </p>
        </div>

        {/* 3 Voucher Sections */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {vouchers.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              onClick={() => setSelectedVoucher(v)}
              className={`relative group cursor-pointer p-8 rounded-[2.5rem] bg-white/5 border-2 ${v.border} ${v.shadow} shadow-2xl transition-all overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${v.color}`} />
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${v.color} shadow-lg`}>
                  <ShoppingCart className="text-black" />
                </div>
                <span className="text-4xl font-black opacity-20 group-hover:opacity-100 transition tracking-tighter italic">0{i+1}</span>
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight">{v.name}</h3>
              <p className="text-gray-400 text-sm mb-6 uppercase tracking-widest font-bold">Official WAEC Stock</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-gray-500">GHS</span>
                <span className="text-4xl font-black text-white tracking-tighter">{v.price}.00</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Integrated Retrieve Section */}
        <section id="retrieve" className="py-20 border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-fuchsia-400 to-purple-600 bg-clip-text text-transparent">RETRIEVE PAST ORDERS</h2>
              <p className="text-gray-500 italic font-mono">Lost your code? No problem. Enter your number below.</p>
            </div>
            
            <form onSubmit={handleRetrieve} className="relative flex items-center mb-12">
              <input 
                type="tel" 
                placeholder="024 XXX XXXX"
                value={retrievePhone}
                onChange={(e) => setRetrievePhone(e.target.value)}
                className="w-full bg-white/5 border-2 border-fuchsia-500/30 rounded-3xl px-8 py-6 text-xl focus:outline-none focus:border-fuchsia-500 focus:bg-white/10 transition-all placeholder:text-gray-700"
              />
              <button className="absolute right-4 p-4 rounded-2xl bg-fuchsia-500 text-black hover:bg-white transition shadow-xl">
                {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div> : <Search size={24} />}
              </button>
            </form>

            <AnimatePresence>
              {retrievedData && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                  {retrievedData.map((item, idx) => (
                    <div key={idx} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="text-center md:text-left">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">{new Date(item.created_at).toDateString()}</span>
                        <h4 className="text-xl font-black">{item.type}</h4>
                      </div>
                      <div className="flex flex-col items-center md:items-end">
                        <span className="text-xs text-gray-500 font-mono">SERIAL: {item.serial}</span>
                        <span className="text-2xl font-black font-mono tracking-tighter text-fuchsia-400">{item.pin}</span>
                      </div>
                    </div>
                  ))}
                </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Floating Checkout Drawer */}
      <AnimatePresence>
        {selectedVoucher && (
          <motion.div 
            initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 200, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50"
          >
            <div className="bg-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-[3rem] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className={`p-5 rounded-3xl bg-gradient-to-br ${selectedVoucher.color} text-black`}>
                    <ShoppingCart size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black leading-none mb-1">{selectedVoucher.name}</h3>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">GHS {(selectedVoucher.price * quantity).toFixed(2)} Total</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="flex items-center bg-black/50 rounded-2xl p-1 border border-white/10">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 hover:text-cyan-400 transition">-</button>
                    <span className="w-12 text-center font-black text-xl">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(50, quantity + 1))} className="w-10 h-10 hover:text-cyan-400 transition">+</button>
                  </div>

                  <input 
                    type="tel" placeholder="Your Phone Number" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-2xl px-6 py-4 w-56 focus:outline-none focus:border-cyan-400 transition font-bold"
                  />

                  {phone.length >= 10 ? (
                    <PaystackButton 
                      className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-black px-12 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/20"
                      email={generatedEmail} // FAKE EMAIL GENERATED AUTOMATICALLY
                      amount={selectedVoucher.price * quantity * 100}
                      publicKey={process.env.NEXT_PUBLIC_PAYSTACK_KEY}
                      text="CONFIRM & PAY"
                      onSuccess={handlePaystackSuccess}
                    />
                  ) : (
                    <button disabled className="bg-white/5 text-gray-600 font-black px-12 py-5 rounded-2xl cursor-not-allowed">ENTER PHONE</button>
                  )}
                  <button onClick={() => setSelectedVoucher(null)} className="p-4 text-gray-500 hover:text-white transition"><X /></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
