import { useRef } from 'react';
import { UploadCloud, Camera, X, CheckCircle2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractReceiptItems } from '../utils/ai';

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
  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);

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
    Array.from(e.target.files || []).forEach(addBill);
    e.target.value = '';
  };

  const handleProceed = () => {
    onDataExtracted({ items: bills.flatMap(b => b.items) });
  };

  const readyCount    = bills.filter(b => !b.processing && !b.error && b.items.length > 0).length;
  const totalItems    = bills.filter(b => !b.processing && !b.error).flatMap(b => b.items).length;
  const anyProcessing = bills.some(b => b.processing);

  return (
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

      {/* Add buttons — camera uses native input capture, upload uses file picker */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Camera size={17} className="text-white/70" />
          </div>
          <span className="text-xs text-white/60 font-medium">Take Photo</span>
        </button>

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

      {/* Native camera — opens phone camera app with full focus/HDR/zoom */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* File picker — for choosing from gallery or desktop */}
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
  );
}
