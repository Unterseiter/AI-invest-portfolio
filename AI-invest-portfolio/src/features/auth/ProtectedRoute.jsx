import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "./model/authStore";

export default function ProtectedRoute() {
  const isAuth = useAuthStore((s) => s.isAuth);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
