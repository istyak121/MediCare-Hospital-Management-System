// ============================================================
// Demo data from spec §15
// ============================================================
import { MedicineCategory, Gender, BloodGroup } from '../entities/enums';

export const departments = [
  { name: 'Cardiology', nameBn: 'হৃদরোগ', icon: 'Heart', description: 'Heart and cardiovascular system' },
  { name: 'Neurology', nameBn: 'স্নায়ুরোগ', icon: 'Brain', description: 'Brain and nervous system' },
  { name: 'Orthopedics', nameBn: 'অস্থিরোগ', icon: 'Bone', description: 'Bones and joints' },
  { name: 'Gastroenterology', nameBn: 'পাচনতন্ত্র', icon: 'Stomach', description: 'Digestive system' },
  { name: 'Pediatrics', nameBn: 'শিশুরোগ', icon: 'Baby', description: 'Children health' },
  { name: 'Gynecology & Obstetrics', nameBn: 'স্ত্রীরোগ ও প্রসূতি', icon: 'Users', description: 'Women health and pregnancy' },
  { name: 'Dermatology', nameBn: 'চর্মরোগ', icon: 'Sparkles', description: 'Skin conditions' },
  { name: 'ENT', nameBn: 'কান নাক গলা', icon: 'Ear', description: 'Ear, nose, throat' },
  { name: 'Ophthalmology', nameBn: 'চক্ষুরোগ', icon: 'Eye', description: 'Eye care' },
  { name: 'Urology', nameBn: 'মূত্রনালী', icon: 'Droplets', description: 'Urinary system' },
  { name: 'Nephrology', nameBn: 'কিডনি', icon: 'Kidney', description: 'Kidney care' },
  { name: 'Oncology', nameBn: 'ক্যান্সার', icon: 'Ribbon', description: 'Cancer treatment' },
  { name: 'Psychiatry', nameBn: 'মানসিক স্বাস্থ্য', icon: 'BrainCircuit', description: 'Mental health' },
  { name: 'Dental', nameBn: 'দন্তরোগ', icon: 'Smile', description: 'Dental care' },
  { name: 'Emergency Medicine', nameBn: 'জরুরি চিকিৎসা', icon: 'Siren', description: 'Emergency care' },
];

export const doctors = [
  { fullName: 'Dr. Abdullah Al Mamun', fullNameBn: 'ডা. আবদুল্লাহ আল মামুন', specialization: 'Cardiology', qualifications: ['MBBS (DMC)', 'MD (Cardiology)', 'FACC (USA)'], experienceYears: 15, consultationFee: 1500, deptIndex: 0 },
  { fullName: 'Dr. Fatema Begum', fullNameBn: 'ডা. ফাতেমা বেগম', specialization: 'Gynecology', qualifications: ['MBBS (SSMC)', 'FCPS (OBGYN)', 'MRCOG (UK)'], experienceYears: 12, consultationFee: 1200, deptIndex: 5 },
  { fullName: 'Dr. Kamal Hossain', fullNameBn: 'ডা. কামাল হোসেন', specialization: 'Orthopedics', qualifications: ['MBBS (RMC)', 'MS (Ortho)', 'Fellowship (Singapore)'], experienceYears: 18, consultationFee: 1000, deptIndex: 2 },
  { fullName: 'Dr. Nasreen Sultana', fullNameBn: 'ডা. নাসরিন সুলতানা', specialization: 'Pediatrics', qualifications: ['MBBS (DMC)', 'MD (Pediatrics)', 'MRCPCH (UK)'], experienceYears: 10, consultationFee: 800, deptIndex: 4 },
  { fullName: 'Dr. Rafiqul Islam', fullNameBn: 'ডা. রফিকুল ইসলাম', specialization: 'Neurology', qualifications: ['MBBS (SSMC)', 'MD (Neurology)', 'Fellowship (India)'], experienceYears: 14, consultationFee: 1300, deptIndex: 1 },
  { fullName: 'Dr. Sharmin Akter', fullNameBn: 'ডা. শারমিন আক্তার', specialization: 'Dermatology', qualifications: ['MBBS (DMC)', 'FCPS (Dermatology)'], experienceYears: 8, consultationFee: 700, deptIndex: 6 },
  { fullName: 'Dr. Mohammad Ali', fullNameBn: 'ডা. মোহাম্মদ আলী', specialization: 'Gastroenterology', qualifications: ['MBBS (RMC)', 'MD (Gastro)', 'MRCP (UK)'], experienceYears: 16, consultationFee: 1100, deptIndex: 3 },
  { fullName: 'Dr. Sajeda Khatun', fullNameBn: 'ডা. সাজেদা খাতুন', specialization: 'Ophthalmology', qualifications: ['MBBS (DMC)', 'FCPS (Ophthalmology)', 'FRCS (Glasgow)'], experienceYears: 11, consultationFee: 900, deptIndex: 8 },
  { fullName: 'Dr. Rahim Uddin', fullNameBn: 'ডা. রহিম উদ্দিন', specialization: 'Urology', qualifications: ['MBBS (SSMC)', 'MS (Urology)', 'Fellowship (Germany)'], experienceYears: 13, consultationFee: 1000, deptIndex: 9 },
  { fullName: 'Dr. Tahmina Rahman', fullNameBn: 'ডা. তাহমিনা রহমান', specialization: 'Nephrology', qualifications: ['MBBS (DMC)', 'MD (Nephrology)'], experienceYears: 9, consultationFee: 1000, deptIndex: 10 },
  { fullName: 'Dr. Anisur Rahman', fullNameBn: 'ডা. আনিসুর রহমান', specialization: 'Oncology', qualifications: ['MBBS (RMC)', 'MD (Oncology)', 'Fellowship (USA)'], experienceYears: 17, consultationFee: 1500, deptIndex: 11 },
  { fullName: 'Dr. Farhana Islam', fullNameBn: 'ডা. ফারহানা ইসলাম', specialization: 'Psychiatry', qualifications: ['MBBS (DMC)', 'MD (Psychiatry)'], experienceYears: 7, consultationFee: 600, deptIndex: 12 },
  { fullName: 'Dr. Mahmudul Hasan', fullNameBn: 'ডা. মাহমুদুল হাসান', specialization: 'ENT', qualifications: ['MBBS (SSMC)', 'MS (ENT)', 'FRCS (Edinburgh)'], experienceYears: 12, consultationFee: 800, deptIndex: 7 },
  { fullName: 'Dr. Rehana Parvin', fullNameBn: 'ডা. রেহানা পারভিন', specialization: 'Dental', qualifications: ['BDS (DMC)', 'MDS (Orthodontics)'], experienceYears: 6, consultationFee: 500, deptIndex: 13 },
  { fullName: 'Dr. Abdul Kader', fullNameBn: 'ডা. আবদুল কাদের', specialization: 'Emergency Medicine', qualifications: ['MBBS (DMC)', 'FCPS (Emergency Medicine)'], experienceYears: 10, consultationFee: 500, deptIndex: 14 },
];

export const medicines = [
  { name: 'Napa', genericName: 'Paracetamol', brandName: 'Square', category: MedicineCategory.TABLET, strength: '500mg', unit: 'tablet', unitPrice: 0.50, sellingPrice: 1.50, stockQuantity: 5000, reorderLevel: 500 },
  { name: 'Seclo', genericName: 'Omeprazole', brandName: 'Square', category: MedicineCategory.CAPSULE, strength: '20mg', unit: 'capsule', unitPrice: 2.00, sellingPrice: 5.00, stockQuantity: 3000, reorderLevel: 300 },
  { name: 'Monas', genericName: 'Montelukast', brandName: 'Square', category: MedicineCategory.TABLET, strength: '10mg', unit: 'tablet', unitPrice: 3.00, sellingPrice: 8.00, stockQuantity: 2000, reorderLevel: 200 },
  { name: 'Amloc', genericName: 'Amlodipine', brandName: 'Square', category: MedicineCategory.TABLET, strength: '5mg', unit: 'tablet', unitPrice: 1.50, sellingPrice: 4.00, stockQuantity: 4000, reorderLevel: 400 },
  { name: 'Metformin', genericName: 'Metformin HCl', brandName: 'Incepta', category: MedicineCategory.TABLET, strength: '500mg', unit: 'tablet', unitPrice: 1.00, sellingPrice: 3.00, stockQuantity: 6000, reorderLevel: 600 },
  { name: 'NovoRapid', genericName: 'Insulin Aspart', brandName: 'Novo Nordisk', category: MedicineCategory.INJECTION, strength: '100U/ml', unit: 'vial', unitPrice: 450.00, sellingPrice: 650.00, stockQuantity: 200, reorderLevel: 20 },
  { name: 'Cef-3', genericName: 'Cefixime', brandName: 'Square', category: MedicineCategory.CAPSULE, strength: '200mg', unit: 'capsule', unitPrice: 5.00, sellingPrice: 12.00, stockQuantity: 2500, reorderLevel: 250 },
  { name: 'Azithrocin', genericName: 'Azithromycin', brandName: 'Square', category: MedicineCategory.TABLET, strength: '500mg', unit: 'tablet', unitPrice: 8.00, sellingPrice: 18.00, stockQuantity: 3000, reorderLevel: 300 },
  { name: 'Doxicap', genericName: 'Doxycycline', brandName: 'Incepta', category: MedicineCategory.CAPSULE, strength: '100mg', unit: 'capsule', unitPrice: 3.00, sellingPrice: 7.00, stockQuantity: 2000, reorderLevel: 200 },
  { name: 'Losectil', genericName: 'Esomeprazole', brandName: 'Incepta', category: MedicineCategory.CAPSULE, strength: '40mg', unit: 'capsule', unitPrice: 4.00, sellingPrice: 10.00, stockQuantity: 2500, reorderLevel: 250 },
  { name: 'Fexo', genericName: 'Fexofenadine', brandName: 'Square', category: MedicineCategory.TABLET, strength: '120mg', unit: 'tablet', unitPrice: 2.50, sellingPrice: 6.00, stockQuantity: 1500, reorderLevel: 150 },
  { name: 'Prednisolone', genericName: 'Prednisolone', brandName: 'Incepta', category: MedicineCategory.TABLET, strength: '5mg', unit: 'tablet', unitPrice: 1.00, sellingPrice: 2.50, stockQuantity: 1000, reorderLevel: 100 },
  { name: 'Diazepam', genericName: 'Diazepam', brandName: 'Opsin', category: MedicineCategory.TABLET, strength: '5mg', unit: 'tablet', unitPrice: 0.50, sellingPrice: 1.50, stockQuantity: 800, reorderLevel: 80 },
  { name: 'Salbutamol', genericName: 'Salbutamol', brandName: 'Square', category: MedicineCategory.INHALER, strength: '100mcg', unit: 'puff', unitPrice: 80.00, sellingPrice: 150.00, stockQuantity: 500, reorderLevel: 50 },
  { name: 'Atorvastatin', genericName: 'Atorvastatin', brandName: 'Incepta', category: MedicineCategory.TABLET, strength: '10mg', unit: 'tablet', unitPrice: 3.00, sellingPrice: 8.00, stockQuantity: 3000, reorderLevel: 300 },
  { name: 'Losartan', genericName: 'Losartan', brandName: 'Square', category: MedicineCategory.TABLET, strength: '50mg', unit: 'tablet', unitPrice: 2.00, sellingPrice: 5.00, stockQuantity: 2500, reorderLevel: 250 },
  { name: 'Ciprofloxacin', genericName: 'Ciprofloxacin', brandName: 'Renata', category: MedicineCategory.TABLET, strength: '500mg', unit: 'tablet', unitPrice: 4.00, sellingPrice: 10.00, stockQuantity: 2000, reorderLevel: 200 },
  { name: 'Diclofenac', genericName: 'Diclofenac Sodium', brandName: 'Square', category: MedicineCategory.TABLET, strength: '50mg', unit: 'tablet', unitPrice: 1.00, sellingPrice: 3.00, stockQuantity: 4000, reorderLevel: 400 },
  { name: 'Ranitidine', genericName: 'Ranitidine', brandName: 'Acme', category: MedicineCategory.TABLET, strength: '150mg', unit: 'tablet', unitPrice: 1.00, sellingPrice: 2.00, stockQuantity: 5000, reorderLevel: 500 },
];

export const labTestTypes = [
  { name: 'Complete Blood Count (CBC)', nameBn: 'সম্পূর্ণ রক্ত পরীক্ষা', category: 'Hematology', price: 350, turnaroundTime: '2 hours' },
  { name: 'Random Blood Sugar (RBS)', nameBn: 'যেকোনো সময় রক্তে শর্করা', category: 'Biochemistry', price: 150, turnaroundTime: '1 hour' },
  { name: 'Fasting Blood Sugar (FBS)', nameBn: 'খালি পেটে রক্তে শর্করা', category: 'Biochemistry', price: 150, turnaroundTime: '1 hour' },
  { name: 'HbA1c', nameBn: 'এইচবিএ১সি', category: 'Biochemistry', price: 800, turnaroundTime: '4 hours' },
  { name: 'Lipid Profile', nameBn: 'লিপিড প্রোফাইল', category: 'Biochemistry', price: 900, turnaroundTime: '4 hours' },
  { name: 'Liver Function Test (LFT)', nameBn: 'লিভার ফাংশন টেস্ট', category: 'Biochemistry', price: 1200, turnaroundTime: '4 hours' },
  { name: 'Thyroid Function Test (TFT)', nameBn: 'থাইরয়েড ফাংশন টেস্ট', category: 'Biochemistry', price: 1500, turnaroundTime: '24 hours' },
  { name: 'Serum Creatinine', nameBn: 'সেরাম ক্রিয়েটিনিন', category: 'Biochemistry', price: 300, turnaroundTime: '2 hours' },
  { name: 'Urine R/E', nameBn: 'প্রস্রাব পরীক্ষা', category: 'Microbiology', price: 200, turnaroundTime: '2 hours' },
  { name: 'X-Ray Chest PA View', nameBn: 'বুকের এক্স-রে', category: 'Radiology', price: 500, turnaroundTime: '1 hour' },
  { name: 'USG Whole Abdomen', nameBn: 'পেটের আল্ট্রাসাউন্ড', category: 'Radiology', price: 1500, turnaroundTime: '2 hours' },
  { name: 'ECG', nameBn: 'ইসিজি', category: 'Cardiology', price: 300, turnaroundTime: '30 minutes' },
  { name: 'Echo Cardiography', nameBn: 'একো কার্ডিওগ্রাফি', category: 'Cardiology', price: 2500, turnaroundTime: '1 hour' },
  { name: 'CT Scan Brain', nameBn: 'ব্রেইন সিটি স্ক্যান', category: 'Radiology', price: 8000, turnaroundTime: '4 hours' },
  { name: 'MRI Brain', nameBn: 'ব্রেইন এমআরআই', category: 'Radiology', price: 12000, turnaroundTime: '24 hours' },
];

export interface SeedPatient {
  fullName: string; fullNameBn: string; phone: string; dateOfBirth: string;
  gender: Gender; bloodGroup: BloodGroup; address: string;
}

export const patients: SeedPatient[] = [
  { fullName: 'Mohammad Ali', fullNameBn: 'মোহাম্মদ আলী', phone: '01712345678', dateOfBirth: '1980-05-15', gender: Gender.MALE, bloodGroup: BloodGroup.B_POSITIVE, address: 'House 12, Road 5, Dhanmondi, Dhaka' },
  { fullName: 'Sajeda Khatun', fullNameBn: 'সাজেদা খাতুন', phone: '01812345679', dateOfBirth: '1975-08-22', gender: Gender.FEMALE, bloodGroup: BloodGroup.O_POSITIVE, address: 'House 45, Block C, Mirpur 10, Dhaka' },
  { fullName: 'Rahim Uddin', fullNameBn: 'রহিম উদ্দিন', phone: '01912345680', dateOfBirth: '1990-03-10', gender: Gender.MALE, bloodGroup: BloodGroup.A_POSITIVE, address: 'Flat 3B, Gulshan Avenue, Dhaka' },
  { fullName: 'Fatema Begum', fullNameBn: 'ফাতেমা বেগম', phone: '01612345681', dateOfBirth: '1985-11-30', gender: Gender.FEMALE, bloodGroup: BloodGroup.AB_POSITIVE, address: 'House 78, Sector 7, Uttara, Dhaka' },
  { fullName: 'Abdul Karim', fullNameBn: 'আবদুল করিম', phone: '01512345682', dateOfBirth: '1965-01-20', gender: Gender.MALE, bloodGroup: BloodGroup.O_NEGATIVE, address: 'House 23, Road 7, Mohammadpur, Dhaka' },
  { fullName: 'Shamima Akhter', fullNameBn: 'শামীমা আক্তার', phone: '01722345671', dateOfBirth: '1992-07-08', gender: Gender.FEMALE, bloodGroup: BloodGroup.A_NEGATIVE, address: 'House 3, Road 10, Banani, Dhaka' },
  { fullName: 'Mizanur Rahman', fullNameBn: 'মিজানুর রহমান', phone: '01832345672', dateOfBirth: '1978-12-25', gender: Gender.MALE, bloodGroup: BloodGroup.B_POSITIVE, address: 'House 67, Road 2, Baridhara, Dhaka' },
  { fullName: 'Nargis Sultana', fullNameBn: 'নার্গিস সুলতানা', phone: '01542345673', dateOfBirth: '1995-04-18', gender: Gender.FEMALE, bloodGroup: BloodGroup.O_POSITIVE, address: 'House 9, Road 15, Malibagh, Dhaka' },
  { fullName: 'Shahidul Islam', fullNameBn: 'শহিদুল ইসলাম', phone: '01952345674', dateOfBirth: '1982-09-30', gender: Gender.MALE, bloodGroup: BloodGroup.AB_POSITIVE, address: 'House 34, Road 8, Shyamoli, Dhaka' },
  { fullName: 'Rokeya Begum', fullNameBn: 'রোকেয়া বেগম', phone: '01662345675', dateOfBirth: '1988-01-05', gender: Gender.FEMALE, bloodGroup: BloodGroup.A_POSITIVE, address: 'House 55, Block D, Mirpur 12, Dhaka' },
];
