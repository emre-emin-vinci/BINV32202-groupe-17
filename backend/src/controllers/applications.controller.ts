import { Router } from "express";
import { toApplicationDto } from "../mappers/application.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import type { ApplicationsService } from "../services/applications.service.ts";
import { HttpError } from "../utils/httpError.ts";

const parsePositiveInteger = (value: unknown, field: string): number => {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new HttpError(400, "INVALID_BODY", `${field} doit être un entier positif`);
  }
  return value;
};

const parseApplicationId = (value: string): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "INVALID_QUERY", "Identifiant de candidature invalide");
  return id;
};

export const createApplicationsRouter = (service: ApplicationsService) => {
  const router = Router();

  router.get("/", (req, res) => {
    res.json(service.listApplications(getCurrentUser(req)).map(toApplicationDto));
  });

  router.post("/", (req, res) => {
    const body: unknown = req.body;
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      throw new HttpError(400, "INVALID_BODY", "Le corps de la requête est invalide");
    }
    const record = body as Record<string, unknown>;
    const offerId = parsePositiveInteger(record.offerId, "offerId");
    let message: string | null = null;
    if (record.message !== undefined && record.message !== null) {
      if (typeof record.message !== "string" || record.message.trim() === "" || record.message.length > 1000) {
        throw new HttpError(400, "INVALID_BODY", "Le message est facultatif, non vide et limité à 1 000 caractères");
      }
      message = record.message.trim();
    }
    const application = service.createApplication(getCurrentUser(req), offerId, message);
    res.status(201).json(toApplicationDto(application));
  });

  router.delete("/:id", (req, res) => {
    service.withdrawApplication(getCurrentUser(req), parseApplicationId(req.params.id));
    res.status(204).send();
  });

  return router;
};
