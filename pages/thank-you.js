import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, CheckCircle, Home } from 'lucide-react';

export default function ThankYou() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    // Retrieve data passed from index page (or you could fetch via API using the Ref)
    const data = localStorage.getItem('lastOrder');
    if (data) {
      setVouchers(JSON.parse(data));
    }
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 297, 'F'); // Black background

    // Logo Area
    doc.setFontSize(22);
    doc.setTextColor(0, 243, 255); // Neon Blue
    doc.text("NEONCHECK", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text("Support: help@neoncheck.com", 14, 35);

    const rows = vouchers.map((v, i) => [v.type, v.serial, v.pin]);

    doc.autoTable({
      head: [['Type', 'Serial Number', 'PIN']],
      body: rows,
      startY: 45,
      theme: 'grid',
      styles: { 
        fillColor: [20, 20, 20], 
        textColor: [255, 255, 255],
        lineColor: [50, 50, 50]
      },
      headStyles: { 
        fillColor: [0, 243, 255], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold' 
      },
      alternateRowStyles: { fillColor: [30, 30, 30] }
    });

    doc.save('my-vouchers.pdf');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <CheckCircle size={80} className="text-neonGreen mb-6 animate-bounce" />
      <h1 className="text-4xl font-bold text-white mb-2">Order Confirmed!</h1>
      <p className="text-gray-400 mb-8">The codes have been sent to your phone via SMS.</p>

      <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
        <div className="grid grid-cols-3 bg-gray-800 p-4 font-bold text-gray-300 border-b border-gray-700">
          <div>Type</div>
          <div>Serial</div>
          <div>PIN</div>
        </div>
        {vouchers.map((v, i) => (
          <div key={i} className="grid grid-cols-3 p-4 border-b border-gray-800 text-sm md:text-base">
            <div className="text-neonBlue font-bold">{v.type}</div>
            <div className="text-white">{v.serial}</div>
            <div className="font-mono text-neonPink tracking-wider">{v.pin}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={generatePDF} className="flex items-center gap-2 bg-neonBlue text-black font-bold px-8 py-3 rounded hover:bg-white transition">
          <Download size={20}/> Download PDF
        </button>
        <button onClick={() => router.push('/')} className="flex items-center gap-2 border border-gray-600 text-gray-300 px-8 py-3 rounded hover:border-white transition">
          <Home size={20}/> Buy More
        </button>
      </div>
    </div>
  );
}
