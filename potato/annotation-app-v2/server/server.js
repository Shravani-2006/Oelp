const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DATA_FILE = path.join(__dirname, 'data', 'database.json');

// Ensure data directory and file exist
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ projects: [] }));
}

function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all projects
app.get('/api/projects', (req, res) => {
  try {
    const db = readData();
    res.json(db.projects || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new project
app.post('/api/projects', (req, res) => {
  try {
    const newProj = req.body;
    const db = readData();
    if (!db.projects) db.projects = [];
    db.projects.push(newProj);
    writeData(db);
    res.json({ success: true, project: newProj });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a project
app.put('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = readData();
    
    if (!db.projects) db.projects = [];
    
    let found = false;
    db.projects = db.projects.map(p => {
      if (p.id === id) {
        found = true;
        // Merge updates with existing project
        return { ...p, ...updates };
      }
      return p;
    });

    if (found) {
      writeData(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend Server running on port ${PORT}`);
});
