import { useState } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAvatarUrl } from '@/utils/avatars';

const DEFAULT_NAMES = ['sai charan', 'harshith', 'saaketh', 'aditya', 'vinay', 'rakesh', 'prudhvi'];

export default function PeopleStep({ people, setPeople, onNext, onBack }) {
  const [newName, setNewName] = useState('');

  const handleAddName = (nameToAdd) => {
    const trimmed = nameToAdd.trim();
    if (!trimmed) return;
    if (people.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) return;
    setPeople(prev => [...prev, { id: `person_${Date.now()}_${Math.floor(Math.random() * 1000)}`, name: trimmed }]);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    handleAddName(newName);
    setNewName('');
  };

  const handleRemove = (idToRemove) => {
    setPeople(people.filter(p => p.id !== idToRemove));
  };

  const availableDefaults = DEFAULT_NAMES.filter(
    name => !people.some(p => p.name.toLowerCase() === name.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <div className="mb-4 sm:mb-5">
        <h2 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">Who is splitting this bill?</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Add everyone involved.</p>
      </div>

      <form onSubmit={handleAddSubmit} className="flex gap-2 mb-4">
        <label htmlFor="person-name" className="sr-only">Person's name</label>
        <Input
          id="person-name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter a name…"
          autoFocus
          className="flex-1 text-sm"
        />
        <Button type="submit" variant="outline" size="sm" className="h-10 px-3 sm:px-4 shrink-0 text-xs sm:text-sm">
          Add
        </Button>
      </form>

      {availableDefaults.length > 0 && (
        <div className="mb-4 sm:mb-5">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Quick Add</p>
          <div className="flex flex-wrap gap-1.5">
            {availableDefaults.map(name => (
              <button
                key={name}
                type="button"
                onClick={() => handleAddName(name)}
                className="text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-muted border border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors capitalize"
              >
                + {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {people.length > 0 && (
        <div className="flex flex-col border border-border rounded-2xl overflow-hidden mb-5">
          <AnimatePresence>
            {people.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30, delay: index * 0.04 }}
                className="flex items-center py-2.5 sm:py-3 px-3 sm:px-4 border-b border-border/40 last:border-0"
              >
                <img
                  src={getAvatarUrl(person.name)}
                  alt={person.name}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-2 ring-background shadow-sm mr-2.5 sm:mr-3 shrink-0 bg-muted"
                />
                <span className="flex-1 text-xs sm:text-sm font-semibold text-foreground tracking-tight capitalize truncate">
                  {person.name}
                </span>
                <button
                  onClick={() => handleRemove(person.id)}
                  aria-label={`Remove ${person.name}`}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ml-2 shrink-0"
                >
                  <X size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="flex justify-between pt-2 border-t border-border/40">
        <Button variant="outline" size="sm" className="sm:h-10 sm:px-5" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </Button>
        <Button onClick={onNext} disabled={people.length === 0} size="sm" className="sm:h-10 sm:px-5">
          Assign Items <ArrowRight size={15} />
        </Button>
      </div>
    </motion.div>
  );
}
