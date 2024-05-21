const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const db = require('../db');
const Task = require('../models/task'); // Importar el modelo de tareas

// Ruta para la página de inicio
router.get('/', (req, res) => {
  res.render('home');
});

router.get('/register', (req, res) => {
  res.render('register', { errors: req.flash('error') }); // Pasamos los mensajes flash de error a la vista
});

router.post('/register', (req, res) => {
  const { username, password, password2 } = req.body;
  let errors = [];

  // Validar campos
  if (!username || !password || !password2) {
    errors.push({ msg: 'Por favor, llena todos los campos' });
  }

  if (password !== password2) {
    errors.push({ msg: 'Las contraseñas no coinciden' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'La contraseña debe tener al menos 6 caracteres' });
  }

  if (errors.length > 0) {
    req.flash('error', errors); // Agregamos el mensaje de error a los mensajes flash
    res.redirect('/register'); // Redirigimos de vuelta al formulario de registro
  } else {
    // Verificar si el usuario ya existe en la base de datos
    db.query('SELECT * FROM Users WHERE username = ?', { replacements: [username], type: db.QueryTypes.SELECT })
      .then(user => {
        if (user.length > 0) {
          // El usuario ya existe
          req.flash('error', [{ msg: 'El usuario ya está registrado' }]);
          res.redirect('/register'); // Redirigimos de vuelta al formulario de registro
        } else {
          // Hash de la contraseña
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) throw err;

            // Insertar el nuevo usuario en la base de datos
            db.query('INSERT INTO Users (username, password) VALUES (?, ?)', { replacements: [username, hash] })
              .then(() => {
                req.flash('success_msg', 'Te has registrado exitosamente'); // Mensaje de éxito
                res.redirect('/login'); // Redirigimos al usuario a la página de inicio de sesión
              })
              .catch(err => console.log(err));
          });
        }
      })
      .catch(err => console.log(err));
  }
});

// Ruta para el login
router.get('/login', (req, res) => {
  res.render('login', { error_msg: req.flash('error_msg') }); // Pasamos el mensaje flash de error a la vista
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/tasks', // Redirecciona al usuario a la página de tareas después de iniciar sesión correctamente
    failureRedirect: '/login', // Redirecciona al usuario de vuelta a la página de inicio de sesión si hay un error
    failureFlash: true
  })(req, res, next);
});

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
  req.logout(); // Método para cerrar sesión proporcionado por Passport
  req.flash('success_msg', 'Has cerrado sesión exitosamente'); // Mensaje de éxito
  res.redirect('/'); // Redirecciona al usuario a la página de inicio
});

module.exports = router;
