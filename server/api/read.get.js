import * as path from 'node:path';
import * as fs from 'node:fs';

import nbt from 'prismarine-nbt';

export default defineEventHandler(async (event) => {
  const filePath = path.join(process.cwd(), 'litematicaFiles', 'Hot_air_baloon_litematic.litematic');

  const dataFile = await fs.promises.readFile(filePath);

  const { parsed, type } = await nbt.parse(dataFile)

  return parsed;
});
