import type { Offer } from "../models/offer.ts";
import { OFFER_STATUS_LABELS, OFFER_STATUS_TONES, PERIOD_LABELS } from "../utils/labels.ts";
import StatusBadge from "./StatusBadge.tsx";
import { useState } from "react";
import { createApplication } from "../services/applications.service.ts";
import { isUnauthorized } from "../utils/api.ts";
import type { User } from "../models/user.ts";

interface OfferTableProps {
  offers: Offer[];
  user: User;
  token: string;
  onUnauthorized: () => void;
}

const OfferTable = ({ offers, user, token, onUnauthorized }: OfferTableProps) => {
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<number[]>([]);

  const submit = async (offerId: number) => {
    try {
      await createApplication(token, offerId, message);
      setSubmitted((ids) => [...ids, offerId]);
      setSelectedOfferId(null);
      setMessage("");
      setError(null);
    } catch (reason: unknown) {
      if (isUnauthorized(reason)) onUnauthorized();
      else setError(reason instanceof Error ? reason.message : "Candidature impossible");
    }
  };

  return (
  <div className="table-wrapper">
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">Titre</th>
          <th scope="col">Entreprise</th>
          <th scope="col">Année</th>
          <th scope="col">Période</th>
          <th scope="col">Statut</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        {offers.map((offer) => (
          <tr key={offer.id}>
            <td>{offer.title}</td>
            <td>{offer.companyShortName}</td>
            <td>{offer.academicYear}</td>
            <td>{PERIOD_LABELS[offer.period]}</td>
            <td>
              <StatusBadge
                label={OFFER_STATUS_LABELS[offer.status]}
                tone={OFFER_STATUS_TONES[offer.status]}
              />
            </td>
            <td>
              {user.kind === "STUDENT" && offer.status === "PUBLISHED" && !submitted.includes(offer.id) && (
                selectedOfferId === offer.id ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void submit(offer.id);
                    }}
                  >
                    <label>
                      Message (facultatif)
                      <textarea
                        value={message}
                        maxLength={1000}
                        onChange={(event) => setMessage(event.target.value)}
                      />
                    </label>
                    <button type="submit">Envoyer</button>
                    <button type="button" onClick={() => setSelectedOfferId(null)}>Annuler</button>
                  </form>
                ) : (
                  <button type="button" onClick={() => setSelectedOfferId(offer.id)}>Candidater</button>
                )
              )}
              {submitted.includes(offer.id) && <span>Candidature envoyée</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {error && (
      <p className="state state-error" role="alert">
        {error}
      </p>
    )}
  </div>
  );
};

export default OfferTable;
