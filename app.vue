<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
    {{ data.value }}
  </div>
</template>

<script setup>
const { data } = await useFetch('/api/read')
console.log(data.value.value)
</script>
