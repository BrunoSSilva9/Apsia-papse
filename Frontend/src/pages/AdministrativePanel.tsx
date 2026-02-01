import React from "react";
import { Outlet } from "react-router-dom";
import TabNavigationAdmin from "../components/layout/TabNavigationAdmin";
import HeaderMenu from "../components/shared/HeaderMenu"; // Importando o novo menu

const AdministrativePanel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-nunito">
      <header className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-wide">
          PAPSE | Painel Administrativo
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-1">
          <HeaderMenu variant="logged-in" />
        </div>
      </header>

      <TabNavigationAdmin />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdministrativePanel;
