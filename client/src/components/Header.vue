<template>
  <div class="header">
    <div class="back-button">
      <router-link to="/">
        <span class="material-icons" id="back" @click="$emit('backClick')">arrow_left</span>
      </router-link>
    </div>
    <div class="header-text">{{ title }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Header",
  created() {
  },
  props: {
    title: String
  },
  data() {
    return {};
  }
});
</script>

<style scoped lang="scss">

.header {
  text-align: center;
  background: #4d4d4d;
  width: 100vw;
  height: 100%;
  grid-area: header;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;


  .back-button {
    float: left;
    color: white;
    height: 100%;
    width: 75px;
    display: flex;
    position: absolute;
    left: 0;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    #back {
      font-size: 60px;
      color: white;

      @media(max-height: 576px), (max-width: 576px) {
        font-size: 50px;
      }
    }
  }

  .header-text {
    color: white;
    font-size: 40px;

    @media(max-height: 576px), (max-width: 576px) {
      font-size: 30px;
    }
  }

}
</style>
