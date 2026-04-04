import { Minus, Music, Plus } from "lucide-react";
import { TIME_SIGNATURE_DENOMINATORS } from "../../constants";
import type { Language } from "../../i18n";
import { translations } from "../../i18n";
import { Button } from "../Button";
import { ModalShell } from "../ModalShell";
import styles from "./styles.module.css";

const COMMON_TIME_SIGNATURES = [
  { numerator: 2, denominator: 4 },
  { numerator: 3, denominator: 4 },
  { numerator: 4, denominator: 4 },
  { numerator: 6, denominator: 8 },
  { numerator: 12, denominator: 8 },
] as const;

interface TimeSignatureModalProps {
  isOpen: boolean;
  numerator: number;
  denominator: number;
  onNumeratorChange: (value: number) => void;
  onDenominatorChange: (value: number) => void;
  onTimeSignatureChange: (numerator: number, denominator: number) => void;
  onClose: () => void;
  language: Language;
}

export const TimeSignatureModal = ({
  isOpen,
  numerator,
  denominator,
  onNumeratorChange,
  onDenominatorChange,
  onTimeSignatureChange,
  onClose,
  language,
}: TimeSignatureModalProps) => {
  const tc = translations.common;
  const t = translations.timeSignatureModal;
  const denominatorIndex = TIME_SIGNATURE_DENOMINATORS.indexOf(
    denominator as (typeof TIME_SIGNATURE_DENOMINATORS)[number]
  );

  const canIncreaseNumerator = numerator < 16;
  const canDecreaseNumerator = numerator > 1;
  const canIncreaseDenominator = denominatorIndex < TIME_SIGNATURE_DENOMINATORS.length - 1;
  const canDecreaseDenominator = denominatorIndex > 0;

  return (
    <ModalShell
      isOpen={isOpen}
      title={translations.dock.timeSignature[language]}
      closeLabel={tc.close[language]}
      onClose={onClose}
      icon={Music}
      panelClassName={styles["time-signature-modal__panel"]}
    >
      <div className={styles["time-signature-modal__content"]}>
        <div className={styles["time-signature-modal__quick-signatures"]}>
          {COMMON_TIME_SIGNATURES.map((signature) => {
            const value = `${signature.numerator}/${signature.denominator}`;
            const isSelected =
              numerator === signature.numerator && denominator === signature.denominator;

            return (
              <Button
                key={value}
                size="md"
                isChecked={isSelected}
                className={styles["time-signature-modal__quick-signature-btn"]}
                onClick={() => onTimeSignatureChange(signature.numerator, signature.denominator)}
              >
                {value}
              </Button>
            );
          })}
        </div>
        <div className={styles["time-signature-modal__grid"]}>
          <div className={styles["time-signature-modal__column"]}>
            <div className={styles["time-signature-modal__label"]}>{t.numerator[language]}</div>
            <Button
              size="icon-sm"
              className={styles["time-signature-modal__step-btn"]}
              onClick={() => canIncreaseNumerator && onNumeratorChange(numerator + 1)}
              disabled={!canIncreaseNumerator}
            >
              <Plus size={18} />
            </Button>
            <div className={styles["time-signature-modal__value"]}>{numerator}</div>
            <Button
              size="icon-sm"
              className={styles["time-signature-modal__step-btn"]}
              onClick={() => canDecreaseNumerator && onNumeratorChange(numerator - 1)}
              disabled={!canDecreaseNumerator}
            >
              <Minus size={18} />
            </Button>
          </div>

          <div className={styles["time-signature-modal__slash"]}>/</div>

          <div className={styles["time-signature-modal__column"]}>
            <div className={styles["time-signature-modal__label"]}>{t.beatUnit[language]}</div>
            <Button
              size="icon-sm"
              className={styles["time-signature-modal__step-btn"]}
              onClick={() =>
                canIncreaseDenominator &&
                onDenominatorChange(TIME_SIGNATURE_DENOMINATORS[denominatorIndex + 1])
              }
              disabled={!canIncreaseDenominator}
            >
              <Plus size={18} />
            </Button>
            <div className={styles["time-signature-modal__value"]}>{denominator}</div>
            <Button
              size="icon-sm"
              className={styles["time-signature-modal__step-btn"]}
              onClick={() =>
                canDecreaseDenominator &&
                onDenominatorChange(TIME_SIGNATURE_DENOMINATORS[denominatorIndex - 1])
              }
              disabled={!canDecreaseDenominator}
            >
              <Minus size={18} />
            </Button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
