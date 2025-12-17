const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // <-- Importar CORS

//Documentación en https://expressjs.com/en/starter/hello-world.html
const app = express()

app.use(cors()); // Activar CORS para todas las peticiones

//Creamos un parser de tipo application/json
const jsonParser = bodyParser.json()

// Abre la base de datos
const db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }
    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`);
});

// --- ENDPOINTS ---

app.post('/insert', jsonParser, function (req, res) {
    const { todo } = req.body;

    if (!todo) {
        return res.status(400).send({ error: 'Falta información necesaria' });
    }

    const stmt = db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, CURRENT_TIMESTAMP)');

    stmt.run(todo, function(err) {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).json({ id: this.lastID, message: 'Insert was successful' });
    });
    stmt.finalize();
});

// Endpoint "agrega_todo"
app.post('/agrega_todo', jsonParser, function (req, res) {
    const { todo } = req.body;

    if (!todo) {
        return res.status(400).json({ error: 'El campo todo es obligatorio' });
    }

    const stmt = db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, CURRENT_TIMESTAMP)');

    stmt.run(todo, function (err) {
        if (err) {
            return res.status(500).json({ error: 'Error al guardar el todo' });
        }

        res.status(201).json({
            id: this.lastID,
            todo: todo,
            message: 'Todo guardado correctamente'
        });
    });

    stmt.finalize();
});

app.get('/', function (req, res) {
    res.status(200).json({ 'status': 'ok' });
});

app.post('/login', jsonParser, function (req, res) {
    res.status(200).json({ 'status': 'ok' });
});

app.get('/todos', function (req, res) {
  db.all('SELECT * FROM todos ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Devuelve todas las tareas en formato JSON
    res.status(200).json(rows);
  });
});

// --- INICIO DEL SERVIDOR ---
if (require.main === module) {
    const port = 3000;
    app.listen(port, () => {
        console.log(`Aplicación corriendo en http://localhost:${port}`);
    });
}

module.exports = { app, db };
