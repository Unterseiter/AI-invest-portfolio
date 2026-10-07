import Input from '@/shared/ui/Input';
import Button from '@/shared/ui/Button';
import styles from './AuthForm.module.scss';

export default function AuthForm({ mode, onSubmit }) {
  const isRegister = mode === 'register';

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {isRegister && <Input label="Имя" type="text" autoComplete="name" required />}
      <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" required />
      <Input
        label="Пароль"
        type="password"
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        required
      />
      <Button type="submit" fullWidth>
        {isRegister ? 'Создать аккаунт' : 'Войти'}
      </Button>
    </form>
  );
}