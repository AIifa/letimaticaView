<template>
  <div class="page">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner" />
    </div>

    <template v-else>
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
          v-for="(material, i) in materialList" :key="material.name + i"
          :name="material.name"
          :image="listImage[i]"
          :counter="arrayCount[i]"
          @change-counter="(v) => setNewCounter(v, i)"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
const schematicName = ref('');
const arrayCount = ref([]);
let listImage = reactive({});
let materialList = reactive([]);
const isLoading = ref(false);
const processFileInput = (files) => {
  if (!files.length) { return; }

  const formData = new FormData();
  formData.append("file", files[0]);
 
  isLoading.value = true;
  useFetch('/api/processFile', {
    method: 'PUT',
    body: formData,
  })
  .then((res) => {
    schematicName.value = res.data.value.name;
    materialList = res.data.value.materials;

    const namesList = materialList.map(material => material.name);
    arrayCount.value = namesList
      .map((item, index) => item = { current: 0, total: materialList[index].amount });

    listImage = materialList.map(material => material.texture);

    localStorage.setItem('litematicData', JSON.stringify({
      'schematicName': schematicName.value,
      'arrayCount': arrayCount.value,
      materialList,
      listImage
    }));
  })
  .finally(() => {
    isLoading.value = false;
  });
};

const setNewCounter = (v, i) => {
  arrayCount.value[i].current = v;
};

onMounted(() => {
  const litematicData = JSON.parse(localStorage.getItem('litematicData'));
  console.log(litematicData)
  if (litematicData) {
    schematicName.value = litematicData.schematicName;
    materialList = litematicData.materialList;
    arrayCount.value = litematicData.arrayCount;
    listImage = litematicData.listImage;
  }
});
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 10px 0px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  background-image: url('../style/minecraft-background.jpg');
  background-size: 100px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4ad35c;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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