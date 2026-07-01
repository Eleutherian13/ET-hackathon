import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, CheckCircle } from "lucide-react";
import { useRef, useState } from "react";

export default function ScheduleUploadCard({ 
  onUpload, 
  isUploading, 
  file, 
  setFile 
}) {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const color = "#0EA5E9"; // Sky blue

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl overflow-hidden transition-all duration-300 group"
    >
      {/* Glass Background */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-xl border border-white/40 z-0 shadow-[0_8px_32px_rgba(0,0,0,0.04)]" />
      
      {/* Animated Gradient Glow on Hover/Drag */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity duration-500"
        animate={{ background: [`radial-gradient(circle at 0% 0%, ${color} 0%, transparent 60%)`, `radial-gradient(circle at 100% 100%, ${color} 0%, transparent 60%)`, `radial-gradient(circle at 0% 0%, ${color} 0%, transparent 60%)`] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
      {isDragActive && (
        <div className="absolute inset-0 bg-sky-500/10 z-0" />
      )}

      <div className="relative z-10 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="font-bold text-xl text-slate-800 mb-2">Import Project Schedule</h3>
        <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">Upload your schedule data to run AI risk prediction and dependency graph analysis.</p>

        {!file ? (
          <div 
            className={`w-full max-w-lg rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-10 text-center cursor-pointer ${isDragActive ? 'bg-white/90 border-sky-400 scale-[1.02] shadow-xl' : 'bg-white/40 border-white/60 hover:bg-white/70 hover:border-sky-300 hover:shadow-lg'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept=".csv"
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleChange} 
            />
            
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-inner" style={{ backgroundColor: `${color}15`, color }}>
              <Upload size={32} />
            </div>
            
            <p className="text-lg font-medium text-slate-700 mb-2">Drag & drop your file here</p>
            <p className="text-sm text-slate-500 mb-4">or <span className="text-sky-500 font-semibold hover:underline">browse files</span></p>
            
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 bg-slate-100/50 px-4 py-2 rounded-lg">
              <span>SUPPORTED:</span>
              <span className="text-slate-600">CSV</span>
              <span className="text-slate-600">MPP</span>
              <span className="text-slate-600">XML</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <div className="p-6 rounded-2xl border border-sky-100 bg-white/80 shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-sky-50 text-sky-500 shadow-sm">
                <FileSpreadsheet size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate mb-1">{file.name}</p>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                  <span className="text-green-500 flex items-center gap-1"><CheckCircle size={12} /> Ready for Analysis</span>
                </div>
              </div>
              <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 text-sm font-medium px-2 py-1 transition-colors">
                Change
              </button>
            </div>

            <button
              onClick={() => onUpload({ target: { files: [file] } })}
              disabled={isUploading}
              className="mt-6 w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:-translate-y-0.5 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  Importing Schedule Data...
                </>
              ) : (
                "Upload & Parse Schedule"
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
