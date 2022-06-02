<!-- Edited by: *** *** -->
<template>
  <div class="wrapperNotif">
    <img
      src="/assets/correct.svg"
      v-if="success"
      alt="Success"
      class="icon success_icon"
    />
    <img
      src="/assets/cross.svg"
      v-if="!success"
      alt="Success"
      class="icon fail_icon"
    />
    <p class="msg">{{ msg }}</p>
  </div>
</template>

<script>
export default {
  name: "Notif",
  props: {
    msg: String,
    success: Boolean,
  },
};
</script>

<style scoped lang="scss">
.wrapperNotif {
  position: relative;
  height: fit-content;
  //width: 300px;
  width: 100%;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.774);
  margin: 10px 0 5px 10px;
  animation-name: fade;
  animation-duration: 5s;
  padding: 10px;
  cursor: not-allowed;

  .msg {
    margin-top: 4px;
    font-weight: 500;
    font-size: 18px;
  }

  .icon {
    float: left;
    margin-right: 20px;
    width: 35px;
  }

  .success_icon {
    filter: invert(81%) sepia(16%) saturate(1268%) hue-rotate(76deg) brightness(84%) contrast(86%);
  }

  .fail_icon {
    color: #d16868;
    filter: invert(38%) sepia(6%) saturate(3820%) hue-rotate(313deg) brightness(129%) contrast(97%);
  }
}

@keyframes fade {
  0% {
    opacity: 0;
  }
  5% {
    opacity: 100;
  }
  95% {
    opacity: 100;
  }
  100% {
    opacity: 0;
  }
}
</style>
