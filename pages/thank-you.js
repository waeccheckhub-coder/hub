import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, CheckCircle, Home, ExternalLink, Copy } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ThankYou() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem('lastOrder');
    if (data) {
      setVouchers(JSON.parse(data));
    }
  }, []);

  const getResultLink = (type) => {
    const t = type?.toUpperCase();
    if (t?.includes('BECE')) return 'https://eresults.waecgh.org';
    if (t?.includes('WASSCE')) return 'https://ghana.waecdirect.org';
    if (t?.includes('CSSPS')) return 'https://www.cssps.gov.gh/';
    return null;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleString();

    // Add Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Brand color
    doc.text('WAEC GH CARDS ONLINE', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Purchase Date: ${date}`, 14, 30);
    doc.text('Thank you for your purchase!', 14, 35);

    // Create Table
    const tableColumn = ["Voucher Type", "Serial Number", "PIN"];
    const tableRows = vouchers.map(v => [
      v.type,
      v.serial,
      v.pin
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillGray: [79, 70, 229], textColor: 255 },
      styles: { font: 'courier', fontSize: 10 }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY || 45;
    doc.setFontSize(9);
    doc.text('Note: Keep these details secure. Do not share your PIN with anyone.', 14, finalY + 10);

    doc.save(`WAEC_Vouchers_${Date.now()}.pdf`);
    toast.success('PDF Downloaded!');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center py-8 px-4 sm:justify-center">
      <Toaster position="top-center" />
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-[2rem] sm:rounded-[2.5rem] p-6 md:p-12 shadow-xl shadow-slate-200/50">
        
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">Payment Successful</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium">Your vouchers are ready below.</p>
        </div>

        {/* Voucher Cards */}
        <div className="space-y-4 mb-8">
          {vouchers.map((v, i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
                            {v.type}
                        </span>
                        <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">Serial Number</p>
                        <p className="text-sm font-mono text-slate-700">{v.serial}</p>
                    </div>
                    <button 
                        onClick={() => copyToClipboard(v.pin)}
                        className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Copy PIN"
                    >
                        <Copy size={16} />
                    </button>
                </div>
                
                <div className="pt-4 border-t border-slate-200/60">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-1">Voucher PIN</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tight select-all">{v.pin}</p>
                </div>
            </div>
          ))}
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {/* PDF Button */}
          <button 
            onClick={downloadPDF}
            className="flex items-center justify-between p-4 bg-slate-900 rounded-xl text-white hover:bg-slate-800 transition-all group"
          >
            <span className="text-xs font-black uppercase tracking-widest">Download PDF</span>
            <Download size={16} />
          </button>

          {/* Portal Links */}
          {Array.from(new Set(vouchers.map(v => v.type))).map((type) => {
            const link = getResultLink(type);
            if (!link) return null;
            return (
              <a key={type} href={link} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-all group"
              >
                <span className="text-xs font-black uppercase tracking-widest">Check {type}</span>
                <ExternalLink size={16} />
              </a>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={() => router.push('/')} className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-900 font-black py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
            <Home size={18}/> Buy Another Voucher
          </button>
        </div>
      </div>
    </div>
  );
}
