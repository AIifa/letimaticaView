<template>
  <div>
    <UInput type="file" size="sm" icon="i-heroicons-folder" />

    <span> {{ schematicName }} </span>
    <LoaderItem
      :list="arrayCount"
    />
    <div
      v-if="listImage"
      v-for="(name, i) in arrayPallete"
    >
      <MineItem
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
const schematicName = data.value.value.Metadata.value.Name.value;
console.log(data.value.value)
const regionNames = Object.keys(schematic.Regions.value);

const arrayPallete = [
  ...new Set(
    regionNames
      .flatMap(regionName => schematic.Regions.value[regionName]?.value.BlockStatePalette?.value.value)
      .map(item => item.Name.value.slice(10))
      .filter(name => name !== 'air')
  ),
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

<style scoped>

</style>