// ============================================================
// src/entities/progress-note.entity.ts
// ============================================================
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Admission } from './admission.entity';

@Entity('progress_notes')
export class ProgressNote extends BaseEntity {
  @ManyToOne(() => Admission, (adm) => adm.progressNotes)
  @JoinColumn({ name: 'admission_id' })
  admission: Admission;

  @Column({ name: 'admission_id' })
  admissionId: string;

  @Column({ name: 'doctor_id' })
  doctorId: string;

  @Column({ type: 'text' })
  note: string;
}
