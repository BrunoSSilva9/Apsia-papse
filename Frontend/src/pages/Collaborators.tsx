/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  getBolsistas,
  createColaborador,
  deleteColaborador,
} from "../services/api";
import {
  User,
  Shield,
  School,
  Trash2,
  Plus,
  X,
  Calendar,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Colaborador {
  idBolsista: number;
  nome: string;
  matricula: string;
  role: string;
  data_admissao: string;
  data_saida?: string;
}

const Collaborators = () => {
  const [collaborators, setCollaborators] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] =
    useState<Colaborador | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    matricula: "",
    data_admissao: new Date().toISOString().split("T")[0],
    senha: "",
    confirmarSenha: "",
    role: "BOLSISTA",
  });

  const [formErrors, setFormErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadCollaborators();
  }, []);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const response = await getBolsistas();
      setCollaborators(response.data);
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name])
      setFormErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors: any = {};
    if (!formData.nome.trim()) errors.nome = "Nome é obrigatório";
    if (!formData.matricula.trim())
      errors.matricula = "Matrícula é obrigatória";
    if (!formData.data_admissao) errors.data_admissao = "Data obrigatória";
    if (!formData.senha) errors.senha = "Senha obrigatória";
    else if (formData.senha.length < 6) errors.senha = "Mínimo 6 caracteres";
    if (formData.senha !== formData.confirmarSenha)
      errors.confirmarSenha = "As senhas não coincidem";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await createColaborador({
        nome: formData.nome.trim(),
        matricula: formData.matricula.trim(),
        data_admissao: formData.data_admissao,
        senha: formData.senha,
        role: formData.role,
      });

      setSuccessMessage("Colaborador criado com sucesso!");
      await loadCollaborators();
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccessMessage("");
        setFormData({
          nome: "",
          matricula: "",
          data_admissao: new Date().toISOString().split("T")[0],
          senha: "",
          confirmarSenha: "",
          role: "BOLSISTA",
        });
      }, 1500);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Erro ao criar colaborador.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!collaboratorToDelete) return;
    setDeleting(true);
    try {
      await deleteColaborador(collaboratorToDelete.idBolsista);
      setSuccessMessage("Colaborador excluído!");
      await loadCollaborators();
      setTimeout(() => setShowDeleteModal(false), 1000);
    } catch {
      alert(
        "Erro ao excluir. Verifique se o colaborador possui vínculos ativos.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const admins = collaborators.filter((c) => c.role?.toUpperCase() === "ADMIN");
  const bolsistas = collaborators.filter(
    (c) => c.role?.toUpperCase() === "BOLSISTA",
  );

  return (
    <div className="w-full font-nunito p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gerenciar Colaboradores
          </h1>
          <p className="text-gray-500 text-sm">
            Administre os acessos de administradores e bolsistas.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md font-medium"
        >
          <Plus size={20} />
          Novo Colaborador
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Carregando equipe...
        </div>
      ) : (
        <div className="space-y-10">
          {/* Seção ADMINS */}
          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
              <Shield className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-700">
                Administradores{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({admins.length})
                </span>
              </h2>
            </div>

            {admins.length === 0 ? (
              <p className="text-gray-500 italic">
                Nenhum administrador encontrado.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map((admin) => (
                  <CollaboratorCard
                    key={admin.idBolsista}
                    data={admin}
                    onDelete={() => {
                      setCollaboratorToDelete(admin);
                      setShowDeleteModal(true);
                    }}
                    type="ADMIN"
                    dateFormatter={formatDate}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
              <School className="text-orange-500" size={24} />
              <h2 className="text-xl font-bold text-gray-700">
                Bolsistas{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({bolsistas.length})
                </span>
              </h2>
            </div>

            {bolsistas.length === 0 ? (
              <p className="text-gray-500 italic">
                Nenhum bolsista cadastrado.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bolsistas.map((bolsista) => (
                  <CollaboratorCard
                    key={bolsista.idBolsista}
                    data={bolsista}
                    onDelete={() => {
                      setCollaboratorToDelete(bolsista);
                      setShowDeleteModal(true);
                    }}
                    type="BOLSISTA"
                    dateFormatter={formatDate}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                Novo Colaborador
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {successMessage && (
                <div className="bg-green-50 text-green-700 p-3 rounded flex items-center gap-2">
                  <CheckCircle size={18} /> {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="bg-red-50 text-red-700 p-3 rounded flex items-center gap-2">
                  <AlertCircle size={18} /> {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: João Silva"
                />
                {formErrors.nome && (
                  <span className="text-xs text-red-500">
                    {formErrors.nome}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matrícula
                  </label>
                  <input
                    name="matricula"
                    value={formData.matricula}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {formErrors.matricula && (
                    <span className="text-xs text-red-500">
                      {formErrors.matricula}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Admissão
                  </label>
                  <input
                    type="date"
                    name="data_admissao"
                    value={formData.data_admissao}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Conta
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="BOLSISTA">Bolsista</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {formErrors.senha && (
                    <span className="text-xs text-red-500">
                      {formErrors.senha}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    name="confirmarSenha"
                    value={formData.confirmarSenha}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {formErrors.confirmarSenha && (
                    <span className="text-xs text-red-500">
                      {formErrors.confirmarSenha}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Salvando..." : "Criar Colaborador"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && collaboratorToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Excluir Colaborador?
            </h3>
            <p className="text-gray-600 mb-6">
              Você está prestes a remover{" "}
              <strong>{collaboratorToDelete.nome}</strong>. Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
              >
                {deleting ? "Excluindo..." : "Sim, Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CollaboratorCard = ({
  data,
  onDelete,
  type,
  dateFormatter,
}: {
  data: Colaborador;
  onDelete: () => void;
  type: string;
  dateFormatter: (d: string) => string;
}) => {
  const isBolsista = type === "BOLSISTA";
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow relative group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${isBolsista ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}
          >
            <User size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base">{data.nome}</h3>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${isBolsista ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}
            >
              {type}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>
          <strong>Matrícula:</strong> {data.matricula}
        </p>
        <p className="flex items-center gap-1">
          <Calendar size={14} className="text-gray-400" />
          Admissão: {dateFormatter(data.data_admissao)}
        </p>
        {data.data_saida && (
          <p className="text-red-500 font-medium text-xs">
            Saída: {dateFormatter(data.data_saida)}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100 flex justify-end">
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm group-hover:opacity-100 opacity-60"
        >
          <Trash2 size={16} /> Excluir
        </button>
      </div>
    </div>
  );
};

export default Collaborators;
