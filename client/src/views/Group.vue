<!--Edited by: *** ***, *** ***, *** ***-->
<template>
  <Header :title="groupname" @backClick="clearCurrentRoom()"></Header>
  <div class="btns">
    <AddBtn type="device" @clicked="editing = false"></AddBtn>
    <i v-if="!editing" class="material-icons-outlined icon" @click="editing = !editing">edit</i>
    <i v-if="editing" class="material-icons-outlined icon" @click="editing = !editing">done</i>
  </div>

  <div class="content-container">
    <div class="grid-wrapper" v-if="rennderDevices">
      <Devicecard
        v-for="device in currentDevices"
        :key="device.id"
        :device="device"
        :edit="editing"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import Devicecard from "@/components/Devicecard.vue";
import { getGroupDevices, getGroups, getUsers } from "@/api";
import Header from "@/components/Header";
import AddBtn from "@/components/CRUD/AddBtn";

export default defineComponent({
  name: "Group",
  components: { AddBtn, Header, Devicecard },
  props: {},
  data: function() {
    return {
      editing: false,
      rennderDevices: false,
    };
  },
  methods: {
    clearCurrentRoom() {
      this.$store.commit("setCurrentDevices", { "devices": [] });
    },
    setCurrentGroup() {
      this.$store.commit("setCurrentGroup", this.group);
    },
  },
  computed: {
    group() {
      let groups = this.$store.getters.getGroups;
      return groups.find((group) => group.id === this.$route.params.id);
    },
    groupname() {
      if (this.group === undefined) {
        return "";
      } else {
        return this.group.name ?? "";
      }
    },
    currentDevices() {
      return this.$store.getters.getCurrentDevices.filter(
        (device) => !this.$store.getters.getCurrentUser.deviceRestrictions.includes(device.id),
      );
    },
  },
  created() {
    if (this.$store.getters.getUsers.length === 0) getUsers();
    if (this.$store.getters.getGroups.length === 0) {
      getGroups();
      setTimeout(() => {
        getGroupDevices(this.$route.params.id);
        this.setCurrentGroup();
        this.rennderDevices = true;
      }, 100);
    } else {
      getGroupDevices(this.$route.params.id);
    }
  },
  mounted() {
    try {
      this.setCurrentGroup();
      this.rennderDevices = true;
    } catch (e) {
      console.log("Will fail if called on reload, 'created' is used in that case.");
    }
  },
});
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  height: 85px;

  @media screen and (max-height: 576px), (max-width: 576px) {
    height: 65px;
  }
}

.btns {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 85px;
  width: 100px;
  cursor: pointer;
  color: #CA5310;
  margin-right: 10px;

  @media screen and (max-height: 576px), (max-width: 576px) {
    height: 65px;
    width: 85px;
  }

  .icon {
    font-size: 40px;

    @media screen and (max-height: 576px), (max-width: 576px) {
      font-size: 35px;
    }
  }
}

.content-container {
  width: 100%;
  height: calc(100% - 85px);
  overflow-y: auto;
  padding: 30px 30px 130px 30px;

  @media screen and (max-height: 576px), (max-width: 576px) {
    height: calc(100% - 65px);
  }

  .grid-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, 290px);
    grid-gap: 15px;
    grid-auto-flow: row dense;
    justify-content: space-evenly;
  }
}

</style>
