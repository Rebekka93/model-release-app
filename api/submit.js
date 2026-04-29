/**
 * Vercel Serverless Function
 * Empfängt Model Release Daten + Unterschrift (Base64)
 * und speichert alles in Notion.
 */
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt' });

  try {
    const { name, datum, bildinfo, referenz, email, instagram, signature } = req.body;

    if (!name || !signature) {
      return res.status(400).json({ error: 'Name und Unterschrift sind Pflichtfelder.' });
    }

    let signatureUrl = null;
    if (process.env.CLOUDINARY_UPLOAD_URL) {
      const uploadRes = await fetch(process.env.CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: signature,
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'model_releases',
          folder: 'model-releases'
        })
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        signatureUrl = uploadData.secure_url;
      }
    }

    const properties = {
      'Name': { title: [{ text: { content: name } }] },
      'Datum': { date: { start: datum || new Date().toISOString().split('T')[0] } },
      'Bildverwendung': { rich_text: [{ text: { content: bildinfo || '' } }] },
      'Foto-Referenz': { rich_text: [{ text: { content: referenz || '' } }] },
      'Status': { select: { name: 'Neu' } }
    };

    if (email) {
      properties['E-Mail'] = { email: email };
    }
    if (instagram) {
      properties['Instagram'] = { rich_text: [{ text: { content: instagram } }] };
    }

    if (signatureUrl) {
      properties['Unterschrift'] = {
        files: [{
          type: 'external',
          name: `unterschrift_${name.replace(/\s+/g, '_')}_${datum}.png`,
          external: { url: signatureUrl }
        }]
      };
    }

    const page = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties
    });

    if (!signatureUrl && signature) {
      await notion.blocks.children.append({
        block_id: page.id,
        children: [
          { type: 'heading_3', heading_3: { rich_text: [{ text: { content: 'Unterschrift (Base64)' } }] } },
          { type: 'code', code: { rich_text: [{ text: { content: signature.substring(0, 2000) } }], language: 'plain text' } }
        ]
      });
    }

    return res.status(200).json({ success: true, pageId: page.id, message: 'Model Release erfolgreich gespeichert!' });

  } catch (error) {
    console.error('Fehler:', error);
    return res.status(500).json({
      error: 'Serverfehler beim Speichern. Bitte erneut versuchen.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
