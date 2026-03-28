import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Pencil, Check, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

// ── Inline edit row ───────────────────────────────────────────────────────────

function EditableItemHeader({ item, onSave }) {
  const [editing, setEditing]   = useState(false);
  const [name,    setName]      = useState(item.name);
  const [price,   setPrice]     = useState(String(item.price));
  const nameRef = useRef(null);

  useEffect(() => {
    if (editing) nameRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const parsed = parseFloat(price);
    if (!name.trim() || isNaN(parsed) || parsed < 0) return;
    onSave({ name: name.trim(), price: parsed });
    setEditing(false);
  };

  const cancel = () => {
    setName(item.name);
    setPrice(String(item.price));
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center justify-between mb-2.5 sm:mb-3 pb-2.5 sm:pb-3 border-b border-border/40">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate">{item.name}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-xs sm:text-sm font-semibold text-green-500">${item.price.toFixed(2)}</span>
          <button
            onClick={() => setEditing(true)}
            className="p-1 rounded-md hover:bg-white/10 transition-colors text-white/30 hover:text-white/70"
            title="Edit item"
          >
            <Pencil size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2.5 sm:mb-3 pb-2.5 sm:pb-3 border-b border-border/40">
      <div className="flex items-center gap-1.5">
        <input
          ref={nameRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
          className="flex-1 min-w-0 text-xs sm:text-sm font-semibold bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-foreground outline-none focus:border-white/40"
          placeholder="Item name"
        />
        <span className="text-white/40 text-xs">$</span>
        <input
          value={price}
          onChange={e => setPrice(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
          className="w-16 text-xs sm:text-sm font-semibold bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-green-400 outline-none focus:border-white/40 text-right"
          inputMode="decimal"
          placeholder="0.00"
        />
        <button onClick={commit} className="p-1 rounded-md bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors">
          <Check size={13} />
        </button>
        <button onClick={cancel} className="p-1 rounded-md hover:bg-white/10 text-white/40 transition-colors">
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Main AssignStep ───────────────────────────────────────────────────────────

export default function AssignStep({ items, setItems, people, assignments, setAssignments, onNext, onBack }) {

  const toggleAssignment = (itemId, personId) => {
    setAssignments(prev => {
      const current = prev[itemId] || [];
      const isAssigned = current.includes(personId);
      return {
        ...prev,
        [itemId]: isAssigned ? current.filter(id => id !== personId) : [...current, personId]
      };
    });
  };

  const selectAll = (itemId) => {
    setAssignments(prev => {
      const isAllAssigned = (prev[itemId] || []).length === people.length;
      return { ...prev, [itemId]: isAllAssigned ? [] : people.map(p => p.id) };
    });
  };

  const saveItem = (itemId, changes) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, ...changes } : item));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <div className="mb-4 sm:mb-5">
        <h2 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">Who ordered what?</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Assign items to people. Tap <Pencil size={10} className="inline" /> to fix any name or price.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 sm:gap-3 mb-5 sm:mb-6">
        {items.map((item, index) => {
          const assignedIds     = assignments[item.id] || [];
          const isFullyAssigned = assignedIds.length > 0;
          const allSelected     = assignedIds.length === people.length;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 28 }}
              className="border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-background"
            >
              <div className="flex items-center gap-1.5 mb-0">
                {isFullyAssigned && <CheckCircle2 size={14} className="text-green-500 shrink-0 mb-2.5 sm:mb-3" />}
                <div className="flex-1 min-w-0">
                  <EditableItemHeader
                    item={item}
                    onSave={(changes) => saveItem(item.id, changes)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {people.map(person => (
                  <button
                    key={person.id}
                    onClick={() => toggleAssignment(item.id, person.id)}
                    className={`text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border font-medium transition-all capitalize
                      ${assignedIds.includes(person.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                      }`}
                  >
                    {person.name}
                  </button>
                ))}
                {people.length > 1 && (
                  <button
                    onClick={() => selectAll(item.id)}
                    className={`text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border font-medium transition-all ml-auto
                      ${allSelected
                        ? 'bg-muted text-foreground border-border'
                        : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                      }`}
                  >
                    {allSelected ? 'Deselect All' : 'Split by All'}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-between pt-2 border-t border-border/40">
        <Button variant="outline" size="sm" className="sm:h-10 sm:px-5" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </Button>
        <Button size="sm" className="sm:h-10 sm:px-5" onClick={onNext}>
          View Summary <ArrowRight size={14} />
        </Button>
      </div>
    </motion.div>
  );
}
