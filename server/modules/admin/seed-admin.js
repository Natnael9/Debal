import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectDatabase, disconnectDatabase } from '../../config/database.js';
import Admin from './admin.model.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@debal.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';
const ADMIN_NAME = 'Debal System Admin';
const ADMIN_ROLE = 'superadmin';

async function seedAdmin() {
  console.log('[seed-admin] Connecting to database...');
  await connectDatabase();

  const existing = await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`[seed-admin] Admin account ${ADMIN_EMAIL} already exists.`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const newAdmin = await Admin.create({
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      name: ADMIN_NAME,
      role: ADMIN_ROLE,
    });
    console.log(`\n========================================`);
    console.log(`✅ Default Admin Account Created Successfully!`);
    console.log(`   Email:    ${newAdmin.email}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role:     ${newAdmin.role}`);
    console.log(`========================================\n`);
  }

  await disconnectDatabase();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('[seed-admin] Error seeding admin account:', err);
  process.exit(1);
});
