exports.development = {
  client: 'sqlite3',
  connection: {
    filename: `${__dirname}/db.sqlite`,
  },
  migrations: {
    directory: `${__dirname}/migrations`,
  },
  useNullAsDefault: true,
};
