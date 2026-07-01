import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { enviarEmailRecuperacao } from "./email.service.js";

export interface LoginDto {
  email: string;
  senha: string;
}

export class AuthService {
  private async logAuthEvent(idBolsista: number, acao: string) {
    try {
      const { AuditService } = await import("./audit.service.js");
      const audit = new AuditService();
      await audit.log({
        idBolsista,
        acao,
        entidade: "Colaborador",
        entidadeId: idBolsista,
      });
    } catch (e) {
      // ignore
    }
  }

  async login(data: LoginDto) {
    const colaborador = await prisma.colaborador.findUnique({
      where: { email: data.email },
    });

    if (!colaborador || colaborador.data_saida !== null) {
      throw new Error("E-mail inválido, senha incorreta ou conta inativa.");
    }

    if (!colaborador) {
      throw new Error("Email ou senha inválidos.");
    }

    const senhaValida = await bcrypt.compare(data.senha, colaborador.senha);

    if (!senhaValida) {
      await this.logAuthEvent(colaborador.idBolsista, "FALHA_LOGIN");
      throw new Error("E-mail ou senha inválidos.");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("Segredo JWT não configurado no servidor.");
    }

    const token = jwt.sign(
      {
        id: colaborador.idBolsista,
        role: colaborador.role,
      },
      secret,
      {
        expiresIn: "8h",
      },
    );

    await this.logAuthEvent(colaborador.idBolsista, "LOGIN_SUCESSO");

    const { senha, resetToken, resetTokenExpires, ...colaboradorLimpo } = colaborador;
    return {
      usuario: colaboradorLimpo,
      token: token,
    };
  }
  async forgotPassword(email: string) {
    const colaborador = await prisma.colaborador.findUnique({
      where: { email },
    });

    if (!colaborador) {
      return {
        message: "Se o e-mail existir, um link de recuperação foi enviado.",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 3600000);

    await prisma.colaborador.update({
      where: { email },
      data: {
        resetToken: resetToken,
        resetTokenExpires: tokenExpires,
      },
    });

    await enviarEmailRecuperacao(email, resetToken);

    return { message: "E-mail de recuperação enviado com sucesso." };
  }

  async resetPassword(token: string, novaSenha: string) {
    const colaborador = await prisma.colaborador.findFirst({
      where: {
        resetToken: token,
      },
    });

    if (!colaborador) {
      throw new Error("Token inválido ou não encontrado.");
    }

    const agora = new Date();
    if (!colaborador.resetTokenExpires || colaborador.resetTokenExpires < agora) {
      throw new Error("Token expirado. Por favor, solicite um novo link.");
    }

    const hashedSenha = await bcrypt.hash(novaSenha, 10);

    await prisma.colaborador.update({
      where: { idBolsista: colaborador.idBolsista }, 
      data: {
        senha: hashedSenha,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return { message: "Senha redefinida com sucesso." };
  }
}
