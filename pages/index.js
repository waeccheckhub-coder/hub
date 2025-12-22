import { useState, useEffect } from 'react';
import Head from 'next/head';
import { PaystackButton } from 'react-paystack';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

export default function Home() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [quantities, setQuantities] = useState({ WASSCE: 1, BECE: 1, CSSPS: 1 });
  const [retrieveInput, setRetrieveInput] = useState('');
  const [retrievedData, setRetrievedData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Initial stock set to 0 to prevent accidental sales before checkStock completes
  const [stock, setStock] = useState({ WASSCE: 0, BECE: 0, CSSPS: 0 });

  useEffect(() => {
    setHasMounted(true);
    checkStock();
  }, []);

  const checkStock = async () => {
    try {
      const res = await axios.get('/api/public-stock');
      setStock(res.data);
    } catch (e) { 
      console.error("Stock check failed"); 
      // Fallback: assume in stock if API fails, or keep at 0 for safety
    }
  };

  const handleSuccess = async (ref, id) => {
    const t = toast.loading('Verifying payment...');
    try {
      const res = await axios.post('/api/verify-payment', { 
        reference: ref.reference, 
        quantity: quantities[id], 
        type: id, 
        phone,
        name 
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

  const retrieveVouchers = async () => {
    if (!retrieveInput) return toast.error("Please enter phone or email");
    setLoading(true);
    try {
      const isEmail = retrieveInput.includes('@');
      const payload = isEmail ? { email: retrieveInput } : { phone: retrieveInput };
      const res = await axios.post('/api/retrieve', payload);
      setRetrievedData(res.data);
      toast.success(`Found ${res.data.length} vouchers`);
    } catch (e) {
      toast.error("No vouchers found.");
    }
    setLoading(false);
  };

  const PRICE = 30;

  return (
    <div className="min-h-screen aura-bg text-[#1e293b] font-outfit selection:bg-[#4f46e5] selection:text-white">
      <Head>
        <title>waeccardsonline — Instant WASSCE, BECE & CSSPS Delivery</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <Toaster position="top-center" />

      <div className="max-w-[1100px] mx-auto px-5 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-[46px] h-[46px] rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] flex items-center justify-center text-white font-bold text-xl shadow-[0_4px_15px_rgba(79,70,229,0.3)] font-space">
              AC
            </div>
            <div>
              <div className="font-extrabold text-[17px]">Waec Gh Cards Online</div>
              <div className="text-sm text-[#64748b]">Instant voucher delivery</div>
            </div>
          </div>
          <nav className="flex gap-5">
            {['How it works', 'FAQ', 'Retrieve', 'Buy Now'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '')}`} className="text-[#64748b] font-semibold text-[15px] hover:text-[#4f46e5] transition-colors uppercase tracking-tight">
                {item}
              </a>
            ))}
          </nav>
        </header>

        {/* Hero Section */}
        <section className="grid md:grid-cols-[1fr_420px] gap-8 items-start mb-10" id="buynow">
          <div className="pt-5">
            <h1 className="font-space text-4xl md:text-[42px] font-bold leading-[1.1] mb-4 tracking-[-1px]">
              Buy WASSCE, BECE & CSSPS <span className="text-[#4f46e5]">Instantly</span>
            </h1>
            <p className="text-[#64748b] text-lg mb-6">Authentic WAEC result checkers and School Placement vouchers delivered via SMS.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => document.getElementById('wassceForm').scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] text-white px-8 py-4 rounded-[14px] font-bold shadow-[0_8px_20px_rgba(79,70,229,0.2)] hover:-translate-y-0.5 transition-all"
              >
                Get Started
              </button>
            </div>
            <div className="mt-4 text-[#64748b] font-medium">
              <strong>Price:</strong> GHS 30 per voucher
            </div>
          </div>

          {/* WASSCE / NOVDEC Card */}
          <div className={`glass-card p-6 md:p-8 relative overflow-hidden transition-all duration-500 ${stock.WASSCE <= 0 ? 'opacity-60 grayscale-[0.5]' : ''}`} id="wassceForm">
            {stock.WASSCE <= 0 && (
              <div className="absolute top-4 right-[-35px] bg-red-500 text-white text-[10px] font-bold py-1 px-10 rotate-45 z-10 shadow-md">
                OUT OF STOCK
              </div>
            )}
            <h3 className="text-xl font-bold mb-1 text-indigo-700">WASSCE / NOVDEC</h3>
            <p className="text-sm text-[#64748b] mb-4">Results Checker Voucher — Delivered via SMS.</p>
            
            <div className={`space-y-4 ${stock.WASSCE <= 0 ? 'pointer-events-none' : ''}`}>
              <div>
                <label className="label">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="John Doe" disabled={stock.WASSCE <= 0} />
              </div>
              <div>
                <label className="label">Phone number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="0244123456" disabled={stock.WASSCE <= 0} />
              </div>
              <div>
                <label className="label">Quantity</label>
                <select 
                  className="input-field w-24" 
                  value={quantities.WASSCE} 
                  onChange={e => setQuantities({...quantities, WASSCE: Number(e.target.value)})}
                  disabled={stock.WASSCE <= 0}
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1}</option>
                  ))}
                </select>
              </div>

              {hasMounted && (
                <PaystackButton 
                  email={phone ? `${phone}@waeccheckers.com` : 'customer@waeccheckers.com'}
                  amount={PRICE * quantities.WASSCE * 100}
                  publicKey={process.env.NEXT_PUBLIC_PAYSTACK_KEY}
                  text={stock.WASSCE <= 0 ? 'Unavailable' : `Pay GHS ${PRICE * quantities.WASSCE}`}
                  onSuccess={(ref) => handleSuccess(ref, 'WASSCE')}
                  onClose={() => toast.error("Payment cancelled")}
                  currency="GHS"
                  disabled={stock.WASSCE <= 0}
                  className={`w-full py-4 rounded-[14px] font-bold transition-all ${stock.WASSCE <= 0 ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] text-white shadow-lg shadow-indigo-200 hover:-translate-y-1'}`}
                />
              )}
            </div>
          </div>
        </section>

        {/* BECE and CSSPS Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* BECE Card */}
            <section className={`glass-card p-8 relative overflow-hidden transition-all duration-500 ${stock.BECE <= 0 ? 'opacity-60 grayscale-[0.5]' : ''}`} id="beceForm">
            {stock.BECE <= 0 && (
              <div className="absolute top-4 right-[-35px] bg-red-500 text-white text-[10px] font-bold py-1 px-10 rotate-45 z-10 shadow-md">
                OUT OF STOCK
              </div>
            )}
            <h2 className="text-xl font-bold mb-1 text-indigo-700">BECE Voucher</h2>
            <p className="text-sm text-[#64748b] mb-6">Purchase BECE checker voucher instantly.</p>
            
            <div className={`space-y-4 ${stock.BECE <= 0 ? 'pointer-events-none' : ''}`}>
                <div>
                    <label className="label">Full Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="input-field" disabled={stock.BECE <= 0} />
                </div>
                <div>
                    <label className="label">Phone number</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="0244123456" disabled={stock.BECE <= 0} />
                </div>
                <div>
                    <label className="label">Quantity</label>
                    <select 
                    className="input-field w-24" 
                    value={quantities.BECE} 
                    onChange={e => setQuantities({...quantities, BECE: Number(e.target.value)})}
                    disabled={stock.BECE <= 0}
                    >
                    {[...Array(10)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1}</option>
                    ))}
                    </select>
                </div>
                {hasMounted && (
                    <PaystackButton 
                    email={phone ? `${phone}@waeccheckers.com` : 'customer@waeccheckers.com'}
                    amount={PRICE * quantities.BECE * 100}
                    publicKey={process.env.NEXT_PUBLIC_PAYSTACK_KEY}
                    text={stock.BECE <= 0 ? 'Unavailable' : `Pay GHS ${PRICE * quantities.BECE}`}
                    onSuccess={(ref) => handleSuccess(ref, 'BECE')}
                    currency="GHS"
                    disabled={stock.BECE <= 0}
                    className={`w-full py-4 rounded-[14px] font-bold transition-all ${stock.BECE <= 0 ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] text-white shadow-lg shadow-indigo-200 hover:-translate-y-1'}`}
                    />
                )}
            </div>
            </section>

            {/* CSSPS Placement Card */}
            {/* CSSPS Placement Card - Only renders if stock > 0 */}
{/* CSSPS Placement Card - Now stays visible but grays out when empty */}
<section className={`glass-card p-8 relative overflow-hidden transition-all duration-500 ${stock.CSSPS <= 0 ? 'opacity-60 grayscale-[0.8]' : ''}`} id="csspsForm">
  {stock.CSSPS <= 0 && (
    <div className="absolute top-4 right-[-35px] bg-red-500 text-white text-[10px] font-bold py-1 px-10 rotate-45 z-10 shadow-md">
      OUT OF STOCK
    </div>
  )}
  <h2 className="text-xl font-bold mb-1 text-indigo-700">School Placement (CSSPS)</h2>
  <p className="text-sm text-[#64748b] mb-6">Buy CSSPS Placement vouchers online.</p>
  
  <div className={`space-y-4 ${stock.CSSPS <= 0 ? 'pointer-events-none' : ''}`}>
      <div>
          <label className="label">Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="input-field" disabled={stock.CSSPS <= 0} />
      </div>
      <div>
          <label className="label">Phone number</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="0244123456" disabled={stock.CSSPS <= 0} />
      </div>
      <div>
          <label className="label">Quantity</label>
          <select 
            className="input-field w-24" 
            value={quantities.CSSPS} 
            onChange={e => setQuantities({...quantities, CSSPS: Number(e.target.value)})}
            disabled={stock.CSSPS <= 0}
          >
            {[...Array(10)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </select>
      </div>
      {hasMounted && (
          <PaystackButton 
            email={phone ? `${phone}@waeccheckers.com` : 'customer@waeccheckers.com'}
            amount={PRICE * quantities.CSSPS * 100}
            publicKey={process.env.NEXT_PUBLIC_PAYSTACK_KEY}
            text={stock.CSSPS <= 0 ? 'Unavailable' : `Pay GHS ${PRICE * quantities.CSSPS}`}
            onSuccess={(ref) => handleSuccess(ref, 'CSSPS')}
            currency="GHS"
            disabled={stock.CSSPS <= 0}
            className={`w-full py-4 rounded-[14px] font-bold transition-all ${stock.CSSPS <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] text-white shadow-lg shadow-indigo-200'}`}
          />
      )}
  </div>
</section>
)}
        </div>

        {/* Retrieve Section */}
        <section id="retrieve" className="glass-card p-8 mb-8">
          <h3 className="text-xl font-bold mb-1">Retrieve Purchased Vouchers</h3>
          <p className="text-sm text-[#64748b] mb-6">Enter the phone number or email you used to buy vouchers.</p>
          
          <div className="flex flex-col md:flex-row gap-3">
            <input 
              value={retrieveInput}
              onChange={e => setRetrieveInput(e.target.value)}
              className="input-field flex-1" 
              placeholder="0244123456 or example@domain.com" 
            />
            <button 
              onClick={retrieveVouchers}
              className="bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] text-white px-8 py-3 rounded-[14px] font-bold transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Retrieve'}
            </button>
          </div>

          {retrievedData && (
            <div className="mt-6 space-y-2 p-4 rounded-2xl bg-white/50 border border-dashed border-[#4f46e5]">
              {retrievedData.map((v, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-[#e2e8f0] font-space text-sm">
                  {v.type} — {v.serial} | <span className="font-bold text-[#4f46e5]">{v.pin}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Info Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <section id="howitworks" className="glass-card p-6">
            <h3 className="font-bold mb-3">How it works</h3>
            <ol className="text-sm text-[#64748b] space-y-2 ml-4 list-decimal">
              <li>Fill details and complete payment via Paystack.</li>
              <li>We verify payment and reserve unused voucher(s).</li>
              <li>Voucher(s) are sent instantly to your phone via SMS.</li>
            </ol>
          </section>

          <section id="faq" className="glass-card p-6">
            <h3 className="font-bold mb-3">FAQ</h3>
            <div className="text-sm text-[#64748b] space-y-2">
              <p><strong>Delivery Time:</strong> Instant after payment.</p>
              <p><strong>Didn't receive SMS?</strong> Reach out via our support lines immediately.</p>
            </div>
          </section>
        </div>

        <footer className="text-center py-10 text-[#64748b] text-sm font-medium">
          © 2025 Waec Gh Cards Online. Securely Powered by Paystack.
        </footer>
      </div>

      <style jsx global>{`
        .aura-bg {
          background: #f4f7fc;
          background-image: 
            radial-gradient(at 0% 0%, rgba(6, 182, 212, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(79, 70, 229, 0.15) 0px, transparent 50%);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid #ffffff;
          border-radius: 24px;
          box-shadow: 0 10px 30px -10px rgba(79, 70, 229, 0.15);
        }
        .label {
          display: block;
          margin-bottom: 6px;
          font-weight: 700;
          font-size: 14px;
          color: #4f46e5;
        }
        .input-field {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          background: #ffffff;
          font-size: 15px;
          transition: 0.3s;
          outline: none;
        }
        .input-field:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-space { font-family: 'Space Grotesk', sans-serif; }
      `}</style>
    </div>
  );
}
