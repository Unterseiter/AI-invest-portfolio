import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/authStore';
import AuthForm from '@/features/auth/ui/AuthForm';
import Button from '@/shared/ui/Button';
import styles from './Auth.module.scss';

export default function Auth() {
  const [params, setParams] = useSearchParams();
  const mode = params.get('mode') === 'register' ? 'register' : 'login';
  const isRegister = mode === 'register';

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? '/app';

  // Заглушка: настоящий запрос к API подключим позже
  const handleSubmit = (e) => {
    e.preventDefault();
    login({ name: 'Demo user' });
    navigate(redirectTo, { replace: true });
  };

  const toggleMode = () => setParams({ mode: isRegister ? 'login' : 'register' });

  return (
    <section className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>{isRegister ? 'Создайте аккаунт' : 'С возвращением'}</h1>
        <p className={styles.subtitle}>
          {isRegister
            ? 'Пара минут, и можно собирать свой портфель.'
            : 'Войдите, чтобы продолжить работу с портфелем.'}
        </p>
        <AuthForm mode={mode} onSubmit={handleSubmit} />
        <div className={styles.switch}>
          {isRegister ? 'Уже есть аккаунт?' : 'Впервые здесь?'}
          <Button variant="ghost" size="sm" onClick={toggleMode}>
            {isRegister ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </div>
      </div>
    </section>
  );
}