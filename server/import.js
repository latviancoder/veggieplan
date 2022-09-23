import fs from 'fs';
import pg from 'pg';
import SQL from 'sql-template-strings';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();

const obj = JSON.parse(fs.readFileSync('../plants.json', 'utf8'));

const annual = obj.plants.filter(
  ({ perennial, countryCode }) => !perennial && countryCode === 'gb'
);

annual.forEach(async (p) => {
  await client.query(SQL`
    UPDATE plants SET alternative_names_en = ${p.otherName
      .split(',')
      .map((a) => a.trim())} 
    WHERE code = ${p.plantCode}
    `);
  // await client.query(SQL`
  //   INSERT INTO plants
  //       (code, name, latin_name, spacing, in_row_spacing,
  //       row_spacing, frost_tolerant, plant_relative_to_last_frost, maturity, harvest_relative_to_first_frost, perennial)
  //   VALUES
  //       (${p.plantCode}, ${p.plantName}, ${p.latinName}, ${p.spacing}, ${
  //   p.inRowSpacing
  // },
  //       ${p.rowSpacing}, ${p.tags.includes('frosttolerant')}, ${p.prlf}, ${
  //   p.ttm
  // }, ${p.hrff}, ${p.perennial})
  //   `);
});

// await client.end();
