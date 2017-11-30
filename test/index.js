const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const knexConfig = require('./knexfile').development;
const knex = require('knex')(knexConfig);
const Bookshelf = require('bookshelf')(knex);

Bookshelf.plugin(require('../'));

chai.use(chaiAsPromised);
const should = chai.should();

module.exports = {
  Bookshelf,
  should,
};
