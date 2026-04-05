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
  Mail,
  Archive,
} from "lucide-react";

interface Colaborador {
  idBolsista: number;
  nome: string;
  matricula: string;
  email: string;
  role: string;
  data_admissao: string;
  data_saida?: string;
}

const Collaborators = () => {
  const [collaborators, setCollaborators] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Estado para controlar a exibição dos inativos
  const [showInactives, setShowInactives] = useState(false);

  const [collaboratorToDelete, setCollaboratorToDelete] =
    useState<Colaborador | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
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
    if (name === "matricula") {
      const apenasNumeros = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: apenasNumeros }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (formErrors[name])
      setFormErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors: any = {};
    if (!formData.nome.trim()) errors.nome = "Nome é obrigatório";

    if (!formData.email.trim()) {
      errors.email = "E-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "E-mail inválido";
    }
    if (!formData.matricula.trim()) {
      errors.matricula = "Matrícula é obrigatória";
    } else if (!/^\d+$/.test(formData.matricula)) {
      errors.matricula = "Apenas números são permitidos";
    }
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
        email: formData.email.trim(),
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
          email: "",
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
      setSuccessMessage("Colaborador inativado com sucesso!");
      await loadCollaborators();
      setTimeout(() => setShowDeleteModal(false), 1000);
    } catch (error: any) {
      const msgErro =
        error.response?.data?.message ||
        "Erro ao processar a exclusão do colaborador.";
      alert(msgErro);
    } finally {
      setDeleting(false);
    }
  };

  const activeAdmins = collaborators.filter(
    (c) => c.role?.toUpperCase() === "ADMIN" && !c.data_saida,
  );
  const activeBolsistas = collaborators.filter(
    (c) => c.role?.toUpperCase() === "BOLSISTA" && !c.data_saida,
  );
  const inactiveCollaborators = collaborators.filter((c) => c.data_saida);

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

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Botão de Exibir Inativos */}
          <button
            onClick={() => setShowInactives(!showInactives)}
            className={`px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm font-medium border ${
              showInactives
                ? "bg-gray-200 text-gray-800 border-gray-300"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Archive size={20} />
            {showInactives ? "Ocultar Inativos" : "Ver Inativos"}
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-md font-medium"
          >
            <Plus size={20} />
            Novo Colaborador
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Carregando equipe...
        </div>
      ) : (
        <div className="space-y-10">
          {/* Seção ADMINS (Somente Ativos) */}
          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
              <Shield className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-700">
                Administradores{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({activeAdmins.length})
                </span>
              </h2>
            </div>

            {activeAdmins.length === 0 ? (
              <p className="text-gray-500 italic">
                Nenhum administrador ativo encontrado.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeAdmins.map((admin) => (
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

          {/* Seção BOLSISTAS (Somente Ativos) */}
          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
              <School className="text-orange-500" size={24} />
              <h2 className="text-xl font-bold text-gray-700">
                Bolsistas e Voluntários{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({activeBolsistas.length})
                </span>
              </h2>
            </div>

            {activeBolsistas.length === 0 ? (
              <p className="text-gray-500 italic">
                Nenhum bolsista ativo cadastrado.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBolsistas.map((bolsista) => (
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

          {/* Seção INATIVOS (Exibida Apenas se o botão for clicado) */}
          {showInactives && (
            <section className="mt-12 bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fade-in">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-300 pb-2">
                <Archive className="text-gray-500" size={24} />
                <h2 className="text-xl font-bold text-gray-700">
                  Colaboradores Inativos{" "}
                  <span className="text-sm font-normal text-gray-500">
                    ({inactiveCollaborators.length})
                  </span>
                </h2>
              </div>

              {inactiveCollaborators.length === 0 ? (
                <p className="text-gray-500 italic">
                  Não há registros de colaboradores inativos.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inactiveCollaborators.map((inativo) => (
                    <CollaboratorCard
                      key={inativo.idBolsista}
                      data={inativo}
                      onDelete={() => {}} 
                      type={inativo.role?.toUpperCase() || "BOLSISTA"}
                      dateFormatter={formatDate}
                      isInactive={true} 
                    />
                  ))}
                </div>
              )}
            </section>
          )}
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

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar"
            >
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail de Acesso
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: joao@projetopapse.org"
                />
                {formErrors.email && (
                  <span className="text-xs text-red-500">
                    {formErrors.email}
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
                    inputMode="numeric"
                    placeholder="Apenas números"
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
              Você está prestes a inativar{" "}
              <strong>{collaboratorToDelete.nome}</strong>. Esta ação bloqueará
              o acesso desta pessoa.
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
                {deleting ? "Inativando..." : "Sim, Inativar"}
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
  isInactive = false, 
}: {
  data: Colaborador;
  onDelete: () => void;
  type: string;
  dateFormatter: (d: string) => string;
  isInactive?: boolean;
}) => {
  const isBolsista = type === "BOLSISTA";

  const iconBgColor = isInactive
    ? "bg-gray-200 text-gray-500"
    : isBolsista
      ? "bg-orange-100 text-orange-600"
      : "bg-blue-100 text-blue-600";

  const badgeColor = isInactive
    ? "bg-gray-100 text-gray-600 border border-gray-200"
    : isBolsista
      ? "bg-orange-50 text-orange-700"
      : "bg-blue-50 text-blue-700";

  return (
    <div
      className={`bg-white border rounded-xl shadow-sm p-5 transition-shadow relative group ${isInactive ? "border-gray-200 opacity-80" : "border-gray-200 hover:shadow-md"}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${iconBgColor}`}>
            {isInactive ? <Archive size={24} /> : <User size={24} />}
          </div>
          <div>
            <h3
              className={`font-bold text-base ${isInactive ? "text-gray-600 line-through decoration-gray-300" : "text-gray-800"}`}
            >
              {data.nome}
            </h3>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}
            >
              {type}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p className="flex items-center gap-2">
          <Mail size={16} className="text-gray-400" />
          {data.email}
        </p>
        <p>
          <strong>Matrícula:</strong> {data.matricula}
        </p>
        <p className="flex items-center gap-1">
          <Calendar size={14} className="text-gray-400" />
          Admissão: {dateFormatter(data.data_admissao)}
        </p>
        {data.data_saida && (
          <p className="text-red-500 font-medium text-xs flex items-center gap-1 bg-red-50 p-1.5 rounded-md inline-flex mt-1">
            <AlertCircle size={14} />
            Saída: {dateFormatter(data.data_saida)}
          </p>
        )}
      </div>

      {!isInactive && (
        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm group-hover:opacity-100 opacity-60"
          >
            <Trash2 size={16} /> Inativar
          </button>
        </div>
      )}
    </div>
  );
};

export default Collaborators;
