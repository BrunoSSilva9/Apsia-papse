import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 10, // Limita a 5 tentativas por IP
  message: {
    message: "Muitas tentativas de login. Tente novamente após 15 minutos.",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export const publicLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  limit: 10, // Limita a 10 requisições públicas por IP (ex: recuperação de senha, inscrição)
  message: {
    message: "Muitas requisições. Tente novamente mais tarde.",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
