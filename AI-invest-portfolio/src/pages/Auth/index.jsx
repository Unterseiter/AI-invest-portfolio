import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model/authStore";
import AuthForm from "@/features/auth/ui/AuthForm";

export default function Auth() {
  const [params, setParams] = useSearchParams();
  const mode = params.get("mode") === "register" ? "register" : "login";

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? "/app";

  // Заглушка: настоящий запрос к API подключим позже
  const handleSubmit = (e) => {
    e.preventDefault();
    login({ name: "Demo user" });
    navigate(redirectTo, { replace: true });
  };

  const toggleMode = () =>
    setParams({ mode: mode === "login" ? "register" : "login" });

  return (
    <section>
      <h1>{mode === "register" ? "Регистрация" : "Вход"}</h1>
      <AuthForm mode={mode} onSubmit={handleSubmit} />
      <button onClick={toggleMode}>
        {mode === "register" ? "Уже есть аккаунт?" : "Создать аккаунт"}
      </button>
    </section>
  );
}
