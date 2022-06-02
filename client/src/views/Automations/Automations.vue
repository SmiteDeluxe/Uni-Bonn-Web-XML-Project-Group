<!--***-->
<template>
  <Header :title="'Automatisierung'"></Header>
  <div class="content">
    <AutomationList :automations="automations"></AutomationList>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Header from "@/components/Header.vue";
import AutomationList from "@/views/Automations/components/AutomationList.vue";
import { getAutomations, getUsers } from "@/api";
import { Automation } from "@/views/Automations/models";


export default defineComponent({
  name: "Automations",
  components: { AutomationList: AutomationList, Header },
  data() {
    return {
      selectedEvent: undefined
    };
  },
  computed: {
    automations(): Automation[] {
      return this.$store.getters.getAutomations;
    }
  },
  methods: {},
  mounted() {
    getAutomations();
    if (this.$store.getters.getUsers.length === 0) getUsers();
  }
});
</script>

<style scoped lang="scss">

.content {
  padding: 0 20px;

  .event-list {
    margin-left: auto;
    margin-right: auto;
    padding: 20px;
    width: 100%;
    max-width: 70rem;
    background: #36363a;
    border-radius: 10px;
    color: white;
    position: relative;

    table {
      display: block;
      width: 100%;
      max-width: 70rem;
    }
  }
}

.header {
  height: 85px;
  margin-bottom: 30px;
  position: sticky;

  @media screen and (max-height: 576px), (max-width: 576px) {
    height: 65px;
  }
}

</style>
