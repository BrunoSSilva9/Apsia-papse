import { Router } from "express";
import {
  createRelatorio,
  getRelatorios,
} from "../controllers/relatorio.controller.js";

const router = Router();

router.post("/", createRelatorio);

router.get("/:idPaciente", getRelatorios);

export default router;
