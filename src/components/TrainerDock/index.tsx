import { clsx } from 'clsx';
import { Gauge, ListMusic, VolumeX } from 'lucide-react';
import type { RhythmTrainerConfig, SpeedTrainerConfig } from '../../constants';
import styles from './styles.module.css';

interface TrainerDockProps {
  speedTrainer: SpeedTrainerConfig;
  rhythmTrainer: RhythmTrainerConfig;
  onSpeedClick: () => void;
  onRhythmClick: () => void;
  onPresetsClick: () => void;
}

export const TrainerDock = ({
  speedTrainer,
  rhythmTrainer,
  onSpeedClick,
  onRhythmClick,
  onPresetsClick,
}: TrainerDockProps) => {
  return (
    <div className={styles['trainer-dock']}>
      <button
        className={clsx(styles['trainer-dock__btn'], speedTrainer.enabled && styles['trainer-dock__btn--active'])}
        onClick={onSpeedClick}
        title="速度渐变训练"
      >
        <Gauge size={16} className={styles['trainer-dock__btn-icon']} />
        <span>速度</span>
      </button>

      <button
        className={clsx(styles['trainer-dock__btn'], rhythmTrainer.enabled && styles['trainer-dock__btn--active'])}
        onClick={onRhythmClick}
        title="节奏检测训练"
      >
        <VolumeX size={16} className={styles['trainer-dock__btn-icon']} />
        <span>节奏</span>
      </button>

      <button
        className={styles['trainer-dock__btn']}
        onClick={onPresetsClick}
        title="预设与曲目单"
      >
        <ListMusic size={16} className={styles['trainer-dock__btn-icon']} />
        <span>预设</span>
      </button>
    </div>
  );
};
