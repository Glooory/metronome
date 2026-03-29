import { clsx } from "clsx";
import { X, type LucideIcon } from "lucide-react";
import { useEffect, useId, useState, type ReactNode, type TransitionEvent } from "react";
import { Button } from "../Button";
import styles from "./styles.module.css";

interface ModalShellProps {
  isOpen: boolean;
  title: ReactNode;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  icon?: LucideIcon;
  titleAs?: "div" | "h2";
  titleId?: string;
  overlayClassName?: string;
  panelClassName?: string;
  headerClassName?: string;
  titleRowClassName?: string;
  titleClassName?: string;
  titleIconClassName?: string;
  closeButtonClassName?: string;
}

export const ModalShell = ({
  isOpen,
  title,
  closeLabel,
  onClose,
  children,
  icon: Icon,
  titleAs = "div",
  titleId,
  overlayClassName,
  panelClassName,
  headerClassName,
  titleRowClassName,
  titleClassName,
  titleIconClassName,
  closeButtonClassName,
}: ModalShellProps) => {
  const generatedTitleId = useId();
  const resolvedTitleId = titleId ?? generatedTitleId;
  const TitleTag = titleAs;
  const [isPresent, setIsPresent] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsPresent(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isPresent) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setIsVisible(isOpen);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, isPresent]);

  const handlePanelTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "opacity" || isOpen) {
      return;
    }

    setIsPresent(false);
  };

  if (!isPresent) {
    return null;
  }

  return (
    <div
      className={clsx(styles.overlay, overlayClassName)}
      data-state={isVisible ? "open" : "closed"}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-labelledby={resolvedTitleId}
        className={clsx(styles.panel, panelClassName)}
        data-state={isVisible ? "open" : "closed"}
        onTransitionEnd={handlePanelTransitionEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={clsx(styles.header, headerClassName)}>
          <div className={clsx(styles.titleRow, titleRowClassName)}>
            {Icon ? (
              <Icon size={20} className={clsx(styles.titleIcon, titleIconClassName)} />
            ) : null}
            <TitleTag id={resolvedTitleId} className={clsx(styles.title, titleClassName)}>
              {title}
            </TitleTag>
          </div>
          <Button
            size="icon-sm"
            onClick={onClose}
            aria-label={closeLabel}
            className={closeButtonClassName}
          >
            <X size={20} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
};
