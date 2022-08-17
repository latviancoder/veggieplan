import { Response } from 'express';
import SQL from 'sql-template-strings';

import { client, RequestBody } from '../server.js';

export const updateObjects = async (req: RequestBody<any[]>, res: Response) => {
  const newObjects = req.body || [];
  const newObjectsIds = newObjects.map(({ id }) => id);

  const prevObjects = await client.query(SQL`SELECT * FROM objects`);

  const deletedObjectsIds = prevObjects.rows
    .filter((prev) => !newObjectsIds.includes(prev.id))
    .map(({ id }) => id);

  if (deletedObjectsIds.length) {
    await client.query(`DELETE FROM objects WHERE id = ANY($1)`, [
      deletedObjectsIds,
    ]);
  }

  res.send();

  for (const obj of req.body || []) {
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
};
