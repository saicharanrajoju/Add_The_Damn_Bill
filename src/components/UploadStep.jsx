import { useState, useRef, useEffect } from 'react';
import { UploadCloud, Camera, X, CheckCircle2, RefreshCcw, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractReceiptItems } from '../utils/ai';

// ── In-app camera modal ───────────────────────────────────────────────────────

function CameraModal({ onCapture, onClose }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const [ready,    setReady]    = useState(false);
  const [facing,   setFacing]   = useState('environment');
  const [captured, setCaptured] = useState(null); // { blob, url }
  const [camError, setCamError] = useState(null);

  const startCamera = async (facingMode) => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCamError('Camera access denied or unavailable on this device.');
    }
  };

  useEffect(() => {
    startCamera('environment');
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const flipCamera = () => {
    const next = facing === 'environment' ? 'user' : 'environment';
    setFacing(next);
    startCamera(next);
  };

  const capturePhoto = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => setCaptured({ blob, url: URL.createObjectURL(blob) }), 'image/jpeg', 0.92);
  };

  const retake = () => {
    URL.revokeObjectURL(captured.url);
    setCaptured(null);
  };

  const usePhoto = () => {
    const file = new File([captured.blob], `receipt_${Date.now()}.jpg`, { type: 'image/jpeg' });
    onCapture(file);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Full-screen video — always behind everything */}
      {!camError && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onCanPlay={() => setReady(true)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: captured ? 'none' : 'block' }}
          />
          {captured && (
            <img
              src={captured.url}
              className="absolute inset-0 w-full h-full object-contain bg-black"
              alt="Captured"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}

      {/* Error state */}
      {camError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="text-white/70 text-sm">{camError}</p>
          <button onClick={onClose} className="mt-2 px-5 py-2.5 rounded-full bg-white/10 text-white text-sm">
            Close
          </button>
        </div>
      )}

      {/* Top controls — overlaid on video */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-10"
           style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)' }}>
        <button
          onClick={onClose}
          aria-label="Close camera"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white"
        >
          <X size={20} />
        </button>
        {!captured && !camError && (
          <button
            onClick={flipCamera}
            aria-label="Flip camera"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white"
          >
            <RefreshCcw size={20} />
          </button>
        )}
      </div>

      {/* Bottom controls — overlaid on video */}
      {!camError && (
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 px-8 pb-12 pt-16"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }}
        >
          {!captured ? (
            /* Shutter button */
            <button
              onClick={capturePhoto}
              disabled={!ready}
              aria-label="Capture photo"
              className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
            >
              <div className="w-14 h-14 rounded-full bg-white" />
            </button>
          ) : (
            /* Retake / Use */
            <>
              <button
                onClick={retake}
                className="flex-1 py-3.5 rounded-2xl bg-black/50 backdrop-blur-sm border border-white/20 text-white text-sm font-medium"
              >
                Retake
              </button>
              <button
                onClick={usePhoto}
                className="flex-1 py-3.5 rounded-2xl bg-white text-black text-sm font-semibold"
              >
                Use Photo
              </button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Single bill card ──────────────────────────────────────────────────────────

function BillCard({ bill, index, onRemove }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      layout
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
    >
      <img
        src={bill.preview}
        alt=""
        className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-white/10"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white">Bill {index + 1}</p>
        {bill.processing && (
          <p className="text-xs text-white/40 mt-0.5">Analyzing with AI…</p>
        )}
        {bill.error && (
          <p className="text-xs text-red-400 mt-0.5 truncate">{bill.error}</p>
        )}
        {!bill.processing && !bill.error && (
          <p className="text-xs text-green-400 mt-0.5 flex items-center gap-1">
            <CheckCircle2 size={10} />
            {bill.items.length} item{bill.items.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        {bill.processing ? (
          <div className="w-4 h-4 rounded-full border border-white/30 border-t-white/80 animate-spin" />
        ) : (
          <button
            onClick={onRemove}
            aria-label="Remove bill"
            className="p-2.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/80"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main UploadStep ───────────────────────────────────────────────────────────

export default function UploadStep({ bills, setBills, onDataExtracted }) {
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef  = useRef(null);

  const hasCameraAPI = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  const addBill = async (file) => {
    if (!file) return;
    const id      = `bill_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const preview = URL.createObjectURL(file);

    setBills(prev => [...prev, { id, preview, items: [], processing: true, error: null }]);

    try {
      const data           = await extractReceiptItems(file);
      const extractedItems = data?.items || [];

      if (extractedItems.length === 0) {
        throw new Error("Couldn't extract items — try a clearer photo.");
      }

      const items = extractedItems.map((item, idx) => ({
        ...item,
        id: `item_${id}_${idx}`
      }));

      setBills(prev => prev.map(b => b.id === id ? { ...b, items, processing: false } : b));
    } catch (err) {
      setBills(prev => prev.map(b => b.id === id ? { ...b, processing: false, error: err.message } : b));
    }
  };

  const removeBill = (id) => {
    setBills(prev => {
      const bill = prev.find(b => b.id === id);
      if (bill?.preview) URL.revokeObjectURL(bill.preview);
      return prev.filter(b => b.id !== id);
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(addBill);
    e.target.value = '';
  };

  const handleProceed = () => {
    const allItems = bills.flatMap(b => b.items);
    onDataExtracted({ items: allItems });
  };

  const readyCount = bills.filter(b => !b.processing && !b.error && b.items.length > 0).length;
  const totalItems = bills.filter(b => !b.processing && !b.error).flatMap(b => b.items).length;
  const anyProcessing = bills.some(b => b.processing);

  return (
    <>
      <AnimatePresence>
        {showCamera && (
          <CameraModal
            onCapture={addBill}
            onClose={() => setShowCamera(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <div className="mb-4 sm:mb-5">
          <h2 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">Add your bills</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Add one or more receipts — AI will extract all items.
          </p>
        </div>

        {/* Bill list */}
        <AnimatePresence mode="popLayout">
          {bills.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2 mb-4"
            >
              {bills.map((bill, i) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  index={i}
                  onRemove={() => removeBill(bill.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add buttons */}
        <div className={`grid gap-2 ${hasCameraAPI ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {hasCameraAPI && (
            <button
              onClick={() => setShowCamera(true)}
              className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Camera size={17} className="text-white/70" />
              </div>
              <span className="text-xs text-white/60 font-medium">Take Photo</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <UploadCloud size={17} className="text-white/70" />
            </div>
            <span className="text-xs text-white/60 font-medium">
              {bills.length > 0 ? 'Add Another' : 'Upload Photo'}
            </span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Proceed button */}
        <AnimatePresence>
          {readyCount > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              onClick={handleProceed}
              disabled={anyProcessing}
              className="mt-4 w-full py-3.5 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus size={15} />
              Continue with {readyCount} bill{readyCount !== 1 ? 's' : ''}
              <span className="text-black/50 font-normal">· {totalItems} items</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
