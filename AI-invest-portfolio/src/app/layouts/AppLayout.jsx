import { Suspense } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model/authStore";
import Spinner from "@/shared/ui/Spinner";
import styles from "./AppLayout.module.scss";

const links = [
  { to: "/app/portfolio", label: "Портфель" },
  { to: "/app/dashboard", label: "Аналитика" },
  { to: "/app/settings", label: "Настройки" },
];

export default function AppLayout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>AI Invest</div>
        <nav className={styles.nav}>
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button className={styles.logout} onClick={handleLogout}>
          Выйти
        </button>
      </aside>

      <main className={styles.content}>
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
