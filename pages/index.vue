<template>
  <div>
    <LoaderItem />
    {{ data }}
    <div 
      v-for="(name, i) in arrayPallete"
    >
      <MineItem
        :name="name"
      />
    </div>
  </div>
</template>

<script setup>
const { data } = await useFetch('/api/read');

const schematic = data.value.value;
const regionNames = Object.keys(schematic.Regions.value)

const arrayPallete = [
  ...new Set(
    regionNames
      .flatMap(regionName => schematic.Regions.value[regionName]?.value.BlockStatePalette?.value.value)
      .map(item => item.Name.value)
      .filter(name => name !== 'minecraft:air')
  )
,
'minecraft:blue_orchid',
'minecraft:brown_mushroom'
];

console.log(arrayPallete);
</script>

<style scoped>

</style>