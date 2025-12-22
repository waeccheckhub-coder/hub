import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { PaystackButton } from 'react-paystack';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { 
  ShoppingCart, Zap, History, 
  ShieldCheck, Search, ChevronRight 
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [phone, setPhone] = useState('');
  const [quantities, setQuantities] = useState({ WASSCE: 1, BECE: 1, PLACEMENT: 1 });
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

  const handleQtyChange = (id, delta) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.min(10, Math.max(1, prev[id] + delta))
    }));
  };

  const vouchers = [
    { id: 'WASSCE', name: 'WASSCE', full: 'WASSCE Results Checker', price: 30 },
    { id: 'BECE', name: 'BECE', full: 'BECE Results Checker', price: 30 },
    { id: 'PLACEMENT', name: 'CSSPS', full: 'School Placement Voucher', price: 30 },
  ];

  const handleSuccess = async (ref, id) => {
    const t = toast.loading('Verifying payment...');
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
      toast.error('Verification failed. Contact support.');
      toast.dismiss(t);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      <Head><title>WAEC Checkers | Instant Buy</title></Head>
      <Toaster position="top-center" />

      {/* Simplified Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-blue-600 fill-blue-600" />
            <span className="text-xl font-black tracking-tighter uppercase">WAEC<span className="text-blue-600">Checkers</span></span>
          </div>
          <button onClick={() => document.getElementById('history').scrollIntoView({behavior:'smooth'})} className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">History</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-12 pb-24">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">Buy Instantly.</h1>
          <p className="text-slate-500 font-medium">Enter your number and pay. No registration required.</p>
        </div>

        {/* Interactive Voucher Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {vouchers.map((v) => {
            const isOutOfStock = stock[v.id] <= 0;
            const currentQty = quantities[v.id];
            const totalPrice = v.price * currentQty;
            
            const paystackProps = {
              email: phone ? `${phone}@waeccheckers.com` : 'customer@waeccheckers.com',
              amount: Math.round(totalPrice * 100),
              publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
              text: `Pay GHS ${totalPrice}`,
              onSuccess: (ref) => handleSuccess(ref, v.id),
              onClose: () => toast("Payment cancelled", { icon: '⚠️' }),
              currency: "GHS",
              reference: `W-${v.id}-${Math.floor(Math.random() * 1000000)}`
            };

            return (
              <div key={v.id} className={`bg-white border-2 border-slate-100 rounded-[2rem] p-6 shadow-sm transition-all hover:border-blue-600/20 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}>
                <div className="mb-6">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Official</span>
                  <h3 className="text-2xl font-black mt-3 tracking-tighter">{v.name}</h3>
                  <p className="text-xs text-slate-400 font-bold">{v.full}</p>
                </div>

                <div className="space-y-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-xs font-black ml-2 uppercase text-slate-400">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleQtyChange(v.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-black">-</button>
                      <span className="font-black text-sm w-4 text-center">{currentQty}</span>
                      <button onClick={() => handleQtyChange(v.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-black">+</button>
                    </div>
                  </div>

                  {/* Phone Input Inline */}
                  <div className="relative">
                    <input 
                      type="tel" 
                      placeholder="Momo Number (024...)" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 ring-blue-600/20 focus:bg-white transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* Dynamic Payment Button */}
                  {hasMounted && (
                    <PaystackButton 
                      {...paystackProps} 
                      className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${phone.length >= 10 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-slate-900' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                      disabled={phone.length < 10 || isOutOfStock}
                    />
                  )}
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 opacity-30">
                  <ShieldCheck size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Secure Payment</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* History Section stays as is for those who need it */}
        <section id="history" className="bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-white overflow-hidden relative">
          <div className="grid md:grid-cols-2 gap-12 relative z-10">
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase mb-4">Check Purchase History</h2>
              <p className="text-slate-400 text-sm mb-8">Lost your codes? Enter your phone number to see all your vouchers.</p>
              <div className="flex gap-2">
                <input 
                  type="tel" 
                  placeholder="024XXXXXXX" 
                  value={retrievePhone}
                  onChange={(e) => setRetrievePhone(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-6 py-4 outline-none focus:bg-white/20 transition-all font-bold"
                />
                <button 
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const res = await axios.post('/api/retrieve', { phone: retrievePhone });
                      setRetrievedData(res.data);
                    } catch (e) { toast.error("No records found"); }
                    setLoading(false);
                  }}
                  className="bg-blue-600 px-6 rounded-xl hover:bg-white hover:text-blue-600 transition-all"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 min-h-[200px]">
               {retrievedData ? (
                 <div className="space-y-3">
                   {retrievedData.map((item, i) => (
                     <div key={i} className="flex justify-between items-center p-4 bg-white/10 rounded-lg">
                       <div>
                         <p className="text-[10px] font-black text-blue-400 uppercase">{item.type}</p>
                         <p className="text-[10px] font-mono opacity-40">{item.serial}</p>
                       </div>
                       <p className="font-black text-xl">{item.pin}</p>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="h-full flex items-center justify-center text-white/20 text-[10px] font-black uppercase tracking-widest">Results will appear here</div>
               )}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 text-center border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-2">Powered by Paystack</p>
        <p className="text-[9px] font-bold text-slate-400">© 2025 WAEC GH Checkers Infrastructure</p>
      </footer>
    </div>
  );
}
