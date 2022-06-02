<template>
  <div class="stats-bottom-content stats-bottom-content-left">
    <div class="middle-divider"></div>
    <transition name="slide-fade">
      <div :key="getCountSecondDate" class="stats-bottom-count-text-container">{{ getCountSecondDate }}</div>
    </transition>
    <div class="stats-bottom-day-text-container">Yesterday</div>
  </div>
  <div class="stats-bottom-content stats-bottom-content-right">
    <transition name="slide-fade">
      <div :key="getCountFirstDate" class="stats-bottom-count-text-container">{{ getCountFirstDate }}</div>
    </transition>
    <div class="stats-bottom-day-text-container">Today</div>
  </div>
</template>

<script>
export default {
  name: "StatsOptions",
};
</script>

<style scoped lang="scss">
.stats-bottom-content {
  height: 100%;
  width: 50%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  .slide-fade-enter-active {
    transition: all 1s ease;
  }

  .slide-fade-leave-active {
    transition: all 0.1s ease;
  }

  .slide-fade-enter-from {
    transform: translateX(50px);
    opacity: 0;
  }

  .slide-fade-leave-to {
    transform: translateX(-50px);
    opacity: 0;
  }

  .stats-bottom-day-text-container {
    position: absolute;
    bottom: 13px;
    left: 0;
    right: 0;
    font-size: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(255, 255, 255, 0.5);
  }

  .stats-bottom-count-text-container {
    font-size: 45px;
    margin-bottom: 30px;
    color: #7A3B69;
  }

}

.stats-bottom-content-left {
  border-bottom-left-radius: inherit;
  position: relative;

  .middle-divider {
    position: absolute;
    right: 0;
    top: 5%;
    height: 90%;
    border-radius: 1px;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
  }
}

.stats-bottom-content-right {
  border-bottom-right-radius: inherit;
}
</style>
