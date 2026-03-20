// routes/favorites.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../data/database');

router.get('/', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = db.getUserFavorites(userId);
    const allTracks = db.getTracks();
    const favoriteTracks = allTracks.filter(track => favorites.includes(track.id));
    res.json(favoriteTracks);
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const { trackId } = req.body;
    
    if (!trackId) {
      return res.status(400).json({ message: 'trackId обязателен' });
    }
    
    const allTracks = db.getTracks();
    const track = allTracks.find(t => String(t.id) === String(trackId));
    
    if (!track) {
      return res.status(404).json({ message: 'трек не найден' });
    }
    
    const success = db.addFavorite(userId, trackId);
    
    if (!success) {
      return res.status(400).json({ message: 'трек уже в избранном' });
    }
    
    res.status(201).json({ message: 'композиция добавлена в избранное' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.delete('/', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const { trackId } = req.body;
    
    if (!trackId) {
      return res.status(400).json({ message: 'trackId обязателен' });
    }
    
    const success = db.removeFavorite(userId, trackId);
    
    if (!success) {
      return res.status(404).json({ message: 'трек не найден в избранном' });
    }
    
    res.json({ message: 'композиция убрана из избранного' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; // ← Экспорт напрямую!