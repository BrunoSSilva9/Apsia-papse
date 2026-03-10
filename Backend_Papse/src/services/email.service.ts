import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const enviarEmailRecuperacao = async (
  emailDestino: string,
  token: string,
) => {
  const resetLink = `https://projetopapse.org/redefinir-senha?token=${token}`;

  const mailOptions = {
    from: `"Equipe PAPSE" <${process.env.EMAIL_USER}>`,
    to: emailDestino,
    subject: "Recuperação de Senha - Sistema PAPSE",
    html: `
      <h2>Olá!</h2>
      <p>Você solicitou a recuperação de senha no sistema PAPSE.</p>
      <p>Clique no link abaixo para criar uma nova senha:</p>
      <a href="${resetLink}" style="padding: 10px 20px; background-color: #FF7A50; color: white; text-decoration: none; border-radius: 5px;">Redefinir Senha</a>
      <p><em>Este link é válido por apenas 1 hora.</em></p>
      <p>Se você não solicitou isso, ignore este e-mail.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
