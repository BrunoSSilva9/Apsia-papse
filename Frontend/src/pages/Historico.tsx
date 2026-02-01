/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight, History, Filter, X } from "lucide-react";
import { getHistorico } from "../services/api";
import PatientCard from "../components/shared/PatientCard";

const ALL_COURSES = [
  "Administração",
  "Agronomia",
  "Arquitetura e Urbanismo",
  "Artes Visuais",
  "Ciências Biológicas",
  "Ciências Contábeis",
  "Ciências Econômicas",
  "Ciências Naturais",
  "Ciências Sociais",
  "Direito",
  "Engenharia Civil",
  "Engenharia de Computação",
  "Engenharia de Materiais",
  "Engenharia de Minas e Meio Ambiente",
  "Engenharia Elétrica",
  "Engenharia Florestal",
  "Engenharia Mecânica",
  "Engenharia Química",
  "Física",
  "Geografia",
  "Geologia",
  "História",
  "Jornalismo",
  "Letras – Inglês",
  "Letras – Língua Portuguesa",
  "Letras – Português",
  "Matemática",
  "Medicina Veterinária",
  "Pedagogia",
  "Psicologia",
  "Química",
  "Saúde Coletiva",
  "Sistemas de Informação",
  "Zootecnia",
];

const Historical = () => {
  const [loading, setLoading] = useState(true);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2019;
    const years = [];
    for (let y = currentYear; y >= startYear; y--) {
      years.push(y.toString());
    }
    return years;
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await getHistorico();
        const mapped = response.data.map((item: any) => ({
          ...item.paciente,
          idHistorico: item.idHistorico,
          relationId: item.idHistorico,
          bolsistaNome: item.colaborador?.nome,
          data_desligamento: item.data_desligamento,
        }));
        setAllPatients(mapped);
        setFilteredPatients(mapped);
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getAge = (dateString: string) => {
    if (!dateString) return 0;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    let result = allPatients;

    if (searchTerm) {
      result = result.filter((p) =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedYear) {
      result = result.filter(
        (p) =>
          p.data_inscricao &&
          new Date(p.data_inscricao).getFullYear().toString() === selectedYear,
      );
    }

    if (selectedCourse) {
      result = result.filter((p) => p.curso === selectedCourse);
    }

    if (minAge || maxAge) {
      result = result.filter((p) => {
        const age = getAge(p.data_nascimento);
        const min = minAge ? parseInt(minAge) : 0;
        const max = maxAge ? parseInt(maxAge) : 150;
        return age >= min && age <= max;
      });
    }

    setFilteredPatients(result);
  }, [searchTerm, selectedYear, selectedCourse, minAge, maxAge, allPatients]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedYear("");
    setSelectedCourse("");
    setMinAge("");
    setMaxAge("");
  };

  const hasActiveFilters =
    searchTerm || selectedYear || selectedCourse || minAge || maxAge;

  return (
    <div className="w-full font-nunito">
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <span className="font-bold text-blue-900 text-lg">PAPSE</span>
        <span className="mx-2 text-gray-300">|</span>
        <Link to="/admin" className="hover:text-blue-700">
          Painel Administrativo
        </Link>
        <ChevronRight size={16} className="mx-1" />
        <span className="font-semibold text-gray-800">
          Histórico de Atendimentos
        </span>
      </div>

      <div className="bg-slate-700 rounded-xl p-8 mb-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-normal">
            <span className="font-bold text-4xl mr-2">
              {filteredPatients.length}
            </span>
            registros encontrados
          </h1>
          <p className="text-slate-300 mt-2">
            Pacientes que já tiveram seu atendimento encerrado.
          </p>
        </div>
        <div className="absolute bottom-4 right-4 opacity-50">
          <History size={64} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
          <div className="w-full lg:w-1/3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="w-full lg:w-32">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Ano</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full lg:w-56">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Curso (Todos)</option>
              {ALL_COURSES.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto bg-gray-50 p-1.5 rounded-lg border border-gray-200">
            <span className="text-xs font-semibold text-gray-500 px-1">
              Idade:
            </span>
            <input
              type="number"
              placeholder="Min"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              className="w-14 p-1 text-center text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-gray-400 text-xs">até</span>
            <input
              type="number"
              placeholder="Max"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              className="w-14 p-1 text-center text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium px-2 transition-colors ml-auto lg:ml-0 whitespace-nowrap"
            >
              <X size={16} /> Limpar
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Carregando histórico...
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Filter size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">
            Nenhum registro encontrado com os filtros atuais.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:underline mt-2 text-sm"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {filteredPatients.map((patient, index) => (
            <PatientCard
              key={patient.idHistorico || index}
              patient={patient}
              index={index}
              colorTheme="gray"
              showPosition={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Historical;
