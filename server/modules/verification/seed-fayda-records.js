import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../../config/database.js';
import { FaydaSimulatedRecord } from './fayda-simulated.model.js';

const records = [
  { idNumber: '1234567890', name: 'Robel Alemayehu', dateOfBirth: '1999-03-14' },
  { idNumber: '2345678901', name: 'Nardos Haile', dateOfBirth: '2000-07-22' },
  { idNumber: '3456789012', name: 'Test User', dateOfBirth: '1998-01-01' },
  { idNumber: '4567890123', name: 'Sample Person', dateOfBirth: '2001-11-05' },
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