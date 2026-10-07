import styles from './RadioCardGroup.module.scss';

/**
 * options: [{ value, label, hint?, icon? }]
 */
export default function RadioCardGroup({ name, value, onChange, options, ariaLabel }) {
  return (
    <div className={styles.group} role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => (
        <label key={option.value} className={styles.option}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className={styles.input}
          />
          <span className={styles.body}>
            {option.icon && <span className={styles.icon}>{option.icon}</span>}
            <span className={styles.text}>
              <span className={styles.label}>{option.label}</span>
              {option.hint && <span className={styles.hint}>{option.hint}</span>}
            </span>
            <span className={styles.mark} aria-hidden="true" />
          </span>
        </label>
      ))}
    </div>
  );
}