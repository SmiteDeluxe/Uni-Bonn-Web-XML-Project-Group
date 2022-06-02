<!--Edited by: *** ***-->
<template>
  <div class="wrapperIconWindow" :style="{ 'width': width+'!important', 'height': height+'!important' }">
    <span class="title">Icon</span>
    <div class="iconWrapper">
      <div v-for="icon in icons" :key="icon" @click="$emit('newIcon', icon)">
        <i :alt="icon" class="material-icons-outlined icon">{{ icon }}</i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "iconSelection",
  props: {
    width: String,
    height: String,
  },
  data: function() {
    return {
      icons: ["balcony", "bed", "chair", "fireplace",
        "grass", "home", "kitchen", "light", "lightbulb", "monitor",
        "shower", "timer", "water", "window", "thermostat", "speed",
        "blender", "coffee", "iron", "kitchen", "room", "wc", "checkroom",
        "attachment", "bluetooth", "boy", "girl", "call", "camera", "cloud", "crib"],
    };
  },
  methods: {},
};
</script>

<style scoped lang="scss">
.wrapperIconWindow {
  width: 308px;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: white;
  padding: 5px 5px 5px 5px;
  border-radius: 5px;
  overflow-y: auto;

  .title {
    color: rgb(0, 0, 0);
    margin-top: 10px;
  }

  .iconWrapper {
    display: flex;
    flex-wrap: wrap;
    z-index: 3;
    background-color: white;
    justify-content: flex-start;
    padding: 25px 5px 5px 5px;
  }

  .icon {
    height: 40px;
    margin: 4px 4px 4px 4px;
    cursor: pointer;
    user-select: none;
    font-size: 46px;
    color: rgb(0, 0, 0);

    &:hover {
      box-shadow: 1px 1px 10px rgba(173, 173, 173, 0.26);
    }
  }
}
</style>
