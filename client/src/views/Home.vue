<!--Edited by: *** ***, *** ***, *** ***-->
<template>
  <div class="content">
    <div class="groupwrapper">
      <template v-if="pinnedDevices?.length">
        <span class="groupTitle">
          Pinned Devices
        </span>
        <div class="groups pinned-devices">
          <Devicecard
            v-for="device in pinnedDevices"
            :key="device.id"
            :device="device"
            :hide-pin="true"
          />
        </div>
        <hr>
      </template>

      <span class="groupTitle">
        Rooms
      </span>
      <div class="groups">
        <router-link
          v-for="room in rooms"
          :key="room.id"
          :to="'/group/' + room.id"
          class="groupcard">
          <Groupcard :group="room" :edit="editing" @[stopPropa].stop.prevent />
        </router-link>
      </div>
      <span class="groupTitle">
        Device Groups
      </span>
      <div class="groups">
        <router-link
          v-for="deviceGroup in deviceGroups"
          :key="deviceGroup.id"
          :to="'/group/' + deviceGroup.id"
          class="groupcard"
        >
          <Groupcard :group="deviceGroup" :edit="editing" @[stopPropa].stop.prevent />
        </router-link>
      </div>
    </div>
    <div class="btns">
      <AddBtn type="Group" @clicked="editing = false"></AddBtn>
      <i v-if="!editing" class="material-icons-outlined icon" @click="editing = !editing">edit</i>
      <i v-if="editing" class="material-icons-outlined icon" @click="editing = !editing">done</i>
    </div>
    <router-link :to="'/automations'" class="feature-button automations">
      <i class="material-icons icon">timer</i>
    </router-link>
    <router-link :to="'/log'" class="feature-button log">
      <i class="material-icons icon">feedback</i>
    </router-link>
    <router-link :to="'/stats'" class="feature-button stats">
      <i class="material-icons icon">bar_chart</i>
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Groupcard from "../components/Groupcard.vue";
import AddBtn from "../components/CRUD/AddBtn.vue";
import { getAllDevices, getGroups, getLogList, getUsers } from "../api";
import Devicecard from "@/components/Devicecard.vue";

export default defineComponent({
  name: "Home",
  components: { AddBtn, Devicecard, Groupcard },
  data: function() {
    return {
      switchChecked: true,
      editing: false
    };
  },
  computed: {
    groups() {
      return this.$store.getters.getGroups;
    },
    rooms() {
      return this.$store.getters.getGroups?.filter(
        (group: any) => group.type === "room" && !this.$store.getters.getCurrentUser.groupRestrictions.includes(group.id)
      );
    },
    pinnedDevices() {
      return this.$store.state.allDevices?.filter((d: any) => d.groups.includes("pinned") && !this.$store.getters.getCurrentUser.deviceRestrictions.includes(d.id));
    },
    deviceGroups() {
      return this.$store.getters.getGroups?.filter(
        (group: any) => group.type === "deviceGroup"
      );
    },
    stopPropa(): string {
      return this.editing ? "click" : "null";
    }
  },
  mounted() {
    getGroups();
    if (this.$store.getters.getUsers.length === 0) {
      getUsers();
    }
    getLogList();
    getAllDevices();
  }
});
</script>

<style scoped lang="scss">
$color-main-elements: #CA5310;

.content {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 100px;
  padding-bottom: 100px;

  .groupwrapper {
    position: relative;

    .groupTitle {
      width: 59vw;
      font-size: 30px;
      text-align: left;
      padding: 20px 0 5px 0;
      position: absolute;
      left: 5px;
      font-weight: bold;
      color: #5f5f5f;
    }

    .groups {
      display: flex;
      flex-wrap: wrap;
      max-width: 60vw;
      margin-top: 60px;

      .groupcard {
        text-decoration: none;
      }
    }

    hr {
      margin-top: 30px;
    }

    .pinned-devices > * {
      margin: 0 20px 20px 0;
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
    width: 125px;
    cursor: pointer;
    color: $color-main-elements;
    margin-right: 10px;

    @media screen and (max-height: 576px), (max-width: 576px) {
      width: 100px;
    }

    .icon {
      font-size: 40px;
    }
  }

  .feature-button {
    position: fixed;
    background: $color-main-elements;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.5);
    height: 50px;
    width: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    left: 20px;

    .icon {
      font-size: 33px;
      padding: 10px 10px 6px;
      color: white;
    }
  }

  .automations {
    bottom: 20px;
  }

  .log {
    bottom: 85px;
  }

  .stats {
    bottom: 153px;
  }
}

@media(max-width: 1200px) {
  .groups {
    max-width: 100% !important;
    margin-left: auto;
    margin-right: auto;
    justify-content: center;
  }
}

</style>
