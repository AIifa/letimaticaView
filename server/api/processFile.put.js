import nbt from 'prismarine-nbt';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const mcAssets = require('minecraft-assets')('1.21.1');

export default defineEventHandler(async (event) => {
    const body = await readMultipartFormData(event); // array of files sent (1 file, in our case)
    const { parsed, type } = await nbt.parse(body[0]?.data); // parsed is Minecraft litematica, basically
    console.log("processFile server side: ", parsed)

    const getMaterialListForRegion = (schematic, regionName, materialList = {}) => {
        const region = schematic.Regions.value[regionName].value;
        if (!region) return materialList;
        const blockStates = schematic.Regions.value[regionName].value.BlockStates?.value;
        const palette = schematic.Regions.value[regionName].value.BlockStatePalette?.value.value;
        if (!blockStates || !palette) {
          console.error('Invalid .litematic file or missing block data.');
          return;
        }
        const paletteSize = palette.length;
        const bits = Math.max(2, Math.ceil(Math.log2(paletteSize)));
      
        const ysizeAbs = Math.abs(region.Size.value.y.value);
        const zsizeAbs = Math.abs(region.Size.value.z.value);
        const xsizeAbs = Math.abs(region.Size.value.x.value);
        for (let y = 0; y < ysizeAbs; y++) {
          for (let z = 0; z < zsizeAbs; z++) {
            for (let x = 0; x < xsizeAbs; x++) {
              const idx = getLitematicaPaletteIdx(x, y, z, xsizeAbs, zsizeAbs, bits, blockStates);
              const material = palette[idx];
              const materialName = material.Name.value;
              if (!materialList[materialName]) {materialList[materialName] = 0;}
                materialList[materialName] ++;
            }
          }
        }
        return materialList;
    }
      
    const getLitematicaPaletteIdx = (x, y, z, xsize, zsize, bits, blockStates) => {
        let paletteIdx;
        const index = (y * xsize * zsize) + z * xsize + x;
    
        const startOffset = index * bits;
        const startArrIndex = startOffset >>> 6; //div 64
        const endArrIndex = ((index + 1) * bits - 1) >>> 6; //div 64
        const startBitOffset = startOffset & 0x3F; //and 64
    
        const maxEntryValue = BigInt((1 << bits) - 1);
    
        // Remove negatives because BigInt deals with signed
        const startLong = (BigInt(blockStates[startArrIndex][0] >>> 0) << 32n) | (BigInt(blockStates[startArrIndex][1] >>> 0));
    
        if (startArrIndex == endArrIndex) {
            paletteIdx = startLong >> BigInt(startBitOffset);
        }
        else {
            const endOffset = BigInt(64 - startBitOffset);
            // Remove negatives because BigInt deals with signed
            const endLong = (BigInt(blockStates[endArrIndex][0] >>> 0) << 32n) | (BigInt(blockStates[endArrIndex][1] >>> 0));
    
            paletteIdx = startLong >> BigInt(startBitOffset) | endLong << endOffset;
        }
        paletteIdx &= maxEntryValue;
        return paletteIdx;
    }

    // console.log(parsed.value.Metadata.value.Author.value)
    const schematic = parsed.value;
    const regionNames = Object.keys(schematic.Regions.value);
    let materialList = regionNames.reduce((result, regionName) => {
        getMaterialListForRegion(schematic, regionName, result);
        return result;
    }, {})
    console.log("materialList: ", materialList)

    const result = [];
    for (let name in materialList) {
        let newItem = {
            name: name.slice(10),
            amount: materialList[name],
            texture: mcAssets.textureContent[name.slice(10)]?.texture && mcAssets.textureContent[name.slice(10)]?.texture.replace(/^data:image\/png;base64,/, '')
        }
        // console.log(name, newItem)
        result.push(newItem)
    }
    console.log("process file server result: ", result)

    return { materials: result, name: schematic.Metadata.value.Name.value };
});