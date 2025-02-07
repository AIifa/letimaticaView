import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const mcAssets = require('minecraft-assets')('1.21.1');

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    console.log(body.listName);
    const listName = body.listName

    listName.map(name => console.log(mcAssets.findItemOrBlockByName(name).name));
    const result = listName.map(name => mcAssets.textureContent[name]?.texture.replace(
        /^data:image\/png;base64,/,
        ''
    ));

    return result;
});
  