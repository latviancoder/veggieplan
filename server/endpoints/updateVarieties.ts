import { Response } from 'express';
import SQL from 'sql-template-strings';

import { Variety } from '../../src/types.js';
import { client, RequestBody } from '../server.js';

export const updateVarieties = async (
  req: RequestBody<Variety[]>,
  res: Response
) => {
  const newVarieties = req.body || [];
  const newVarietiesIds = newVarieties.map(({ id }) => id);

  const prevVarieties = await client.query(SQL`SELECT * FROM varieties`);

  const deletedVarietiesIds = prevVarieties.rows
    .filter((prev) => !newVarietiesIds.includes(prev.id))
    .map(({ id }) => id);

  if (deletedVarietiesIds.length) {
    await client.query(
      `UPDATE objects SET variety_id = NULL WHERE variety_id = ANY($1)`,
      [deletedVarietiesIds]
    );

    await client.query(`DELETE FROM varieties WHERE id = ANY($1)`, [
      deletedVarietiesIds,
    ]);
  }

  for (const obj of req.body || []) {
    await client.query(
      SQL`INSERT INTO varieties
      (id, plant_id, name, row_spacing, in_row_spacing, maturity) VALUES
      (${obj.id}, ${obj.plantId}, ${obj.name}, ${obj.rowSpacing}, ${obj.inRowSpacing}, ${obj.maturity})
      ON CONFLICT (id) DO UPDATE SET
        name = ${obj.name}, row_spacing = ${obj.rowSpacing}, in_row_spacing = ${obj.inRowSpacing}, maturity = ${obj.maturity}`
    );
  }

  res.send();
};
