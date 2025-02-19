import * as path from 'node:path';
import * as fs from 'node:fs';

import ImageCollection from '../models/imageCollection.js';

import loadingNewImageInDatabase from '../utils/loadingNewImageInDatabase.js';
import parseLitematicaFile from '../utils/parseLitematicaFile.js';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const mcAssets = require('minecraft-assets')('1.21.1');


export default defineEventHandler(async (event) => {
    const body = await readMultipartFormData(event);
    
    let { materialList, schematic } = await parseLitematicaFile(body);

    // TODO: чекнуть как litematica сохраняет поршни (т.к.piston и piston_head это разные блоки, надо ли делить на
    //  2 итоговое колво и т.п.)
    // Блоки, с которыми могут быть потенциально проблемы:
    // tripwire hook (и его части)
    // двери (их колво)


    const blocksUsingItemImage = [
        'campfire', 'soul_campfire', 'chain', 'lantern', 'soul_lantern', 'iron_bars', 'hopper', 'lever', 
        'mushroom_stem', 'repeater', 'comparator', 'kelp', 'seagrass', 'oak_door', 'spruce_door', 
        'jungle_door', 'birch_door', 'jungle_door', 'acacia_door', 'dark_oak_door', 'mangrove_door', 
        'cherry_door', 'bamboo_door', 'crimson_door', 'warped_door', 'iron_door', 'copper_door', 
        'exposed_copper_door', 'weathered_copper_door', 'oxidized_copper_door', 'waxed_copper_door', 
        'waxed_exposed_copper_door', 'waxed_weathered_copper_door', 'waxed_oxidized_copper_door', 
        'candle', 'white_candle', 'light_gray_candle', 'gray_candle', 'black_candle', 'brown_candle', 
        'red_candle', 'orange_candle', 'yellow_candle', 'lime_candle', 'green_candle', 'cyan_candle', 
        'light_blue_candle', 'blue_candle', 'purple_candle', 'magenta_candle', 'pink_candle', 
        'pointed_dripstone', 'bell'
    ]; // 'pale_oak_door' (not yet)

    const differentTexturesForBlocks = {
        'bone_block': 'blocks/bone_block_side',
        'sticky_piston': 'blocks/piston_top_sticky', 
        'composter': 'blocks/composter_side',
        'crafting_table': 'blocks/crafting_table_front', 
        'barrel': 'blocks/barrel_side',
        'bee_nest': 'blocks/bee_nest_side', 
        'beehive': 'blocks/beehive_front_honey',
        'bookshelf': 'blocks/bookshelf', 
        'chiseled_bookshelf': 'blocks/chiseled_bookshelf_empty',
        'crimson_hyphae': 'blocks/crimson_stem_top', 
        'grass_block': 'blocks/grass_block_side',
        'crafter': 'blocks/crafter_top'
    };
    const blocksUsingDifferentTexture = Object.keys(differentTexturesForBlocks);

    // Gets texture from /./node_modules/minecraft-assets/minecraft-assets/data/1.21.1/ some item path .png
    const getMcAssetsTexture = async (itemPath) => {
        const filePath = path.join(process.cwd(), '/./node_modules/minecraft-assets/minecraft-assets/data/1.21.1', itemPath + '.png');
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
        const itemPath = differentTexturesForBlocks[blockName] || "misc/unknown_pack";
        return await getMcAssetsTexture(itemPath);
    }

    // Для загрузки БД
    // loadingNewImageInDatabase();

    const result = [];
    for (let name in materialList) {
        let texture = '';
        // Пробуем найти текстуру среди вручную загруженных текстур
        // Там есть следующие текстуры:
        // Кровати, Ступени, Полублоки, Таблички (в т.ч.подвесные), Заборы+Ограды, Нажимные плиты, Калитки, Кнопки
        // chest, trapped_chest, sculk_shrieker, tall_seagrass, lectern, stonecutter, grindstone

        // Осталось найти+дозагрузить следующие текстуры:
        // Ковры, Баннеры
        // end_rod, redstone_wire, decorated_pot, glow lichen, sculk vein, котел с водой, котел с лавой, ender chest
        // prismarine, magma_block, sea lantern
        // cartography table, мб еще какие-то блоки работ
        
        try {
            const filePath = path.join(process.cwd(), '/./public/mc_textures', name.replace("waxed_", "") + '.webp');
            const dataFile = await fs.promises.readFile(filePath);
            // return dataFile.toString('base64');
            texture = dataFile.toString('base64');
        } catch (error) {
            // console.log(error);
            texture = mcAssets.textureContent[name]?.texture && mcAssets.textureContent[name]?.texture.replace(/^data:image\/png;base64,/, '');
        }
        
        // У некоторых блоков путь к нужной текстуре отличается от просто названия блока; или текстуры блока хуже подходят для представления блока, чем текстура предмета
        if (blocksUsingItemImage.includes(name)) { 
            texture = await getItemFileForBlock(name);
        }
        if (blocksUsingDifferentTexture.includes(name)) {
            texture = await getDifTextureFileForBlock(name);
        }
        if (texture == null) { texture = await getMcAssetsTexture('misc/unknown_pack'); }

        let newItem = {
            name: name.replaceAll('_', ' '),
            amount: materialList[name],
            texture
        };
        result.push(newItem);
    }

    return { materials: result, name: schematic.Metadata.value.Name.value };
});