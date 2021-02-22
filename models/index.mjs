import { Sequelize } from 'sequelize';
import url from 'url';
import allConfig from '../config/config.js';
import initPurchaseModel from './purchase.mjs';
import initUserModel from './user.mjs';
import initListingModel from './listing.mjs';

const env = process.env.NODE_ENV || 'development';

const config = allConfig[env];

const db = {};

let sequelize;

if (env === 'production') {
  // break apart the Heroku database url and rebuild the configs we need

  const { DATABASE_URL } = process.env;
  const dbUrl = url.parse(DATABASE_URL);
  const username = dbUrl.auth.substr(0, dbUrl.auth.indexOf(':'));
  const password = dbUrl.auth.substr(dbUrl.auth.indexOf(':') + 1, dbUrl.auth.length);
  const dbName = dbUrl.path.slice(1);

  const host = dbUrl.hostname;
  const { port } = dbUrl;

  config.host = host;
  config.port = port;

  sequelize = new Sequelize(dbName, username, password, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// add your model definitions to db here
db.User = initUserModel(sequelize, Sequelize.DataTypes);
db.Listing = initListingModel(sequelize, Sequelize.DataTypes);
db.Purchase = initPurchaseModel(sequelize, Sequelize.DataTypes);

// Define associations
db.User.hasMany(db.Purchase, { as: 'purchaser', foreignKey: 'purchaser_id' });
db.Purchase.belongsTo(db.User, { as: 'purchaser' });

db.Listing.hasMany(db.Purchase);
db.Purchase.belongsTo(db.Listing);

db.User.hasMany(db.Listing, { as: 'lister', foreignKey: 'lister_id' });
db.Listing.belongsTo(db.User, { as: 'lister' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
