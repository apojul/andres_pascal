const bcrypt = require('bcrypt');
const salt = 10;
const passwd = '2345';

const pwd = bcrypt.hashSync(passwd, salt);

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {email: 'pascalallau@gmail.com', password:pwd, full_name: 'pascal'},
        {email: 'pascal.allau@laposte.net', password:pwd, full_name: 'apojul'},
        {email: 'andres@lilo.org', password:pwd, full_name: 'andres'}
      ]);
    });
};
