import React from "react";
import WaitingListCard from "../components/cards/WaitingListCard";
import type { WaitingList } from "../types/index";

const ManageAppointments: React.FC = () => {
  const waitingLists: WaitingList[] = [
    {
      id: 1,
      title: "Lista de espera",
      description: "Pacientes aguardando atendimento inicial.",
      color: "blue",
      icon: "users",
      to: "/admin/lista-espera",
    },
    {
      id: 2,
      title: "Lista de espera para atendimentos regulares",
      description: "Pacientes aguardando atendimento regular.",
      color: "amber",
      icon: "clipboard",
      to: "/admin/lista-espera-atendimento-regular",
    },
    {
      id: 3,
      title: "Lista de atendimentos de protocolo",
      description: "Pacientes em atendimento protocolar.",
      color: "darkblue",
      icon: "document",
      to: "/admin/lista-atendimento-protocolo",
    },
    {
      id: 4,
      title: "Lista de atendimentos regulares",
      description: "Pacientes em atendimento psicológico regular.",
      color: "coral",
      icon: "refresh",
      to: "/admin/lista-atendimento-regular",
    },

    {
      id: 5,
      title: "Gerenciar Colaboradores",
      description: "Cadastrar e remover bolsistas e administradores.",
      color: "purple",
      icon: "shield",
      to: "/admin/gerenciamento-colaboradores",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {waitingLists.map((list) => (
        <WaitingListCard
          key={list.id}
          title={list.title}
          description={list.description}
          color={list.color}
          icon={list.icon}
          to={list.to}
        />
      ))}
    </div>
  );
};

export default ManageAppointments;
