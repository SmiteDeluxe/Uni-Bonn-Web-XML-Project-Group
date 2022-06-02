<!--Edited by: *** ***-->
<template>
  <div class="wrapperSelection" :style="{ 'width': width+' !important', 'height': height+' !important' }">
    <span class="title">{{ title }}</span>
    <div class="selection">
        <span v-for="option in options" :key="option.id">
          <input type="checkbox" @change="change" :id="option.id" class="opt" v-model="option.checked" />
          <label :for="option.id">{{ option.name }}</label>
        </span>
    </div>
    <img src="/assets/close.svg"
         alt="close"
         class="close_btn filter"
         @click="$emit('close')" />
  </div>
</template>

<script>
export default {
  name: "Selection",
  props: {
    title: String,
    options: Array,
    width: String,
    height: String,
  },
  data: function() {
    return {};
  },
  computed: {},
  methods: {
    change() {
      let currentSel = [];
      for (const obj of this.options) {
        if (obj.checked) currentSel.push({ id: obj.id, name: obj.name });
      }
      this.$emit("change", currentSel);
    },
  },
  mounted() {
  },
};
</script>

<style scoped lang="scss">
.wrapperSelection {
  position: relative;
  width: 308px;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: white;
  padding: 5px 5px 5px 5px;
  border-radius: 5px;
  margin-top: 30px;

  .title {
    color: rgb(0, 0, 0);
    margin-top: 10px;
  }

  .selection {
    display: flex;
    flex-wrap: wrap;
    z-index: 3;
    background-color: white;
    justify-content: space-evenly;
    padding: 5% 5px 5px 5px;
    flex-direction: column;
    height: 80%;
    overflow-y: auto;

    .opt, label {
      margin-right: 10px;
      cursor: pointer;
    }
  }

  .close_btn {
    width: 30px;
    height: 30px;
    top: 10px;
    right: 20px;
    position: absolute;
    cursor: pointer;
    z-index: 3;
  }

  .filter {
    filter: invert(16%) sepia(5%) saturate(711%) hue-rotate(201deg) brightness(93%) contrast(83%);
  }
}
</style>
