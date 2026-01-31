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
  UserCheck,
  //FileText,
} from "lucide-react";

interface Patient {
  id?: number;
  idPaciente?: number;
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
  onAddRelatorio?: (patient: Patient) => void;
  showPosition?: boolean;
  colorTheme?: string;
}

const PatientCard = ({
  patient,
  index,
  onEncaminhar,
  onEncerrar,
  onAddRelatorio,
  showPosition = true,
  colorTheme = "blue",
}: PatientCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayId = patient.id || patient.idPaciente || "---";

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
    <div
      className={`bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors relative ${expanded ? "ring-2 ring-opacity-50" : ""}`}
    >
      <div className="bg-gray-50 border-b border-gray-200 py-2 px-4 text-center rounded-t-xl">
        <span className="text-sm font-semibold text-gray-700">
          {showPosition
            ? `${index + 1}º lugar na lista de espera`
            : `Registro #${displayId}`}
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
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <MoreVertical size={20} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 animate-fade-in origin-top-right">
                    {onEncaminhar?.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          t.action(patient);
                          setMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        {t.label}
                      </button>
                    ))}

                    {onAddRelatorio && (
                      <button
                        onClick={() => {
                          onAddRelatorio(patient);
                          setMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors border-t border-gray-100"
                      >
                        Adicionar Relatório
                      </button>
                    )}

                    {onEncerrar && (
                      <>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => {
                            onEncerrar(patient);
                            setMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Encerrar Inscrição
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {!expanded && (
              <div className="mt-1">
                <p className="text-sm text-gray-500">
                  {patient.curso || "Curso não informado"}
                </p>
                {patient.bolsistaNome && (
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded">
                    <UserCheck size={12} />
                    <span>Resp: {patient.bolsistaNome}</span>
                  </div>
                )}
              </div>
            )}

            {expanded && (
              <div className="mt-4 space-y-2 text-sm text-gray-600 animate-fade-in">
                {patient.bolsistaNome && (
                  <div className="flex items-center gap-2 mb-3 text-blue-700 bg-blue-50 p-2 rounded-md border border-blue-100">
                    <UserCheck size={18} />
                    <span className="font-bold text-xs uppercase tracking-wide">
                      Responsável:
                    </span>
                    <span className="font-semibold">
                      {patient.bolsistaNome}
                    </span>
                  </div>
                )}
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
                  <p className="italic text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 text-xs">
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
