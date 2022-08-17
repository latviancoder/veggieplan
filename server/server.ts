// @ts-ignore
import camelCaseObjectDeep from 'camelcase-object-deep';
import express, { Request } from 'express';
import { expressjwt as jwt } from 'express-jwt';
import { JwtPayload } from 'jsonwebtoken';
import jwks from 'jwks-rsa';
import path, { dirname } from 'path';
import pg from 'pg';
import SQL from 'sql-template-strings';
import { fileURLToPath } from 'url';

import { updateObjects } from './endpoints/updateObjects.js';
import { updateVarieties } from './endpoints/updateVarieties.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Client } = pg;

const app = express();
const port = process.env.PORT || 5303;

export type RequestBody<T> = Request<{}, {}, T> & { auth?: JwtPayload };

const jwtCheck = jwt({
  // @ts-ignore
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://veggieplan.eu.auth0.com/.well-known/jwks.json',
  }),
  audience: 'http://localhost:5303/api',
  issuer: 'https://veggieplan.eu.auth0.com/',
  algorithms: ['RS256'],
});

export const client = new Client(
  process.env.ENVIRONMENT === 'DEV'
    ? {
        host: 'localhost',
        database: 'sergejsrizovs',
      }
    : {
        connectionString: process.env.DATABASE_URL,
      }
);

await client.connect();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// Serve react app as an index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.get('/api/plants', async (req, res) => {
  const result = await client.query(
    SQL`SELECT plants.*, families.name AS family_name, families.latin_name AS family_latin_name 
    FROM plants LEFT OUTER JOIN families ON (plants.family_id = families.id) ORDER BY plants.name ASC`
  );
  res.json(camelCaseObjectDeep(result.rows));
});

app.get('/api/config', jwtCheck, async (req: RequestBody<any>, res) => {
  const result = await client.query(
    SQL`SELECT * FROM config WHERE user_id = ${req.auth?.sub}`
  );

  res.json(camelCaseObjectDeep(result.rows[0]));
});

app.put('/api/config', jwtCheck, async (req: RequestBody<any>, res) => {
  await client.query(
    SQL`INSERT INTO config (user_id, width, height) 
        VALUES (${req.auth?.sub}, ${req.body.width}, ${req.body.height}) 
        ON CONFLICT (user_id) DO UPDATE SET width=${req.body.width}, height=${req.body.height}`
  );

  res.send();
});

app.get('/api/objects', jwtCheck, async (req, res) => {
  const result = await client.query(`SELECT objects.* FROM objects`);
  res.json(camelCaseObjectDeep(result.rows));
});

app.get('/api/varieties', jwtCheck, async (req, res) => {
  const result = await client.query(SQL`SELECT * FROM varieties ORDER BY name`);

  res.json(camelCaseObjectDeep(result.rows));
});

app.put('/api/varieties', jwtCheck, updateVarieties);

app.put('/api/objects', jwtCheck, updateObjects);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
