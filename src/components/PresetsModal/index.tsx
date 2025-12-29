import { motion } from 'framer-motion';
import { ListMusic, X } from 'lucide-react';
import { useState } from 'react';
import type { Preset } from '../../constants';
import styles from './styles.module.css';

interface PresetsModalProps {
  presets: Preset[];
  onSave: (name: string) => void;
  onLoad: (preset: Preset) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const PresetsModal = ({
  presets,
  onSave,
  onLoad,
  onDelete,
  onClose,
}: PresetsModalProps) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSave();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <motion.div
      className={styles['presets-modal__overlay']}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles['presets-modal']}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles['presets-modal__header']}>
          <div className={styles['presets-modal__title']}>
            <ListMusic size={20} className={styles['presets-modal__title-icon']} />
            预设与曲目单
          </div>
          <button className={styles['presets-modal__close-btn']} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles['presets-modal__content']}>
          {/* Save Current */}
          <div className={styles['presets-modal__save-section']}>
            <input
              type="text"
              className={styles['presets-modal__name-input']}
              placeholder="输入预设名称..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={30}
            />
            <button
              className={styles['presets-modal__save-btn']}
              onClick={handleSave}
              disabled={!name.trim()}
            >
              保存当前
            </button>
          </div>

          <div className={styles['presets-modal__divider']} />

          {/* Presets List */}
          <div className={styles['presets-modal__list']}>
            {presets.length === 0 ? (
              <div className={styles['presets-modal__empty-state']}>
                <div className={styles['presets-modal__empty-icon']}>📝</div>
                <div>暂无预设<br />保存当前配置以便快速切换</div>
              </div>
            ) : (
              presets.map((preset) => (
                <div key={preset.id} className={styles['presets-modal__item']}>
                  <div className={styles['presets-modal__item-info']}>
                    <div className={styles['presets-modal__item-name']}>{preset.name}</div>
                    <div className={styles['presets-modal__item-meta']}>
                      <span>{preset.bpm} BPM</span>
                      <span>{preset.beatsPerMeasure}/4</span>
                      <span>{formatDate(preset.createdAt)}</span>
                    </div>
                  </div>
                  <div className={styles['presets-modal__item-actions']}>
                    <button
                      className={`${styles['presets-modal__action-btn']} ${styles['presets-modal__action-btn--load']}`}
                      onClick={() => onLoad(preset)}
                    >
                      加载
                    </button>
                    <button
                      className={`${styles['presets-modal__action-btn']} ${styles['presets-modal__action-btn--delete']}`}
                      onClick={() => onDelete(preset.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
