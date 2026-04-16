const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Auto-migrate legacy database.json to individual project files
const legacyFile = path.join(DATA_DIR, 'database.json');
if (fs.existsSync(legacyFile)) {
  try {
    const raw = fs.readFileSync(legacyFile, 'utf8');
    const db = JSON.parse(raw);
    if (db.projects && Array.isArray(db.projects)) {
      for (const p of db.projects) {
        if (p && p.id) {
          fs.writeFileSync(path.join(DATA_DIR, `${p.id}.json`), JSON.stringify(p, null, 2));
        }
      }
    }
    // Rename to avoid re-migration
    fs.renameSync(legacyFile, path.join(DATA_DIR, 'database.json.bak'));
    console.log('Migrated legacy database.json to individual project files.');
  } catch (e) {
    console.error('Legacy migration failed', e);
  }
}

// Get all projects
app.get('/api/projects', (req, res) => {
  try {
    const projects = [];
    const files = fs.readdirSync(DATA_DIR);
    for (const file of files) {
      if (file.endsWith('.json') && !file.startsWith('database')) {
        const filePath = path.join(DATA_DIR, file);
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          projects.push(JSON.parse(raw));
        } catch (e) {
          console.error(`Failed to parse ${file}`, e);
        }
      }
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new project
app.post('/api/projects', (req, res) => {
  try {
    const newProj = req.body;
    if (!newProj || !newProj.id) throw new Error("Invalid project structure");
    
    const filePath = path.join(DATA_DIR, `${newProj.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(newProj, null, 2));
    
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
    const filePath = path.join(DATA_DIR, `${id}.json`);
    
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const proj = JSON.parse(raw);
      // Merge new data over existing project
      const updatedProj = { ...proj, ...updates };
      fs.writeFileSync(filePath, JSON.stringify(updatedProj, null, 2));
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Project file not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a project
app.delete('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(DATA_DIR, `${id}.json`);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Project file not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all projects
app.delete('/api/projects', (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR);
    let deletedCount = 0;
    for (const file of files) {
      if (file.endsWith('.json') && !file.startsWith('database')) {
        fs.unlinkSync(path.join(DATA_DIR, file));
        deletedCount++;
      }
    }
    res.json({ success: true, deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend Server running on port ${PORT}`);
});
