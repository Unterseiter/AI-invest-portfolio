import { Link, Outlet } from "react-router-dom";
import styles from "./PublicLayout.module.scss";

export default function PublicLayout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          AI Invest Portfolio
        </Link>
        <Link to="/auth">Войти</Link>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
