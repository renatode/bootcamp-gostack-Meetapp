import 'dotenv/config';
import express from 'express';
import Youch from 'youch';
import 'express-async-errors';
import { resolve } from 'path';
import * as Sentry from '@sentry/node';
import routes from './routes';
import sentryConfig from './Config/sentry';

import './Database/dbinit';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const erros = await new Youch(err, req).toJSON();
        return res.status(500).json(erros);
      }

      return res.status(500).json({ error: 'Internal Server Error.' });
    });
  }
}

export default new App().server;
