const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../db');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
      // Verificar si el usuario existe en la base de datos
      db.query('SELECT * FROM Users WHERE username = ?', { replacements: [username], type: db.QueryTypes.SELECT })
        .then(user => {
          if (!user || user.length === 0) {
            return done(null, false, { message: 'Usuario no encontrado' });
          }

          // Comparar la contraseña proporcionada con la almacenada en la base de datos
          bcrypt.compare(password, user[0].password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user[0]);
            } else {
              return done(null, false, { message: 'Contraseña incorrecta' });
            }
          });
        })
        .catch(err => done(err));
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    // Obtener el usuario por su ID
    db.query('SELECT * FROM Users WHERE id = ?', { replacements: [id], type: db.QueryTypes.SELECT })
      .then(user => {
        done(null, user[0]);
      })
      .catch(err => done(err));
  });
};
