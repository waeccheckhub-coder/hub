import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { 
  LayoutDashboard, Database, LogOut, Trash2, 
  UploadCloud, FileSpreadsheet, Fingerprint, Plus, 
  ShieldCheck, ArrowRight, X 
} from 'lucide-react';

export default function Admin() {
  const sessionContext = useSession(); // Don't destructure yet
  const router = useRouter();

  // Add this safety check
  const session = sessionContext?.data;
  const status = sessionContext?.status;

  const [stats, setStats] = useState({ total: 0, sold: 0, available: 0 });
  // ... rest of your states
  
  const [stats, setStats] = useState({ total: 0, sold: 0, available: 0 });
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState('manual');
  const [type, setType] = useState('WASSCE');
  
  // File & Manual States
  const [file, setFile] = useState(null);
  const [manualSerial, setManualSerial] = useState('');
  const [manualPin, setManualPin] = useState('');
  const fileInputRef = useRef(null);

  // Security Redirect: If unauthenticated, send to login page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  // Only fetch data if authenticated
  useEffect(() => { 
    if (status === "authenticated") {
      fetchData(); 
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data.stats);
      setVouchers(res.data.recentVouchers);
    } catch (e) { 
      toast.error("Connection Interrupted"); 
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === "text/csv" || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
    } else {
      toast.error("Please upload a valid .csv file");
    }
  };

  const processUpload = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = { type };

    if (inputMode === 'manual') {
      if (!manualSerial || !manualPin) {
        setLoading(false);
        return toast.error("Incomplete manual entry");
      }
      formData.csvData = `${manualSerial}, ${manualPin}`;
      executeUpload(formData);
    } else {
      if (!file) {
        setLoading(false);
        return toast.error("No file selected");
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        formData.csvData = event.target.result;
        executeUpload(formData);
      };
      reader.readAsText(file);
    }
  };

  const executeUpload = async (payload) => {
    try {
      await axios.post('/api/admin/upload', payload);
      toast.success("Inventory Synchronized");
      setFile(null);
      setManualSerial('');
      setManualPin('');
      fetchData();
    } catch (e) {
      toast.error("Upload process failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle Loading State
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Fingerprint size={40} className="animate-pulse text-black/20" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Authenticating System...</span>
        </div>
      </div>
    );
  }

  // Guard: Don't render dashboard content if not logged in
  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans">
      <Toaster position="bottom-right" />
      
      {/* Precision Header */}
      <nav className="h-20 bg-white border-b border-black/[0.08] px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Fingerprint size={18} className="text-white" />
            </div>
            <span className="font-bold tracking-tighter text-lg uppercase">System Console</span>
          </div>
          <div className="h-6 w-[1px] bg-black/10"></div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-black/40 uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" /> Secure Protocol Active
          </div>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-black/40 hover:text-red-500 transition-colors"
        >
          Terminate Session <LogOut size={14} />
        </button>
      </nav>

      <main className="max-w-[1600px] mx-auto p-12 grid lg:grid-cols-12 gap-12">
        
        {/* Metric Cards */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total units', val: stats.total, color: 'bg-white text-black' },
            { label: 'Live Stock', val: stats.available, color: 'bg-black text-white' },
            { label: 'Units Sold', val: stats.sold, color: 'bg-white text-black' },
            { label: 'Health', val: '100%', color: 'bg-white text-emerald-600' }
          ].map((s, i) => (
            <div key={i} className={`p-8 border border-black/[0.05] rounded-sm ${s.color} flex flex-col justify-between h-40`}>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{s.label}</span>
              <span className="text-4xl font-light tracking-tighter">{s.val}</span>
            </div>
          ))}
        </div>

        {/* Input Terminal */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-black/10 rounded-sm p-10 sticky top-32">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-10 border-b border-black/5 pb-4">Inventory Intake</h2>
            
            <form onSubmit={processUpload} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-black/40 tracking-widest">Select Category</label>
                <select 
                  value={type} onChange={(e) => setType(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-black/10 py-3 font-bold outline-none focus:border-black transition-all appearance-none cursor-pointer"
                >
                  <option value="WASSCE">WASSCE RESULTS</option>
                  <option value="BECE">BECE RESULTS</option>
                  <option value="PLACEMENT">PLACEMENT VOUCHER</option>
                </select>
              </div>

              <div className="flex gap-4 p-1 bg-[#f0f0f0] rounded-sm">
                <button 
                  type="button" onClick={() => setInputMode('manual')}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${inputMode === 'manual' ? 'bg-white shadow-sm' : 'opacity-40'}`}
                >
                  Manual Entry
                </button>
                <button 
                  type="button" onClick={() => setInputMode('csv')}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${inputMode === 'csv' ? 'bg-white shadow-sm' : 'opacity-40'}`}
                >
                  File Upload
                </button>
              </div>

              {inputMode === 'manual' ? (
                <div className="space-y-6">
                  <input 
                    type="text" placeholder="SERIAL NUMBER" value={manualSerial}
                    onChange={(e) => setManualSerial(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-black/5 p-4 text-xs font-bold outline-none focus:border-black/20"
                  />
                  <input 
                    type="text" placeholder="PIN CODE" value={manualPin}
                    onChange={(e) => setManualPin(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-black/5 p-4 text-xs font-mono font-bold outline-none focus:border-black/20"
                  />
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all ${file ? 'border-emerald-500 bg-emerald-50' : 'border-black/10 hover:border-black/30'}`}
                >
                  <input type="file" hidden ref={fileInputRef} accept=".csv" onChange={handleFileChange} />
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileSpreadsheet className="text-emerald-600" />
                      <span className="text-[10px] font-black uppercase">{file.name}</span>
                      <button type="button" onClick={(e) => {e.stopPropagation(); setFile(null)}} className="text-red-500 text-[9px] font-bold">REMOVE</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <UploadCloud size={32} />
                      <span className="text-[10px] font-black uppercase">Click to Select CSV</span>
                    </div>
                  )}
                </div>
              )}

              <button 
                disabled={loading}
                className="w-full bg-black text-white py-5 flex items-center justify-center gap-3 group hover:bg-[#333] transition-all"
              >
                <span className="text-xs font-black uppercase tracking-[0.2em]">{loading ? 'Processing...' : 'Sync Inventory'}</span>
                {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-black/10 rounded-sm overflow-hidden">
            <div className="p-8 border-b border-black/5 flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Recent Database Records</h3>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-[#fcfcfc] border-b border-black/5 text-[9px] font-black uppercase tracking-widest text-black/40">
                <tr>
                  <th className="px-8 py-6">Identity</th>
                  <th className="px-8 py-6">Serial Ref</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Removal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {vouchers.map((v, i) => (
                  <tr key={i} className="hover:bg-[#f9f9f9] transition-colors group">
                    <td className="px-8 py-5 text-[11px] font-black">{v.type}</td>
                    <td className="px-8 py-5 text-[11px] font-mono opacity-50">{v.serial}</td>
                    <td className="px-8 py-5">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border ${v.status === 'sold' ? 'border-red-200 text-red-500' : 'border-emerald-200 text-emerald-500'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-black/10 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
