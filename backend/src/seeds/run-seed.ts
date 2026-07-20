import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { UserRole, WardType, BedType, BedStatus, Gender } from '../entities/enums';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { Staff } from '../entities/staff.entity';
import { Patient } from '../entities/patient.entity';
import { Ward } from '../entities/ward.entity';
import { Bed } from '../entities/bed.entity';
import { Medicine } from '../entities/medicine.entity';
import { LabTestType } from '../entities/lab-test-type.entity';
import { Setting } from '../entities/setting.entity';
import {
  departments as deptData,
  doctors as docData,
  medicines as medData,
  labTestTypes as labData,
  patients as patData,
} from './seed-data';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  await dataSource.synchronize(true);
  console.log('Schema synchronized');

  await dataSource.query(
    'CREATE TABLE IF NOT EXISTS id_counters (' +
    'prefix VARCHAR(10) NOT NULL, ' +
    'scope VARCHAR(20) NOT NULL, ' +
    'current_value VARCHAR(20) NOT NULL DEFAULT \'0\', ' +
    'PRIMARY KEY (prefix, scope))'
  );
  console.log('id_counters ready');

  // Departments
  for (const d of deptData) {
    const dept = new Department();
    dept.name = d.name;
    dept.nameBn = d.nameBn;
    dept.icon = d.icon;
    dept.description = d.description;
    await dataSource.manager.save(dept);
  }
  const departments = await dataSource.manager.find(Department);
  console.log(departments.length + ' departments seeded');

  // Super Admin
  const adminUser = new User();
  adminUser.email = 'admin@medicare.com';
  adminUser.password = await bcrypt.hash('Admin@123', 12);
  adminUser.role = UserRole.SUPER_ADMIN;
  adminUser.isActive = true;
  await dataSource.manager.save(adminUser);
  console.log('Admin: admin@medicare.com / Admin@123');

  // Role staff
  const roleStaff = [
    { email: 'doctor@medicare.com', password: 'Doctor@123', role: UserRole.DOCTOR, fullName: 'Dr. Demo Doctor', designation: 'Consultant' },
    { email: 'reception@medicare.com', password: 'Reception@123', role: UserRole.RECEPTIONIST, fullName: 'Receptionist Demo', designation: 'Senior Receptionist' },
    { email: 'nurse@medicare.com', password: 'Nurse@123', role: UserRole.NURSE, fullName: 'Nurse Demo', designation: 'Senior Staff Nurse' },
    { email: 'pharmacist@medicare.com', password: 'Pharmacist@123', role: UserRole.PHARMACIST, fullName: 'Pharmacist Demo', designation: 'Senior Pharmacist' },
    { email: 'lab@medicare.com', password: 'Lab@123', role: UserRole.LAB_TECHNICIAN, fullName: 'Lab Tech Demo', designation: 'Senior Lab Technician' },
    { email: 'accountant@medicare.com', password: 'Accountant@123', role: UserRole.ACCOUNTANT, fullName: 'Accountant Demo', designation: 'Senior Accountant' },
  ];

  for (const rs of roleStaff) {
    const user = new User();
    user.email = rs.email;
    user.password = await bcrypt.hash(rs.password, 12);
    user.role = rs.role;
    user.isActive = true;
    await dataSource.manager.save(user);

    const staff = new Staff();
    staff.userId = user.id;
    staff.fullName = rs.fullName;
    staff.phone = '01700000000';
    staff.gender = Gender.MALE;
    staff.employeeId = 'DEMO-' + rs.role;
    staff.departmentId = departments[0].id;
    staff.designation = rs.designation;
    await dataSource.manager.save(staff);
    console.log(rs.role + ': ' + rs.email + ' / ' + rs.password);
  }

  // Doctors from seed data
  for (let di = 0; di < docData.length; di++) {
    const doc = docData[di];
    const user = new User();
    user.email = doc.fullName.toLowerCase().replace(/[^a-z]/g, '.') + '@medicare.com';
    user.password = await bcrypt.hash('Doctor@123', 12);
    user.role = UserRole.DOCTOR;
    user.isActive = true;
    await dataSource.manager.save(user);

    const staff = new Staff();
    staff.userId = user.id;
    staff.fullName = doc.fullName;
    staff.fullNameBn = doc.fullNameBn;
    staff.phone = '017' + Math.floor(10000000 + Math.random() * 90000000);
    staff.gender = Gender.MALE;
    staff.employeeId = 'EMP-2026-' + String(di + 2).padStart(3, '0');
    staff.departmentId = departments[doc.deptIndex].id;
    staff.designation = 'Senior Consultant';
    staff.specialization = doc.specialization;
    staff.qualifications = doc.qualifications;
    staff.experienceYears = doc.experienceYears;
    staff.consultationFee = doc.consultationFee;
    await dataSource.manager.save(staff);
  }
  console.log(docData.length + ' doctors seeded');

  // Patients
  for (let i = 0; i < patData.length; i++) {
    const p = patData[i];
    const patient = new Patient();
    patient.patientId = 'PAT-2026-' + String(i + 1).padStart(5, '0');
    patient.fullName = p.fullName;
    patient.fullNameBn = p.fullNameBn;
    patient.phone = p.phone;
    patient.dateOfBirth = new Date(p.dateOfBirth);
    patient.gender = p.gender;
    patient.bloodGroup = p.bloodGroup;
    patient.address = p.address;
    await dataSource.manager.save(patient);
  }
  console.log(patData.length + ' patients seeded');

  // Wards and Beds
  const wardConfigs = [
    { name: 'General Ward A', wardType: WardType.GENERAL, floor: 1, beds: ['G-A01','G-A02','G-A03','G-A04','G-A05','G-A06','G-A07','G-A08','G-A09','G-A10'] },
    { name: 'Cabin Wing', wardType: WardType.CABIN, floor: 2, beds: ['C-01','C-02','C-03','C-04','C-05','C-06','C-07','C-08'] },
    { name: 'ICU', wardType: WardType.ICU, floor: 1, beds: ['ICU-01','ICU-02','ICU-03','ICU-04','ICU-05'] },
    { name: 'NICU', wardType: WardType.NICU, floor: 1, beds: ['NICU-01','NICU-02','NICU-03'] },
    { name: 'CCU', wardType: WardType.CCU, floor: 3, beds: ['CCU-01','CCU-02','CCU-03'] },
  ];

  for (const wc of wardConfigs) {
    const ward = new Ward();
    ward.name = wc.name;
    ward.wardType = wc.wardType;
    ward.departmentId = departments[0].id;
    ward.floorNumber = wc.floor;
    await dataSource.manager.save(ward);

    for (const bn of wc.beds) {
      const bed = new Bed();
      bed.bedNumber = bn;
      bed.wardId = ward.id;
      bed.bedType = BedType.GENERAL;
      bed.dailyRent = wc.wardType === WardType.CABIN ? 3000 : wc.wardType === WardType.ICU ? 8000 : 1000;
      bed.status = BedStatus.AVAILABLE;
      await dataSource.manager.save(bed);
    }
  }
  console.log('Wards and beds seeded');

  // Medicines
  for (const m of medData) {
    const medicine = new Medicine();
    medicine.name = m.name;
    medicine.genericName = m.genericName;
    medicine.brandName = m.brandName;
    medicine.category = m.category;
    medicine.strength = m.strength;
    medicine.unit = m.unit;
    medicine.unitPrice = m.unitPrice;
    medicine.sellingPrice = m.sellingPrice;
    medicine.stockQuantity = m.stockQuantity;
    medicine.reorderLevel = m.reorderLevel;
    await dataSource.manager.save(medicine);
  }
  console.log(medData.length + ' medicines seeded');

  // Lab test types
  for (const l of labData) {
    const ltt = new LabTestType();
    ltt.name = l.name;
    ltt.nameBn = l.nameBn;
    ltt.category = l.category;
    ltt.price = l.price;
    ltt.turnaroundTime = l.turnaroundTime;
    await dataSource.manager.save(ltt);
  }
  console.log(labData.length + ' lab test types seeded');

  // Settings
  const settings = [
    { key: 'hospital_name', value: 'MediCare Hospital Ltd.', type: 'string' },
    { key: 'hospital_name_bn', value: 'মেডিকেয়ার হাসপাতাল লিমিটেড', type: 'string' },
    { key: 'hospital_address', value: '123 Dhanmondi, Dhaka-1205, Bangladesh', type: 'string' },
    { key: 'hospital_phone', value: '+880 2-XXXX-XXXX', type: 'string' },
    { key: 'hospital_email', value: 'info@medicarehospital.com', type: 'string' },
    { key: 'currency', value: 'BDT', type: 'string' },
    { key: 'currency_symbol', value: '৳', type: 'string' },
    { key: 'enable_bengali', value: 'true', type: 'boolean' },
    { key: 'tax_rate', value: '0', type: 'number' },
  ];

  for (const s of settings) {
    const setting = new Setting();
    setting.key = s.key;
    setting.value = s.value;
    setting.type = s.type;
    await dataSource.manager.save(setting);
  }
  console.log('Settings seeded');

  console.log('\nSeed complete!');
  console.log('Super Admin: admin@medicare.com / Admin@123');
  console.log('Doctor:      doctor@medicare.com / Doctor@123');
  console.log('Reception:   reception@medicare.com / Reception@123');
  console.log('Nurse:       nurse@medicare.com / Nurse@123');

  await app.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
