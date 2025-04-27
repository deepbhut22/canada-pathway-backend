import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be defined');
}

const generateToken = (
  id: string,
  email: string,
  firstName: string
): string => {
  const payload = { id, email, firstName };
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRE || '30d';

  const token = jwt.sign(payload, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn']
  });
  console.log(token);
  
  return token;
};

export default generateToken;
