<template>
    <div class="loader">
      <UProgress :value="sumListCurrent" :max="sumListTotal"/>
    </div>
</template>

<script setup>
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  }
});

const sumListCurrent = computed(() => {
  return props.list.reduce((acc, item) => acc + item.current, 0);
});
const sumListTotal = computed(() => {
  return props.list.reduce((acc, item) => acc + item.total, 0);
});
</script>

<style scoped>
.loader {
  width: 80vw;
  background-color: bisque;
  flex: 1;
  border-radius: 5px;
}
</style>