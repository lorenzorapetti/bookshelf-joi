exports.up = function (knex) {
  return knex.schema.createTable('test_table', (table) => {
    table.increments();
    table.string('first_name');
    table.string('last_name');
    table.string('address');
    table.string('phone_number');
    table.timestamps();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('test_table');
};
