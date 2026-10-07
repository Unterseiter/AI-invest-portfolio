import styles from './Button.module.scss';

export default function Button({
  variant = 'primary', // primary | secondary | ghost
  size = 'md', // sm | md
  fullWidth = false,
  className = '',
  ...props
}) {
  const classes = [styles.btn, styles[variant], styles[size], fullWidth && styles.full, className]
    .filter(Boolean)
    .join(' ');
  return <button className={classes} {...props} />;
}