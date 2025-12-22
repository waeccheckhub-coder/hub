import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { PaystackButton } from 'react-paystack';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { 
  ShoppingCart, Zap, X, History, 
  ArrowRight, ShieldCheck, Sparkles, 
  ZapOff, MessageSquare, Smartphone, 
  CheckCircle, CreditCard, Send
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
  const [openFaq, setOpenFaq] = useState(null);

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
    { id: 'WASSCE', name: 'WASSCE', full: 'WASSCE Results Checker', price: 30 },
    { id: 'BECE', name: 'BECE', full: 'BECE Results Checker', price: 30 },
    { id: 'PLACEMENT', name: 'CSSPS', full: 'School Placement Voucher', price: 30 },
  ];

  const faqs = [
    { q: "How do I receive my voucher?", a: "Once your payment is confirmed, your serial and pin will appear on the 'Thank You' page and will also be sent to you via SMS immediately." },
    { q: "Can I buy more than one voucher?", a: "Yes. You can select up to 10 vouchers at once using the quantity selector in the checkout drawer." },
    { q: "What if I didn't get the SMS?", a: "Don't worry! Scroll down to our 'History' section, enter your phone number, and you can retrieve all your purchased codes for free." },
    { q: "Is my payment secure?", a: "Absolutely. We use Paystack, a PCI-certified payment processor, to handle all transactions. We never store your card or Momo details." }
  ];

  const handleSuccess = async (ref) => {
    const t = toast.loading('Verifying payment & generating codes...');
    try {
      const res = await axios.post('/api/verify-payment', { 
        reference: ref.reference, 
        quantity, 
        type: selectedVoucher?.id, 
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

  const paystackProps = {
    email: phone ? `${phone}@waeccheckers.com` : 'customer@waeccheckers.com',
    amount: Math.round((selectedVoucher?.price || 0) * quantity * 100),
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
    text: "Pay Now",
    onSuccess: (ref) => handleSuccess(ref),
    onClose: () => toast("Transaction paused", { icon: '⚠️' }),
    currency: "GHS",
    reference: `W-CH-${Math.floor(Math.random() * 1000000000)}`
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      <Head><title>WAEC Checkers | Buy Result Vouchers Online</title></Head>
      <Toaster position="top-center" />

      {/* Simplified Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 uppercase">WAEC<span className="text-blue-600">Checkers</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => document.getElementById('history').scrollIntoView({behavior:'smooth'})} className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase">Check History</button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-700 uppercase">Online</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-10 pb-20">
        {/* Simple Hero */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
            Get your checker <span className="text-blue-600 text-shadow-sm">instantly.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl font-medium">
            The fastest way to purchase WAEC, BECE, and Placement vouchers in Ghana.
          </p>
        </div>

        {/* Improved Voucher Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {vouchers.map((v) => {
            const isOutOfStock = stock[v.id] <= 0;
            const isSelected = selectedVoucher?.id === v.id;
            return (
              <div
                key={v.id}
                onClick={() => !isOutOfStock && setSelectedVoucher(v)}
                className={`group relative p-8 bg-white border-2 transition-all cursor-pointer rounded-xl ${
                    isSelected ? 'border-blue-600 shadow-lg' : 'border-transparent hover:border-slate-200 shadow-sm'
                } ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
              >
                {isOutOfStock && (
                  <div className="absolute top-4 right-4 text-[10px] font-bold text-red-500 uppercase">Sold Out</div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">{v.name}</h3>
                  <p className="text-sm text-slate-400 font-medium">{v.full}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-3xl font-black text-blue-600">GHS {v.price}</span>
                  <div className={`w-10 h-10 rounded flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* History Section - Simple Card */}
        <section id="history" className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-20 shadow-sm">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-100">
              <h2 className="text-2xl font-bold mb-2">Retrieve Voucher</h2>
              <p className="text-slate-500 text-sm mb-8">Can't find your code? Enter your phone number below to see your purchase history.</p>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  const res = await axios.post('/api/retrieve', { phone: retrievePhone });
                  setRetrievedData(res.data);
                } catch (e) { toast.error("No records found"); }
                setLoading(false);
              }} className="space-y-3">
                <input 
                  type="tel" 
                  placeholder="024XXXXXXX" 
                  value={retrievePhone} 
                  onChange={(e) => setRetrievePhone(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-3 rounded-lg outline-none focus:border-blue-600 transition-colors font-bold" 
                />
                <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm uppercase tracking-wider uppercase">
                  {loading ? 'Searching...' : 'Check History'}
                </button>
              </form>
            </div>
            <div className="p-8 bg-slate-50 max-h-[400px] overflow-y-auto">
              {!retrievedData ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 italic text-sm">
                   Your results will appear here...
                </div>
              ) : (
                <div className="space-y-3">
                  {retrievedData.map((item, i) => (
                    <div key={i} className="p-4 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase">{item.type}</p>
                        <p className="text-xs font-mono text-slate-400">{item.serial}</p>
                      </div>
                      <p className="text-xl font-black">{item.pin}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Simplified FAQ */}
        <section className="max-w-2xl mx-auto">
          <h2 className="text-center text-xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <div key={i} className="border border-slate-200 bg-white rounded-lg">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-6 py-4 text-left flex justify-between items-center font-bold text-slate-700 text-sm">
                  {f.q}
                  <X size={16} className={`text-slate-300 transition-transform ${openFaq === i ? 'rotate-45' : ''}`} />
                </button>
                {openFaq === i && <div className="px-6 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-4">{f.a}</div>}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modern Checkout Bottom Bar */}
      <AnimatePresence>
        {selectedVoucher && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-0 inset-x-0 z-[60] bg-white border-t border-slate-200 p-4 shadow-2xl">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-900 shrink-0"><ShoppingCart size={20}/></div>
                <div>
                  <h4 className="font-bold text-sm">{selectedVoucher?.name} x {quantity}</h4>
                  <p className="text-blue-600 font-black text-xs">GHS {((selectedVoucher?.price || 0) * quantity).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 rounded p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 font-bold">-</button>
                  <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="w-8 h-8 font-bold">+</button>
                </div>
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  value={phone} 
                  onChange={(e)=>setPhone(e.target.value)} 
                  className="bg-slate-100 border-none rounded px-4 py-2 w-40 text-sm font-bold outline-none focus:ring-2 ring-blue-600" 
                />
                <PaystackButton 
                  {...paystackProps} 
                  className={`px-6 py-2 rounded text-sm font-bold transition-all ${phone.length >= 10 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  disabled={phone.length < 10}
                />
                <button onClick={() => setSelectedVoucher(null)} className="p-2 text-slate-300 hover:text-red-500"><X size={20} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-12 text-center border-t border-slate-100 bg-white">
         <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <ShieldCheck size={14} className="text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Secure Payments via Paystack</span>
         </div>
         <p className="text-[10px] font-medium text-slate-400">© 2025 WAEC Checkers. All rights reserved.</p>
      </footer>
    </div>
  );
}
