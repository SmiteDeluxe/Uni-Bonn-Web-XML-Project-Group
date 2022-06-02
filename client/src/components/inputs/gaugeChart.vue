<!--Edited by: *** ***-->
<template>
  <div class="gauge">
    <div class="gauge-body">
      <div class="gauge-fill" :style="{ transform: 'rotate(' + progress + 'deg)' }"></div>
      <div class="gauge-cover">{{ currentValue }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "gaugeChart",
  props: {
    currentValue: Number,
    min: Number,
    max: Number,
  },
  data: function() {
    return {
      progress: 0,
    };
  },
  watch: {
    currentValue: {
      handler: function() {
        this.getCurrentValue();
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    getCurrentValue() {
      const scale = (this.max - this.min) / 180;
      this.progress = this.currentValue / scale;
    },
  },
};
</script>

<style scoped lang="scss">
.gauge {
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;

  .gauge-body {
    width: 100%;
    height: 0;
    padding-bottom: 50%;
    background: #616161;
    position: relative;
    border-top-left-radius: 100% 200%;
    border-top-right-radius: 100% 200%;
    overflow: hidden;

    .gauge-fill {
      position: absolute;
      top: 100%;
      left: 0;
      width: inherit;
      height: 100%;
      background: #1abc9c;
      //background: linear-gradient(to left, #c0392b 0%, #f1c40f 50%, #1abc9c 100%);
      transform-origin: center top;
      //transform: rotate(75deg);
      transition: transform 0.2s ease-out;
    }

    .gauge-cover {
      width: 75%;
      height: 150%;
      background: #36363a;
      border-radius: 50%;
      position: absolute;
      top: 25%;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding-bottom: 25%;
      box-sizing: border-box;
    }
  }
}

</style>
