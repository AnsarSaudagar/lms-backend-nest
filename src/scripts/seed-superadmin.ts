import 'dotenv/config';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import mongoose from 'mongoose';
import { UserSchema } from '../modules/users/schemas/user.schema';
import { ADMIN_KEY } from '../common/constants/user-type.constant';

const SUPERADMIN_EMAIL = 'adminlms@mail.com';

function generatePassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*';
  const all = upper + lower + digits + symbols;

  const pick = (chars: string) => chars[crypto.randomInt(chars.length)];

  const required = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  const rest = Array.from({ length: 12 }, () => pick(all));

  return [...required, ...rest]
    .sort(() => crypto.randomInt(3) - 1)
    .join('');
}

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set');
  }

  await mongoose.connect(mongoUri);
  const UserModel = mongoose.model('User', UserSchema);

  const existing = await UserModel.findOne({ email: SUPERADMIN_EMAIL });
  if (existing) {
    console.log(`Superadmin already exists: ${SUPERADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const plainPassword = generatePassword();
  const hashedPassword = await argon2.hash(plainPassword);

  await UserModel.create({
    email: SUPERADMIN_EMAIL,
    firstName: 'Super',
    lastName: 'Admin',
    password: hashedPassword,
    role: ADMIN_KEY,
    isActive: true,
    isVerified: true,
  });

  console.log('Superadmin created successfully:');
  console.log(`  email:    ${SUPERADMIN_EMAIL}`);
  console.log(`  password: ${plainPassword}`);
  console.log('Save this password now — it will not be shown again.');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Failed to seed superadmin:', err);
  process.exit(1);
});
