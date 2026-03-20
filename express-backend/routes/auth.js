const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../data/database');

// ⚠️ ВАЖНО: Этот секрет ДОЛЖЕН быть идентичен в middleware/auth.js!
const JWT_SECRET = 'vibecast-fixed-secret-key-2024';

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'username и password обязательны' });
    }
    
    const existingUser = db.getUser(username);
    if (existingUser) {
      return res.status(400).json({ message: 'пользователь уже существует' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = db.createUser(username, hashedPassword);
    
    res.status(201).json({ 
      message: 'пользователь успешно добавлен',
      user: { username: newUser.username }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'username и password обязательны' });
    }
    
    const user = db.getUser(username);
    if (!user) {
      return res.status(401).json({ message: 'произошла ошибка при авторизации — неверные данные' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'произошла ошибка при авторизации — неверные данные' });
    }
    
    // ⚠️ Подписываем токен с ПРЯМЫМ секретом
    const token = jwt.sign(
      { id: user.username, username: user.username },
      JWT_SECRET,  // ← Тот же, что в middleware!
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login success, token signed');
    
    res.json({ 
      message: 'авторизация прошла успешно',
      token 
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;