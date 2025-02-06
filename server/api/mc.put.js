import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const mcAssets = require('minecraft-assets')('1.21.1')

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    // console.log(body.name)
    const name = body?.name.slice(10);

    console.log(mcAssets.textureContent[name])

    return mcAssets.textureContent[name]?.texture.replace(
        /^data:image\/png;base64,/,
        ''
    );
});
  