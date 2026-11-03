import { toApplication } from "../mappers/application.mapper.ts";
import type { Application, ApplicationStatus } from "../models/application.ts";
import type { User } from "../models/user.ts";
import type { ApplicationsRepository } from "../repositories/applications.repository.ts";
import type { OffersRepository } from "../repositories/offers.repository.ts";
import { HttpError } from "../utils/httpError.ts";
import { isStudent } from "./permissions.ts";

export const createApplicationsService = (
  repository: ApplicationsRepository,
  offersRepository: OffersRepository,
) => {
  const requireStudent = (user: User): void => {
    if (!isStudent(user)) throw new HttpError(403, "FORBIDDEN", "Seul un étudiant peut gérer ses candidatures");
  };

  return {
    listApplications: (user: User): Application[] => {
      requireStudent(user);
      return repository.findByStudent(user.id).map(toApplication);
    },
    createApplication: (user: User, offerId: number, message: string | null): Application => {
      requireStudent(user);
      const offer = offersRepository.findPublishedCurrentById(offerId);
      if (!offer) throw new HttpError(400, "OFFER_NOT_AVAILABLE", "Cette offre n'est pas publiée pour l'année courante");
      if (repository.findActive(offerId, user.id)) {
        throw new HttpError(409, "APPLICATION_EXISTS", "Vous avez déjà une candidature en cours pour cette offre");
      }
      return toApplication(repository.create({ offerId, studentId: user.id, message }));
    },
    withdrawApplication: (user: User, id: number): void => {
      requireStudent(user);
      const application = repository.findByIdForStudent(id, user.id);
      if (!application) throw new HttpError(404, "NOT_FOUND", "Candidature introuvable");
      if (application.status !== ("IN_PROGRESS" satisfies ApplicationStatus)) {
        throw new HttpError(409, "APPLICATION_ALREADY_PROCESSED", "Cette candidature a déjà été traitée");
      }
      repository.withdraw(id, user.id);
    },
  };
};

export type ApplicationsService = ReturnType<typeof createApplicationsService>;
