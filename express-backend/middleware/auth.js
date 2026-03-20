// middleware/auth.js
const jwt = require('jsonwebtoken');

// ⚠️ ВАЖНО: Тот же секрет, что в routes/auth.js!
const JWT_SECRET = 'vibecast-fixed-secret-key-2024';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }
  
  const token = authHeader.slice(7);
  
  try {
    // ⚠️ Проверяем токен с ПРЯМЫМ секретом
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = { 
      id: decoded.id || decoded.username, 
      username: decoded.username 
    };
    next();
  } catch (error) {
    console.log('❌ Token verify error:', error.message);
    return res.status(401).json({ message: 'Неверный токен' });
  }
}

module.exports = { authenticate };