import nbt from 'prismarine-nbt';

const parseLitematicaFile = async (body) =>{    
  const { parsed } = await nbt.parse(body[0]?.data);

  const schematic = parsed.value;
  const regionNames = Object.keys(schematic.Regions.value);

  let materialList = regionNames.reduce((result, regionName) => {
    getMaterialListForRegion(schematic, regionName, result);
    return result;
  }, {});

  let newMaterialList = Object.assign({}, materialList);
  Object.keys(materialList).forEach(name => {
    delete newMaterialList[name];
    
    const shortName = name.slice(10);
    if (shortName == "air" || shortName == "cave_air" || shortName == "void_air" 
      || shortName == "water" || shortName == "fire" || shortName == "soul_fire" 
      || shortName == "bubble_column") {
      return;
    }
      
    const isWall = name.indexOf('wall_');
    if (isWall > -1) {
      const realName = name.replace('wall_', '');
      const realShortName = realName.slice(10);
      newMaterialList[realShortName] = newMaterialList[realName] || 0;
      newMaterialList[realShortName] += materialList[realName];

      delete newMaterialList[realName];
    } else {
      newMaterialList[shortName] = materialList[name];
    }
  });

  return { materialList: newMaterialList, schematic };
}

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

export default parseLitematicaFile;