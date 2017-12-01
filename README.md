# bookshelf-joi

[![npm](https://img.shields.io/npm/v/bookshelf-joi.svg)](https://www.npmjs.com/package/bookshelf-joi)
[![Build Status](https://img.shields.io/travis/loryman/bookshelf-joi.svg)](https://travis-ci.org/loryman/bookshelf-joi)
[![Coveralls github](https://img.shields.io/coveralls/github/loryman/bookshelf-joi.svg)](https://coveralls.io/github/loryman/bookshelf-joi)
[![Dependencies](https://img.shields.io/david/loryman/bookshelf-joi.svg)](https://david-dm.org/loryman/bookshelf-joi)
[![Dev Dependencies](https://img.shields.io/david/dev/loryman/bookshelf-joi.svg)](https://david-dm.org/loryman/bookshelf-joi?type=dev)
[![David](https://img.shields.io/david/peer/loryman/bookshelf-joi.svg)](https://david-dm.org/loryman/bookshelf-joi?type=peer)

This is a simple [Bookshelf](http://bookshelfjs.org/) plugin that adds attribute validation with [Joi](https://github.com/hapijs/joi).

This plugin takes the validation part of [bookshelf-modelbase](https://github.com/bsiddiqui/bookshelf-modelbase) and adds some functionality and flexibility.

## Prerequisites

Install `knex`, `Bookshelf`, `Joi` and `bookshelf-joi`:

```
yarn add knex bookshelf joi bookshelf-joi
```

## Usage

```javascript
const knex = require('knex')(require('./knexfile'));
const Bookshelf = require('bookshelf')('knex');
const Joi = require('joi');

Bookshelf.plugin(require('bookshelf-joi'));

const User = Bookshelf.Model.extend({
  tableName: 'users',

  buildValidation(model, attrs, options) {
    return {
      first_name: Joi.string().required(),
      last_name: Joi.string().optional(),
    };
  }
});

User.forge({ first_name: 'Lorenzo' }).save(); // Valid

User.forge({}).save(); // Will throw `ValidationError`

User.forge({}).save(null, { validation: false }); // Will skip the validation
```

## `buildValidation`

This method gets called when the `saving` event gets emitted, so you get access to all the event parameters. In this way you can do some manipolation, like:

```javascript
const User = Bookshelf.Model.extend({
  tableName: 'users',

  buildValidation(model, attrs, options) {
    const schema = {
      first_name: Joi.string().required(),
      last_name: Joi.string().optional(),
    };

    if (attr.phone_number) {
      schema.phone_number = Joi.number().required();
    }

    return schema;
  }
});
```

## Configuration

`bookshelf-joi` can be configured through different paths. The order is: plugin options -> model options -> `save` method options.

You can supply all the options available in the [Joi documentation](https://github.com/hapijs/joi/blob/v13.0.2/API.md#validatevalue-schema-options-callback).

### Plugin options

```javascript
Bookshelf.plugin(require('bookshelf-joi'), {
  joi: {
    abortEarly: true,
    // ...
  },
});
```

### Model options

```javascript
const User = Bookshelf.Model.extend({
  tableName: 'users',

  joi: {
    abortEarly: true,
    // ...
  },

  buildValidation(model, attrs, options) {
    return {
      first_name: Joi.string().required(),
      last_name: Joi.string().optional(),
    };
  }
});
```

### `save` method options

```javascript
User.forge({}).save(null, {
  joi: {
    abortEarly: true,
    // ...
  },
})
```
