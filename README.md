# Model Release App — Rebekka Schnell Fotografie

Mobile Web-App zum Erfassen von Model Releases mit digitaler Unterschrift.
Daten werden direkt in deiner Notion-Datenbank gespeichert.

## Schnellstart (5 Minuten)

### 1. Notion Integration erstellen

1. Gehe zu https://www.notion.so/my-integrations
2. Klicke "New integration"
3. Name: `Model Release App`
4. Capabilities: "Read content", "Insert content", "Update content"
5. Kopiere den **Internal Integration Token** (beginnt mit `secret_...`)

### 2. Datenbank mit Integration verbinden

1. Öffne deine "Model Releases" Datenbank in Notion
2. Klicke oben rechts auf `•••` → "Connections" → "Connect to" → Wähle "Model Release App"

### 3. Deployment auf Vercel

```bash
# Repo klonen / Dateien hochladen
cd model-release-app
npm install

# Bei Vercel einloggen
npx vercel login

# Deployen
npx vercel --prod
```

Alternativ: Ordner als ZIP zu vercel.com/new hochladen (Git-Import oder Drag & Drop).

### 4. Environment Variables in Vercel setzen

In Vercel Dashboard → Settings → Environment Variables:

| Variable | Wert |
|----------|------|
| `NOTION_API_KEY` | `secret_xxx...` (dein Integration Token) |
| `NOTION_DATABASE_ID` | `ca20b1da26ad464a853f23fd726a96fc` |
| `CLOUDINARY_UPLOAD_URL` | (optional, für Unterschrift-Bilder) |
| `CLOUDINARY_UPLOAD_PRESET` | (optional, z.B. `model_releases`) |

### 5. Fertig!

Öffne die Vercel-URL auf deinem Handy. Tipp: Erstelle einen QR-Code mit dem Link.

## Optional: Cloudinary für Unterschrift-Bilder

Ohne Cloudinary werden Unterschriften als Base64-Text in Notion gespeichert (funktioniert, aber weniger elegant).

Mit Cloudinary (kostenlos bis 25GB/Monat):
1. Registriere dich auf https://cloudinary.com
2. Dashboard → Settings → Upload → "Add upload preset"
3. Signing Mode: **Unsigned**
4. Preset Name: `model_releases`
5. Folder: `model-releases`
6. Deine Upload-URL: `https://api.cloudinary.com/v1_1/DEIN_CLOUD_NAME/image/upload`

## Projektstruktur

```
model-release-app/
├── api/
│   └── submit.js          # Vercel Serverless Function (Notion API)
├── public/
│   └── index.html         # Mobile Web-App (Frontend)
├── package.json
├── vercel.json            # Routing-Config
├── .env.example           # Umgebungsvariablen-Vorlage
└── README.md
```

## Workflow

1. Öffne den Link auf deinem Handy (oder scanne QR-Code)
2. Kunde gibt Namen ein
3. Kunde unterschreibt mit dem Finger auf dem Bildschirm
4. "Freigabe absenden" → gespeichert in Notion
5. In Notion siehst du alle Releases im Dashboard
