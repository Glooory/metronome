import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Gauge, GripVertical, HelpCircle, ListMusic, MousePointerClick, Music2, Star, VolumeX, X } from 'lucide-react';
import styles from './styles.module.css';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  if (!isOpen) return null;
  
  return (
    <div className={styles['help-modal']} onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className={styles['help-modal__content']}
      >
        <div className={styles['help-modal__header']}>
          <div className={styles['header-title-wrapper']}>
            <HelpCircle className={styles.icon} size={20} />
            <h2 className={styles['help-modal__title']}>使用说明</h2>
          </div>
          <button onClick={onClose} className={styles['help-modal__close-btn']}>
            <X size={20} />
          </button>
        </div>
        
        <div className={clsx(styles['help-modal__body'], "custom-scrollbar")}>
          {/* BPM Control */}
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><GripVertical size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>BPM 速度控制</h3>
              <p className={styles['section-text']}>
                拖动数字旁的滑块，或点击右侧箭头调整。<br/>
                <span className={styles['text-xs']}>快捷键: <kbd className={styles.kbd}>↑</kbd> / <kbd className={styles.kbd}>↓</kbd> (Shift 加速)</span>
              </p>
            </div>
          </div>

          {/* BPM Memory */}
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><Star size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>BPM 记忆栏</h3>
              <p className={styles['section-text']}>
                点击 <strong className={styles['text-amber']}>★</strong> 保存当前速度，点击胶囊快速切换。
              </p>
            </div>
          </div>

          {/* Beat Bars */}
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><MousePointerClick size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>节拍光柱</h3>
              <p className={styles['section-text']}>
                点击光柱循环切换状态。方块数量代表强弱：<br/>
                <strong>3格</strong>=重音 · <strong>2格</strong>=次重音 · <strong>1格</strong>=普通 · <strong>空</strong>=静音
              </p>
            </div>
          </div>

          {/* Speed Trainer */}
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><Gauge size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>速度渐变训练</h3>
              <p className={styles['section-text']}>
                每隔 N 小节自动加速，适合爬音阶练习。可设置目标 BPM，达到后自动停止。
              </p>
            </div>
          </div>

          {/* Rhythm Trainer */}
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><VolumeX size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>节奏检测训练</h3>
              <p className={styles['section-text']}>
                播放 X 小节后自动静音 Y 小节。静音期间观察光柱，检测你内心的节奏是否稳定。
              </p>
            </div>
          </div>

          {/* Presets */}
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><ListMusic size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>预设与曲目单</h3>
              <p className={styles['section-text']}>
                保存常用配置（BPM、拍号、音色、节奏型），一键快速切换。
              </p>
            </div>
          </div>

          {/* Bottom Dock */}
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><Music2 size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>底部控制栏</h3>
              <p className={styles['section-text']}>
                点击"拍号"或"音色"展开选项列表。按<kbd className={styles.kbd}>空格</kbd>播放/暂停。
              </p>
            </div>
          </div>
        </div>

        <div className={styles['help-modal__footer']}>
           <p className={styles['help-modal__footer-text']}>所有设置自动保存</p>
        </div>
      </motion.div>
    </div>
  );
};
