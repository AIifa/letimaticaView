<template>
    <div class="loader">
      <UProgress :value="sumListCurrent" :max="sumListTotal"/>
    </div>
</template>

<script setup>
const prosp = defineProps({
  list: {
    type: Array,
    default: () => [],
  }
});

const sumListCurrent = computed(() => {
  return prosp.list.reduce((acc, item) => acc + item.current, 0);
});
const sumListTotal = computed(() => {
  return prosp.list.reduce((acc, item) => acc + item.total, 0);
});
</script>

<style scoped>
.loader {
  background-color: bisque;
}
</style>