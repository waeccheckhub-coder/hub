import { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { Upload, Shield } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fileData, setFileData] = useState([]);
  const [voucherType, setVoucherType] = useState('WASSCE');

  const handleLogin = (e) => {
    e.preventDefault();
    // In real app, use better auth. This is simple gatekeeping.
    if(password) setIsAuthenticated(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        // Expecting CSV headers: serial, pin
        setFileData(results.data.filter(row => row.serial && row.pin));
      }
    });
  };

  const uploadToDB = async () => {
    const loadingToast = toast.loading(`Uploading ${fileData.length} vouchers...`);
    try {
      await axios.post('/api/admin/upload', {
        vouchers: fileData,
        type: voucherType,
        password: password // Send password to verify on server again
      });
      toast.dismiss(loadingToast);
      toast.success('Upload Successful!');
      setFileData([]);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Upload failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded border border-gray-800">
          <Shield className="w-12 h-12 text-neonBlue mb-4 mx-auto"/>
          <input 
            type="password" 
            placeholder="Admin Key" 
            className="bg-black border border-gray-700 p-2 rounded text-white w-64 block mb-4"
            onChange={e => setPassword(e.target.value)}
          />
          <button className="w-full bg-neonBlue text-black font-bold py-2 rounded">Access</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <Toaster />
      <h1 className="text-3xl font-bold mb-10 text-neonBlue">Admin Dashboard</h1>

      <div className="max-w-2xl bg-gray-900 p-8 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold mb-6 flex gap-2 items-center"><Upload/> Bulk Upload Vouchers</h2>
        
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Voucher Type</label>
          <select 
            value={voucherType} onChange={e => setVoucherType(e.target.value)}
            className="w-full bg-black border border-gray-700 p-3 rounded text-white"
          >
            <option value="WASSCE">WASSCE</option>
            <option value="BECE">BECE</option>
            <option value="PLACEMENT">School Placement</option>
          </select>
        </div>

        <div className="border-2 border-dashed border-gray-700 rounded-lg p-10 text-center mb-6">
          <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neonBlue file:text-black hover:file:bg-white"/>
          <p className="text-xs text-gray-500 mt-2">CSV must have headers: <code className="text-gray-300">serial, pin</code></p>
        </div>

        {fileData.length > 0 && (
          <div className="mb-6">
            <p className="text-green-400 mb-4">{fileData.length} vouchers ready to upload.</p>
            <button onClick={uploadToDB} className="w-full bg-neonGreen text-black font-bold py-3 rounded hover:bg-white transition">
              Confirm Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
