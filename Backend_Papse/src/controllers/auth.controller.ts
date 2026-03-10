import { type Request, type Response } from "express";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
  private authService = new AuthService();

  public login = async (req: Request, res: Response) => {
    try {
      const { email, senha } = req.body;
      const resultado = await this.authService.login({
        email: email,
        senha: senha,
      });
      res.status(200).json(resultado);
    } catch (error: any) {
      if (error.message.includes("inválidos")) {
        return res.status(401).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  };
  public forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const resultado = await this.authService.forgotPassword(email);
      res.status(200).json(resultado);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Erro ao processar solicitação de recuperação." });
    }
  };

  public resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, novaSenha } = req.body;
      const resultado = await this.authService.resetPassword(token, novaSenha);
      res.status(200).json(resultado);
    } catch (error: any) {
      if (error.message.includes("inválido ou expirado")) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro ao redefinir a senha." });
    }
  };
}
