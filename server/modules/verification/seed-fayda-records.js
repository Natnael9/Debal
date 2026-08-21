import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../../config/database.js';
import { FaydaSimulatedRecord } from './fayda-simulated.model.js';

const records = [
  { idNumber: '1234567890', name: 'Robel Alemayehu', dateOfBirth: '2004-09-05' },
  { idNumber: '2345678901', name: 'Nardos Haile', dateOfBirth: '2005-08-18' },
  { idNumber: '3456789012', name: 'Natnael Ashenafi', dateOfBirth: '2003-09-20' },
  { idNumber: '4567890123', name: 'Natnael Sebhat', dateOfBirth: '2005-09-14' },
  { idNumber: '4567890167', name: 'Natnael Abrha', dateOfBirth: '2005-07-12' },
];

async function seed() {
  await connectDatabase();
  await FaydaSimulatedRecord.deleteMany({}); // clean slate each run
  await FaydaSimulatedRecord.insertMany(records);
  console.log(`[seed] inserted ${records.length} fayda_simulated_records`);
  await disconnectDatabase();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});