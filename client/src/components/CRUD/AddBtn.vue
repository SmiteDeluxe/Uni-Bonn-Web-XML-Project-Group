<!--Edited by: *** ***-->
<template>
  <i class="material-icons-outlined icon" @click="clicked">add</i>
  <AddWindow v-if="visible" @minimize="visible = false" :type="type" />
</template>

<script>
import AddWindow from "./AddWindow.vue";

export default {
  name: "AddBtn",
  components: { AddWindow },
  props: {
    type: String,
  },
  data: function() {
    return {
      visible: false,
    };
  },
  methods: {
    clicked() {
      this.visible = true;
      this.$emit("clicked");
    },
  },
};
</script>

<style scoped lang="scss">
.icon {
  font-size: 40px;

  @media screen and (max-height: 576px), (max-width: 576px) {
    font-size: 35px;
  }
}
</style>>
