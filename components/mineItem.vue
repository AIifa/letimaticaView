<template>
  <div
    class="item-container"
    :class="{ 'disabled': checkboxValue }"
  >
    <img
      class="mine-img"
      :src="'data:image/png;base64,' + props.image"
    >

    <span 
      class="mine-name"
    > 
      {{ props.name }} 
    </span>

    <input
      ref="input"
      v-model="current"
      class="number-input"
      type="number"
      min="0"
      pattern="[0-9]*"
      :max="props.counter?.total"
      @input="inputNumber"
    >

    <span style="color: black"> {{ '/' + props.counter?.total }} </span>

    <input 
      v-model="checkboxValue"
      class="mine-checkbox"
      type="checkbox"
      @change="changeCheckbox"
    >
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
  counter: {
    type: Object,
    default: () => {},
  },
});

const input = ref(null);
const current = ref(props.counter?.current);
const inputNumber = () => {
  if (!current.value || current.value <= 0 || current.value == Number('00')) {
    current.value = 0;
    input.value.value = 0;
  } else if (current.value >= Number(props.counter?.total)) {
    current.value = Number(props.counter?.total);
  }

  emits('changeCounter', Number(current.value));
};

const checkboxValue = ref(props.counter?.current === props.counter.total);
const changeCheckbox = () => {
  current.value = checkboxValue.value ? props.counter.total : 0;

  inputNumber(current.value);
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

.mine-name {
  flex: 1 0;
  margin-left: 5px;
  color: black;
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
  margin-top: 5px;
  margin-bottom: 5px;
  width: 270px;
}

.item-container.disabled {
  background-color: #666666d4;
}

.mine-img {
  margin: 5px;
  border-radius: 5px;
  border: 1px solid #000000;
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