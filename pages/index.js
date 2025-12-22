import { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { PaystackButton } from 'react-paystack';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { ShoppingCart, Search, History, Check, X } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'retrieve'
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState('');
  const [retrievePhone, setRetrievePhone] = useState('');
  const [retrievedData, setRetrievedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const vouchers = [
    { id: 'WASSCE', name: 'WASSCE Checker', color: 'text-neonBlue border-neonBlue shadow-[0_0_15px_#00f3ff]', price: 30 },
    { id: 'BECE', name: 'BECE Checker', color: 'text-neonPink border-neonPink shadow-[0_0_15px_#ff00ff]', price: 30 },
    { id: 'PLACEMENT', name: 'School Placement', color: 'text-neonGreen border-neonGreen shadow-[0_0_15px_#00ff41]', price: 30 },
  ];

  const handlePaystackSuccess = async (reference) => {
    const loadingToast = toast.loading('Verifying & Fetching Vouchers...');
    try {
      const res = await axios.post('/api/verify-payment', {
        reference: reference.reference,
        quantity,
        type: selectedVoucher.id,
        phone
      });

      toast.dismiss(loadingToast);
      toast.success('Purchase Successful!');
      
      // Redirect to Thank You page with actual data
      // We pass data via state/storage or query (encrypted usually, but simple query for now)
      localStorage.setItem('lastOrder', JSON.stringify(res.data.vouchers));
      router.push(`/thank-you?ref=${reference.reference}`);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || 'Verification Failed');
    }
  };

  const handleRetrieve = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/retrieve', { phone: retrievePhone });
      setRetrievedData(res.data);
    } catch (err) {
      toast.error("Could not fetch history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-200 p-4 md:p-8 bg-[url('/grid.svg')]">
      <Head><title>NeonCheck | WAEC Services</title></Head>
      <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />

      {/* Header */}
      <header className="flex justify-between items-center max-w-6xl mx-auto mb-16 relative z-10">
        <div className="text-3xl font-extrabold italic tracking-tighter">
          <span className="text-neonBlue">NEON</span>CHECK
        </div>
        <div className="flex bg-gray-900 rounded-full p-1 border border-gray-700">
          <button 
            onClick={() => setActiveTab('buy')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'buy' ? 'bg-neonBlue text-black shadow-[0_0_10px_#00f3ff]' : 'hover:text-white text-gray-400'}`}
          >
            Buy Vouchers
          </button>
          <button 
             onClick={() => setActiveTab('retrieve')}
             className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'retrieve' ? 'bg-neonPink text-black shadow-[0_0_10px_#ff00ff]' : 'hover:text-white text-gray-400'}`}
          >
            Retrieve
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto relative z-10">
        
        {/* BUY SECTION */}
        {activeTab === 'buy' && (
          <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                Secure. <br/> Fast. <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPink">Instant.</span>
              </h1>
              <p className="text-gray-400 text-lg mb-8 max-w-md">
                Purchase your WAEC result checkers instantly. Receive codes via SMS and download as PDF immediately.
              </p>
              
              {/* Steps */}
              <div className="flex gap-4 text-sm font-mono text-neonGreen">
                <div className="flex items-center gap-2"><Check size={16}/> Select Voucher</div>
                <div className="flex items-center gap-2"><Check size={16}/> Pay with MoMo</div>
                <div className="flex items-center gap-2"><Check size={16}/> Get Code</div>
              </div>
            </div>

            <div className="grid gap-4">
              {vouchers.map((v) => (
                <div 
                  key={v.id}
                  onClick={() => setSelectedVoucher(v)}
                  className={`relative p-6 rounded-xl border transition-all cursor-pointer glass-panel overflow-hidden group
                    ${selectedVoucher?.id === v.id ? v.color + ' bg-white/5' : 'border-gray-800 hover:border-gray-600'}
                  `}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                    <ShoppingCart size={100} />
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{v.name}</h3>
                  <p className="text-gray-400">Instantly available</p>
                  <div className="mt-4 text-3xl font-mono font-bold">GHS {v.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* RETRIEVE SECTION */}
        {activeTab === 'retrieve' && (
          <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="max-w-2xl mx-auto">
            <div className="glass-panel p-8 rounded-2xl border border-gray-800">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-neonPink">
                <History /> Retrieve Past Orders
              </h2>
              <form onSubmit={handleRetrieve} className="flex gap-4 mb-8">
                <input 
                  type="tel"
                  placeholder="Enter Phone Number"
                  value={retrievePhone}
                  onChange={(e) => setRetrievePhone(e.target.value)}
                  className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-neonPink text-white placeholder-gray-600"
                />
                <button disabled={loading} className="bg-neonPink text-black font-bold px-6 rounded-lg hover:bg-white transition disabled:opacity-50">
                  {loading ? '...' : 'Search'}
                </button>
              </form>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {retrievedData && retrievedData.length === 0 && <p className="text-center text-gray-500">No records found.</p>}
                {retrievedData?.map((item, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded border-l-2 border-neonBlue flex justify-between items-center">
                    <div>
                      <span className="text-xs text-gray-500 block">{new Date(item.created_at).toLocaleDateString()}</span>
                      <span className="font-bold text-neonBlue">{item.type}</span>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm text-gray-400">Serial: {item.serial}</div>
                      <div className="text-lg tracking-widest">{item.pin}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* CHECKOUT MODAL */}
      <AnimatePresence>
        {selectedVoucher && activeTab === 'buy' && (
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            className="fixed bottom-0 left-0 w-full z-50 bg-[#0a0a0a] border-t border-gray-800 p-6 shadow-2xl"
          >
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedVoucher(null)} className="p-2 hover:bg-gray-800 rounded-full"><X/></button>
                <div>
                  <p className="text-gray-400 text-sm">Buying</p>
                  <h3 className="text-xl font-bold text-white">{selectedVoucher.name}</h3>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap justify-center">
                
                {/* Quantity Control */}
                <div className="flex items-center bg-gray-900 rounded-lg border border-gray-800">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-gray-800">-</button>
                  <input 
                    type="number" value={quantity} readOnly
                    className="w-12 text-center bg-transparent font-bold focus:outline-none"
                  />
                  <button onClick={() => setQuantity(Math.min(50, quantity + 1))} className="px-4 py-3 hover:bg-gray-800">+</button>
                </div>

                <input 
                  type="tel"
                  placeholder="Your Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 w-48 focus:border-neonBlue outline-none"
                />

                <div className="text-right mr-4">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-neonBlue">GHS {(selectedVoucher.price * quantity).toFixed(2)}</p>
                </div>

                {phone.length >= 10 ? (
                  <PaystackButton 
                    className="bg-neonBlue text-black font-extrabold px-8 py-4 rounded-lg hover:shadow-[0_0_20px_#00f3ff] transition transform hover:-translate-y-1"
                    email="customer@neoncheck.com" // Placeholder, irrelevant for logic
                    amount={selectedVoucher.price * quantity * 100}
                    publicKey={process.env.NEXT_PUBLIC_PAYSTACK_KEY}
                    text="PAY NOW"
                    onSuccess={handlePaystackSuccess}
                    onClose={() => toast.error("Payment Cancelled")}
                    metadata={{ custom_fields: [{ display_name: "Phone", variable_name: "phone", value: phone }] }}
                  />
                ) : (
                  <button disabled className="bg-gray-800 text-gray-500 font-bold px-8 py-4 rounded-lg cursor-not-allowed">
                    Enter Phone
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
