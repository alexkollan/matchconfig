# calendarconfig

Config UI for Match Calendar n8n workflow.

## Deploy on VPS

```bash
# 1. Copy this folder to your VPS
scp -r calendarconfig/ user@alexcoll.in:~/calendarconfig

# 2. Build and start
cd ~/calendarconfig
docker compose up -d --build

# 3. Verify it's running
curl http://localhost:3010/config
```

## Cloudflare Setup

1. In Cloudflare Tunnel → add a public hostname:
   - Subdomain: calendarconfig
   - Domain: alexcoll.in
   - Service: HTTP → localhost:3010

2. In Cloudflare Zero Trust → Access → Applications:
   - Add application → Self-hosted
   - Domain: calendarconfig.alexcoll.in
   - Policy: Allow → Emails → your@gmail.com
   - Identity provider: Google (enable under Settings → Authentication)

That's it. Cloudflare handles the Google login wall — your container
never sees unauthenticated requests.

## n8n Config Node Replacement

Replace the Config **Code** node with an **HTTP Request** node:

- Method: GET
- URL: https://calendarconfig.alexcoll.in/config
- Authentication: None (Cloudflare Zero Trust protects it,
  but n8n runs server-side so it bypasses the browser auth wall.
  If you want to protect the /config endpoint from n8n too,
  add a secret header — see below.)

### Optional: protect /config with a secret header

In docker-compose.yml add:
  environment:
    - API_SECRET=your-secret-here

In index.js, add to the GET /config route:
  const secret = req.headers['x-api-secret'];
  if (secret !== process.env.API_SECRET) return res.status(401).json({ error: 'unauthorized' });

In n8n HTTP Request node → Headers → add:
  x-api-secret: your-secret-here

## API

GET  /config  → returns current config.json
POST /config  → saves body as config.json (returns { ok: true })

## Calendars per league

```json
"defaultCalendar": { "name": "Sports Matches", "color": "" },
"calendars": [
  { "name": "Greek Championship", "color": "14",
    "leagues": ["stoiximan super league", "stoiximan super league 2026-2027"] }
]
```

- n8n finds each calendar by name in your Google account and creates it if missing (never deletes/renames).
- League match = contains, accent/case-insensitive. A match fitting several calendars goes to all of them; no match → default calendar.
- `color` = Google calendar palette id (1–24) or empty. Applied only when n8n creates the calendar; existing calendars are never touched.

## Export / Import

- **⇩ Export** downloads the current editor state (incl. unsaved edits) as `match-config-<date>.json`.
- **⇧ Import** loads a JSON file into the editor only — press **Save Config** to apply it.
