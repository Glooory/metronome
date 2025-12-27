import { clsx } from 'clsx';
import { ReactNode } from 'react';
import styles from './styles.module.css';

interface LiquidGlassDockProps {
  children: ReactNode;
  className?: string;
}

export const LiquidGlassDock = ({ children, className }: LiquidGlassDockProps) => (
  <div className={clsx(styles.dock, className)}>
    {/* Top light leak */}
    <div className={styles['dock__top-light']} />
    {children}
  </div>
);
