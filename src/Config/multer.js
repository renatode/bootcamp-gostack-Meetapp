import multer from 'multer';
import crypto from 'crypto';
import { resolve, extname } from 'path';

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return cb(err);

        console.log(resolve('..', '..', 'tmp', 'uploads'));

        return cb(null, buf.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
