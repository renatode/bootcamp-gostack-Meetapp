import Sequelize from 'sequelize';
import dbConfig from '../Config/database';

import User from '../App/Models/User';
import File from '../App/Models/File';
import Meetup from '../App/Models/Meetup';
import Subscription from '../App/Models/Subscription';

const models = [User, File, Meetup, Subscription];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.conection = new Sequelize(dbConfig);
    models
      .map(model => model.init(this.conection))
      .map(model => model.associate && model.associate(this.conection.models));

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
