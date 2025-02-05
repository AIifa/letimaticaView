<template>
  <div>
    {{ materialList }}
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div>
</template>

<script setup>
const { data } = await useFetch('/api/read')
console.log(data.value.value) // Данные схематики
// data.value.value?.Regions.value - объект вида {имя_подрегиона: {объект с данными подрегиона}}
let regions = data.value.value?.Regions.value;
// let palette = Object.keys(regions).reduce((acc, cur) => {

// }, {});
// console.log(palette)
/////////////////////////////////////////////////
let schematic = data.value.value;
// Assuming `schematic` is the parsed NBT data
const regionName = Object.keys(schematic.Regions.value)[0]; // Get the first region name
// console.log("regionName: ", regionName)
// console.log(schematic.Regions.value[regionName])
const blocks = schematic.Regions.value[regionName]?.value.BlockStates?.value; // Block indices
const blockStates = blocks;
const palette = schematic.Regions.value[regionName]?.value.BlockStatePalette?.value.value; // Block palette
// console.log("blocks: ", blocks, "palette: ", palette);
if (!blocks || !palette) {
  console.error('Invalid .litematic file or missing block data.');
  //return;
}

// // Step 1: Count the occurrences of each block type
// const materialList = {};
// for (const block of palette) {
//   console.log(block)
//   const blockName = block?.Name?.value; // Get the block name from the palette
//   if (blockName) {
//     materialList[blockName] = (materialList[blockName] || 0) + 1;
//   }
// }

// // Step 2: Display the material list
// console.log('Material List:');
// console.log(materialList);

/////////////////////////////////////////////////////////////////////////////
// Step 1: Calculate bitsPerIndex
const paletteSize = palette.length;
const bitsPerIndex = 1;//Math.ceil(Math.log2(paletteSize));
console.log(paletteSize, bitsPerIndex, Math.ceil(Math.log2(paletteSize)))
// bitsPerIndex = 4 = Math.ceil(Math.log2(paletteSize)) верно для 2x2_region, где 8 разных блоков

// Step 2: Decode BlockStates
const blockIndices = [];
// for (let i = 0; i < blockStates.length; i += 2) {
for (let i = 0; i < blockStates.length; i ++) {
  // const lowerBits = blockStates[i]; // Lower 32 bits
  // const upperBits = blockStates[i + 1]; // Upper 32 bits
  const lowerBits = blockStates[i][0]; // Lower 32 bits
  const upperBits = blockStates[i][1]; // Upper 32 bits
  // console.log(lowerBits, upperBits)
  const longValue = (BigInt(lowerBits) << 32n) | BigInt(upperBits);
  // const longValue = (BigInt(upperBits) << 32n) | BigInt(lowerBits); // Combine into 64-bit integer

  // Extract block indices from the 64-bit integer
  for (let bitOffset = 0; bitOffset < 64; bitOffset += bitsPerIndex) {
    const index = Number((longValue >> BigInt(bitOffset)) & ((1n << BigInt(bitsPerIndex)) - 1n));
    if (index >= paletteSize) break; // Stop if index is out of bounds
    blockIndices.push(index);
  }
}

// Step 3: Count materials
const materialList = {};
for (const blockIndex of blockIndices) {
  const blockName = palette[blockIndex]?.Name?.value; // Get the block name from the palette
  if (blockName) {
    materialList[blockName] = (materialList[blockName] || 0) + 1;
  }
}

// Step 4: Display the material list
console.log('Material List:', Object.keys(materialList).length);
for (let mat in materialList) {
  console.log(mat, materialList[mat])
}
// console.log(materialList);
</script>
