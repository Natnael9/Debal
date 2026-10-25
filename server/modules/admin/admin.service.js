import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from './admin.model.js';

const BCRYPT_COST_FACTOR = 12;
const ADMIN_TOKEN_TTL = '15m';

class AdminError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin._id.toString(), type: 'admin', role: admin.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ADMIN_TOKEN_TTL }
  );
}

/**
 * POST /admin/auth/login — checks against the admins collection, never
 * users (architecture doc §12.2). No self-registration exists for admins.
 */
async function loginAdmin({ email, password }) {
  const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');

  if (!admin) {
    throw new AdminError('Invalid email or password.', 401);
  }

  const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordMatches) {
    throw new AdminError('Invalid email or password.', 401);
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = signAdminToken(admin);

  return {
    token,
    admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
  };
}

export { loginAdmin, AdminError };