import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { LayoutDashboard, PlusCircle, Database, LogOut, BarChart3, Trash2 } from 'lucide-react';

export default function Admin() {
  const [stats, setStats] = useState({ total: 0, sold: 0, available: 0 });
  const [vouchers, setVouchers] = useState([]);
  const [csvData, setCsvData] = useState('');
  const [type, setType] = useState('WASSCE');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data.stats);
      setVouchers(res.data.recentVouchers);
    } catch (e) { toast.error("Failed to load data"); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/upload', { csvData, type });
      toast.success("Vouchers Uploaded Successfully!");
      setCsvData('');
      fetchData();
    } catch (e) { toast.error("Upload failed"); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      <Toaster />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col shadow-sm">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="p-1.5 bg-cyan-500 rounded-lg text-white"><LayoutDashboard size={20}/></div>
          <span className="font-black italic tracking-tighter text-xl">NEON<span className="text-cyan-500">ADMIN</span></span>
        </div>
        
        <nav className="space-y-1 flex-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-cyan-50 text-cyan-600 rounded-xl font-bold text-sm shadow-sm border border-cyan-100">
            <Database size={18}/> Inventory
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl font-bold text-sm transition-all">
            <BarChart3 size={18}/> Sales Reports
          </button>
        </nav>

        <button className="mt-auto flex items-center gap-3 px-4 py-3 text-pink-500 font-bold text-sm hover:bg-pink-50 rounded-xl transition-all">
          <LogOut size={18}/> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 font-medium">Manage your WAEC voucher inventory</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">System Status</p>
            <div className="flex items-center gap-2 text-emerald-500 font-bold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Live Database
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Stock', val: stats.total, color: 'text-blue-600', bg: 'bg-blue-100' },
            { label: 'Available', val: stats.available, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { label: 'Total Sold', val: stats.sold, color: 'text-pink-600', bg: 'bg-pink-100' }
          ].map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className={`text-4xl font-black ${s.color}`}>{s.val}</h3>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <PlusCircle className="text-cyan-500" />
                <h2 className="text-xl font-black">Quick Upload</h2>
              </div>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Voucher Type</label>
                  <select 
                    value={type} onChange={(e)=>setType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 ring-cyan-400"
                  >
                    <option value="WASSCE">WASSCE Checker</option>
                    <option value="BECE">BECE Checker</option>
                    <option value="PLACEMENT">School Placement</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">CSV Data (Serial, Pin)</label>
                  <textarea 
                    rows="6" value={csvData} onChange={(e)=>setCsvData(e.target.value)}
                    placeholder="S123,P456&#10;S789,P012"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-mono text-sm outline-none focus:ring-2 ring-cyan-400"
                  ></textarea>
                </div>
                <button className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-cyan-500 transition-all shadow-lg">
                  IMPORT VOUCHERS
                </button>
              </form>
            </div>
          </div>

          {/* Recent Inventory Table */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50">
                <h2 className="text-xl font-black">Recent Inventory</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Type</th>
                      <th className="px-8 py-4">Serial</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {vouchers.map((v, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-4 font-bold text-slate-700">{v.type}</td>
                        <td className="px-8 py-4 font-mono text-sm">{v.serial}</td>
                        <td className="px-8 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${v.status === 'sold' ? 'bg-pink-100 text-pink-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button className="text-slate-300 hover:text-pink-500 transition-colors"><Trash2 size={18}/></button>
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
