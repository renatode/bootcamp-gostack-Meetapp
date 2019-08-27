import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../Config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({ error: 'Token not provided' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    req.userId = decoded.id;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(401).json({ error: 'Invalid Token' });
  }

  return next();
};
