import { useMemo, useState } from "react";
import { Link } from "react-router";

export type CatalogItem = {
  title: string;
  path: string;
  description: string;
  tags: string[];
  status: "present" | "proposed";
  whyUseful?: string;
};

type CatalogSection = {
  title: string;
  description: string;
  items: CatalogItem[];
};

const sections: CatalogSection[] = [
  {
    title: "Guides et documentation",
    description: "Les documents à consulter pour comprendre, installer et développer Gesta.",
    items: [
      {
        title: "Guide de démarrage",
        path: "README.md",
        description: "Prérequis, installation, commandes, dépannage et fonctionnement du mode démo.",
        tags: ["Installation", "Développement"],
        status: "present",
      },
      {
        title: "Architecture",
        path: "docs/architecture.md",
        description: "Organisation des couches, flux backend/frontend, conventions et parcours de référence.",
        tags: ["Architecture", "Référence"],
        status: "present",
      },
      {
        title: "Cahier des charges",
        path: "docs/cdc_gesta_developpement.md",
        description: "Exigences fonctionnelles, règles métier et périmètre de l'application.",
        tags: ["Métier", "Référence"],
        status: "present",
      },
      {
        title: "Données de démonstration",
        path: "docs/seed.md",
        description: "Utilisateurs, entreprises, offres, candidatures et règles de cohérence du jeu de données.",
        tags: ["Base de données", "Démo"],
        status: "present",
      },
      {
        title: "Contrat de l'API",
        path: "backend/API.md",
        description: "Routes, authentification, formats de réponse et erreurs HTTP documentées.",
        tags: ["API", "Backend"],
        status: "present",
      },
      {
        title: "Modèle de pull request",
        path: ".github/pull_request_template.md",
        description: "Checklist de fonctionnalité, tests, droits, documentation et points d'attention.",
        tags: ["Contribution", "Revue"],
        status: "present",
      },
      {
        title: "Configuration npm",
        path: ".npmrc",
        description: "Désactive les scripts d'installation pour éviter une compilation native inutile.",
        tags: ["Configuration", "Installation"],
        status: "present",
      },
    ],
  },
  {
    title: "Senseurs de qualité",
    description: "Les commandes et configurations qui détectent les erreurs avant livraison.",
    items: [
      {
        title: "Vérification complète",
        path: "package.json",
        description: "npm run check enchaîne lint, vérification TypeScript, tests et compilation.",
        tags: ["npm run check", "Global"],
        status: "present",
      },
      {
        title: "Scripts racine",
        path: "package.json",
        description: "Déclare les commandes communes et l'exigence Node.js >= 22.14.0.",
        tags: ["npm", "Node.js"],
        status: "present",
      },
      {
        title: "Scripts backend",
        path: "backend/package.json",
        description: "Oxlint, tsc, Vitest, compilation backend, migrations et démarrage de l'API.",
        tags: ["Lint", "Types", "Tests", "Build"],
        status: "present",
      },
      {
        title: "Scripts frontend",
        path: "frontend/package.json",
        description: "Oxlint, tsc, Vitest et build Vite de l'interface React.",
        tags: ["Lint", "Types", "Tests", "Build"],
        status: "present",
      },
      {
        title: "Configuration Vitest backend",
        path: "backend/vitest.config.ts",
        description: "Branche la garde de version Node aux tests backend.",
        tags: ["Vitest", "Backend"],
        status: "present",
      },
      {
        title: "Configuration Vite et tests frontend",
        path: "frontend/vite.config.ts",
        description: "Configure le proxy API, le port 5173, jsdom et les fichiers d'initialisation des tests.",
        tags: ["Vite", "Vitest", "Frontend"],
        status: "present",
      },
      {
        title: "Tests API backend",
        path: "backend/tests/",
        description: "Tests HTTP, authentification, permissions, entreprises, offres, candidatures et santé.",
        tags: ["Vitest", "Supertest", "API"],
        status: "present",
      },
      {
        title: "Tests base de données",
        path: "backend/tests/db/",
        description: "Vérifient les contraintes SQLite, les migrations et la cohérence des données de seed.",
        tags: ["Vitest", "SQLite", "Migrations"],
        status: "present",
      },
      {
        title: "Tests interface frontend",
        path: "frontend/tests/",
        description: "Tests React Testing Library des pages, de la navigation, des guards et de la session.",
        tags: ["Vitest", "Testing Library", "UI"],
        status: "present",
      },
      {
        title: "Garde de version Node",
        path: "backend/src/requireSupportedNode.ts",
        description: "Refuse l'exécution avec une version Node trop ancienne pour le projet.",
        tags: ["Runtime", "Compatibilité"],
        status: "present",
      },
      {
        title: "Bilan de la semaine 2",
        path: "docs/semaine-2.md",
        description: "Choix et validation du parcours des candidatures étudiantes.",
        tags: ["Historique", "Candidatures"],
        status: "present",
      },
      {
        title: "Bilan de la semaine 3",
        path: "docs/semaine-3.md",
        description: "Document de suivi de l'avancement de la troisième semaine.",
        tags: ["Historique", "Suivi"],
        status: "present",
      },
    ],
  },
  {
    title: "Validation manuelle et exploitation",
    description: "Ressources pour essayer l'API, réinitialiser les données et lancer l'application.",
    items: [
      {
        title: "Requêtes REST Client",
        path: "backend/http/",
        description: "Requêtes reproductibles pour health, authentification, entreprises, offres et candidatures.",
        tags: ["REST Client", "Manuel"],
        status: "present",
      },
      {
        title: "Initialisation de la base",
        path: "backend/src/db/scripts/init.ts",
        description: "Applique les migrations et insère les données de démonstration si nécessaire.",
        tags: ["SQLite", "Migrations"],
        status: "present",
      },
      {
        title: "Réinitialisation de la base",
        path: "backend/src/db/scripts/reset.ts",
        description: "Recrée la base locale avec les données de démonstration.",
        tags: ["SQLite", "Démo"],
        status: "present",
      },
      {
        title: "Migrations SQL",
        path: "backend/src/db/migrations/",
        description: "Évolutions versionnées du schéma, appliquées dans l'ordre.",
        tags: ["SQLite", "Schéma"],
        status: "present",
      },
      {
        title: "Workflow de développement",
        path: "docs/workflow-visualisation-offre.html",
        description: "Visualisation HTML du parcours de consultation d'une offre.",
        tags: ["Workflow", "HTML"],
        status: "present",
      },
    ],
  },
  {
    title: "Senseurs recommandés",
    description: "Des contrôles utiles qui ne sont pas encore présents dans le dépôt.",
    items: [
      {
        title: "Pipeline CI GitHub Actions",
        path: ".github/workflows/quality.yml",
        description: "Lance automatiquement lint, types, tests et build à chaque pull request.",
        tags: ["CI", "GitHub Actions", "Proposition"],
        status: "proposed",
        whyUseful: "Évite qu'une branche cassée soit fusionnée et donne une validation identique à toute l'équipe.",
      },
      {
        title: "Rapport de couverture des tests",
        path: "vitest.config.ts",
        description: "Mesure les lignes et branches réellement couvertes par les tests.",
        tags: ["Couverture", "Vitest", "Proposition"],
        status: "proposed",
        whyUseful: "Révèle les règles métier ou les cas d'erreur qui ne sont jamais testés, sans confondre couverture et qualité.",
      },
      {
        title: "Analyse de dépendances",
        path: ".github/workflows/dependencies.yml",
        description: "Surveille les vulnérabilités et les mises à jour des dépendances npm.",
        tags: ["Sécurité", "Dépendances", "Proposition"],
        status: "proposed",
        whyUseful: "Réduit le risque de conserver une librairie vulnérable ou obsolète dans le backend et le frontend.",
      },
      {
        title: "Matrice de traçabilité",
        path: "docs/traceability.md",
        description: "Relie chaque exigence du cahier des charges à son code, son test et son état.",
        tags: ["Métier", "Tests", "Proposition"],
        status: "proposed",
        whyUseful: "Permet de voir rapidement quelles exigences sont implémentées et lesquelles nécessitent encore un test.",
      },
      {
        title: "Scénarios E2E navigateur",
        path: "frontend/tests/e2e/",
        description: "Teste les parcours complets de connexion, consultation, candidature et déconnexion.",
        tags: ["E2E", "Frontend", "Proposition"],
        status: "proposed",
        whyUseful: "Complète les tests unitaires en vérifiant que plusieurs pages et appels API fonctionnent ensemble.",
      },
    ],
  },
  {
    title: "Guides recommandés",
    description: "Des documents pédagogiques utiles qui pourraient être ajoutés au projet.",
    items: [
      {
        title: "Guide de contribution",
        path: "docs/contributing.md",
        description: "Explique comment développer, tester et préparer une pull request.",
        tags: ["Contribution", "Équipe", "Proposition"],
        status: "proposed",
        whyUseful: "Donne une procédure commune aux contributeurs et évite les oublis avant une pull request.",
      },
      {
        title: "Guide de débogage",
        path: "docs/debugging.md",
        description: "Aide à diagnostiquer les problèmes de démarrage, d'API, de session et de base.",
        tags: ["Support", "Développement", "Proposition"],
        status: "proposed",
        whyUseful: "Fait gagner du temps en regroupant les symptômes, les logs et les commandes de diagnostic.",
      },
      {
        title: "Guide des tests",
        path: "docs/testing.md",
        description: "Explique les tests backend, frontend, API, SQLite et les commandes ciblées.",
        tags: ["Tests", "Vitest", "Proposition"],
        status: "proposed",
        whyUseful: "Aide à écrire des tests cohérents et à choisir la bonne commande de validation.",
      },
      {
        title: "Guide des migrations",
        path: "docs/database-migrations.md",
        description: "Explique comment faire évoluer le schéma SQLite sans casser l'historique.",
        tags: ["SQLite", "Migrations", "Proposition"],
        status: "proposed",
        whyUseful: "Réduit le risque de modifier une migration déjà appliquée ou de perdre des données.",
      },
      {
        title: "Guide frontend",
        path: "docs/frontend-development.md",
        description: "Décrit les pages, hooks, services, modèles et règles d'interface.",
        tags: ["Frontend", "React", "Proposition"],
        status: "proposed",
        whyUseful: "Explique le parcours d'une fonctionnalité React et aide à placer chaque responsabilité au bon endroit.",
      },
      {
        title: "Guide backend",
        path: "docs/backend-development.md",
        description: "Décrit le parcours route, contrôleur, service, repository et base de données.",
        tags: ["Backend", "API", "Proposition"],
        status: "proposed",
        whyUseful: "Évite de mélanger la validation HTTP, les règles métier et les requêtes SQL.",
      },
      {
        title: "Guide sécurité",
        path: "docs/security.md",
        description: "Explique l'authentification, les permissions, le token et les limites du mode démo.",
        tags: ["Sécurité", "Authentification", "Proposition"],
        status: "proposed",
        whyUseful: "Rappelle les règles indispensables pour ne pas considérer le frontend ou le mode démo comme une protection.",
      },
    ],
  },
];

export const catalogSections = sections;
export const allItems = sections.flatMap((section) => section.items);

export const slugify = (title: string): string =>
  title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const findCatalogItem = (slug: string): CatalogItem | undefined =>
  allItems.find((item) => slugify(item.title) === slug);

const GuidesPage = () => {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("Tous");

  const tags = useMemo(
    () => ["Tous", ...new Set(allItems.flatMap((item) => item.tags))],
    [],
  );

  const filteredSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const matchesQuery =
            normalizedQuery.length === 0 ||
            [item.title, item.path, item.description, ...item.tags]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery);
          const matchesTag = activeTag === "Tous" || item.tags.includes(activeTag);
          return matchesQuery && matchesTag;
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [activeTag, query]);

  const visibleCount = filteredSections.reduce((count, section) => count + section.items.length, 0);
  const presentCount = allItems.filter((item) => item.status === "present").length;
  const proposedCount = allItems.filter((item) => item.status === "proposed").length;

  return (
    <section className="guides-page">
      <div className="guides-hero">
        <div>
          <p className="eyebrow">Centre de référence du projet</p>
          <h1>Guides &amp; senseurs</h1>
          <p className="guides-intro">
            Retrouvez les documents utiles, les tests et les contrôles qui garantissent la
            qualité de Gesta. Ouvrez une ressource pour voir son code, son rôle et une
            explication accessible.
          </p>
        </div>
        <div className="guides-summary" aria-label="Résumé de l'inventaire">
          <strong>{presentCount}</strong>
          <span>ressources présentes</span>
          <small>{proposedCount} proposition{proposedCount > 1 ? "s" : ""}</small>
        </div>
      </div>

      <div className="guides-toolbar">
        <label className="guides-search">
          <span>Rechercher une ressource</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex. Vitest, API, migration…"
          />
        </label>
        <div className="guides-filters" aria-label="Filtrer par catégorie">
          {tags.map((tag) => (
            <button
              className={`filter-chip${activeTag === tag ? " filter-chip-active" : ""}`}
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <p className="guides-result-count">
        {visibleCount} ressource{visibleCount > 1 ? "s" : ""} affichée{visibleCount > 1 ? "s" : ""}
      </p>

      {filteredSections.length === 0 ? (
        <p className="state state-empty">Aucune ressource ne correspond à votre recherche.</p>
      ) : (
        filteredSections.map((section) => (
          <section className="guide-section" key={section.title}>
            <div className="guide-section-heading">
              <div>
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </div>
              <span>{section.items.length}</span>
            </div>
            <div className="resource-grid">
              {section.items.map((item) => (
                <Link
                  className="resource-card"
                  to={`/guides/${slugify(item.title)}`}
                  key={`${section.title}-${item.path}-${item.title}`}
                >
                  <div className="resource-card-topline">
                    <span className="resource-kind">{item.path.endsWith("/") ? "Dossier" : "Fichier"}</span>
                    <span className={`resource-status resource-status-${item.status}`}>
                      <span aria-hidden="true">●</span>
                      {item.status === "present" ? "Présent" : "À ajouter"}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <code>{item.path}</code>
                  {item.whyUseful && <p className="resource-why"><strong>Pourquoi ?</strong> {item.whyUseful}</p>}
                  <div className="resource-tags">
                    {item.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </section>
  );
};

export default GuidesPage;
