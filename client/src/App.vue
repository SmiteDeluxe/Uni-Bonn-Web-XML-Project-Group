<!--Edited by: *** ***, *** ***-->
<template>
  <div class="all_cont" v-if="clientID !== ''">
    <router-view />
    <UsersSelect v-if="currentUser.id!==''" class="userSel" />
    <Sidebar :msgs="Messages" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { client } from "./config";
import { InitConnection } from "./api";
import UsersSelect from "./components/UserSelect.vue";
import Sidebar from "./components/Notifs/Sidebar.vue";

export default defineComponent({
  name: "App",
  components: { UsersSelect, Sidebar },
  data: function() {
    return {};
  },
  methods: {},
  computed: {
    currentUser() {
      return this.$store.getters.getCurrentUser;
    },
    clientID() {
      return this.$store.getters.getClientID;
    },
    Messages() {
      return this.$store.getters.getAllStatus;
    }
  },
  mounted() {
    client.on("connect", () => client.subscribe("#"));
    client.on("error", (error) => console.error(error));

    InitConnection();
  },
  unmounted(): void {
    client.end();
  }
});
</script>

<style lang="scss">
.all_cont {
  height: 100vh;
  width: 100vw;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
}

.userSel {
  position: fixed;
  right: 30px;
  bottom: 25px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.5);
}
</style>
