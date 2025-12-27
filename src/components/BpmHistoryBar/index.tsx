import { clsx } from 'clsx';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Star, X } from 'lucide-react';
import styles from './styles.module.css';

interface BpmHistoryBarProps {
  currentBpm: number;
  setBpm: (value: number | ((prev: number) => number)) => void;
  savedBpms: number[];
  setSavedBpms: (value: number[] | ((prev: number[]) => number[])) => void;
}

export const BpmHistoryBar = ({ currentBpm, setBpm, savedBpms, setSavedBpms }: BpmHistoryBarProps) => {
  const saveCurrentBpm = () => {
    // We need to handle the state update logic here or pass simpler props. 
    // The prop is setSavedBpms which matches useState setter signature.
    // The App logic was: setSavedBpms([...savedBpms.filter(b => b !== currentBpm), currentBpm].slice(-20));
    // Let's replicate safe logic.
    setSavedBpms((prev: number[]) => {
       const newSaved = [...prev.filter(b => b !== currentBpm), currentBpm].slice(-20);
       return newSaved;
    });
  };

  const removeBpm = (e: React.MouseEvent, bpmToRemove: number) => {
    e.stopPropagation();
    setSavedBpms((prev: number[]) => prev.filter(b => b !== bpmToRemove));
  };

  return (
    <div className={styles['history-bar']}>
      <div className={styles['history-bar__list']}>
        <LayoutGroup>
          <AnimatePresence mode='popLayout'>
            {savedBpms.map((b) => (
              <motion.div
                layout
                key={b}
                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5, width: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                onClick={() => setBpm(b)}
                className={clsx(
                  styles['history-bar__item'],
                  b === currentBpm && styles['history-bar__item--active']
                )}
              >
                <span className={styles['history-bar__item-text']}>{b}</span>
                <button 
                  onClick={(e) => removeBpm(e, b)}
                  className={styles['history-bar__remove-btn']}
                >
                  <X size={10} strokeWidth={3} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </LayoutGroup>
        
        {savedBpms.length === 0 && <span className={styles['no-history']}>No history</span>}
      </div>

      <motion.button 
        layout
        onClick={saveCurrentBpm}
        className={styles['history-bar__save-btn']}
      >
        <Star size={18} fill="currentColor" />
      </motion.button>
    </div>
  );
};
