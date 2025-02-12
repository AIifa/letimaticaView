<template>
  <div class="page">
    <UInput
      type="file"
      size="sm"
      icon="i-heroicons-folder" 
      accept=".litematic"
      @change="(files) => processFileInput(files)"
    />

    <span v-if="schematicName"> {{ schematicName }} </span>
    <LoaderItem
      v-if="schematicName"
      :list="arrayCount"
    />
    <div 
      v-if="schematicName"
      class="mine-item-container"
    >
      <MineItem
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
  arrayCount.value[i].current = v;
};
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 10px 0px;
}

.mine-item-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: center;
  height: 73vh;
  margin: 0px 10px;
  overflow-y: auto;
}

.mine-item-container::-webkit-scrollbar {
  width: 10px;
}

.mine-item-container::-webkit-scrollbar-track {
  border-radius: 100vh;
  background: rgb(0 0 0 / 50%);
}

.mine-item-container::-webkit-scrollbar-thumb {
  background: #8f8f8f23;
  border-radius: 100vh;
  border: 1px solid #000000;
}

.mine-item-container::-webkit-scrollbar-thumb:hover {
  background: #8f8f8f6c;
}
</style>