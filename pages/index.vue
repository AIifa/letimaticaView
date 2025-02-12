<template>
  <div class="page">
    <UInput
      type="file"
      size="sm"
      icon="i-heroicons-folder" 
      accept=".litematic"
      @change="(files) => processFileInput(files)"
    />

    <span> {{ schematicName }} </span>
    <LoaderItem
      v-if="listImage"
      :list="arrayCount"
    />
    <div 
      v-if="schematicName"
      class="mine-item-container"
    >
      <MineItem
        v-if="listImage"
        v-for="(material, i) in materialList"
        :name="material.name"
        :image="listImage[i]"
        :counter="arrayCount[i]"
        @change-counter="(v) => setNewCounter(v, i)"
      />
    </div>
  </div>
</template>

<script setup>
let schematicName = ref('');
let listImage = reactive({});
let materialList = reactive([]);
const processFileInput = (files) => {
  if (!files.length) { return; }

  const formData = new FormData();
  formData.append("file", files[0]);

  useFetch('/api/processFile', {
    method: 'PUT',
    body: formData,
  })
  .then((res) => {
    schematicName.value = res.data.value.name;
    materialList = res.data.value.materials;

    let namesList = materialList.map(material => material.name);
    arrayCount.value = namesList
      .map((item, index) => item = { current: 0, total: materialList[index].amount });

    listImage = materialList.map(material => material.texture);
  });
};

let arrayCount = ref([]);
const setNewCounter = (v, i) => {
  console.log(v)
  arrayCount.value[i].current = v;
};
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