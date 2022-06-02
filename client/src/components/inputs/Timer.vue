<!--Edited by: *** ***-->
<template>
  <div class="timer-container">
    <svg class="gauge-container-background" height="120" width="120">
      <circle
        class="gauge-circle"
        stroke-width="8"
        stroke="#616161"
        fill="transparent"
        :r="normalizedRadius"
        :cx="radius"
        :cy="radius" />
    </svg>
    <svg class="gauge-container" height="120" width="120">
      <circle
        class="gauge-circle"
        stroke-width="8"
        stroke="#D6900A"
        fill="transparent"
        :stroke-dasharray="circumference + ' ' + circumference"
        :style="{ strokeDashoffset: strokeDashoffset }"
        :r="normalizedRadius"
        :cx="radius"
        :cy="radius" />
    </svg>
    <i class="material-icons timer-icon">timer</i>
    <div class="timer-text">01:02:00</div>
  </div>
</template>

<script>
export default {
  name: "Timer",
  props: {
    progress: Number,
  },
  data: function() {
    const radius = 60;
    const normalizedRadius = radius - 8;
    const circumference = normalizedRadius * 2 * Math.PI;
    console.log(circumference);

    return {
      normalizedRadius,
      circumference,
      radius,
    };
  },
  computed: {
    strokeDashoffset() {
      return this.circumference - this.progress / 100 * this.circumference;
    },
  },
};
</script>

<style scoped lang="scss">
.timer-container {
  position: absolute;
  top: 0;
  right: 0;
  height: 120px;
  width: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .gauge-container {
    position: absolute;
    top: 0;
    right: 0;

    circle {
      transition: stroke-dashoffset 0.35s;
      transform: rotate(-90deg);
      transform-origin: 50% 50%;
    }
  }

  .gauge-container-background {
    position: absolute;
    top: 0;
    right: 0;
  }

  .timer-icon {
    color: #D6900A;
    font-size: 32px;
    padding-bottom: 5px;
  }

  .timer-text {
    font-size: 18px;
  }
}
</style>
