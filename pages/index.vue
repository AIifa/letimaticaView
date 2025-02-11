<template>
  <div class="page">
    <UInput
      type="file"
      size="sm"
      icon="i-heroicons-folder" 
      accept=".litematic"
      v-model="schemPath"
      ref="fileInput"
      @change="(files) => processFileInput(files)"
    />

    <span> {{ schematicName }} </span>
    <LoaderItem v-if="schematicName"
      :list="arrayCount"
    />
    <div class="mine-item-container" v-if="schematicName">
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
let schematicName = ref("");
let listImage = reactive({});
let arrayCount = reactive([]);
let materialList = [];
const setNewCounter = (v, i) => {
  arrayCount[i].current = v;
};

let schemPath = ref("");
let fileInput = ref();
const processFileInput = (files) => {
  if (!files.length) {return;}
  console.log("process file, pages: ", files)
  const formData = new FormData();
  formData.append("file", files[0]);

  useFetch('/api/processFile', {
    method: 'PUT',
    body: formData,
  })
  .then((res) => {
    console.log("something returned: ", res.data.value)
    console.log(res.data)

    schematicName.value = res.data.value.name;
    materialList = res.data.value.materials;
    let namesList = materialList.map(material => material.name);

    arrayCount = namesList
      // .filter(name => name !== 'air')
      .map((item, index) => item = { current: 0, total: materialList[index].amount });

    console.log(arrayCount)
    listImage = materialList.map(material => material.texture);
    console.log(listImage)
  });
}
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