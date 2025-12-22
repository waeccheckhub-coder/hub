import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { LayoutDashboard, PlusCircle, Database, LogOut, Trash2, Activity } from 'lucide-react';

export default function Admin() {
  const [stats, setStats] = useState({ total: 0, sold: 0, available: 0 });
  const [vouchers, setVouchers] = useState([]);
  const [csvData, setCsvData] = useState('');
  const [type, setType] = useState('WASSCE');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data.stats);
      setVouchers(res.data.recentVouchers);
    } catch (e) { toast.error("Database connection failed"); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!csvData) return toast.error("Please paste CSV data");
    setLoading(true);
    try {
      await axios.post('/api/admin/upload', { csvData, type });
      toast.success("Vouchers added successfully!");
      setCsvData('');
      fetchData();
    } catch (e) { toast.error("Upload failed"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      <Toaster />
      
      {/* Sidebar - Bright Neon Accents */}
      <aside className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col shadow-sm">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-200">
            <LayoutDashboard size={24}/>
          </div>
          <span className="font-black italic tracking-tighter text-2xl">NEON<span className="text-cyan-500">ADMIN</span></span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button className="w-full flex items-center gap-4 px-5 py-4 bg-cyan-50 text-cyan-600 rounded-2xl font-black text-sm border border-cyan-100 shadow-sm transition-all">
            <Database size={20}/> INVENTORY
          </button>
          <button className="w-full flex items-center gap-4 px-5 py-4 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-2xl font-bold text-sm transition-all">
            <Activity size={20}/> ANALYTICS
          </button>
        </nav>

        <button className="mt-auto flex items-center gap-4 px-5 py-4 text-pink-500 font-black text-sm hover:bg-pink-50 rounded-2xl transition-all border border-transparent hover:border-pink-100">
          <LogOut size={20}/> SIGN OUT
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight italic uppercase">Control <span className="text-cyan-500">Center.</span></h1>
            <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs">Voucher Management & System Health</p>
          </div>
        </header>

        {/* Stats Grid - High Saturation Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-10 rounded-[3rem] border-2 border-cyan-100 shadow-xl shadow-cyan-100/20">
            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-2">Total In Database</p>
            <h3 className="text-5xl font-black text-slate-900">{stats.total}</h3>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border-2 border-emerald-100 shadow-xl shadow-emerald-100/20">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Active Stock</p>
            <h3 className="text-5xl font-black text-slate-900">{stats.available}</h3>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border-2 border-pink-100 shadow-xl shadow-pink-100/20">
            <p className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em] mb-2">Revenue Sold</p>
            <h3 className="text-5xl font-black text-slate-900">{stats.sold}</h3>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Neon Upload Form */}
          <div className="lg:col-span-5">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-100/30 blur-3xl -z-10"></div>
              <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter">Add <span className="text-cyan-500">Inventory</span></h2>
              
              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Service Category</label>
                  <select 
                    value={type} onChange={(e)=>setType(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-slate-700 outline-none focus:border-cyan-400 transition-all appearance-none"
                  >
                    <option value="WASSCE">WASSCE Checker</option>
                    <option value="BECE">BECE Checker</option>
                    <option value="PLACEMENT">School Placement (CSSPS)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">CSV Format (Serial, PIN)</label>
                  <textarea 
                    rows="8" value={csvData} onChange={(e)=>setCsvData(e.target.value)}
                    placeholder="S12345, P67890&#10;S98765, P43210"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 font-mono text-sm outline-none focus:border-cyan-400 transition-all shadow-inner"
                  ></textarea>
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-200 uppercase italic tracking-tighter active:scale-95"
                >
                  {loading ? "PROCESSING..." : "IMPORT DATASET"}
                </button>
              </form>
            </div>
          </div>

          {/* Clean Inventory Table */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Recent Logs</h2>
                <div className="px-4 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-full animate-pulse">SYSTEM LIVE</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-10 py-6">Category</th>
                      <th className="px-10 py-6">Serial</th>
                      <th className="px-10 py-6">Status</th>
                      <th className="px-10 py-6 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {vouchers.map((v, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-10 py-5">
                          <span className="font-black text-slate-800 italic">{v.type}</span>
                        </td>
                        <td className="px-10 py-5 font-mono text-xs text-slate-400">{v.serial}</td>
                        <td className="px-10 py-5">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${v.status === 'sold' ? 'bg-pink-100 text-pink-600 border border-pink-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="px-10 py-5 text-right">
                          <button className="p-2 text-slate-200 hover:text-pink-500 transition-all rounded-lg hover:bg-pink-50"><Trash2 size={18}/></button>
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
