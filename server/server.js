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

app.get('/api/config', async (req, res) => {
  const result = await client.query(`SELECT * FROM config`);

  res.json(camelCaseObjectDeep(result.rows[0]));
});

app.post('/api/config/save', async (req, res) => {
  await client.query(
    SQL`UPDATE config set width=${req.body.width}, height=${req.body.height}`
  );

  res.send();
});

app.get('/api/objects', async (req, res) => {
  const result = await client.query(`SELECT objects.* FROM objects`);
  res.json(camelCaseObjectDeep(result.rows));
});

app.get('/api/plants', async (req, res) => {
  const result = await client.query(
    `SELECT plants.*, families.name AS family_name, families.latin_name AS family_latin_name 
    FROM plants LEFT OUTER JOIN families ON (plants.family_id = families.id) ORDER BY plants.name ASC`
  );
  res.json(camelCaseObjectDeep(result.rows));
});

app.get('/api/varieties', async (req, res) => {
  const result = await client.query(SQL`SELECT * FROM varieties ORDER BY name`);

  res.json(camelCaseObjectDeep(result.rows));
});

app.get('/api/varieties/:plantId', async (req, res) => {
  const result = await client.query(
    SQL`SELECT * FROM varieties WHERE plant_id=${req.params.plantId} ORDER BY name`
  );

  res.json(camelCaseObjectDeep(result.rows));
});

app.post('/api/varieties', async (req, res) => {
  const result = await client.query(
    SQL`INSERT INTO varieties (plant_id, name) VALUES (${req.body.plantId}, ${req.body.name}) RETURNING id`
  );

  res.send({ id: result.rows[0].id });
});

app.post('/api/objects/:objectId/save', async (req, res) => {
  const query = SQL`UPDATE objects SET`;

  query.append(SQL` notes=${req.body.notes} `);

  query.append(SQL` WHERE id=${req.params.objectId}`);

  await client.query(query);

  res.send();
});

app.post('/api/objects/save', async (req, res) => {
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
        (id, x, y, width, height, rotation, variety_id, object_type, shape_type, plant_id, 
          date_added, sorting, in_row_spacing, row_spacing, 
          date_direct_sow, date_start_indoors, date_transplant, date_first_harvest, date_last_harvest) VALUES 
        (${obj.id}, ${obj.x}, ${obj.y}, ${obj.width}, ${obj.height}, ${obj.rotation}, 
          ${obj.varietyId}, ${obj.objectType}, ${obj.shapeType}, ${obj.plantId}, 
          ${obj.dateAdded}, ${obj.sorting}, ${obj.inRowSpacing}, ${obj.rowSpacing},
          ${obj.dateDirectSow}, ${obj.dateStartIndoors}, ${obj.dateTransplant}, ${obj.dateFirstHarvest}, ${obj.dateLastHarvest}  
          ) 
      ON CONFLICT (id) DO UPDATE SET 
        x = ${obj.x}, y = ${obj.y}, 
        width = ${obj.width}, height = ${obj.height}, 
        rotation = ${obj.rotation}, 
        variety_id=${obj.varietyId}, 
        in_row_spacing=${obj.inRowSpacing}, row_spacing=${obj.rowSpacing},
        title=${obj.title},
        date_direct_sow=${obj.dateDirectSow}, date_start_indoors=${obj.dateStartIndoors}, date_transplant=${obj.dateTransplant}, date_first_harvest=${obj.dateFirstHarvest}, date_last_harvest=${obj.dateLastHarvest}
        `
    );
  }

  res.send();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
