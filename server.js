const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'db.json');

app.use(bodyParser.json());
app.use(express.static(__dirname)); // serve index.html and assets

// ensure db file exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '[]', 'utf8');
}

app.post('/log', (req, res) => {
  const entry = req.body;
  if (!entry || typeof entry !== 'object') {
    return res.status(400).json({ error: 'Invalid log entry' });
  }

  // read current db
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read database' });

    let arr;
    try {
      arr = JSON.parse(data);
      if (!Array.isArray(arr)) arr = [];
    } catch (e) {
      arr = [];
    }

    arr.push({ ...entry, timestamp: new Date().toISOString() });

    fs.writeFile(dbPath, JSON.stringify(arr, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Failed to write database' });
      res.json({ success: true });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
