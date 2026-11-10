import { Link, useParams } from "react-router";
import NotFoundPage from "./NotFoundPage.tsx";
import { findCatalogItem } from "./GuidesPage.tsx";

const codeFor = (title: string, path: string): string => {
  if (title === "Vérification complète") {
    return `{
  "scripts": {
    "check": "npm run lint && npm run typecheck && npm run test && npm run build"
  }
}`;
  }
  if (title === "Scripts backend") {
    return `"scripts": {
  "lint": "oxlint --deny-warnings",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "build": "tsc -p tsconfig.build.json && node scripts/copyMigrations.js"
}`;
  }
  if (title === "Scripts frontend") {
    return `"scripts": {
  "lint": "oxlint --deny-warnings",
  "typecheck": "tsc -b",
  "test": "vitest run",
  "build": "tsc -b && vite build"
}`;
  }
  if (title === "Configuration Vitest backend") {
    return `export default defineConfig({
  test: {
    setupFiles: ["./tests/helpers/requireSupportedNode.ts"],
  },
});`;
  }
  if (title === "Garde de version Node") {
    return `const MIN_NODE = [22, 14, 0];

export const requireSupportedNode = (): void => {
  if (process.versions.node < "22.14.0") {
    throw new Error("Node.js 22.14.0 ou plus récent est requis");
  }
};`;
  }
  if (title === "Configuration npm") {
    return `# Les binaires précompilés sont utilisés
ignore-scripts=true`;
  }
  if (title.includes("Tests")) {
    return `describe("fonctionnalité", () => {
  it("vérifie le comportement attendu", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
  });
});`;
  }
  if (title === "Contrat de l'API") {
    return `GET /health

// Réponse attendue
{ "status": "ok" }`;
  }
  return `// Ressource : ${path}
// Consultez cette page pour comprendre le rôle
// de ce fichier dans le projet Gesta.`;
};

const explanationFor = (title: string): string => {
  if (title === "Vérification complète") {
    return "Cette commande est le contrôle qualité principal. Elle arrête la chaîne dès qu'une étape échoue : le code est d'abord analysé, puis typé, testé et enfin compilé.";
  }
  if (title.includes("Scripts")) {
    return "Ce fichier rassemble les commandes utiles à cette partie du projet. Les mêmes contrôles sont disponibles séparément pour obtenir un diagnostic plus précis.";
  }
  if (title.includes("Tests")) {
    return "Les tests reproduisent un scénario réel et vérifient le résultat attendu. Ils servent de filet de sécurité lorsqu'une fonctionnalité est modifiée.";
  }
  if (title.includes("Configuration")) {
    return "Cette configuration indique aux outils du projet comment travailler : environnement de test, fichiers d'initialisation, proxy ou règles d'exécution.";
  }
  if (title.includes("Migrations") || title.includes("base")) {
    return "Cette ressource concerne la base SQLite. Elle permet de créer, faire évoluer ou vérifier les données sans modifier directement la base de production.";
  }
  return "Cette ressource documente une règle, une commande ou une partie de l'architecture. L'objectif est de savoir où regarder et pourquoi ce fichier existe avant de le modifier.";
};

const GuideDetailPage = () => {
  const { slug } = useParams();
  const item = slug ? findCatalogItem(slug) : undefined;

  if (!item) return <NotFoundPage />;

  return (
    <article className="guide-detail">
      <Link className="back-link" to="/guides">
        ← Retour aux guides et senseurs
      </Link>
      <div className="guide-detail-header">
        <span className="resource-kind">{item.path.endsWith("/") ? "Dossier" : "Fichier"}</span>
        <span className={`resource-status resource-status-${item.status}`}>
          <span aria-hidden="true">●</span>
          {item.status === "present" ? "Présent dans le projet" : "Proposition à ajouter"}
        </span>
        <h1>{item.title}</h1>
        <p>{item.description}</p>
        <code>{item.path}</code>
      </div>
      <div className="guide-detail-grid">
        <section className="detail-panel">
          <h2>À quoi sert cette ressource ?</h2>
          <p>{explanationFor(item.title)}</p>
          <h2>Comment la comprendre ?</h2>
          <p>
            Commencez par identifier les entrées, puis observez le résultat attendu. Pour
            les senseurs, demandez-vous quelle erreur ils détectent et à quel moment ils
            arrêtent la livraison.
          </p>
        </section>
        <section className="detail-panel code-panel">
          <h2>Extrait expliqué</h2>
          <pre><code>{codeFor(item.title, item.path)}</code></pre>
          <p className="code-caption">
            Extrait pédagogique associé à <strong>{item.path}</strong>.
          </p>
        </section>
      </div>
      {item.whyUseful && (
        <section className="recommendation-panel">
          <h2>Pourquoi cette proposition est utile</h2>
          <p>{item.whyUseful}</p>
        </section>
      )}
      <div className="resource-tags detail-tags">
        {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
    </article>
  );
};

export default GuideDetailPage;
