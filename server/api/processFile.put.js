import * as path from 'node:path';
import * as fs from 'node:fs';

import nbt from 'prismarine-nbt';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const mcAssets = require('minecraft-assets')('1.21.1');

export default defineEventHandler(async (event) => {
    const body = await readMultipartFormData(event); // array of files sent (1 file, in our case)
    const { parsed } = await nbt.parse(body[0]?.data); // parsed is Minecraft litematica, basically
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

    // Чистка всяких дублирующихся предметов (например, что torch и wall torch по-хорошему выводиться должны как torch с общим их колвом)
    // Факела
    if (materialList['minecraft:wall_torch']) { 
        materialList['minecraft:torch'] = materialList['minecraft:torch'] || 0; 
        materialList['minecraft:torch'] +=materialList['minecraft:wall_torch'];
        delete materialList['minecraft:wall_torch'];
    }
    if (materialList['minecraft:redstone_wall_torch']) { 
        materialList['minecraft:redstone_torch'] = materialList['minecraft:redstone_torch'] || 0; 
        materialList['minecraft:redstone_torch'] +=materialList['minecraft:redstone_wall_torch'];
        delete materialList['minecraft:redstone_wall_torch'];
    }
    // to-do: чекнуть как litematica сохраняет поршни (т.к.piston и piston_head это разные блоки, надо ли делить на 2 итоговое колво и т.п.)
    // skulls в зависимости от их положения (wall или нет)
    // Блоки, с которыми могут быть потенциально проблемы:
    // tripwire hook (и его части)
    // двери (их колво)
    
    // let toFind = "grindstone";
    // console.log("blocks: ", mcAssets.blocks[toFind])
    // console.log("blocksArray: ", mcAssets.blocksArray[toFind])
    // console.log("items: ", mcAssets.items[toFind])
    // console.log("itemsArray: ", mcAssets.itemsArray[toFind])
    // console.log("textureContent: ", mcAssets.textureContent[toFind])
    // console.log("textureContentArray: ", mcAssets.textureContentArray[toFind])
    // console.log("findItemOrBlockByName: ", mcAssets.findItemOrBlockByName(toFind))
    // console.log("getTexture: ", mcAssets.getTexture(toFind))

    const blocksUsingItemImage = ['campfire', 'soul_campfire', 'chain', 'lantern', 'soul_lantern', 'iron_bars', 'hopper', 'lever', 'mushroom_stem', 'repeater', 'comparator', 'kelp', 'seagrass', 'oak_door', 'spruce_door', 'jungle_door', 'birch_door', 'jungle_door', 'acacia_door', 'dark_oak_door', 'mangrove_door', 'cherry_door', 'pale_oak_door', 'bamboo_door', 'crimson_door', 'warped_door', 'iron_door', 'copper_door', 'exposed_copper_door', 'weathered_copper_door', 'oxidized_copper_door', 'waxed_copper_door', 'waxed_exposed_copper_door', 'waxed_weathered_copper_door', 'waxed_oxidized_copper_door', 'candle', 'white_candle', 'light_gray_candle', 'gray_candle', 'black_candle', 'brown_candle', 'red_candle', 'orange_candle', 'yellow_candle', 'lime_candle', 'green_candle', 'cyan_candle', 'light_blue_candle', 'blue_candle', 'purple_candle', 'magenta_candle', 'pink_candle', 'pointed_dripstone', 'bell'];
    const differentTexturesForBlocks = {
        'bone_block': 'blocks/bone_block_side', 'sticky_piston': 'blocks/piston_top_sticky', 'composter': 'blocks/composter_side', 'crafting_table': 'blocks/crafting_table_front', 'barrel': 'blocks/barrel_side', 'bee_nest': 'blocks/bee_nest_side', 'beehive': 'blocks/beehive_front_honey', 'bookshelf': 'blocks/bookshelf', 'chiseled_bookshelf': 'blocks/chiseled_bookshelf_empty', 'crimson_hyphae': 'blocks/crimson_stem_top', 'grass_block': 'blocks/grass_block_side', 'crafter': 'blocks/crafter_top'
    };
    const blocksUsingDifferentTexture = Object.keys(differentTexturesForBlocks);
    const handmadeTextures = {
        'prismarine': 'prismarine_basic.png',
        'stonecutter': 'stonecutter.webp',
        'tall_seagrass': 'tall_seagrass.webp',
        'sculk_shrieker': 'sculk_shrieker.webp',
        // Beds
        'white_bed': 'white_bed.webp',
        'light_gray_bed': 'light_gray_bed.webp',
        'gray_bed': 'gray_bed.webp',
        'black_bed': 'black_bed.webp',
        'brown_bed': 'brown_bed.webp',
        'red_bed': 'red_bed.webp',
        'orange_bed': 'orange_bed.webp',
        'yellow_bed': 'yellow_bed.webp',
        'lime_bed': 'lime_bed.webp',
        'green_bed': 'green_bed.webp',
        'cyan_bed': 'cyan_bed.webp',
        'light_blue_bed': 'light_blue_bed.webp',
        'blue_bed': 'blue_bed.webp',
        'purple_bed': 'purple_bed.webp',
        'magenta_bed': 'magenta_bed.webp',
        'pink_bed': 'pink_bed.webp',
        // Stairs
        'end_stone_brick_stairs': 'end_stone_brick_stairs.webp',
        'purpur_stairs': 'purpur_stairs.webp',
        'prismarine_stairs': 'prismarine_stairs.webp',
        'prismarine_brick_stairs': 'prismarine_brick_stairs.webp',
        'dark_prismarine_stairs': 'dark_prismarine_stairs.webp',
        'brick_stairs': 'brick_stairs.webp',
        'mud_brick_stairs': 'mud_brick_stairs.webp',

        'blackstone_stairs': 'blackstone_stairs.webp',
        'polished_blackstone_stairs': 'polished_blackstone_stairs.webp',
        'polished_blackstone_brick_stairs': 'polished_blackstone_brick_stairs.webp',
        'cobbled_deepslate_stairs': 'cobbled_deepslate_stairs.webp',
        'deepslate_tile_stairs': 'deepslate_tile_stairs.webp',
        'deepslate_brick_stairs': 'deepslate_brick_stairs.webp',
        'polished_deepslate_stairs': 'polished_deepslate_stairs.webp',

        'cut_copper_stairs': 'cut_copper_stairs.webp',
        'waxed_cut_copper_stairs': 'waxed_cut_copper_stairs.webp',
        'exposed_cut_copper_stairs': 'exposed_cut_copper_stairs.webp',
        'waxed_exposed_cut_copper_stairs': 'waxed_exposed_cut_copper_stairs.webp',
        'weathered_cut_copper_stairs': 'weathered_cut_copper_stairs.webp',
        'waxed_weathered_cut_copper_stairs': 'waxed_weathered_cut_copper_stairs.webp',
        'oxidized_cut_copper_stairs': 'oxidized_cut_copper_stairs.webp',
        'waxed_oxidized_cut_copper_stairs': 'oxidized_cut_copper_stairs.webp',

        'oak_stairs': 'oak_stairs.webp',
        'birch_stairs': 'birch_stairs.webp',
        'spruce_stairs': 'spruce_stairs.webp',
        'jungle_stairs': 'jungle_stairs.webp',
        'dark_oak_stairs': 'dark_oak_stairs.webp',
        'acacia_stairs': 'acacia_stairs.webp',
        'mangrove_stairs': 'mangrove_stairs.webp',
        'cherry_stairs': 'cherry_stairs.webp',
        'bamboo_stairs': 'bamboo_stairs.webp',
        'warped_stairs': 'warped_stairs.webp',
        'crimson_stairs': 'crimson_stairs.webp',

        'nether_brick_stairs': 'nether_brick_stairs.webp',
        'red_nether_brick_stairs': 'red_nether_brick_stairs.webp',
        'quartz_stairs': 'quartz_stairs.webp',
        'smooth_quartz_stairs': 'smooth_quartz_stairs.webp',
        'smooth_red_sandstone_stairs': 'smooth_red_sandstone_stairs.webp',
        'red_sandstone_stairs': 'red_sandstone_stairs.webp',
        'smooth_sandstone_stairs': 'smooth_sandstone_stairs.webp',
        'sandstone_stairs': 'sandstone_stairs.webp',

        'stone_stairs': 'stone_stairs.webp',
        'stone_brick_stairs': 'stone_brick_stairs.webp',
        'mossy_stone_brick_stairs': 'mossy_stone_brick_stairs.webp',
        'cobblestone_stairs': 'cobblestone_stairs.webp',
        'mossy_cobblestone_stairs': 'mossy_cobblestone_stairs.webp',

        'andesite_stairs': 'andesite_stairs.webp',
        'polished_andesite_stairs': 'polished_andesite_stairs.webp',
        'granite_stairs': 'granite_stairs.webp',
        'polished_granite_stairs': 'polished_granite_stairs.webp',
        'diorite_stairs': 'diorite_stairs.webp',
        'polished_diorite_stairs': 'polished_diorite_stairs.webp',
    }
    const blocksWithHandmadeTextures = Object.keys(handmadeTextures);
    // grindstone, end_rod, *_wall, *_fence, *_button, *_slab, *_stairs, *_bed, redstone_wire, sticky_piston, decorated_pot - нет текстуры, видимо, собирается из кусочков/других текстур?
    // prismarine, magma_block - нет квадратной текстуры, т.к.есть анимация

    // Gets texture from /./node_modules/minecraft-assets/minecraft-assets/data/1.21.1/ some item path .png
    const getMcAssetsTexture = async (itemPath) => {
        const filePath = path.join(process.cwd(), '/./node_modules/minecraft-assets/minecraft-assets/data/1.21.1', itemPath + '.png');
        const dataFile = await fs.promises.readFile(filePath);
        return dataFile.toString('base64');
    }
    // gets texture from /public Nuxt folder
    const getTexture = async (itemPath) => {
        const filePath = path.join(process.cwd(), '/./public/mc_textures', itemPath);
        const dataFile = await fs.promises.readFile(filePath);
        return dataFile.toString('base64');
    }
    // For cases where we want block to use it's item texture
    const getItemFileForBlock = async (blockName) => {
        const itemPath = mcAssets.items[blockName]?.texture.replace("minecraft:", "").replace("block/", "blocks/");
        return await getMcAssetsTexture(itemPath);
    }
    // For cases where we want block to use other texture
    const getDifTextureFileForBlock = async (blockName) => {
        const itemPath = differentTexturesForBlocks[blockName] || "";
        return await getMcAssetsTexture(itemPath);
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
        if (blocksWithHandmadeTextures.includes(shortName)) {
            texture = await getTexture(handmadeTextures[shortName]);
        }
        if (texture == null) { texture = await getMcAssetsTexture('misc/unknown_pack'); }

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