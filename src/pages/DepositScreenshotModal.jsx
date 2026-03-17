// DepositScreenshotModal.jsx
import React, { useRef, useState } from 'react';
import { X, Camera, Loader, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';


// ==================== Move DepositScreenshotModal OUTSIDE DepositPage ====================
export const DepositScreenshotModal = ({ deposit, onClose, onUpdate, uploading, updateReason, setUpdateReason }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large! Max 5MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    if (!selectedFile) {
      toast.error("Please select a new screenshot");
      return;
    }

    const success = await onUpdate(deposit._id, selectedFile, updateReason);
    if (success) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setUpdateReason("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[500] p-4 backdrop-blur-sm">
      <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0A1F1A] p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-black text-[#00F5A0]">Update Deposit Screenshot</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Screenshots Gallery */}
          {deposit?.paymentScreenshots && deposit.paymentScreenshots.length > 0 && (
            <div>
              <h4 className="text-sm font-bold mb-3">Uploaded Screenshots</h4>
              <div className="grid grid-cols-3 gap-3">
                {deposit.paymentScreenshots.filter(ss => ss.isActive).map((ss, idx) => (
                  <div 
                    key={idx}
                    className="relative rounded-xl overflow-hidden border-2 border-white/10 cursor-pointer hover:border-[#00F5A0] transition-all"
                    onClick={() => window.open(`https://cpay-link-backend.onrender.com${ss.url}`)}
                  >
                    <img 
                      src={`https://cpay-link-backend.onrender.com${ss.url}`}
                      alt={`screenshot-${idx}`}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute top-1 right-1 bg-black/60 text-[8px] px-1 rounded">
                      {new Date(ss.uploadedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Update Form */}
          <div className="border-t border-white/10 pt-6">
            <h4 className="text-sm font-bold mb-3">Upload New Screenshot</h4>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!previewUrl ? (
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full border-2 border-dashed border-white/10 rounded-xl py-8 text-center hover:border-[#00F5A0]/30 transition-all group"
              >
                <Camera size={32} className="mx-auto mb-2 text-gray-500 group-hover:text-[#00F5A0]" />
                <p className="text-sm text-gray-400">Click to select new screenshot</p>
                <p className="text-[8px] text-gray-600 mt-1">Max 5MB (JPEG, PNG)</p>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full h-48 object-contain bg-black/40 rounded-xl border border-[#00F5A0]"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Reason for update (optional)"
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00F5A0]"
                />

                <button
                  onClick={handleUpdate}
                  disabled={uploading}
                  className="w-full bg-[#00F5A0] text-black py-3 rounded-xl font-black text-sm hover:bg-[#00d88c] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader size={16} className="animate-spin" />
                      UPDATING...
                    </span>
                  ) : (
                    "UPDATE SCREENSHOT"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Status Info */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
            <p className="text-yellow-400 text-xs font-bold mb-2">⚠️ Deposit Status: {deposit?.status}</p>
            <p className="text-[10px] text-gray-400">
              You can update screenshots while deposit is pending. After admin approval, screenshots cannot be changed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
