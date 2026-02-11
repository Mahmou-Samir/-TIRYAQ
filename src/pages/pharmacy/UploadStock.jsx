import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx'; // استيراد مكتبة الإكسيل
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const UploadStock = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // قراءة ملف الإكسيل
  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        setData(jsonData); // تخزين البيانات المعروضة
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  // رفع البيانات لـ Firebase
  const handleUploadToFirebase = async () => {
    setUploading(true);
    try {
      const batchPromises = data.map(item => {
        // نتأكد إن الحقول موجودة
        return addDoc(collection(db, "medicines"), {
          name: item['اسم الدواء'] || item['Name'],
          stock: item['الكمية'] || item['Quantity'],
          category: item['الفئة'] || 'عام',
          pharmacyId: 'ID_OF_CURRENT_USER', // مفروض ييجي من Auth
          updatedAt: serverTimestamp()
        });
      });
      
      await Promise.all(batchPromises);
      setSuccess(true);
      setData([]);
      setFile(null);
    } catch (error) {
      console.error("Error uploading:", error);
      alert("حدث خطأ أثناء الرفع");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">تحديث المخزون بالجملة</h1>
          <p className="text-green-100 opacity-90 max-w-xl">
            قم برفع ملف Excel (.xlsx) يحتوي على مخزون صيدليتك، وسيقوم النظام بتحديث قاعدة البيانات المركزية تلقائياً ليظهر للمرضى.
          </p>
        </div>
        <FileSpreadsheet className="absolute left-10 top-1/2 -translate-y-1/2 text-white opacity-10" size={120} />
      </div>

      <div className="bg-white rounded-3xl border-2 border-dashed border-gray-300 p-12 text-center hover:border-green-500 transition-colors cursor-pointer group"
           onClick={() => fileInputRef.current.click()}>
        <input type="file" ref={fileInputRef} hidden accept=".xlsx, .xls" onChange={handleFileUpload} />
        
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud size={40} className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">اضغط لرفع الملف أو اسحبه هنا</h3>
        <p className="text-slate-400 mt-2 text-sm">يدعم ملفات Excel فقط (XLSX, XLS)</p>
      </div>

      {/* معاينة البيانات */}
      {data.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <FileSpreadsheet size={18}/> معاينة البيانات ({data.length} صنف)
            </h3>
            <button 
              onClick={handleUploadToFirebase}
              disabled={uploading}
              className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />}
              {uploading ? 'جاري المعالجة...' : 'اعتماد ورفع البيانات'}
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="p-3 text-slate-600">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="p-3 text-slate-700">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle size={24} />
          <div>
            <p className="font-bold">تم رفع المخزون بنجاح!</p>
            <p className="text-xs">تم تحديث قاعدة البيانات المركزية وأصبح الدواء متاحاً للبحث.</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default UploadStock;