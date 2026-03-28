import { useMemo, useState } from 'react';
import { ArrowLeft, RefreshCw, Receipt, Share2, Copy, Check, FileDown } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { calculateSplits } from '../utils/calculator';
import { getAvatarUrl } from '@/utils/avatars';
import { downloadPDF, getPDFFile } from '../utils/pdf';

// ── WhatsApp-friendly text formatter ────────────────────────────────────────

function buildShareText(participantTotals, grandTotal) {
  const lines = [];
  lines.push('🧾 *Bill Split (Add the Damn Bill)*');
  lines.push('');
  participantTotals.forEach(p => {
    lines.push(`👤 *${p.name}* → $${p.total.toFixed(2)}`);
  });
  lines.push('');
  lines.push(`💰 *Total: $${grandTotal.toFixed(2)}*`);
  return lines.join('\n');
}

// ── Share buttons ────────────────────────────────────────────────────────────

// Detect whether this browser/device can share files via Web Share API
function canShareFiles() {
  try {
    const probe = new File([], 'probe.pdf', { type: 'application/pdf' });
    return !!navigator.canShare?.({ files: [probe] });
  } catch {
    return false;
  }
}

function ShareBar({ items, people, assignments, participantTotals, grandTotal }) {
  const [copied,      setCopied]      = useState(false);
  const [pdfError,    setPdfError]    = useState(null);
  const [pdfLoading,  setPdfLoading]  = useState(false);
  const supportsShare = canShareFiles();
  const text = buildShareText(participantTotals, grandTotal);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pdfArgs = [items, people, assignments, participantTotals, grandTotal];

  const handleShare = async () => {
    setPdfError(null);
    setPdfLoading(true);
    try {
      const file = await getPDFFile(...pdfArgs);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Add the Damn Bill — Bill Summary' });
      } else {
        await downloadPDF(...pdfArgs);
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setPdfError('Could not generate PDF. Try again.');
      }
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownload = async () => {
    setPdfError(null);
    setPdfLoading(true);
    try {
      await downloadPDF(...pdfArgs);
    } catch {
      setPdfError('Could not generate PDF. Try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="mb-4 sm:mb-5">
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          disabled={pdfLoading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-xs font-semibold hover:bg-[#25D366]/25 transition-all active:scale-95 disabled:opacity-50"
        >
          {pdfLoading ? <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" /> : <Share2 size={13} />}
          {supportsShare ? 'Share PDF' : 'Download PDF'}
        </button>
        <button
          onClick={copyToClipboard}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white/70 text-xs font-semibold hover:bg-white/10 transition-all active:scale-95"
        >
          {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        {supportsShare && (
          <button
            onClick={handleDownload}
            disabled={pdfLoading}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-semibold hover:bg-purple-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            <FileDown size={13} />
            PDF
          </button>
        )}
      </div>
      {pdfError && <p className="text-xs text-red-400 mt-2 text-center">{pdfError}</p>}
    </div>
  );
}

// ── Main SummaryStep ─────────────────────────────────────────────────────────

export default function SummaryStep({ items, people, assignments, onBack, onReset }) {
  const { itemBreakdown, participantTotals, grandTotal } = useMemo(
    () => calculateSplits(items, people, assignments),
    [items, people, assignments]
  );

  const allAssigned = grandTotal > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <div className="mb-4 sm:mb-5">
        <h2 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">The Final Calculation</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">A detailed breakdown of who ordered what.</p>
      </div>

      {allAssigned ? (
        <>
          {/* Itemized breakdown */}
          <div className="border border-border rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-5">
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/40 border-b border-border/40">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Itemized Breakdown</p>
            </div>
            <div className="divide-y divide-border/40">
              {itemBreakdown.map((row, i) => (
                <motion.div
                  key={`row_${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start justify-between px-3 sm:px-4 py-2.5 sm:py-3 gap-2 sm:gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">{row.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {row.sharingNames.length > 0 ? (
                        row.sharingNames.map((name, idx) => (
                          <span key={idx} className="text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground capitalize">
                            {name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-destructive italic">Unassigned</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">${row.price.toFixed(2)}</p>
                    <p className="text-xs sm:text-sm font-semibold text-foreground">
                      ${row.costPerPerson.toFixed(2)}
                      <span className="text-xs font-normal text-muted-foreground">/ea</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Individual totals */}
          <div className="border border-border rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-5">
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/40 border-b border-border/40">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Individual Totals</p>
            </div>
            <div className="divide-y divide-border/40">
              {participantTotals.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 30 }}
                  className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3"
                >
                  <img
                    src={getAvatarUrl(p.name)}
                    alt={p.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-background shadow-sm shrink-0 bg-muted"
                  />
                  <span className="flex-1 text-xs sm:text-sm font-semibold text-foreground capitalize truncate">{p.name}</span>
                  <span className="text-sm sm:text-base font-bold text-green-400 shrink-0">${p.total.toFixed(2)}</span>
                </motion.div>
              ))}
              <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-3.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Grand Total</span>
                <span className="text-base sm:text-lg font-bold text-foreground">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Share bar */}
          <ShareBar
            items={items} people={people} assignments={assignments}
            participantTotals={participantTotals} grandTotal={grandTotal}
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 py-8 sm:py-10 rounded-xl sm:rounded-2xl bg-destructive/5 border border-destructive/20 mb-5 sm:mb-6">
          <Receipt size={26} className="text-destructive/50" />
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">No items assigned</p>
            <p className="text-xs text-muted-foreground mt-1">Go back and assign at least one item.</p>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2 border-t border-border/40">
        <Button variant="outline" size="sm" className="sm:h-10 sm:px-5" onClick={onBack}>
          <ArrowLeft size={14} /> Edit
        </Button>
        <Button variant="outline" size="sm" className="sm:h-10 sm:px-5 text-destructive hover:text-destructive" onClick={onReset}>
          <RefreshCw size={14} /> Start Over
        </Button>
      </div>
    </motion.div>
  );
}
