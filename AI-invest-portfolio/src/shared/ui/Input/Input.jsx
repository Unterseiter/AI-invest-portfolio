import { useId } from 'react';
import styles from './Input.module.scss';

export default function Input({ label, error, id, ...props }) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input id={inputId} className={styles.input} aria-invalid={Boolean(error)} {...props} />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}