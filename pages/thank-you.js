import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, CheckCircle, Home, ExternalLink, Printer } from 'lucide-react';

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
    if (type?.toUpperCase().includes('BECE')) return 'https://eresults.waecgh.org';
    if (type?.toUpperCase().includes('WASSCE')) return 'https://ghana.waecdirect.org';
    return null;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Professional Header
    doc.setFillColor(37, 99, 235); // Blue 600
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("WAEC CHECKERS RECEIPT", 14, 25);
    
    doc.setFontSize(10);
    doc.text(`Issued on: ${new Date().toLocaleString()}`, 14, 34);

    const rows = vouchers.map((v) => [v.type, v.serial, v.pin]);

    doc.autoTable({
      head: [['Voucher Type', 'Serial Number', 'PIN / Code']],
      body: rows,
      startY: 50,
      theme: 'grid',
      styles: { fontSize: 11, cellPadding: 5 },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] }, // Slate 900
    });

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Thank you for using WAEC Checkers. Keep this receipt safe.", 14, doc.autoTable.previous.finalY + 10);

    doc.save(`WAEC-Vouchers-${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 text-center">
        
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">Payment Successful</h1>
        <p className="text-slate-500 font-medium mb-10">Your vouchers are ready. A copy has also been sent via SMS.</p>

        {/* Voucher Display Card */}
        <div className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden mb-8">
          <div className="grid grid-cols-3 bg-slate-900 py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
            <div>Type</div>
            <div>Serial Number</div>
            <div>PIN / Code</div>
          </div>
          
          <div className="divide-y divide-slate-100">
            {vouchers.map((v, i) => (
              <div key={i} className="grid grid-cols-3 p-6 text-left items-center bg-white">
                <div className="text-xs font-black text-blue-600 uppercase">{v.type}</div>
                <div className="text-xs font-mono text-slate-400">{v.serial}</div>
                <div className="text-xl font-black text-slate-900 tracking-tighter">{v.pin}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Result Checkers Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {Array.from(new Set(vouchers.map(v => v.type))).map((type) => {
            const link = getResultLink(type);
            if (!link) return null;
            return (
              <a 
                key={type}
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 hover:bg-blue-100 transition-all group"
              >
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Check Result</p>
                  <p className="text-sm font-bold">Official {type} Portal</p>
                </div>
                <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={generatePDF} 
            className="flex items-center justify-center gap-2 bg-slate-900 text-white font-black px-8 py-4 rounded-2xl hover:bg-blue-600 transition-all text-xs uppercase tracking-widest"
          >
            <Printer size={18}/> Save Receipt (PDF)
          </button>
          
          <button 
            onClick={() => router.push('/')} 
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-900 font-black px-8 py-4 rounded-2xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
          >
            <Home size={18}/> Buy More
          </button>
        </div>
      </div>

      <footer className="mt-12 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">WAEC GH Checkers Infrastructure</p>
      </footer>
    </div>
  );
}
