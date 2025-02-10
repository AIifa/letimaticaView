<template>
  <div class="item-container">
    <img
      style="height: 64px; image-rendering: pixelated;"
      :src="'data:image/png;base64,' + props.image"
    >

    <span style="margin-left: 5px; color: black"> {{ props.name + ': ' }} </span>

    <input
      v-model="current"
      class="number-input"
      type="number"
      min="0"
      pattern="[0-9]*"
      style="margin-left: 5px; color: black"
      :max="props.total"
    />

    <span style="color: black"> {{ '/' + props.total }} </span>

    <input style="margin-left: 5px;" type="checkbox" id="checkbox" />
  </div>
</template>

<script setup>
const props = defineProps({
  name: {
    type: String,
    default: '',
  }, 
  image: {
    type: String,
    default: '',
  },
  // current: {
  //   type: Number,
  //   default: 0,
  // },
  total: {
    type: Number,
    default: 0,
  },
});

const current = ref(0);
// const nameWithCount = computed(() => props.name + ': ' + current.value + '/' + props.total);
</script>

<style scoped>
/* Chrome, Safari, Edge, Opera */
.number-input::-webkit-outer-spin-button,
.number-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
.number-input[type=number] {
  -moz-appearance: textfield;
}

.number-input {
  background: transparent;
  field-sizing: content;
  min-width: 8px;
}

.item-container {
  display: flex;
  align-items: center;
}
</style>