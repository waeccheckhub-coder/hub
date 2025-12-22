import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { LayoutDashboard, PlusCircle, Database, LogOut, Trash2, FileText, UserPlus, Save, AlertCircle } from 'lucide-react';

export default function Admin() {
  const [stats, setStats] = useState({ total: 0, sold: 0, available: 0 });
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState('manual'); // 'manual' or 'csv'
  
  // Form States
  const [type, setType] = useState('WASSCE');
  const [csvData, setCsvData] = useState('');
  const [manualSerial, setManualSerial] = useState('');
  const [manualPin, setManualPin] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data.stats);
      setVouchers(res.data.recentVouchers);
    } catch (e) { toast.error("Sync Error: Check database connection."); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let payload = { type };
    
    if (inputMode === 'manual') {
      if (!manualSerial || !manualPin) {
        setLoading(false);
        return toast.error("Please enter both Serial and PIN");
      }
      payload.csvData = `${manualSerial}, ${manualPin}`;
    } else {
      if (!csvData) {
        setLoading(false);
        return toast.error("Please paste CSV data");
      }
      payload.csvData = csvData;
    }

    try {
      await axios.post('/api/admin/upload', payload);
      toast.success(inputMode === 'manual' ? "Voucher saved!" : "Bulk import complete!");
      setCsvData('');
      setManualSerial('');
      setManualPin('');
      fetchData();
    } catch (e) { 
      toast.error(e.response?.data?.error || "Import failed"); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex text-slate-800 font-sans">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col hidden lg:flex shadow-sm">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Database size={20}/>
          </div>
          <span className="font-bold tracking-tight text-xl">PORTAL<span className="text-blue-600">HUB</span></span>
        </div>
        
        <nav className="space-y-1 flex-1">
          <button className="w-full flex items-center gap-4 px-5 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm border border-blue-100 transition-all">
            <LayoutDashboard size={18}/> INVENTORY
          </button>
        </nav>

        <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 uppercase">System Health</div>
           <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> DB Online
           </div>
        </div>

        <button className="flex items-center gap-4 px-5 py-3 text-slate-400 font-bold text-sm hover:text-red-500 transition-all">
          <LogOut size={18}/> SIGN OUT
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Stock Management</h1>
            <p className="text-slate-500 mt-1">Add, track, and monitor digital vouchers.</p>
        </header>

        {/* Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Stock', val: stats.total, color: 'text-slate-900', border: 'border-slate-200' },
            { label: 'Available', val: stats.available, color: 'text-blue-600', border: 'border-blue-200 bg-blue-50/30' },
            { label: 'Sold Units', val: stats.sold, color: 'text-slate-400', border: 'border-slate-100' }
          ].map((s, i) => (
            <div key={i} className={`bg-white p-8 rounded-3xl border ${s.border} shadow-sm transition-transform hover:scale-[1.02]`}>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
               <h3 className={`text-4xl font-bold ${s.color}`}>{s.val}</h3>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm sticky top-8">
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                <h2 className="text-xl font-bold">Add Vouchers</h2>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setInputMode('manual')}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-md transition-all ${inputMode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Manual
                  </button>
                  <button 
                    onClick={() => setInputMode('csv')}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-md transition-all ${inputMode === 'csv' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Bulk CSV
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Category</label>
                  <select 
                    value={type} onChange={(e)=>setType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 ring-blue-500/10 focus:border-blue-500"
                  >
                    <option value="WASSCE">WASSCE Results</option>
                    <option value="BECE">BECE Results</option>
                    <option value="PLACEMENT">Placement Voucher</option>
                  </select>
                </div>

                {inputMode === 'manual' ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Serial Number</label>
                        <input 
                          type="text" value={manualSerial} onChange={(e)=>setManualSerial(e.target.value)}
                          placeholder="e.g., WAEC-12345"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">PIN Code</label>
                        <input 
                          type="text" value={manualPin} onChange={(e)=>setManualPin(e.target.value)}
                          placeholder="e.g., 987654321"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300">
                    <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Paste CSV Data (Serial, Pin)</label>
                    <textarea 
                      rows="8" value={csvData} onChange={(e)=>setCsvData(e.target.value)}
                      placeholder="SERIAL123, PIN456&#10;SERIAL789, PIN012"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-mono text-xs outline-none focus:border-blue-500"
                    ></textarea>
                    <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 rounded-xl text-blue-600 text-[10px] font-bold">
                       <AlertCircle size={14}/> <span>Ensure format is: Serial, PIN (one pair per line)</span>
                    </div>
                  </div>
                )}

                <button 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 active:scale-95"
                >
                  {loading ? 'Processing...' : (inputMode === 'manual' ? <Save size={18}/> : <FileText size={18}/>)}
                  {loading ? '' : (inputMode === 'manual' ? 'Save Voucher' : 'Import Batch')}
                </button>
              </form>
            </div>
          </div>

          {/* Activity Table */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <h2 className="text-xl font-bold">Latest Entries</h2>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter">Real-time</span>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5">Product</th>
                        <th className="px-8 py-5">Serial</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vouchers.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <span className="font-bold text-slate-900 text-sm">{v.type}</span>
                          </td>
                          <td className="px-8 py-5 font-mono text-xs text-slate-400 tracking-tighter uppercase">{v.serial}</td>
                          <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${v.status === 'sold' ? 'bg-pink-50 text-pink-600 border border-pink-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                                <Trash2 size={16}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
