import type { Db } from "../db/database.ts";
import type { ApplicationDbo, ApplicationStatus } from "../models/application.ts";

export interface CreateApplicationParams {
  offerId: number;
  studentId: number;
  message: string | null;
}

export const createApplicationsRepository = (db: Db) => {
  const findByStudent = db.prepare<{ studentId: number }, ApplicationDbo>(`
    SELECT a.id, a.offer_id, o.title AS offer_title, c.short_name AS company_short_name,
           ay.label AS academic_year_label, p.code AS period_code, a.message, a.status, a.applied_at
    FROM applications a
    JOIN offers o ON o.id = a.offer_id
    JOIN companies c ON c.id = o.company_id
    JOIN academic_years ay ON ay.id = o.academic_year_id AND ay.is_current = 1
    JOIN periods p ON p.id = o.period_id
    WHERE a.student_id = @studentId
    ORDER BY a.applied_at DESC, a.id DESC
  `);
  const findByIdForStudent = db.prepare<{ id: number; studentId: number }, { id: number; status: ApplicationStatus } | undefined>(`
    SELECT id, status FROM applications WHERE id = @id AND student_id = @studentId
  `);
  const findActive = db.prepare<{ offerId: number; studentId: number }, { id: number } | undefined>(`
    SELECT id FROM applications
    WHERE offer_id = @offerId AND student_id = @studentId AND status = 'IN_PROGRESS'
  `);
  const insert = db.prepare<CreateApplicationParams, { id: number }>(`
    INSERT INTO applications (offer_id, student_id, message)
    VALUES (@offerId, @studentId, @message)
    RETURNING id
  `);
  const findCreated = db.prepare<{ id: number }, ApplicationDbo>(`
    SELECT a.id, a.offer_id, o.title AS offer_title, c.short_name AS company_short_name,
           ay.label AS academic_year_label, p.code AS period_code, a.message, a.status, a.applied_at
    FROM applications a
    JOIN offers o ON o.id = a.offer_id
    JOIN companies c ON c.id = o.company_id
    JOIN academic_years ay ON ay.id = o.academic_year_id
    JOIN periods p ON p.id = o.period_id
    WHERE a.id = @id
  `);
  const withdraw = db.prepare<{ id: number; studentId: number }, { changes: number }>(`
    UPDATE applications SET status = 'WITHDRAWN'
    WHERE id = @id AND student_id = @studentId AND status = 'IN_PROGRESS'
  `);

  return {
    findByStudent: (studentId: number): ApplicationDbo[] => findByStudent.all({ studentId }),
    findByIdForStudent: (id: number, studentId: number) => findByIdForStudent.get({ id, studentId }),
    findActive: (offerId: number, studentId: number) => findActive.get({ offerId, studentId }),
    create: (params: CreateApplicationParams): ApplicationDbo => {
      const inserted = insert.get(params);
      if (!inserted) throw new Error("La candidature n'a pas été créée");
      const application = findCreated.get({ id: inserted.id });
      if (!application) throw new Error("La candidature créée est introuvable");
      return application;
    },
    withdraw: (id: number, studentId: number): boolean => withdraw.run({ id, studentId }).changes === 1,
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
