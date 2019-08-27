import Sequelize from 'sequelize';
import dbConfig from '../Config/database';

import User from '../App/Models/User';

const models = [User];

class Database {
  constructor() {
    this.conection = new Sequelize(dbConfig);
    this.init();
  }

  init() {
    models.map(model => model.init(this.conection));

    // Teste conexão com db
    this.conection
      .authenticate()
      .then(() => {
        // eslint-disable-next-line no-console
        console.log('Connection has been established successfully.');
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('Unable to connect to the database:', err);
      });
  }
}

export default new Database();
