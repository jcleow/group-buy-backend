module.exports = {
  development: {
    username: process.env.USER,
    password: null,
    database: 'group_buy_development',
    host: '127.0.0.1',
    dialect: 'postgres',
  },
  // test
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: { // https://github.com/sequelize/sequelize/issues/12083
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
