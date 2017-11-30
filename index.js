const Joi = require('joi');
const _ = require('lodash');

module.exports = function bookshelfValidation(Bookshelf, params) {
  // Default params
  params = _.merge({
    joi: {
      abortEarly: false,
    },
  }, params);

  const proto = Bookshelf.Model.prototype;

  const Model = Bookshelf.Model.extend({
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
      // plugin options -> model options -> `save` method options
      const joiOptions = _.merge(params.joi, this.joi || {}, options.joi || {});

      let validation;
      if ((model && !model.isNew()) || (options && (options.method === 'update' || options.patch === true))) {
        // If the model is not new or the update method is explicitly set,
        // we need to remove all the unnecessary attributes

        // eslint-disable-next-line no-underscore-dangle
        const validationKeys = _.map(schema._inner.children, item => item.key);
        const keysToBeUpdated = Object.keys(_.isEmpty(attrs) ? model.changed : attrs);
        const optionalKeys = _.difference(validationKeys, keysToBeUpdated);

        validation = Joi.validate(
          _.isEmpty(attrs) ? model.changed : attrs,
          _.isEmpty(optionalKeys) ? schema : schema.optionalKeys(optionalKeys),
          joiOptions,
        );
      } else {
        validation = Joi.validate(this.attributes, schema, joiOptions);
      }

      if (validation.error) {
        validation.error.tableName = this.tableName;

        throw validation.error;
      } else {
        this.set(validation.value);
      }
    },
  });

  Bookshelf.Model = Model;
};
