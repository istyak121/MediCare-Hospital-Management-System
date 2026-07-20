import { DataSource } from 'typeorm';

/**
 * Generate sequential, human-readable IDs per spec formats.
 * Uses a DB sequence counter per prefix to stay concurrency-safe.
 *
 * Formats (spec §3.2 / §7.3):
 *   Patient:       PAT-2026-00001
 *   Appointment:   APT-20260721-001  (date-based daily counter)
 *   Prescription:  PRX-2026-001
 *   Lab Test:      LAB-2026-001
 *   Admission:     ADM-2026-001
 *   Invoice:       INV-2026-001
 *   Employee:      EMP-2026-001
 */
export async function generateSequentialId(
  dataSource: DataSource,
  prefix: string,
  scope: string,
  padLength = 5,
): Promise<string> {
  // Use an upsert counter table for concurrency-safe sequential IDs
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    // Lock the counter row for this scope
    let counter: { current_value: string } | undefined;
    const row = await queryRunner.query(
      `SELECT current_value FROM id_counters WHERE prefix = $1 AND scope = $2 FOR UPDATE`,
      [prefix, scope],
    );
    if (row && row.length > 0) {
      counter = row[0];
    }

    let nextValue: number;
    if (counter) {
      nextValue = parseInt(counter.current_value, 10) + 1;
      await queryRunner.query(
        `UPDATE id_counters SET current_value = $3 WHERE prefix = $1 AND scope = $2`,
        [prefix, scope, nextValue.toString()],
      );
    } else {
      nextValue = 1;
      await queryRunner.query(
        `INSERT INTO id_counters (prefix, scope, current_value) VALUES ($1, $2, $3)`,
        [prefix, scope, '1'],
      );
    }

    await queryRunner.commitTransaction();
    const padded = nextValue.toString().padStart(padLength, '0');

    // Build the formatted ID based on prefix
    switch (prefix) {
      case 'APT': // APT-YYYYMMDD-XXX (date-based scope)
        return `${prefix}-${scope}-${padded}`;
      default: // PAT-2026-00001, PRX-2026-001, etc.
        return `${prefix}-${scope}-${padded}`;
    }
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}

/** Patient ID: PAT-YYYY-XXXXX */
export const generatePatientId = (ds: DataSource, year: number) =>
  generateSequentialId(ds, 'PAT', year.toString());

/** Appointment No: APT-YYYYMMDD-XXX */
export const generateAppointmentNo = (ds: DataSource, dateStr: string) =>
  generateSequentialId(ds, 'APT', dateStr, 3);

/** Prescription No: PRX-YYYY-XXX */
export const generatePrescriptionNo = (ds: DataSource, year: number) =>
  generateSequentialId(ds, 'PRX', year.toString(), 3);

/** Lab Test No: LAB-YYYY-XXX */
export const generateLabTestNo = (ds: DataSource, year: number) =>
  generateSequentialId(ds, 'LAB', year.toString(), 3);

/** Admission No: ADM-YYYY-XXX */
export const generateAdmissionNo = (ds: DataSource, year: number) =>
  generateSequentialId(ds, 'ADM', year.toString(), 3);

/** Invoice No: INV-YYYY-XXX */
export const generateInvoiceNo = (ds: DataSource, year: number) =>
  generateSequentialId(ds, 'INV', year.toString(), 3);

/** Employee ID: EMP-YYYY-XXX */
export const generateEmployeeId = (ds: DataSource, year: number) =>
  generateSequentialId(ds, 'EMP', year.toString(), 3);
