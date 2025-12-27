import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { GripVertical, HelpCircle, MousePointerClick, Music2, Star, X } from 'lucide-react';
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
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><Star size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>BPM 记忆栏</h3>
              <p className={styles['section-text']}>
                点击右侧的 <strong className={styles['text-amber']}>★</strong> 按钮可保存当前速度。列表左侧可滑动查看历史记录，点击胶囊快速切换。
              </p>
            </div>
          </div>
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><MousePointerClick size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>光柱交互</h3>
              <p className={styles['section-text']}>
                点击屏幕下方的光柱可循环切换每一拍的状态：<br/>
                <span className={styles['text-cyan']}>● 普通</span> &nbsp; 
                <span className={styles['text-amber']}>● 重音</span> &nbsp; 
                <span className={styles['text-mute']}>○ 静音</span>
              </p>
            </div>
          </div>
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><Music2 size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>底部控制栏</h3>
              <p className={styles['section-text']}>
                功能按钮已升级为弹出菜单。点击“拍号”、“音色”或“细分”可展开详细选项列表。
              </p>
            </div>
          </div>
        </div>
        <div className={styles['help-modal__footer']}>
           <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">All settings are auto-saved</p>
        </div>
      </motion.div>
    </div>
  );
};
