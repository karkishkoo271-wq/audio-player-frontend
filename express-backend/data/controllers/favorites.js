// controllers/favorites.js
const db = require('../data/database');

/**
 * Получить список избранных треков пользователя
 */
async function getUserFavorites(userId) {
  // Получаем треки из "базы данных"
  const allTracks = db.getTracks();
  const userFavorites = db.getUserFavorites(userId);
  
  // Фильтруем треки, которые в избранном у пользователя
  return allTracks.filter(track => userFavorites.includes(track.id));
}

/**
 * Добавить трек в избранное пользователя
 */
async function addToUserFavorites(userId, trackId) {
  const allTracks = db.getTracks();
  const track = allTracks.find(t => t.id === trackId);
  
  if (!track) {
    throw new Error('track_not_found');
  }
  
  const result = db.addFavorite(userId, trackId);
  
  if (!result) {
    throw new Error('already_exists');
  }
  
  return { success: true };
}

/**
 * Удалить трек из избранного пользователя
 */
async function removeFromUserFavorites(userId, trackId) {
  const result = db.removeFavorite(userId, trackId);
  
  if (!result) {
    throw new Error('not_found');
  }
  
  return { success: true };
}

module.exports = {
  getUserFavorites,
  addToUserFavorites,
  removeFromUserFavorites
};