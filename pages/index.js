import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { PaystackButton } from 'react-paystack';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { 
  ShoppingCart, Zap, X, CheckCircle2, 
  History, ArrowRight, ShieldCheck, 
  Sparkles, ZapOff, MessageSquare, 
  MousePointer2, CreditCard, Send
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
    { id: 'WASSCE', name: 'WASSCE', full: 'WASSCE Results Checker', color: 'text-blue-600', border: 'border-blue-100', bg: 'bg-blue-50', price: 30 },
    { id: 'BECE', name: 'BECE', full: 'BECE Results Checker', color: 'text-indigo-600', border: 'border-indigo-100', bg: 'bg-indigo-50', price: 30 },
    { id: 'PLACEMENT', name: 'CSSPS', full: 'School Placement Voucher', color: 'text-violet-600', border: 'border-violet-100', bg: 'bg-violet-50', price: 30 },
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
      toast.error('Verification failed. Please contact support with your reference.');
      toast.dismiss(t);
    }
  };

  const paystackProps = {
    email: phone ? `${phone}@waecghcheckers.com` : 'customer@waecghcheckers.com',
    amount: Math.round((selectedVoucher?.price || 0) * quantity * 100),
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
    text: "Confirm & Pay",
    onSuccess: (ref) => handleSuccess(ref),
    onClose: () => toast("Transaction paused", { icon: '⚠️' }),
    currency: "GHS",
    reference: `WGC-${Math.floor(Math.random() * 1000000000)}`
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans selection:bg-blue-100">
      <Head><title>Waec GH Checkers | Instant Results Vouchers</title></Head>
      <Toaster position="top-center" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-800 uppercase">Waec GH <span className="text-blue-600">Checkers</span></span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => document.getElementById('how-it-works').scrollIntoView({behavior:'smooth'})} className="hidden lg:block text-[11px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest">Process</button>
            <button onClick={() => document.getElementById('history').scrollIntoView({behavior:'smooth'})} className="hidden lg:block text-[11px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest">History</button>
            <div className="px-4 py-2 bg-emerald-50 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">System Live</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-8">
            <Sparkles size={14} /> Official WAEC Voucher Portal
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9]">
            Check your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Results</span> instantly.
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            Waec GH Checkers provides the most reliable way to get your WASSCE, BECE, and Placement vouchers in seconds.
          </p>
        </div>

        {/* Voucher Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-32">
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
                  <div className="absolute top-6 right-6 px-4 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><ZapOff size={12} /> Out of Stock</div>
                )}
                <div className={`w-14 h-14 ${v.bg} ${v.color} rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform`}>
                  <ShoppingCart size={28} />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-2">{v.name}</h3>
                <p className="text-slate-400 font-medium mb-12">{v.full}</p>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-black text-slate-900">₵{v.price}</span>
                  <div className={`p-4 rounded-2xl ${isOutOfStock ? 'bg-slate-100' : 'bg-blue-600 text-white shadow-xl shadow-blue-200'} transition-all`}>
                    <ArrowRight size={20} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* How It Works */}
        <section id="how-it-works" className="mb-40">
          <div className="text-center mb-16">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-blue-600 mb-4">The Process</h2>
            <p className="text-4xl font-black">How it works</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <MousePointer2 />, title: "Select Voucher", desc: "Choose the specific result checker or placement voucher you need." },
              { icon: <CreditCard />, title: "Quick Payment", desc: "Pay securely with Mobile Money or Bank Card via Paystack." },
              { icon: <Send />, title: "Instant Delivery", desc: "Receive your codes instantly on your screen and via SMS." }
            ].map((step, i) => (
              <div key={i} className="text-center p-8">
                <div className="w-16 h-16 bg-white shadow-xl shadow-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-8 text-blue-600 border border-slate-50">
                  {step.icon}
                </div>
                <h4 className="text-xl font-bold mb-4">{step.title}</h4>
                <p className="text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* History Section */}
        <section id="history" className="bg-slate-900 rounded-[4rem] p-12 md:p-24 text-white relative overflow-hidden mb-32">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="relative z-10 grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black mb-6">Lost your code?</h2>
              <p className="text-slate-400 text-lg mb-10">We keep a history of your purchases. Enter your phone number to retrieve them instantly.</p>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  const res = await axios.post('/api/retrieve', { phone: retrievePhone });
                  setRetrievedData(res.data);
                } catch (e) { toast.error("No records found"); }
                setLoading(false);
              }} className="flex flex-col sm:flex-row gap-4 p-2 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10">
                <input type="tel" placeholder="Phone used for purchase" value={retrievePhone} onChange={(e) => setRetrievePhone(e.target.value)} className="flex-1 bg-transparent px-8 py-5 outline-none font-bold text-lg" />
                <button className="bg-blue-600 text-white font-black px-10 py-5 rounded-[1.5rem] hover:bg-white hover:text-blue-600 transition-all text-xs uppercase tracking-widest">{loading ? 'Searching...' : 'Retrieve'}</button>
              </form>
            </div>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
              {retrievedData?.map((item, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center group">
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{item.type}</p>
                    <p className="text-xs text-slate-400">{item.serial}</p>
                  </div>
                  <p className="text-2xl font-black tracking-tighter">{item.pin}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto mb-40">
          <div className="text-center mb-16">
             <MessageSquare className="mx-auto text-blue-600 mb-6" size={32} />
             <h2 className="text-4xl font-black">Common Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-10 py-8 text-left flex justify-between items-center font-bold text-lg text-slate-800">
                  {f.q}
                  <div className={`transition-transform ${openFaq === i ? 'rotate-45' : ''}`}><X size={20} className="text-slate-300" /></div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-10 pb-8 text-slate-500 font-medium">
                      {f.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Checkout Drawer */}
      <AnimatePresence>
        {selectedVoucher && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 inset-x-0 z-[60] p-6">
            <div className="max-w-5xl mx-auto bg-white border border-slate-200 p-8 rounded-[3.5rem] shadow-2xl">
              <div className="flex flex-col lg:flex-row items-center gap-10">
                <div className="flex-1 flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shrink-0"><ShoppingCart size={28}/></div>
                  <div>
                    <h4 className="font-black text-2xl mb-1">{selectedVoucher?.name}</h4>
                    <p className="text-blue-600 font-bold uppercase text-[10px] tracking-widest">Total: GHS {((selectedVoucher?.price || 0) * quantity).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="flex items-center bg-slate-50 rounded-2xl p-2 border border-slate-100">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 font-black">-</button>
                    <span className="w-10 text-center font-black">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="w-10 h-10 font-black">+</button>
                  </div>
                  <input type="tel" placeholder="Active Phone Number" value={phone} onChange={(e)=>setPhone(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 w-52 font-bold outline-none focus:ring-4 ring-blue-500/10 transition-all" />
                  {hasMounted && phone.length >= 10 ? (
                    <PaystackButton {...paystackProps} className="bg-blue-600 text-white font-black px-10 py-5 rounded-2xl hover:bg-slate-900 transition-all text-xs uppercase tracking-widest shadow-xl shadow-blue-200" />
                  ) : (
                    <button disabled className="bg-slate-100 text-slate-400 font-black px-10 py-5 rounded-2xl text-xs uppercase tracking-widest">Phone Required</button>
                  )}
                  <button onClick={() => setSelectedVoucher(null)} className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-red-500 bg-slate-50 rounded-full"><X size={20} /></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-20 text-center bg-slate-50 mt-20">
         <div className="flex items-center justify-center gap-3 mb-6">
            <ShieldCheck size={18} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Securely processed via Paystack</span>
         </div>
         <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Waec GH Checkers Infrastructure &copy; 2025</p>
      </footer>
    </div>
  );
}
