const express = require('express');
const router = express.Router();
const Task = require('../models/task');

// Obtener todas las tareas
router.get('/', (req, res) => {
  Task.findAll()
    .then(tasks => res.render('tasks', { tasks }))
    .catch(err => res.status(500).send(err));
});

// Crear una nueva tarea
router.post('/add', (req, res) => {
  const { title, description } = req.body;
  Task.create({ title, description })
    .then(() => res.redirect('/tasks'))
    .catch(err => res.status(500).send(err));
});

// Editar una tarea
router.post('/edit/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  // Convierte el valor del checkbox en un número (1 o 0)
  const status = completed ? 1 : 0;
  Task.update({ title, description, status }, { where: { id } })
    .then(() => res.redirect('/tasks'))
    .catch(err => res.status(500).send(err));
});

// Eliminar una tarea
router.post('/delete/:id', (req, res) => {
  const { id } = req.params;
  Task.destroy({ where: { id } })
    .then(() => res.redirect('/tasks'))
    .catch(err => res.status(500).send(err));
});

module.exports = router;
