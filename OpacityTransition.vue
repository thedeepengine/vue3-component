<template>
  <Transition
    name="slide-up"
    mode="out-in">
    <slot></slot>
  </Transition>
</template>

<script>
</script>

<style>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  
}

.slide-up-leave-to {
  opacity: 0;
}
</style>