import { motion } from 'framer-motion';
import { BEAT_ACCENT, BEAT_MUTE, BEAT_SUB_ACCENT } from '../../constants';
import styles from './styles.module.css';

interface VisualizerProps {
  activeBeat: number | null;
  beatsPerMeasure: number;
  subdivision: number;
  stepStates: number[];
  toggleStepState: (index: number) => void;
}

export const Visualizer = ({ activeBeat, beatsPerMeasure, subdivision, stepStates, toggleStepState }: VisualizerProps) => {
  return (
    <div className={styles.visualizer}>
        <div className={styles['visualizer__container']}>
           {stepStates.map((currentState, i) => {
             // We now treat all steps uniformly for visualization
             // const isMainBeat = i % subdivision === 0;

             const isAccent = currentState === BEAT_ACCENT;
             const isSubAccent = currentState === BEAT_SUB_ACCENT;
             const isMute = currentState === BEAT_MUTE;

             const isActive = activeBeat === i;

             return (
               <div 
                 key={i} 
                 onClick={() => toggleStepState(i)} 
                 className={styles['visualizer__column']}
               >


                  {/* THE VISUALIZATION: STACKED BLOCKS FOR ALL STEPS */}
                  {/* We apply the same stacked logic to ALL steps now */}
                  <div className={styles['visualizer__stack']}>
                        {/* Top Block: Active only if Accent */}
                        <motion.div 
                            initial={false}
                            animate={{ 
                                backgroundColor: isActive && isAccent 
                                    ? "rgba(34, 211, 238, 1)" // Active Cyan
                                    : (isAccent ? "rgba(34, 211, 238, 0.3)" : "rgba(255, 255, 255, 0.02)"),
                                borderColor: isActive && isAccent ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.1)",
                                boxShadow: isActive && isAccent ? "0 0 20px rgba(34, 211, 238, 0.5)" : "none"
                            }}
                            className={styles['visualizer__block']}
                        />
                        {/* Middle Block: Active if Accent OR Sub-Accent */}
                        <motion.div 
                            initial={false}
                            animate={{ 
                                backgroundColor: isActive && (isAccent || isSubAccent)
                                    ? "rgba(34, 211, 238, 1)" 
                                    : ((isAccent || isSubAccent) ? "rgba(34, 211, 238, 0.3)" : "rgba(255, 255, 255, 0.02)"),
                                borderColor: isActive && (isAccent || isSubAccent) ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.1)",
                                boxShadow: isActive && (isAccent || isSubAccent) ? "0 0 20px rgba(34, 211, 238, 0.5)" : "none"
                            }}
                            className={styles['visualizer__block']}
                        />
                        {/* Bottom Block: Active unless Mute */}
                        <motion.div 
                            initial={false}
                            animate={{ 
                                backgroundColor: isActive && !isMute
                                    ? "rgba(34, 211, 238, 1)" 
                                    : (!isMute ? "rgba(34, 211, 238, 0.3)" : "rgba(255, 255, 255, 0.02)"),
                                borderColor: isActive && !isMute ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.1)",
                                boxShadow: isActive && !isMute ? "0 0 20px rgba(34, 211, 238, 0.5)" : "none"
                            }}
                            className={styles['visualizer__block']}
                        />
                  </div>
               </div>
             );
           })}
        </div>
    </div>
  );
};
