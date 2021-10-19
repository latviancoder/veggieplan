import express from 'express';
import path, { dirname } from 'path';
import pg from 'pg';
import camelCaseObjectDeep from 'camelcase-object-deep';
import SQL from 'sql-template-strings';

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

app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Serve react app as an index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/api/objects', async (req, res) => {
  const result = await client.query(`SELECT objects.* FROM objects`);
  res.json(camelCaseObjectDeep(result.rows));
});

app.get('/api/plants', async (req, res) => {
  const result = await client.query(
    `SELECT plants.*, families.name AS family_name, families.latin_name AS family_latin_name 
    FROM plants INNER JOIN families ON (plants.family_id = families.id)`
  );
  res.json(camelCaseObjectDeep(result.rows));
});

app.get('/api/varieties/:plantId', async (req, res) => {
  const result = await client.query(
    SQL`SELECT * FROM varieties WHERE plant_id=${req.params.plantId} ORDER BY name`
  );

  res.json(camelCaseObjectDeep(result.rows));
});

app.post('/api/varieties', async (req, res) => {
  await client.query(
    SQL`INSERT INTO varieties (plant_id, name) VALUES (${req.body.plantId}, ${req.body.name})`
  );

  res.send({});
});

app.post('/api/save', async (req, res) => {
  // Deleted objects
  if (req.body.deletedObjectIds?.length) {
    await client.query(`DELETE FROM objects WHERE id = ANY($1)`, [
      req.body.deletedObjectIds,
    ]);
  }

  // Upsert all changed objects
  for (const obj of req.body.changedObjects || []) {
    await client.query(
      SQL`INSERT INTO objects 
        (id, x, y, width, height, rotation, object_type, shape_type, plant_id, variety_id, date_added, sorting) VALUES 
        (${obj.id}, ${obj.x}, ${obj.y}, ${obj.width}, ${obj.height}, ${obj.rotation}, ${obj.objectType}, ${obj.shapeType}, ${obj.plantId}, ${obj.varietyId}, ${obj.dateAdded}, ${obj.sorting}) 
      ON CONFLICT (id) DO UPDATE SET 
        x = ${obj.x}, y = ${obj.y}, width = ${obj.width}, height = ${obj.height}, rotation = ${obj.rotation}, variety_id=${obj.varietyId}`
    );
  }

  res.send();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
