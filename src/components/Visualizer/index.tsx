import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { VolumeX } from 'lucide-react';
import { BEAT_ACCENT, BEAT_MUTE, BEAT_NORMAL } from '../../constants';
import styles from './styles.module.css';

interface VisualizerProps {
  activeBeat: number | null;
  beatsPerMeasure: number;
  beatStates: number[];
  toggleBeatState: (index: number) => void;
  subdivision: number;
}

export const Visualizer = ({ activeBeat, beatsPerMeasure, beatStates, toggleBeatState, subdivision }: VisualizerProps) => {
  const totalSteps = beatsPerMeasure * subdivision;

  return (
    <div className={styles.visualizer}>
        <div className={styles['visualizer__container']}>
           {Array.from({ length: totalSteps }).map((_, i) => {
             const isMainBeat = i % subdivision === 0;
             const mainBeatIndex = Math.floor(i / subdivision);
             
             const currentState = beatStates[mainBeatIndex] ?? BEAT_NORMAL;
             const isAccent = currentState === BEAT_ACCENT;
             const isMute = currentState === BEAT_MUTE;

             const isActive = activeBeat === i;

             return (
               <div 
                 key={i} 
                 onClick={() => toggleBeatState(mainBeatIndex)} 
                 className={styles['visualizer__column']}
               >
                  {/* Label only on Main Beats */}
                  {isMainBeat && (
                    <div className={clsx(
                        styles['visualizer__label'], 
                        isActive && !isMute ? (isAccent ? "text-amber-100 scale-110 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" : "text-cyan-100 scale-110 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]") : "text-white/30 scale-100 group-hover:text-white/60"
                    )}>
                        {mainBeatIndex + 1}
                    </div>
                  )}

                  {/* THE BAR */}
                  <motion.div 
                    initial={false} 
                    animate={{ 
                        backgroundColor: isActive 
                            ? (isMute ? "rgba(255, 255, 255, 0.4)" : isAccent ? "rgba(251, 191, 36, 1)" : "rgba(34, 211, 238, 1)") 
                            : (isMute ? "rgba(255, 255, 255, 0.05)" : isAccent ? "rgba(251, 191, 36, 0.15)" : "rgba(34, 211, 238, 0.15)"), 
                        
                        borderColor: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.1)",
                        
                        // HEIGHT LOGIC
                        height: isMainBeat ? "48px" : "32px",
                        
                        boxShadow: isActive && !isMute
                            ? (isAccent ? "0 0 50px 10px rgba(245, 158, 11, 0.5)" : "0 0 40px 8px rgba(34, 211, 238, 0.5)") 
                            : "none"
                    }} 
                    transition={{ duration: 0.05, ease: "easeOut" }} 
                    className={clsx(
                        styles['visualizer__bar'],
                        isMainBeat ? styles['visualizer__bar--main'] : styles['visualizer__bar--sub'], 
                        isMute && !isActive && "opacity-30" 
                    )}
                  >
                     {isMainBeat && isMute && (
                        <div className={styles['visualizer__mute-icon']}>
                            <VolumeX size={18} className={clsx("transition-colors duration-100", isActive ? "text-black/60" : "text-white/40")} />
                        </div>
                     )}
                  </motion.div>
                  
                  {/* Reflection only on Main */}
                  {isMainBeat && (
                     <motion.div animate={{ opacity: isActive ? 0.6 : 0.1 }} className={clsx(styles['visualizer__reflection'], isAccent ? "bg-amber-400/40" : isMute ? "bg-white/10" : "bg-cyan-400/40")} />
                  )}
               </div>
             );
           })}
       </div>
    </div>
  );
};
