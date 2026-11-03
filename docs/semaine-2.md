# Bilan de la semaine 2 — candidatures étudiantes

## Choix

La planification a retenu trois étapes :

1. candidater à une offre publiée ;
2. consulter ses candidatures et leur statut ;
3. retirer une candidature encore en cours.

Les règles métier retenues sont les suivantes :

- seul un étudiant peut gérer ses candidatures ;
- une candidature n’est acceptée que pour une offre `PUBLISHED` de l’année académique courante ;
- le message est facultatif, nettoyé lorsqu’il est fourni, et limité à 1 000 caractères ;
- une candidature `IN_PROGRESS` peut être retirée ;
- une candidature déjà traitée (`SELECTED` ou `REJECTED`) ne peut plus être retirée ;
- après un retrait, une nouvelle candidature pour la même offre est possible, tout en conservant l’historique ;
- la consultation est proposée sur une page dédiée « Mes candidatures » ;
- la sélection du candidat par l’administrateur et la création du stage restent hors périmètre.

Après lecture du plan et du code existant, nous avons réutilisé la table `applications`,
les statuts déjà présents dans le schéma et les utilisateurs de démonstration. Aucune
modification de la migration initiale n’a été faite ; un index partiel a été ajouté dans
une nouvelle migration pour empêcher deux candidatures actives identiques.

## Résultat

Le parcours fonctionne :

- un étudiant peut candidater depuis la liste des offres publiées, avec ou sans message ;
- la candidature apparaît dans « Mes candidatures » avec le statut « En cours » ;
- le rechargement de la page relit la candidature depuis la base ;
- le retrait fait passer le statut à « Retirée » ;
- les statuts « Retenue » et « Non retenue » sont affichés, même si leur attribution
  par l’administrateur n’est pas encore implémentée ;
- les candidatures d’une autre année ne sont pas incluses dans la liste étudiante.

Les principaux points de difficulté ont été l’intégration avec l’architecture
repository/service/controller existante, la vérification de l’année académique courante
et la conservation de l’historique après retrait. Le périmètre reste limité : il n’y a
pas encore d’écran administrateur pour sélectionner un candidat, ni de notification
automatique.

## Modifications

### Backend

- Ajout de [application.ts](../backend/src/models/application.ts), du mapper, du
  repository, du service et du contrôleur pour exposer les candidatures.
- Ajout de la migration
  [002_application_active_unique.sql](../backend/src/db/migrations/002_application_active_unique.sql)
  avec une unicité partielle sur une candidature `IN_PROGRESS` par étudiant et par offre.
- Modification de [app.ts](../backend/src/app.ts) pour brancher `/applications`.
- Modification du repository et du service des offres pour filtrer les offres étudiantes
  sur l’année courante et vérifier qu’une offre est publiée avant une candidature.
- Mise à jour de [API.md](../backend/API.md) et ajout des requêtes reproductibles dans
  [applications.http](../backend/http/applications.http).

### Frontend

- Ajout du modèle, service et hook des candidatures.
- Ajout de [ApplicationsPage.tsx](../frontend/src/pages/ApplicationsPage.tsx) et du lien
  « Mes candidatures » dans la navigation étudiant.
- Ajout du formulaire « Candidater » dans [OfferTable.tsx](../frontend/src/components/OfferTable.tsx).
- Ajout des guards et des libellés français des statuts dans `guards.ts` et `labels.ts`.

### Tests

- Ajout de [applications.test.ts](../backend/tests/applications.test.ts) pour les appels
  HTTP et les règles serveur.
- Extension des tests de contraintes et de migrations pour l’index des candidatures actives.

## Validation fonctionnelle

Les cas suivants ont été réellement essayés par tests HTTP avec Supertest :

- `POST /applications` sur une offre publiée avec un message : réponse `201`, message
  nettoyé et statut `IN_PROGRESS` ;
- `POST /applications` sans message : réponse `201`, message `null` ;
- `GET /applications` après la création : la candidature est toujours présente avec
  son statut `IN_PROGRESS` ;
- `DELETE /applications/:id` sur une candidature en cours : réponse `204` ;
- `GET /applications` après le retrait : le statut est `WITHDRAWN` ;
- retrait d’une candidature déjà traitée : réponse `409` ;
- candidature par un contact : réponse `403 FORBIDDEN` ;
- candidature d’un étudiant à une offre `PENDING` : réponse `400 OFFER_NOT_AVAILABLE`.

Les contrôles inaccessibles depuis l’interface sont donc vérifiés directement par API et
par test ciblé. Une erreur de migration a d’abord été rencontrée parce que le test
attendait uniquement la migration initiale ; il a été corrigé pour prendre en compte la
nouvelle migration.

## Qualité

Les contrôles ont été placés côté serveur dans le service et le contrôleur ; l’interface
ne constitue donc pas une protection. L’identité de l’étudiant est issue du jeton
authentifié et la candidature est toujours recherchée avec cet identifiant.

Les entrées invalides sont refusées explicitement : identifiant d’offre incorrect,
message vide ou trop long, offre indisponible et utilisateur non étudiant. Les erreurs
utilisent le format centralisé `{ error: { code, message } }`.

La solution reste volontairement simple : pas de détail complet d’offre ni de sélection
administrateur dans cette évolution, conformément au périmètre EF-32/EF-33. Le frontend
réutilise les composants de tableau et de badge existants.

## Tests et commandes

Commandes exécutées :

- `npm run test -w backend -- tests/applications.test.ts` — **7 tests réussis** ;
- `npm run test -w backend` — **122 tests réussis** ;
- `npm test` — **122 tests backend et 47 tests frontend réussis** ;
- `npm run lint` — **réussi** ;
- `npm run typecheck` — **réussi** ;
- `npm run build` — **réussi**.

Exemple de comportement couvert :

```text
POST /applications
Authorization: token d’un contact
Body: { "offerId": 1 }
=> 403
{ "error": { "code": "FORBIDDEN", ... } }
```

Le même cas est reproductible avec la requête « Refus serveur : un contact ne peut pas
candidater » dans [applications.http](../backend/http/applications.http).
