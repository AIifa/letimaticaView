<template>
  <div class="page">
    <UInput
      v-if="true"
      type="file"
      size="sm"
      icon="i-heroicons-folder" 
    />

    <span> {{ schematicName }} </span>
    <LoaderItem
      :list="arrayCount"
    />
    <div class="mine-item-container">
      <MineItem
        v-if="listImage"
        v-for="(name, i) in arrayPallete"
        :name="name"
        :image="listImage[i]"
        :current="arrayCount[i]"
        :total="arrayCount[i]"
      />
    </div>
  </div>
</template>

<script setup>
const { data } = await useFetch('/api/read');

const schematic = data.value.value;

// Вынести бы эту функцию куда-то. И getLitematicaPaletteIdx вместе с ней
function getMaterialListForRegion(schematic, regionName, materialList = {}) {
  console.log("getMaterialListForRegion: ")
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

function getLitematicaPaletteIdx(x, y, z, xsize, zsize, bits, blockStates) {
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


const regionNames = Object.keys(schematic.Regions.value);
let materialList = regionNames.reduce((result, regionName) => {
  getMaterialListForRegion(schematic, regionName, result);
  return result;
}, {})

console.log("materialList: ", materialList)

const schematicName = data.value.value.Metadata.value.Name.value;

const arrayPallete = [
  ...new Set(
    regionNames
      .flatMap(regionName => schematic.Regions.value[regionName]?.value.BlockStatePalette?.value.value)
      .map(item => item.Name.value.slice(10))
      .filter(name => name !== 'air')
  ),
  'blue_orchid',
  'brown_mushroom',
  'blue_orchid',
  'brown_mushroom',
  'blue_orchid',
  'brown_mushroom',
  'blue_orchid',
  'brown_mushroom',
  'blue_orchid',
  'brown_mushroom',
  'blue_orchid',
  'brown_mushroom',
];
const arrayCount = ref(new Array(arrayPallete.length).map((item) => item = { current: 0, total: 0 }));

let listImage = reactive({});
useFetch('/api/mc', {
    method: 'PUT',
    body: { listName: arrayPallete },
  })
  .then((res) => {
    listImage = res.data;
  });
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
}

.mine-item-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}
</style>