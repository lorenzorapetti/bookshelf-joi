const { Bookshelf, should } = require('../');
const Joi = require('joi');

describe('bookshelf-validation', function () {
  let TestModel;

  before(function () {
    TestModel = Bookshelf.Model.extend({
      tableName: 'test_table',

      buildValidation() {
        return {
          first_name: Joi.string().required(),
          last_name: Joi.string().optional(),
          address: Joi.string().required(),
          phone_number: Joi.number().optional(),
        };
      },
    });

    return Bookshelf.knex.migrate.latest();
  });

  describe('testModel', function () {
    it('should pass the validation', async function () {
      const testModel = await TestModel.forge({ first_name: 'Lorenzo', address: '1st street' }).save();

      testModel.has('id').should.be.true;
      should.not.exist(testModel.validationError);
    });

    it('should not pass the validation', async function () {
      try {
        await TestModel.forge({}).save();
      } catch (err) {
        err.isJoi.should.be.true;
        err.details.length.should.equal(2);
        err.details[0].message.should.equal('"first_name" is required');
        err.details[1].message.should.equal('"address" is required');
      }
    });

    it('should skip the validation', async function () {
      const testModel = await TestModel.forge({}).save(null, { validation: false });

      testModel.has('id').should.be.true;
      should.not.exist(testModel.validationError);
    });

    describe('when updating via `set`', function () {
      let testModel;

      beforeEach(async function () {
        testModel = await TestModel.forge({ first_name: 'Lorenzo', address: '1st street' }).save();
      });

      it('should validate only the fields that are updated', async function () {
        testModel = await testModel.set('address', '2nd street').save();

        testModel.get('address').should.equal('2nd street');
      });

      it('should give only the updated fields errors', async function () {
        try {
          await testModel.set('address', null).save();
        } catch (err) {
          err.isJoi.should.be.true;
          err.details.length.should.equal(1);
          err.details[0].message.should.equal('"address" must be a string');
        }
      });
    });

    describe('when updating via `save`', function () {
      let testModel;

      beforeEach(async function () {
        testModel = await TestModel.forge({ first_name: 'Lorenzo', address: '1st street' }).save();
      });

      it('should validate only the fields that are updated', async function () {
        testModel = await testModel.save({ address: '2nd street' });

        testModel.get('address').should.equal('2nd street');
      });

      it('should give only the updated fields errors', async function () {
        try {
          await testModel.save({ address: null });
        } catch (err) {
          err.isJoi.should.be.true;
          err.details.length.should.equal(1);
          err.details[0].message.should.equal('"address" must be a string');
        }
      });
    });
  });
});
