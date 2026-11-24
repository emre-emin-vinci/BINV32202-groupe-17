# Audit des écarts de tests — EF-32 et EF-33

## Matrice de traçabilité

| Cas à vérifier | Test existant et assertion utile | Manque confirmé ou constat écarté |
|---|---|---|
| Candidater à une offre publiée avec un message | `backend/tests/applications.test.ts` — `crée une candidature avec un message` ; vérifie `201`, le message nettoyé et `IN_PROGRESS`. | Constat écarté : couvert. |
| Candidater sans message | `backend/tests/applications.test.ts` — `crée une candidature sans message et la retrouve après rechargement` ; vérifie `message: null` puis la présence après `GET`. | Constat écarté : couvert. |
| Refuser une offre non publiée | `backend/tests/applications.test.ts` — `refuse une offre non publiée et les messages invalides` ; vérifie `400` et `OFFER_NOT_AVAILABLE`. | Constat écarté pour une offre `PENDING` ; l’année précédente reste à tester si elle devient un cas requis. |
| Refuser un message vide ou composé d’espaces | Le contrôleur refuse `message.trim() === ""`, mais aucun test ne le vérifiait. | Manque confirmé, ajouté dans `refuse une offre non publiée et les messages invalides` ; vérifie `400 INVALID_BODY`. |
| Refuser un message trop long | `backend/tests/applications.test.ts` — `refuse une offre non publiée et les messages invalides` ; vérifie `400`. | Constat écarté : couvert. |
| Refuser la candidature d’un utilisateur non étudiant | `backend/tests/applications.test.ts` — `refuse côté serveur la candidature d'un utilisateur qui n'est pas étudiant` ; vérifie `403` et le corps d’erreur complet. | Constat écarté : couvert. |
| Refuser une candidature active en doublon | La contrainte SQLite était testée dans `backend/tests/db/constraints.test.ts`, mais pas la réponse API. | Manque confirmé, ajouté dans `refuse une candidature active en doublon par l'API` ; vérifie `409 APPLICATION_EXISTS`. |
| Retirer sa candidature en cours | `backend/tests/applications.test.ts` — `retire une candidature en cours, mais refuse une candidature traitée` ; vérifie `204` puis `WITHDRAWN`. | Constat écarté : couvert. |
| Refuser le retrait d’une candidature traitée | Même test ; vérifie `409` pour une candidature `SELECTED`. | Constat écarté : couvert. |
| Refuser le retrait de la candidature d’un autre étudiant | Le service et le repository filtrent par l’étudiant connecté, mais aucun test API ne le vérifiait. | Manque confirmé, ajouté dans `refuse le retrait de la candidature d'un autre étudiant` ; vérifie `404 NOT_FOUND`. |
| Voir uniquement ses candidatures | `backend/tests/applications.test.ts` — `liste uniquement les candidatures de l'étudiant connecté` ; vérifie la longueur et l’identifiant de Lucas. | Partiel : le cas d’un second étudiant n’était pas comparé explicitement. |
| Ne pas voir les candidatures d’un autre étudiant | Aucun test comparatif avant cet audit. | Manque confirmé, ajouté dans `isole les candidatures entre deux étudiants` ; vérifie les identifiants de Lucas et d’Inès et l’absence de la candidature de Lucas chez Inès. |
| Voir le statut « En cours » | Les tests de liste et de création vérifient `IN_PROGRESS`. | Constat écarté : couvert. |
| Voir le statut « Retirée » | Le test de retrait recharge la liste et vérifie `WITHDRAWN`. | Constat écarté : couvert. |
| Voir le statut « Retenue » | Le seed contient le statut, mais aucun test API ne l’exposait à l’étudiant concerné. | Manque confirmé, ajouté dans `retourne les statuts retenue et non retenue à leurs étudiants` ; vérifie `SELECTED`. |
| Voir le statut « Non retenue » | Le seed contient le statut, mais aucun test API ne l’exposait à l’étudiante concernée. | Manque confirmé, ajouté dans `retourne les statuts retenue et non retenue à leurs étudiants` ; vérifie `REJECTED`. |

## Tests ajoutés

Les tests ajoutés restent au niveau API avec Supertest, conformément aux conventions backend. Ils protègent les frontières d’identité et les contrats HTTP les plus importants d’EF-32 et EF-33.

## Validation

- `npm run test -w backend -- tests/applications.test.ts tests/db/constraints.test.ts tests/db/seed.test.ts` — non exécuté : le sandbox a refusé le lancement car l’accès au proxy local est désactivé.
- `npm run typecheck -w backend` — non exécuté pour la même raison.
- `npm run lint -w backend` — non exécuté pour la même raison.
