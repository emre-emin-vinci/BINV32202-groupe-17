import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import GuideDetailPage from "../src/pages/GuideDetailPage.tsx";

describe("GuideDetailPage", () => {
  it("affiche l'explication et un extrait de code", () => {
    render(
      <MemoryRouter initialEntries={["/guides/verification-complete"]}>
        <Routes>
          <Route path="/guides/:slug" element={<GuideDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Vérification complète" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "À quoi sert cette ressource ?" })).toBeInTheDocument();
    expect(screen.getByText(/npm run lint/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Retour aux guides/ })).toHaveAttribute("href", "/guides");
  });
});
