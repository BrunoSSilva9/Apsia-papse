import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface PrivateRouteProps {
  requiredRole?: "ADMIN" | "BOLSISTA";
}

export const PrivateRoute = ({ requiredRole }: PrivateRouteProps) => {
  const { user, signed, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Carregando...
      </div>
    );
  }

  if (!signed || !user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" />;
    }
    if (user.role === "BOLSISTA") {
      return <Navigate to="/bolsista" />;
    }
  }

  return <Outlet />;
};
