import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { ADMINISTRATOR, APPLICATION, CONTACT, OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

const studentToken = (id: number) => tokenFor("STUDENT", id);

describe("applications", () => {
  it("liste uniquement les candidatures de l'étudiant connecté", async () => {
    const response = await request(app)
      .get("/applications")
      .set("Authorization", studentToken(STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      id: APPLICATION.LUCAS_FLEET_APP,
      offerId: OFFER.FLEET_APP,
      status: "IN_PROGRESS",
    });
  });

  it("crée une candidature avec un message", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", studentToken(STUDENT.MATEUSZ_KOWALSKI))
      .send({ offerId: OFFER.INTERNAL_CHATBOT, message: "  Mon message  " });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      offerId: OFFER.INTERNAL_CHATBOT,
      message: "Mon message",
      status: "IN_PROGRESS",
    });
  });

  it("crée une candidature sans message et la retrouve après rechargement", async () => {
    const createResponse = await request(app)
      .post("/applications")
      .set("Authorization", studentToken(STUDENT.MATEUSZ_KOWALSKI))
      .send({ offerId: OFFER.INTERNAL_CHATBOT });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      offerId: OFFER.INTERNAL_CHATBOT,
      message: null,
      status: "IN_PROGRESS",
    });

    const reloadResponse = await request(app)
      .get("/applications")
      .set("Authorization", studentToken(STUDENT.MATEUSZ_KOWALSKI));

    expect(reloadResponse.status).toBe(200);
    expect(reloadResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createResponse.body.id,
          offerId: OFFER.INTERNAL_CHATBOT,
          message: null,
          status: "IN_PROGRESS",
        }),
      ]),
    );
  });

  it("refuse une offre non publiée et les messages invalides", async () => {
    const unavailable = await request(app)
      .post("/applications")
      .set("Authorization", studentToken(STUDENT.MATEUSZ_KOWALSKI))
      .send({ offerId: OFFER.E2E_TESTS });
    expect(unavailable.status).toBe(400);
    expect(unavailable.body.error.code).toBe("OFFER_NOT_AVAILABLE");

    const invalidMessage = await request(app)
      .post("/applications")
      .set("Authorization", studentToken(STUDENT.MATEUSZ_KOWALSKI))
      .send({ offerId: OFFER.INTERNAL_CHATBOT, message: " ".repeat(1001) });
    expect(invalidMessage.status).toBe(400);
  });

  it("refuse côté serveur la candidature d'un utilisateur qui n'est pas étudiant", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("CONTACT", CONTACT.MARC_LEJEUNE))
      .send({ offerId: OFFER.FLEET_APP, message: "Tentative hors interface" });

    expect(response.status).toBe(403);
    expect(response.body.error).toEqual({
      code: "FORBIDDEN",
      message: "Seul un étudiant peut gérer ses candidatures",
    });
  });

  it("retire une candidature en cours, mais refuse une candidature traitée", async () => {
    const withdrawn = await request(app)
      .delete(`/applications/${APPLICATION.LUCAS_FLEET_APP}`)
      .set("Authorization", studentToken(STUDENT.LUCAS_DUPONT));
    expect(withdrawn.status).toBe(204);

    const reloadResponse = await request(app)
      .get("/applications")
      .set("Authorization", studentToken(STUDENT.LUCAS_DUPONT));
    expect(reloadResponse.status).toBe(200);
    expect(reloadResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: APPLICATION.LUCAS_FLEET_APP,
          status: "WITHDRAWN",
        }),
      ]),
    );

    const processed = await request(app)
      .delete(`/applications/${APPLICATION.MATEUSZ_CLOUD_MIGRATION}`)
      .set("Authorization", studentToken(STUDENT.MATEUSZ_KOWALSKI));
    expect(processed.status).toBe(409);
  });

  it("refuse les actions d'un administrateur", async () => {
    const response = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ));
    expect(response.status).toBe(403);
  });
});
