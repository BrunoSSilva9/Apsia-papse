import PatientList from "./PatientList";

const Historical = () => {
  return (
    <PatientList
      status="historico"
      title="Histórico de Atendimentos Encerrados"
      transitions={[]}
      canEncerrar={false}
    />
  );
};

export default Historical;
