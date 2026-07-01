import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { useRef, useState } from "react";

export default function ComplianceUploadCard({ 
  stepNumber, 
  title, 
  description, 
  icon: Icon = Upload, 
  color = "#14B8A6", 
  file, 
  setFile, 
  onUpload, 
  isUploading, 
  isActive, 
  isCompleted,
  children
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

  // State styling variants
  const opacity = isActive || isCompleted ? 1 : 0.4;
  const borderColor = isCompleted ? color : isDragActive ? color : "rgba(255,255,255,0.4)";
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity, x: 0 }}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${!isActive && !isCompleted ? 'pointer-events-none' : ''}`}
    >
      {/* Glass Background */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-xl border border-white/40 z-0 shadow-sm" />
      
      {/* Animated Gradient Glow on Active */}
      {isActive && !isCompleted && (
        <motion.div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          animate={{ background: [`radial-gradient(circle at 0% 0%, ${color} 0%, transparent 50%)`, `radial-gradient(circle at 100% 100%, ${color} 0%, transparent 50%)`, `radial-gradient(circle at 0% 0%, ${color} 0%, transparent 50%)`] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      )}

      <div className="relative z-10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm" style={{ backgroundColor: isCompleted ? color : isActive ? color : "#CBD5E1" }}>
            {isCompleted ? <CheckCircle size={16} /> : stepNumber}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>

        {!isCompleted ? (
          <div 
            className={`mt-4 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer ${isDragActive ? 'bg-white/80' : 'bg-white/40 hover:bg-white/60'}`}
            style={{ borderColor }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept=".pdf"
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleChange} 
            />
            
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${color}15`, color }}>
              <Icon size={24} />
            </div>
            
            {file ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700">Drag & drop or <span style={{ color }} className="hover:underline">browse files</span></p>
                <p className="text-xs text-slate-500">PDF documents up to 50MB</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-white/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{file?.name || "Uploaded Document"}</p>
              <p className="text-xs text-green-600 font-medium">Successfully processed</p>
            </div>
          </div>
        )}

        {/* Extra Form Elements for Submittal (Vendor Name, PO) */}
        {children && (
          <div className="mt-4 space-y-3">
            {children}
          </div>
        )}

        {/* Upload Button */}
        {file && !isCompleted && (
          <button
            onClick={(e) => { e.stopPropagation(); onUpload(); }}
            disabled={isUploading}
            className="mt-4 w-full text-white font-medium py-2.5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: color }}
          >
            {isUploading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Processing...
              </>
            ) : (
              "Confirm & Upload"
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
