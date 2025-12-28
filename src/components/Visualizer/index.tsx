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
  subdivisionStates: boolean[];
  toggleSubdivisionState: (index: number) => void;
}

export const Visualizer = ({ activeBeat, beatsPerMeasure, beatStates, toggleBeatState, subdivision, subdivisionStates, toggleSubdivisionState }: VisualizerProps) => {
  const totalSteps = beatsPerMeasure * subdivision;

  return (
    <div className={styles.visualizer}>
        <div className={styles['visualizer__container']}>
           {Array.from({ length: totalSteps }).map((_, i) => {
             const isMainBeat = i % subdivision === 0;
             const mainBeatIndex = Math.floor(i / subdivision);
             
             const currentMainState = beatStates[mainBeatIndex] ?? BEAT_NORMAL;
             const isMainAccent = currentMainState === BEAT_ACCENT;
             const isMainMute = currentMainState === BEAT_MUTE;

             const isSubdivisionActive = subdivisionStates[i] ?? true;

             const isActive = activeBeat === i;

             // Determine effective mute state for display
             // Main beat: uses beatStates
             // Sub beat: uses subdivisionStates
             const isEffectiveMute = isMainBeat ? isMainMute : !isSubdivisionActive;

             return (
               <div 
                 key={i} 
                 onClick={() => isMainBeat ? toggleBeatState(mainBeatIndex) : toggleSubdivisionState(i)} 
                 className={styles['visualizer__column']}
               >
                  {/* Label only on Main Beats */}
                  {isMainBeat && (
                    <div className={clsx(
                        styles['visualizer__label'], 
                        isActive && !isMainMute 
                          ? (isMainAccent ? styles['visualizer__label--active-accent'] : styles['visualizer__label--active-normal']) 
                          : styles['visualizer__label--inactive']
                    )}>
                        {mainBeatIndex + 1}
                    </div>
                  )}

                  {/* THE BAR */}
                  <motion.div 
                    initial={false} 
                    animate={{ 
                        backgroundColor: isActive 
                            ? (isEffectiveMute ? "rgba(255, 255, 255, 0.4)" : isMainAccent ? "rgba(251, 191, 36, 1)" : "rgba(34, 211, 238, 1)") 
                            : (isEffectiveMute ? "rgba(255, 255, 255, 0.05)" : isMainAccent ? "rgba(251, 191, 36, 0.15)" : "rgba(34, 211, 238, 0.15)"), 
                        
                        borderColor: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.1)",
                        
                        // HEIGHT LOGIC
                        height: isMainBeat ? "48px" : "32px",
                        
                        boxShadow: isActive && !isEffectiveMute
                            ? (isMainAccent ? "0 0 50px 10px rgba(245, 158, 11, 0.5)" : "0 0 40px 8px rgba(34, 211, 238, 0.5)") 
                            : "none"
                    }} 
                    transition={{ duration: 0.05, ease: "easeOut" }} 
                    className={clsx(
                        styles['visualizer__bar'],
                        isMainBeat ? styles['visualizer__bar--main'] : styles['visualizer__bar--sub'], 
                        isEffectiveMute && !isActive && "opacity-30" 
                    )}
                  >
                     {isEffectiveMute && (
                        <div className={styles['visualizer__mute-icon']}>
                            <VolumeX size={14} className={clsx(
                              styles['visualizer__mute-icon-svg'],
                              isActive && styles['visualizer__mute-icon-svg--active']
                            )} />
                        </div>
                     )}
                  </motion.div>
                  
                  {/* Reflection only on Main */}
                  {isMainBeat && (
                     <motion.div animate={{ opacity: isActive ? 0.6 : 0.1 }} className={clsx(
                       styles['visualizer__reflection'], 
                       isMainAccent ? styles['visualizer__reflection--accent'] : isMainMute ? styles['visualizer__reflection--mute'] : styles['visualizer__reflection--normal']
                     )} />
                  )}
               </div>
             );
           })}
       </div>
    </div>
  );
};
