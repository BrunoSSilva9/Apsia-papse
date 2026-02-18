import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

type MenuVariant = "guest" | "logged-in";

interface HeaderMenuProps {
  variant?: MenuVariant;
}

interface MenuItem {
  label: string;
  path?: string;
  externalUrl?: string;
  action?: () => void;
}

const HeaderMenu = ({ variant = "guest" }: HeaderMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    signOut();
    closeMenu();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const guestItems: MenuItem[] = [{ label: "LOGIN", path: "/login" }];

  const loggedInItems: MenuItem[] = [
    { label: "HOME", path: "/" },
    { label: "SAIR", action: handleLogout },
  ];

  const itemsToShow = variant === "logged-in" ? loggedInItems : guestItems;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="p-1.5 text-orange-500 hover:bg-orange-100 rounded-md transition-colors focus:outline-none flex items-center justify-center"
        aria-label="Abrir menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 animate-fade-in">
          <ul className="flex flex-col">
            {itemsToShow.map((item, index) => {
              const baseClasses =
                "block w-full text-left px-4 py-2 text-gray-800 font-nunito font-bold uppercase hover:text-orange-500 hover:bg-orange-50 transition-colors text-sm";

              if (item.externalUrl) {
                return (
                  <li key={index}>
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={baseClasses}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              }

              if (item.action) {
                return (
                  <li key={index}>
                    <button onClick={item.action} className={baseClasses}>
                      {item.label}
                    </button>
                  </li>
                );
              }

              return (
                <li key={index}>
                  <Link
                    to={item.path || "/"}
                    className={baseClasses}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HeaderMenu;
