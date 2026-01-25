import { useState } from "react";

const Header: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800">
          PAPSE | Administrative Panel
        </h1>

        {/* Container relativo do menu */}
        <div className="relative">
          {/* Botão Hambúrguer */}
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Open menu"
            type="button"
          >
            ☰
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg">
              <button
                onClick={() => setOpen(false)}
                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                type="button"
              >
                Home
              </button>

              <button
                onClick={() => setOpen(false)}
                className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                type="button"
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
