import * as path from 'node:path';
import * as fs from 'node:fs';
import * as buffer from 'node:buffer';

import nbt from 'prismarine-nbt';

export default defineEventHandler(async (event) => {

  const body = await readBody(event);
    // console.log("process File server side: ", body);
  const filePath = path.join(process.cwd(), 'litematicaFiles', 'Hot_air_baloon_litematic.litematic');

  const dataFile = await fs.promises.readFile(filePath);
  // console.log(buffer)
  console.log(body);
  console.log("\n");
  console.log(dataFile);

  const { parsed, type } = await nbt.parse(body)

  return parsed;
});