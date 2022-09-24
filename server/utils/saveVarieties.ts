import { JwtPayload } from 'jsonwebtoken';
import SQL from 'sql-template-strings';

import { Variety } from '../../src/types';
import { client } from '../server.js';

export const saveVarieties = async (
  varieties: Variety[] = [],
  auth?: JwtPayload
) => {
  const varietyIds = varieties.map(({ id }) => id);

  const prevVarieties = await client.query(
    SQL`SELECT * FROM varieties WHERE user_id = ${auth?.sub}`
  );

  const deletedVarietiesIds = prevVarieties.rows
    .filter((prev) => !varietyIds.includes(prev.id))
    .map(({ id }) => id);

  if (deletedVarietiesIds.length) {
    await client.query(
      SQL`UPDATE objects SET variety_id = NULL WHERE variety_id = ANY($1) AND user_id=${auth?.sub}`,
      [deletedVarietiesIds]
    );

    await client.query(
      SQL`DELETE FROM varieties WHERE id = ANY($1) AND user_id=${auth?.sub}`,
      [deletedVarietiesIds]
    );
  }

  for (const obj of varieties) {
    await client.query(
      SQL`INSERT INTO varieties
      (id, plant_id, name, row_spacing, in_row_spacing, maturity, user_id) VALUES
      (${obj.id}, ${obj.plantId}, ${obj.name}, ${obj.rowSpacing}, ${obj.inRowSpacing}, ${obj.maturity}, ${auth?.sub})
      ON CONFLICT (id) DO UPDATE SET
        name = ${obj.name}, row_spacing = ${obj.rowSpacing}, in_row_spacing = ${obj.inRowSpacing}, maturity = ${obj.maturity}`
    );
  }
};
