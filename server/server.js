import express from 'express';
import path, { dirname } from 'path';
import pg from 'pg';
import camelCaseObjectDeep from 'camelcase-object-deep';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Client } = pg;

const app = express();
const port = process.env.PORT || 5000;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();

app.use(express.static(path.join(__dirname, 'build')));

// Serve react app as an index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/api/plants', async (req, res) => {
  const result = await client.query(
    `SELECT plants.*, families.name AS family_name, families.latin_name AS family_latin_name 
    FROM plants INNER JOIN families ON (plants.family_id = families.id)`
  );
  res.json(camelCaseObjectDeep(result.rows));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
