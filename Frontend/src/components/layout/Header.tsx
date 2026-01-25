import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    signOut();
    setOpen(false);
    navigate("/login");
  }

  function handleGoHomeAndLogout() {
    signOut();
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800">
          PAPSE | Painel Administrativo
        </h1>

        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="p-2 rounded hover:bg-gray-100"
          >
            ☰
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg">
              <button
                onClick={handleGoHomeAndLogout}
                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                Home
              </button>

              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
