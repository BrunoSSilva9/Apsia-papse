import { NavLink } from "react-router-dom";

const TabNavigationAdmin: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-8">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }
          >
            Gerenciar Atendimentos
          </NavLink>

          <NavLink
            to="/admin/report"
            className={({ isActive }) =>
              `py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }
          >
            Relatorios
          </NavLink>

          <NavLink
            to="/admin/historical"
            className={({ isActive }) =>
              `py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }
          >
            Histórico
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default TabNavigationAdmin;
