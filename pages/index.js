import { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { PaystackButton } from 'react-paystack';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { ShoppingCart, Search, Zap, X, Check } from 'lucide-react';

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
    const loadingToast = toast.loading('Syncing with WAEC...');
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
    } catch (err) {
      toast.error("Records not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden pb-20">
      <Head><title>NEONCHECK | WAEC PORTAL</title></Head>
      <Toaster position="top-right" />

      {/* Hero BG */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <Zap className="text-cyan-400 fill-cyan-400" size={28} />
            <span className="text-2xl font-black tracking-tighter italic">NEONCHECK</span>
          </div>
          <a href="#retrieve" className="text-sm font-bold text-gray-400 hover:text-cyan-400 transition">RETRIEVE HISTORY</a>
        </header>

        <div className="text-center mb-16">
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-6xl md:text-8xl font-black tracking-tighter mb-4">
            FASTER <span className="text-cyan-400 font-outline-2">RESULTS.</span>
          </motion.h1>
          <p className="text-gray-500 font-mono tracking-widest uppercase text-sm">Official WAEC Result Checkers & Placement Vouchers</p>
        </div>

        {/* Purchase Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {vouchers.map((v) => (
            <motion.div
              key={v.id}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => setSelectedVoucher(v)}
              className={`p-8 rounded-[2rem] bg-white/5 border-2 ${v.border} ${v.shadow} shadow-2xl cursor-pointer transition-all relative overflow-hidden`}
            >
              <div className="absolute -right-4 -top-4 opacity-10"><ShoppingCart size={120}/></div>
              <h3 className="text-2xl font-black mb-1">{v.name}</h3>
              <p className="text-xs text-gray-400 mb-6 uppercase tracking-widest font-bold">In Stock - GHS {v.price}.00</p>
              <div className="flex items-center gap-2 text-neonGreen text-xs font-bold">
                <Check size={14}/> SMS DELIVERY
              </div>
            </motion.div>
          ))}
        </div>

        {/* Retrieve Section */}
        <section id="retrieve" className="max-w-2xl mx-auto pt-10 border-t border-white/10">
          <h2 className="text-2xl font-black mb-6 text-center italic">RETRIEVE PAST ORDERS</h2>
          <form onSubmit={handleRetrieve} className="flex gap-2 mb-8">
            <input 
              type="tel" placeholder="Phone Number" value={retrievePhone}
              onChange={(e) => setRetrievePhone(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-cyan-400 outline-none transition"
            />
            <button className="bg-white text-black font-black px-6 rounded-xl hover:bg-cyan-400 transition">
              {loading ? '...' : <Search size={20}/>}
            </button>
          </form>

          <div className="space-y-3">
            <AnimatePresence>
              {retrievedData?.map((item, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>
                    <p className="font-bold text-cyan-400">{item.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">SERIAL: {item.serial}</p>
                    <p className="font-mono font-bold text-lg">{item.pin}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Floating Checkout */}
      <AnimatePresence>
        {selectedVoucher && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-4 inset-x-4 z-50">
            <div className="max-w-4xl mx-auto bg-white text-black p-6 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-black text-white p-3 rounded-2xl"><ShoppingCart/></div>
                <div>
                  <h4 className="font-black leading-none">{selectedVoucher.name}</h4>
                  <p className="text-xs font-bold text-gray-500">GHS {(selectedVoucher.price * quantity).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 font-bold">-</button>
                  <span className="w-10 text-center font-black">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(50, quantity + 1))} className="w-8 h-8 font-bold">+</button>
                </div>

                <input 
                  type="tel" placeholder="Your Phone" value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-gray-100 rounded-xl px-4 py-3 w-40 font-bold focus:outline-none focus:ring-2 ring-cyan-400"
                />

                {phone.length >= 10 ? (
                  <PaystackButton 
                    className="bg-black text-white font-black px-10 py-3 rounded-xl hover:bg-cyan-500 transition shadow-lg"
                    email={generatedEmail} // FAKE EMAIL GENERATED
                    amount={selectedVoucher.price * quantity * 100}
                    publicKey={process.env.NEXT_PUBLIC_PAYSTACK_KEY}
                    text="PAY NOW"
                    onSuccess={handlePaystackSuccess}
                  />
                ) : (
                  <button disabled className="bg-gray-200 text-gray-400 font-black px-10 py-3 rounded-xl">ENTER PHONE</button>
                )}
                <button onClick={() => setSelectedVoucher(null)} className="text-gray-400 hover:text-black"><X/></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
