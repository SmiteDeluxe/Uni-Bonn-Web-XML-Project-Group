<!--Edited by: *** ***-->
<template>
  <div class="overlay" @click.self="$emit('minimize')">
    <div class="modal" @click.self="icons_vis = false">
      <i class="material-icons-outlined close_btn" @click.self="$emit('minimize')">close</i>
      <AddGroup v-if="type === 'Group'" @submitted="$emit('minimize')" />
      <AddDevice v-if="type === 'device'" @submitted="$emit('minimize')" />
    </div>
  </div>
</template>

<script>
import AddGroup from "./AddGroup.vue";
import AddDevice from "./AddDevice.vue";

export default {
  name: "AddWindow",
  components: { AddGroup, AddDevice },
  props: {
    type: String,
  },
  data: function() {
    return {};
  },
  methods: {},
};
</script>

<style scoped lang="scss">
.overlay {
  top: 0;
  left: 0;
  position: fixed;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(5px);
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  .modal {
    background-color: #424246;
    position: relative;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 75px;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.5);
    min-width: 400px;
    min-height: 350px;
    cursor: default;

    @media screen and (max-height: 576px), (max-width: 576px) {
      width: 350px;
    }

    .close_btn {
      top: 10px;
      right: 10px;
      position: absolute;
      cursor: pointer;
      z-index: 2;
      font-size: 30px;
    }
  }
}
</style>
