// routes/tracks.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../data/database');

// GET /api/tracks - получить все треки с пагинацией
router.get('/', authenticate, (req, res) => {
  try {
    const allTracks = db.getTracks();
    
    // Получаем параметры пагинации из query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Рассчитываем смещение
    const offset = (page - 1) * limit;
    
    // Получаем общее количество треков
    const total = allTracks.length;
    
    // Получаем треки для текущей страницы
    const tracks = allTracks.slice(offset, offset + limit);
    
    // Возвращаем данные с мета-информацией
    res.json({
      tracks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: offset + limit < total,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error getting tracks:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;