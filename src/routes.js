import { Router } from 'express';
import multer from 'multer';
import multerConfig from './Config/multer';

import authMiddleware from './App/MiddleWares/auth';

import UserController from './App/Controllers/UserController';
import AuthController from './App/Controllers/AuthController';
import FileController from './App/Controllers/FileController';

const routes = new Router();
const upload = multer(multerConfig);

// Rotas publicas
routes.post('/users', UserController.store);
routes.post('/auth', AuthController.store);

// Rotas com autenticação JWT
// A partir deste linha todas as rotas precisam do token
routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
