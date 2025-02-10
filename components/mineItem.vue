<template>
  <div class="item-container">
    <img
      class="mine-img"
      :src="'data:image/png;base64,' + props.image"
    >

    <span style="margin-left: 5px; color: black"> {{ props.name + ': ' }} </span>

    <input
      v-model="current"
      class="number-input"
      type="number"
      min="0"
      pattern="[0-9]*"
      :max="props.counter.total"
      @input="inputNumber"
    />

    <span style="color: black"> {{ '/' + props.counter.total }} </span>

    <input 
      class="mine-checkbox" 
      type="checkbox" 
      id="checkbox" 
    />
  </div>
</template>

<script setup>
const emits = defineEmits(['changeCounter']);
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
  counter: {
    type: Object,
    default: () => {},
  },
});

const current = ref(props.counter.current);
const inputNumber = (v) => {
  if (!v.data) {
    current.value = 0;
  }
  emits('changeCounter', Number(v.data));
};
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
  margin-left: 5px;
  color: black;
}

.item-container {
  display: flex;
  align-items: center;
  background-color: #f0f8ffd1;
  border-radius: 10px;
  margin-top: 2px;
  margin-bottom: 2px;
}

.mine-img {
  margin: 5px;
  border-radius: 5px;
  height: 64px;
  image-rendering: pixelated;
}

.mine-checkbox {
  margin-left: 5px;
  margin-right: 5px;
  width: 20px;
  height: 20px;

}
</style>