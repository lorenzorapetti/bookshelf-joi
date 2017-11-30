const Joi = require('joi');
const _ = require('lodash');

module.exports = function bookshelfValidation(Bookshelf, params) {
  // Default params
  params = _.merge({
    joi: {
      abortEarly: false,
    },
    throw: true,
  }, params);

  const proto = Bookshelf.Model.prototype;

  const Model = Bookshelf.Model.extend({
    // If the `throw` param is set to false, we're not going
    // to throw an exception. Instead, we set the `validationError` property
    // to the joi error object
    validationError: null,

    initialize() {
      proto.initialize.apply(this, arguments);
      this.on('saving', this.validateSave);
    },

    validateSave(model, attrs, options) {
      // Skip the validation if a `validation` option is set to false
      // in the `save` method
      if (options.validation === false || typeof this.buildValidation !== 'function') return;

      const schema = Joi.object().keys(_.merge({
        id: Joi.any().optional(),
        created_at: Joi.date().optional(),
        updated_at: Joi.date().optional(),
      }, this.buildValidation(model, attrs, options)));

      // Merge the various sources into one option object.
      // The order is (from least to most important):
      // plugin option -> model option -> save method option
      const joiOptions = _.merge(params.joi, this.joi || {}, options.joi || {});

      let validation;
      if ((model && !model.isNew()) || (options && (options.method === 'update' || options.patch === true))) {
        // If the model is not new or the update method is explicitly set,
        // we need to remove all the unnecessary attributes

        // eslint-disable-next-line no-underscore-dangle
        const validationKeys = _.map(schema._inner.children, item => item.key);
        const keysToBeUpdated = Object.keys(attrs);
        const optionalKeys = _.difference(validationKeys, keysToBeUpdated);

        validation = Joi.validate(
          attrs,
          optionalKeys.length ? schema.optionalKeys(optionalKeys) : schema,
          joiOptions,
        );
      } else {
        validation = Joi.validate(this.attributes, schema, joiOptions);
      }

      if (validation.error) {
        validation.error.tableName = this.tableName;

        if (params.throw) {
          throw validation.error;
        } else {
          this.validationError = validation.error;
        }
      } else {
        this.set(validation.value);
      }
    },
  });

  Bookshelf.Model = Model;
};
