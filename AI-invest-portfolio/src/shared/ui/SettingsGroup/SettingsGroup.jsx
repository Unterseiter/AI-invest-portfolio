import styles from './SettingsGroup.module.scss';

export default function SettingsGroup({ title, description, children }) {
  return (
    <section className={styles.group}>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {children}
    </section>
  );
}