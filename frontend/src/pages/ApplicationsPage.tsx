import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import StatusBadge from "../components/StatusBadge.tsx";
import type { Application } from "../models/application.ts";
import { useApplications } from "../hooks/useApplications.ts";
import type { User } from "../models/user.ts";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_TONES, PERIOD_LABELS } from "../utils/labels.ts";

interface ApplicationsPageProps {
  user: User;
  token: string;
  onUnauthorized: () => void;
}

const ApplicationsPage = ({ user, token, onUnauthorized }: ApplicationsPageProps) => {
  const { applications, isLoading, error, withdraw } = useApplications(token, onUnauthorized);
  const handleWithdraw = async (application: Application) => {
    if (window.confirm(`Retirer votre candidature pour « ${application.offerTitle} » ?`)) {
      await withdraw(application.id);
    }
  };

  return (
    <section>
      <h1>Mes candidatures</h1>
      <p>Les candidatures de {user.firstName}, pour l’année académique en cours.</p>
      {error && <ErrorState message={error} />}
      {isLoading && <LoadingState />}
      {!isLoading && !error && applications.length === 0 && (
        <EmptyState message="Aucune candidature à afficher." />
      )}
      {!isLoading && !error && applications.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Offre</th><th>Entreprise</th><th>Période</th><th>Statut</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>{application.offerTitle}</td>
                  <td>{application.companyShortName}</td>
                  <td>{PERIOD_LABELS[application.period]}</td>
                  <td>
                    <StatusBadge
                      label={APPLICATION_STATUS_LABELS[application.status]}
                      tone={APPLICATION_STATUS_TONES[application.status]}
                    />
                  </td>
                  <td>
                    {application.status === "IN_PROGRESS" && (
                      <button type="button" onClick={() => void handleWithdraw(application)}>
                        Retirer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ApplicationsPage;
