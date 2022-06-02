<!-- Edited by: *** ***, *** *** -->
<template>
  <div :class="[currentRouteName ? 'notify-main' : 'notify-rest' ]" class="notify">
    <Notif
      v-for="msg of msgs"
      :key="msg.setMethod"
      :msg="msg.msg"
      :success="!(msg.code !== 200)"
      @click="clearMsg(msg)"
    />
  </div>
</template>

<script>
import Notif from "./Notif.vue";

export default {
  name: "Sidebar",
  components: { Notif },
  props: {
    msgs: Array,
  },
  methods: {
    clearMsg(msg) {
      this.$store.commit("clearStatusResponse", { entity: msg.clearStateData.entity, type: msg.clearStateData.type });
    },
  },
  computed: {
    currentRouteName() {
      return this.$route.name === "Home";
    },
  },
  watch: {
    msgs: function(val) {
      setTimeout(() => {
        for (const msg of val) {
          this.clearMsg(msg);
        }
      }, 5000);
    },
  },
};
</script>

<style scoped lang="scss">
.notify {
  z-index: 4;
  position: absolute;
  width: 350px;
  display: flex;
  flex-direction: column;
  padding: 20px;

  @media screen and (max-height: 576px), (max-width: 576px) {
    height: 65px;
    width: 250px;
  }
}

.notify-main {
  top: 0;
  left: 0;
}

.notify-rest {
  bottom: 0;
  left: 0;

  @media screen and (max-height: 576px), (max-width: 576px) {
    left: 0;
    top: 65px;
  }
}
</style>
