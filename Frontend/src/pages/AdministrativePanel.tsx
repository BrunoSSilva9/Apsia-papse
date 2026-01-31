import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import TabNavigationAdmin from "../components/layout/TabNavigationAdmin";

const AdministrativePanel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-nunito">
      <Header />
      <TabNavigationAdmin />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdministrativePanel;
