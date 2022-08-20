import { JwtPayload } from 'jsonwebtoken';
import SQL from 'sql-template-strings';

import { Config } from '../../src/types';
import { client } from '../server.js';

export const saveConfig = async (config: Config, auth?: JwtPayload) => {
  return await client.query(
    SQL`INSERT INTO config (user_id, width, height) 
        VALUES (${auth?.sub}, ${config.width}, ${config.height}) 
        ON CONFLICT (user_id) DO UPDATE SET width=${config.width}, height=${config.height}`
  );
};
