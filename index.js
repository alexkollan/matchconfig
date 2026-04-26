const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app        = express();
const PORT       = process.env.PORT || 3000;
const CONFIG_PATH = process.env.CONFIG_PATH || '/data/config.json';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Default config if none saved yet
const DEFAULT_CONFIG = {
  sports:              [],
  excludeSports:       ['τενις', 'χαντμπολ', 'πολο', 'πολεμικες τεχνες', 'εκπομπη', 'μηχανοκινητος αθλητισμος'],
  leagues:             [],
  excludeLeagues:      [],
  teams:               [],
  excludeTeams:        [],
  leagueTeams:         [],
  excludeKeywords:     ['κ21', 'γυναικων', 'νεανικη'],
  timeWindow:          null,
  channels:            [],
  excludeChannels:     [],
  calendarId:          '',
  defaultColor:        '9',
  teamColors:          [],
  leagueColors:        [],
  defaultDurationHours: 2,
  sportDurations:      [
    { sport: 'ποδοσφαιρο', hours: 2   },
    { sport: 'μπασκετ',    hours: 2.5 }
  ]
};

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading config:', e.message);
  }
  return DEFAULT_CONFIG;
}

function writeConfig(data) {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// n8n reads this on every run
app.get('/config', (req, res) => {
  res.json(readConfig());
});

// UI saves to this
app.post('/config', (req, res) => {
  try {
    const config = req.body;
    writeConfig(config);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Calendar Config server running on port ${PORT}`);
  console.log(`Config file: ${CONFIG_PATH}`);
});
