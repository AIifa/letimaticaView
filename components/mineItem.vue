<template>
  <div>
    <!-- Изображение ресурса -->

     <!-- ПОЧЕМУ ОДИН И ТОТ ЖЕ КОМПОНЕНТ? -->
    <div><img :src="'data:image/png;base64,' + data2"></div>

    <span> {{ props.name }} </span>

    <!-- Поле с число собрано/надо -->
    <div></div>

    <!-- чекбокс -->
    <div></div>
  </div>
</template>

<script setup>
const props = defineProps(['name',]);

// ЧТО ТО НЕ ТО С ЗАПРОСАМИ
const { data: data2 } = await useFetch('/api/mc', {
  method: 'PUT',
  body: { name: props.name },
});
console.log(data2?.value)
</script>

<style scoped>
</style>