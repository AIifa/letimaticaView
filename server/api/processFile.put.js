import nbt from 'prismarine-nbt';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const mcAssets = require('minecraft-assets')('1.21.1');

import * as path from 'node:path';
import * as fs from 'node:fs';

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
    
    // let toFind = "grindstone";
    // console.log("blocks: ", mcAssets.blocks[toFind])
    // console.log("blocksArray: ", mcAssets.blocksArray[toFind])
    // console.log("items: ", mcAssets.items[toFind])
    // console.log("itemsArray: ", mcAssets.itemsArray[toFind])
    // console.log("textureContent: ", mcAssets.textureContent[toFind])
    // console.log("textureContentArray: ", mcAssets.textureContentArray[toFind])
    // console.log("findItemOrBlockByName: ", mcAssets.findItemOrBlockByName(toFind))
    // console.log("getTexture: ", mcAssets.getTexture(toFind))

    const blocksUsingItemImage = ['campfire', 'chain', 'lantern', 'iron_bars', 'hopper', 'lever', 'mushroom_stem', 'repeater', 'comparator', 'kelp', 'seagrass', 'oak_door', 'spruce_door', 'jungle_door', 'birch_door', 'jungle_door', 'acacia_door', 'dark_oak_door', 'mangrove_door', 'cherry_door', 'pale_oak_door', 'bamboo_door', 'crimson_door', 'warped_door', 'iron_door', 'copper_door', 'exposed_copper_door', 'weathered_copper_door', 'oxidized_copper_door', 'waxed_copper_door', 'waxed_exposed_copper_door', 'waxed_weathered_copper_door', 'waxed_oxidized_copper_door', 'candle', 'white_candle', 'light_gray_candle', 'gray_candle', 'black_candle', 'brown_candle', 'red_candle', 'orange_candle', 'yellow_candle', 'lime_candle', 'green_candle', 'cyan_candle', 'light_blue_candle', 'blue_candle', 'purple_candle', 'magenta_candle', 'pink_candle', 'pointed_dripstone', 'bell'];
    const differentTexturesForBlocks = {
        'bone_block': 'blocks/bone_block_side', 'sticky_piston': 'blocks/piston_top_sticky', 'composter': 'blocks/composter_side', 'crafting_table': 'blocks/crafting_table_front', 'barrel': 'blocks/barrel_side', 'bee_nest': 'blocks/bee_nest_side', 'beehive': 'blocks/beehive_front_honey', 'bookshelf': 'blocks/bookshelf', 'chiseled_bookshelf': 'blocks/chiseled_bookshelf_empty', 'crimson_hyphae': 'blocks/crimson_stem_top'
    };
    const blocksUsingDifferentTexture = Object.keys(differentTexturesForBlocks);
    // grindstone, end_rod, *_wall, *_fence, *_button, *_slab, *_stairs, *_bed, redstone_wire, sticky_piston, decorated_pot - нет текстуры, видимо, собирается из кусочков/других текстур?
    // prismarine, magma_block - нет квадратной текстуры, т.к.есть анимация

    // Gets texture from /./node_modules/minecraft-assets/minecraft-assets/data/1.21.1/ some item path .png
    const getTexture = async (itemPath) => {
        const filePath = path.join(process.cwd(), '/./node_modules/minecraft-assets/minecraft-assets/data/1.21.1', itemPath + '.png');
        const dataFile = await fs.promises.readFile(filePath);
        return dataFile.toString('base64');
    }
    // For cases where we want block to use it's item texture
    const getItemFileForBlock = async (blockName) => {
        const itemPath = mcAssets.items[blockName]?.texture.replace("minecraft:", "").replace("block/", "blocks/");
        return await getTexture(itemPath);
    }
    // For cases where we want block to use other texture
    const getDifTextureFileForBlock = async (blockName) => {
        const itemPath = differentTexturesForBlocks[blockName] || "";
        return await getTexture(itemPath);
    }

    const result = [];
    for (let name in materialList) {
        const shortName = name.slice(10);
        let texture = mcAssets.textureContent[shortName]?.texture && mcAssets.textureContent[shortName]?.texture.replace(/^data:image\/png;base64,/, '');
        
        // Тут чистка materialList от всяких air, правки путей и т.п.
        if (shortName == "air" || shortName == "cave_air" || shortName == "void_air" || shortName == "water") { continue; }
        // У некоторых блоков путь к нужной текстуре отличается от просто названия блока; или текстуры блока хуже подходят для представления блока, чем текстура предмета
        if (blocksUsingItemImage.includes(shortName)) { 
            texture = await getItemFileForBlock(shortName);
        }
        if (blocksUsingDifferentTexture.includes(shortName)) {
            texture = await getDifTextureFileForBlock(shortName);
        }
        if (texture == null) { texture = await getTexture('misc/unknown_pack'); }

        let newItem = {
            name: shortName.replaceAll('_', ' '),
            amount: materialList[name],
            texture
        };
        result.push(newItem);
    }
    // console.log("process file server result: ", result)

    return { materials: result, name: schematic.Metadata.value.Name.value };
});