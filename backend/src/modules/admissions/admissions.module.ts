import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admission } from '../../entities/admission.entity';
import { Bed } from '../../entities/bed.entity';
import { ProgressNote } from '../../entities/progress-note.entity';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Admission, Bed, ProgressNote])],
  controllers: [AdmissionsController],
  providers: [AdmissionsService],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}
