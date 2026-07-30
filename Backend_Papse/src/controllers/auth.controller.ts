import { type Request, type Response, type NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import axios from "axios";
import { AppError } from "../errors/AppError.js";

export class AuthController {
  private authService = new AuthService();

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, senha, recaptchaToken } = req.body;

      if (process.env.NODE_ENV !== "development" && process.env.RECAPTCHA_SECRET_KEY !== "chave_local_de_teste") {
        if (!recaptchaToken) {
          throw new AppError("Falha de segurança: Token do reCAPTCHA ausente.", 403);
        }
        const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;

        const googleResponse = await axios.post(googleVerifyUrl);
        const { success, score } = googleResponse.data;

        if (!success || score < 0.5) {
          console.warn(
            `Tentativa suspeita de login bloqueada. E-mail: ${email} | Score: ${score}`,
          );
          throw new AppError("Acesso negado por medida de segurança (Atividade Suspeita).", 403);
        }
      }

      const resultado = await this.authService.login({
        email: email,
        senha: senha,
      });
      res.status(200).json({
        success: true,
        data: resultado,
        message: "Login realizado com sucesso."
      });
    } catch (error: any) {
      if (error.message.includes("inválidos")) {
        return next(new AppError(error.message, 401));
      }
      next(error);
    }
  };
  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const resultado = await this.authService.forgotPassword(email);
      res.status(200).json({
        success: true,
        data: resultado,
        message: "E-mail de recuperação enviado com sucesso."
      });
    } catch (error: any) {
      if (error.message.includes("não encontrado")) {
        return next(new AppError(error.message, 404));
      }
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, novaSenha } = req.body;
      const resultado = await this.authService.resetPassword(token, novaSenha);
      res.status(200).json({
        success: true,
        data: resultado,
        message: "Senha redefinida com sucesso."
      });
    } catch (error: any) {
      if (error.message.includes("inválido ou expirado")) {
        return next(new AppError(error.message, 400));
      }
      next(error);
    }
  };
}
