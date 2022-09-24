// @ts-ignore
import camelCaseObjectDeep from 'camelcase-object-deep';
import express, { Request, Response } from 'express';
import { expressjwt as jwt } from 'express-jwt';
import { JwtPayload } from 'jsonwebtoken';
import jwks from 'jwks-rsa';
import path, { dirname } from 'path';
import pg from 'pg';
import SQL from 'sql-template-strings';
import { fileURLToPath } from 'url';

import { Config, GardenObject, Variety } from '../src/types';
import { saveConfig } from './utils/saveConfig.js';
import { saveObjects } from './utils/saveObjects.js';
import { saveVarieties } from './utils/saveVarieties.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Client } = pg;

const app = express();
const port = process.env.PORT || 5303;

export type RequestBody<T = {}> = Request<{}, {}, T> & { auth?: JwtPayload };

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

// Bootstrap determines if this is first login after signup
// If it is: we save to database the state saved in web storage.
// Other queries wait for this query to finish because the app uses suspense.
app.post(
  '/api/bootstrap',
  jwtCheck,
  async (
    req: RequestBody<{
      varieties: Variety[];
      objects: GardenObject[];
      config: Config;
    }>,
    res
  ) => {
    // Check if the user already has configuration entry
    const result = await client.query(
      SQL`SELECT * FROM config WHERE user_id = ${req.auth?.sub}`
    );

    // No entry yet, save web state
    if (!result.rows.length) {
      await saveConfig(req.body.config, req.auth);
      await saveVarieties(req.body.varieties, req.auth);
      await saveObjects(req.body.objects, req.auth);
    }

    res.json({});
  }
);

app.get('/api/plants', async (req, res) => {
  const lang = req.query.language || 'en';

  const result = await client.query(
    SQL`SELECT plants.*, `
      .append(`plants.name_${lang} as name, `)
      .append(`plants.alternative_names_${lang} as alternative_names, `)
      .append(SQL`families.name AS family_name, families.latin_name AS family_latin_name
    FROM plants LEFT OUTER JOIN families ON (plants.family_id = families.id) ORDER by name ASC`)
  );

  res.json(camelCaseObjectDeep(result.rows));
});

app.get('/api/config', jwtCheck, async (req: RequestBody<any>, res) => {
  const result = await client.query(
    SQL`SELECT * FROM config WHERE user_id = ${req.auth?.sub}`
  );

  res.json(camelCaseObjectDeep(result.rows[0]));
});

app.put('/api/config', jwtCheck, async (req: RequestBody<Config>, res) => {
  await saveConfig(req.body, req.auth);

  res.send();
});

app.get('/api/objects', jwtCheck, async (req: RequestBody, res) => {
  const result = await client.query(
    SQL`SELECT objects.* FROM objects WHERE user_id = ${req.auth?.sub}`
  );

  res.json(camelCaseObjectDeep(result.rows));
});

app.get('/api/varieties', jwtCheck, async (req: RequestBody, res) => {
  const result = await client.query(
    SQL`SELECT * FROM varieties WHERE user_id = ${req.auth?.sub} ORDER BY name `
  );

  res.json(camelCaseObjectDeep(result.rows));
});

app.put(
  '/api/varieties',
  jwtCheck,
  async (req: RequestBody<Variety[]>, res: Response) => {
    await saveVarieties(req.body, req.auth);
    res.send();
  }
);

app.put(
  '/api/objects',
  jwtCheck,
  async (req: RequestBody<any[]>, res: Response) => {
    await saveObjects(req.body, req.auth);
    res.send();
  }
);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
