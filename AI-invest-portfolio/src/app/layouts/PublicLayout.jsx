// src/app/layouts/PublicLayout.jsx
import { Link, Outlet } from 'react-router-dom';
import ThemeToggle from '@/features/theme/ui/ThemeToggle';
import styles from './PublicLayout.module.scss';

export default function PublicLayout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          AI Invest Portfolio
        </Link>
        <div className={styles.actions}>
          <ThemeToggle />
          <Link to="/auth">Войти</Link>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}