// jsPDF and autoTable are lazy-loaded inside generatePDFDoc so they don't
// bloat the initial bundle — they're only needed when the user hits "PDF".

// ── Palette ──────────────────────────────────────────────────────────────────

const C = {
  purple:    [124, 58, 237],
  pink:      [236, 72, 153],
  white:     [255, 255, 255],
  dark:      [15, 23, 42],
  muted:     [100, 116, 139],
  rowAlt:    [250, 247, 255],
  unassigned:[180, 190, 210],
};

// Colors cycled per person: [accent, lightBg]
const PERSON_PALETTE = [
  [[124, 58, 237],  [237, 233, 254]],  // purple
  [[16, 185, 129],  [209, 250, 229]],  // green
  [[245, 158, 11],  [254, 243, 199]],  // amber
  [[59, 130, 246],  [219, 234, 254]],  // blue
  [[236, 72, 153],  [252, 231, 243]],  // pink
  [[20, 184, 166],  [204, 251, 241]],  // teal
  [[249, 115, 22],  [255, 237, 213]],  // orange
  [[239, 68, 68],   [254, 226, 226]],  // red
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Draw a left-to-right gradient rectangle using thin strips */
function gradientRect(doc, x, y, w, h, c1, c2, steps = 32) {
  const sw = w / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    doc.setFillColor(
      Math.round(c1[0] + t * (c2[0] - c1[0])),
      Math.round(c1[1] + t * (c2[1] - c1[1])),
      Math.round(c1[2] + t * (c2[2] - c1[2])),
    );
    doc.rect(x + i * sw, y, sw + 0.5, h, 'F');
  }
}

/** Capitalize first letter */
function cap(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

/** Draw a section heading with a colored left bar */
function sectionLabel(doc, text, x, y) {
  doc.setFillColor(...C.purple);
  doc.rect(x, y - 4, 2.5, 6, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.purple);
  doc.text(text, x + 5, y);
}

// ── Main export ───────────────────────────────────────────────────────────────

async function generatePDFDoc(items, people, assignments, participantTotals, grandTotal) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();   // 210
  const H = doc.internal.pageSize.getHeight();  // 297
  const M = 15;
  let y = 0;

  // ────────────────────────────────────────────────────────────────────────────
  // HEADER
  // ────────────────────────────────────────────────────────────────────────────
  const hdrH = 54;
  gradientRect(doc, 0, 0, W, hdrH, C.purple, C.pink);

  // App name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...C.white);
  doc.text('Add the Damn Bill', M, 23);

  // Date (top right)
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 210, 255);
  doc.text(dateStr, W - M, 17, { align: 'right' });

  // Subtitle
  doc.setFontSize(11);
  doc.setTextColor(230, 210, 255);
  doc.text('Bill Split Summary', M, 33);

  // People list
  const nameList = people.map(p => cap(p.name)).join('  ·  ');
  doc.setFontSize(8);
  doc.setTextColor(200, 175, 255);
  // Truncate if too long
  const maxW = W - M * 2;
  let truncatedNames = nameList;
  while (doc.getTextWidth(truncatedNames) > maxW && truncatedNames.includes('  ·  ')) {
    const parts = truncatedNames.split('  ·  ');
    parts.pop();
    truncatedNames = parts.join('  ·  ') + '  · …';
  }
  doc.text(truncatedNames, M, 45);

  y = hdrH + 11;

  // ────────────────────────────────────────────────────────────────────────────
  // ITEMIZED BREAKDOWN TABLE
  // ────────────────────────────────────────────────────────────────────────────
  sectionLabel(doc, 'ITEMIZED BREAKDOWN', M, y);
  y += 4;

  const tableRows = items.map(item => {
    const assignedIds = assignments[item.id] || [];
    const sharingNames = assignedIds.length > 0
      ? assignedIds.map(pid => cap(people.find(p => p.id === pid)?.name)).filter(Boolean).join(', ')
      : 'Unassigned';
    const each = assignedIds.length > 0 ? item.price / assignedIds.length : null;
    return [
      item.name,
      sharingNames,
      `$${item.price.toFixed(2)}`,
      each !== null ? `$${each.toFixed(2)}` : '—',
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [['Item', 'Shared By', 'Total', 'Each']],
    body: tableRows,
    headStyles: {
      fillColor: C.purple,
      textColor: C.white,
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: { top: 2.8, bottom: 2.8, left: 4, right: 4 },
      textColor: C.dark,
      lineColor: [230, 225, 245],
      lineWidth: 0.15,
    },
    alternateRowStyles: {
      fillColor: C.rowAlt,
    },
    columnStyles: {
      0: { cellWidth: 66 },
      1: { cellWidth: 66 },
      2: { cellWidth: 24, halign: 'right' },
      3: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell(data) {
      if (data.section !== 'body') return;
      const isUnassigned = data.column.index === 1 && data.cell.text[0] === 'Unassigned';
      const isDash       = data.column.index === 3 && data.cell.text[0] === '—';
      if (isUnassigned) {
        data.cell.styles.textColor  = C.unassigned;
        data.cell.styles.fontStyle  = 'italic';
      }
      if (isDash) {
        data.cell.styles.textColor = C.unassigned;
      }
    },
    // Page footer for multi-page tables
    didDrawPage(data) {
      const pg    = data.pageNumber;
      const total = doc.internal.getNumberOfPages();
      if (total > 1) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.muted);
        doc.text(`${pg} / ${total}`, W / 2, H - 7, { align: 'center' });
      }
    },
  });

  y = doc.lastAutoTable.finalY + 14;

  // ────────────────────────────────────────────────────────────────────────────
  // INDIVIDUAL TOTALS — colored person cards
  // ────────────────────────────────────────────────────────────────────────────
  const cols    = Math.min(participantTotals.length, 3);
  const gap     = 4;
  const cardW   = (W - M * 2 - gap * (cols - 1)) / cols;
  const cardH   = 27;
  const cardRows = Math.ceil(participantTotals.length / cols);
  const neededH  = cardRows * (cardH + gap) + 55; // cards + total footer + label

  if (y + neededH > H - 15) {
    doc.addPage();
    y = 20;
  }

  sectionLabel(doc, 'INDIVIDUAL TOTALS', M, y);
  y += 6;

  participantTotals.forEach((person, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx  = M + col * (cardW + gap);
    const cy  = y + row * (cardH + gap);
    const [accent, bg] = PERSON_PALETTE[i % PERSON_PALETTE.length];

    // Card background
    doc.setFillColor(...bg);
    doc.roundedRect(cx, cy, cardW, cardH, 3, 3, 'F');

    // Colored top accent bar
    doc.setFillColor(...accent);
    doc.roundedRect(cx, cy, cardW, 7, 3, 3, 'F');
    doc.rect(cx, cy + 3, cardW, 4, 'F'); // flatten bottom corners of bar

    // Subtle border
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, cy, cardW, cardH, 3, 3, 'S');

    // Name
    const displayName = person.name.length > 13
      ? person.name.slice(0, 12) + '…'
      : cap(person.name);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.dark);
    doc.text(displayName, cx + cardW / 2, cy + 15, { align: 'center' });

    // Amount
    doc.setFontSize(13);
    doc.setTextColor(...accent);
    doc.text(`$${person.total.toFixed(2)}`, cx + cardW / 2, cy + 23, { align: 'center' });
  });

  y += cardRows * (cardH + gap) + 10;

  // ────────────────────────────────────────────────────────────────────────────
  // GRAND TOTAL BAR
  // ────────────────────────────────────────────────────────────────────────────
  const gtH = 22;
  gradientRect(doc, M, y, W - M * 2, gtH, C.purple, C.pink);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.white);
  doc.text('GRAND TOTAL', M + 8, y + 9);

  doc.setFontSize(17);
  doc.text(`$${grandTotal.toFixed(2)}`, W - M - 8, y + 14, { align: 'right' });

  y += gtH + 10;

  // ────────────────────────────────────────────────────────────────────────────
  // FOOTER
  // ────────────────────────────────────────────────────────────────────────────
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.muted);
  doc.text('Generated by Add the Damn Bill', W / 2, y, { align: 'center' });

  // Return the doc so callers can save or export as blob
  return doc;
}

/** Build PDF and trigger a file download */
export async function downloadPDF(...args) {
  const doc   = await generatePDFDoc(...args);
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`split-ai-${stamp}.pdf`);
}

/** Build PDF and return a File blob for Web Share API */
export async function getPDFFile(...args) {
  const doc   = await generatePDFDoc(...args);
  const blob  = doc.output('blob');
  const stamp = new Date().toISOString().slice(0, 10);
  return new File([blob], `split-ai-${stamp}.pdf`, { type: 'application/pdf' });
}
