import { Router } from 'express';

import authMiddleware from './App/MiddleWares/auth';

import UserController from './App/Controllers/UserController';
import AuthController from './App/Controllers/AuthController';

const routes = new Router();

// Rotas publicas
routes.post('/users', UserController.store);
routes.post('/auth', AuthController.store);

// Rotas com autenticação JWT
// A partir deste linha todas as rotas precisam do token
routes.use(authMiddleware);

routes.put('/users', UserController.update);

export default routes;
