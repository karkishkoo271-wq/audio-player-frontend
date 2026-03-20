const { tracks: rawTracks } = require('./tracks');

// Хранилище пользователей в памяти
const users = {};

// Хранилище избранного
const userFavorites = {};

/**
 * Получить пользователя по имени
 */
function getUser(username) {
  return users[username] || null;
}

/**
 * Создать нового пользователя
 */
function createUser(username, hashedPassword) {
  users[username] = {
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  return users[username];
}

/**
 * Получить все треки (преобразованные для API)
 */
function getTracks() {
  return rawTracks.map(track => ({
    id: String(track.id),
    title: (track.title || '').trim(),
    artist: (track.artist || '').trim(),
    album: (track.artist || '').trim(),
    duration: track.duration || 0,
    size_mb: track.size_mb || 0,
    coverUrl: track.coverUrl || null,
    audioUrl: track.audioUrl || null,
    uploadedAt: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ).toISOString()
  }));
}

/**
 * Получить список избранного пользователя
 */
function getUserFavorites(userId) {
  return userFavorites[userId] || [];
}

/**
 * Добавить трек в избранное
 */
function addFavorite(userId, trackId) {
  if (!userFavorites[userId]) {
    userFavorites[userId] = [];
  }
  
  const trackIdStr = String(trackId);
  
  if (userFavorites[userId].includes(trackIdStr)) {
    return false;
  }
  
  userFavorites[userId].push(trackIdStr);
  return true;
}

/**
 * Удалить трек из избранного
 */
function removeFavorite(userId, trackId) {
  if (!userFavorites[userId]) {
    return false;
  }
  
  const trackIdStr = String(trackId);
  const index = userFavorites[userId].indexOf(trackIdStr);
  
  if (index === -1) {
    return false;
  }
  
  userFavorites[userId].splice(index, 1);
  return true;
}

module.exports = {
  getUser,
  createUser,
  getTracks,
  getUserFavorites,
  addFavorite,
  removeFavorite
};