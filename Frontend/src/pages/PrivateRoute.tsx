import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../src/hooks/useAuth";

export function PrivateRoute() {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-blue-600">
        Carregando...
      </div>
    );
  }

  return signed ? <Outlet /> : <Navigate to="/" />;
}
