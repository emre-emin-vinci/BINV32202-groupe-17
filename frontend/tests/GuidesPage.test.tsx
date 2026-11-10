import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import GuidesPage from "../src/pages/GuidesPage.tsx";

describe("GuidesPage", () => {
  it("affiche les ressources et leurs liens internes", () => {
    render(
      <MemoryRouter>
        <GuidesPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Guides & senseurs" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Guide de démarrage/ })).toHaveAttribute("href", "/guides/guide-de-demarrage");
    expect(screen.getByText("Senseurs de qualité")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Bilan de la semaine 2/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Bilan de la semaine 3/ })).toBeInTheDocument();
    expect(screen.getAllByText("Présent").length).toBeGreaterThan(0);
    expect(screen.getByText("Senseurs recommandés")).toBeInTheDocument();
    expect(screen.getByText("Guides recommandés")).toBeInTheDocument();
    expect(screen.getAllByText("À ajouter").length).toBeGreaterThan(0);
    expect(screen.getByText(/Évite qu'une branche cassée/)).toBeInTheDocument();
    expect(screen.getByText(/Donne une procédure commune/)).toBeInTheDocument();
  });

  it("filtre les ressources par recherche et par catégorie", () => {
    render(<GuidesPage />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Vitest" } });
    expect(screen.getByRole("link", { name: /Configuration Vitest backend/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Cahier des charges/ })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "API" }));
    expect(screen.getByRole("link", { name: /Contrat de l'API/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Configuration Vitest backend/ })).not.toBeInTheDocument();
  });
});
