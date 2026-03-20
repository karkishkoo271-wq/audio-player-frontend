const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");

const app = express();
const PORT = 8000;

// CORS настройка
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Парсинг JSON
app.use(bodyParser.json());

// Раздача статических файлов (аудио и обложки)
app.use("/audio", express.static(path.join(__dirname, "public", "audio")));
app.use("/covers", express.static(path.join(__dirname, "public", "covers")));

// API маршруты
app.use("/api", routes);

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "VibeCast API is running", 
    version: "1.0.0",
    endpoints: {
      tracks: "/api/tracks",
      favorites: "/api/favorites",
      login: "/api/login",
      register: "/api/register"
    }
  });
});

// Обработка preflight OPTIONS запросов
app.options('*', cors());

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Audio files: http://localhost:${PORT}/audio/`);
  console.log(`🎨 Covers: http://localhost:${PORT}/covers/`);
});