/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import {
  User,
  MoreVertical,
  Mail,
  Phone,
  BookOpen,
  Hash,
  Calendar,
  //FileText,
} from "lucide-react";

interface Patient {
  id: number;
  nome: string;
  telefone?: string;
  curso?: string;
  matricula: string;
  motivo?: string;
  data_nascimento?: string;
  email?: string;
  bolsistaNome?: string;
}

interface Transition {
  label: string;
  action: (patient: Patient) => void;
}

interface PatientCardProps {
  patient: Patient;
  index: number;
  onEncaminhar?: Transition[];
  onEncerrar?: (patient: Patient) => void;
  showPosition?: boolean;
  colorTheme?: string;
}

const PatientCard = ({
  patient,
  index,
  onEncaminhar,
  onEncerrar,
  showPosition = true,
  colorTheme = "blue",
}: PatientCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const themeClasses: any = {
    blue: "focus:ring-blue-500",
    amber: "focus:ring-amber-500",
    indigo: "focus:ring-indigo-500",
    orange: "focus:ring-orange-500",
  };

  const textTheme: any = {
    blue: "text-blue-600 hover:text-blue-800",
    amber: "text-amber-600 hover:text-amber-800",
    indigo: "text-indigo-600 hover:text-indigo-800",
    orange: "text-orange-600 hover:text-orange-800",
  };

  const activeTextClass = textTheme[colorTheme] || textTheme.blue;

  const getIdade = (dataNasc?: string) => {
    if (!dataNasc) return "Não informada";
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return `${idade} anos`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
      <div className="bg-gray-50 border-b border-gray-200 py-2 px-4 text-center">
        <span className="text-sm font-semibold text-gray-700">
          {showPosition
            ? `${index + 1}º lugar na lista de espera`
            : `Registro #${patient.id}`}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <User size={24} className="text-gray-700" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-gray-900 truncate pr-2">
                {patient.nome}
              </h3>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MoreVertical size={20} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-10 py-1">
                    {onEncaminhar?.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => t.action(patient)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {t.label}
                      </button>
                    ))}
                    {onEncerrar && (
                      <button
                        onClick={() => onEncerrar(patient)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Encerrar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {expanded && (
              <div className="mt-4 space-y-2 text-sm text-gray-600 animate-fade-in">
                {patient.email && (
                  <div className="flex gap-2">
                    <Mail size={16} className="text-gray-400" />{" "}
                    <span>{patient.email}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Phone size={16} className="text-gray-400" />{" "}
                  <span>{patient.telefone || "Sem telefone"}</span>
                </div>
                <div className="flex gap-2">
                  <BookOpen size={16} className="text-gray-400" />{" "}
                  <span>{patient.curso || "Sem curso"}</span>
                </div>
                <div className="flex gap-2">
                  <Calendar size={16} className="text-gray-400" />{" "}
                  <span>{getIdade(patient.data_nascimento)}</span>
                </div>
                <div className="flex gap-2">
                  <Hash size={16} className="text-gray-400" />{" "}
                  <span>Matrícula: {patient.matricula}</span>
                </div>
                <div className="mt-3">
                  <span className="font-semibold text-gray-700 block mb-1">
                    Carta/Relato:
                  </span>
                  <p className="italic text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                    {patient.motivo || "Não informado"}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-3 text-center md:text-left">
              <button
                onClick={() => setExpanded(!expanded)}
                className={`text-sm font-medium ${activeTextClass} focus:outline-none`}
              >
                {expanded ? "Ver menos" : "Ver mais"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;
