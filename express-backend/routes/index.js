// routes/index.js
const express = require('express');
const router = express.Router();

// Импортируем роутеры
const auth = require('./auth');        // ← экспортирует router напрямую
const tracks = require('./tracks');    // ← экспортирует router напрямую
const favorites = require('./favorites'); // ← экспортирует router напрямую

// Подключаем роутеры
// auth роутер уже содержит /register и /login, поэтому монтируем на корень
router.use('/', auth);

// tracks и favorites монтируем на соответствующие пути
router.use('/tracks', tracks);
router.use('/favorites', favorites);

module.exports = router;
