export default function AuthForm({ mode, onSubmit }) {
  const isRegister = mode === "register";

  return (
    <form onSubmit={onSubmit}>
      {isRegister && <input type="text" placeholder="Имя" />}
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Пароль" />
      <button type="submit">
        {isRegister ? "Зарегистрироваться" : "Войти"}
      </button>
    </form>
  );
}
