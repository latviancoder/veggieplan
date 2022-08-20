import { JwtPayload } from 'jsonwebtoken';
import SQL from 'sql-template-strings';

import { client } from '../server.js';

export const saveObjects = async (objects: any[] = [], auth?: JwtPayload) => {
  const objectsIds = objects.map(({ id }) => id);

  const prevObjects = await client.query(
    SQL`SELECT * FROM objects WHERE user_id=${auth?.sub}`
  );

  const deletedObjectsIds = prevObjects.rows
    .filter((prev) => !objectsIds.includes(prev.id))
    .map(({ id }) => id);

  if (deletedObjectsIds.length) {
    await client.query(
      `DELETE FROM objects WHERE id = ANY($1) AND user_id=${auth?.sub}`,
      [deletedObjectsIds]
    );
  }

  for (const obj of objects) {
    await client.query(
      SQL`INSERT INTO objects 
        (id, x, y, width, height, rotation, variety_id, object_type, shape_type, plant_id, 
          date_added, sorting, in_row_spacing, row_spacing, 
          date_direct_sow, date_start_indoors, date_transplant, date_first_harvest, date_last_harvest, 
         user_id) VALUES 
        (${obj.id}, ${obj.x}, ${obj.y}, ${obj.width}, ${obj.height}, ${obj.rotation}, 
          ${obj.varietyId}, ${obj.objectType}, ${obj.shapeType}, ${obj.plantId}, 
          ${obj.dateAdded}, ${obj.sorting}, ${obj.inRowSpacing}, ${obj.rowSpacing},
          ${obj.dateDirectSow}, ${obj.dateStartIndoors}, ${obj.dateTransplant}, ${obj.dateFirstHarvest}, ${obj.dateLastHarvest}, 
         ${auth?.sub}
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
};
