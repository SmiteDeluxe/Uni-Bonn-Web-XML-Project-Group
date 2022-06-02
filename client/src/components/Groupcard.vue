<!--Edited by: *** ***, *** ***, *** ***-->
<template>
  <div class="room_box" :class="{ 'room_box_editing': edit }">
    <div class="room_box_container">
      <div class="room_box_content">
        <i alt="Group Icon"
           class="material-icons-outlined icon"
           :class="{ 'icon_editing': edit }"
           @click="changeIcon">{{ this.icon }}</i>
        <input type="text" class="room_name"
               :class="[ edit ? 'room_name_editing' : 'room_name_normal' ]"
               :title="name"
               v-model.lazy="name"
               :readonly="!edit"
               @focus="edited = true"
        />
        <div class="removeBtn" v-if="edit" @click="removeGroup">
          <img src="/assets/minus.svg" alt="Remove Group" />
        </div>
        <div class="iconSelWrapper" v-if="iconSelVis && edit">
          <iconSelection width="300px" height="300px" @newIcon="setNewIcon" />
          <img src="/assets/close.svg"
               alt="close"
               class="close_btn filter"
               @click.self="iconSelVis = false" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import iconSelection from "./CRUD/iconSelection.vue";
import { updateGroup, deleteGroup } from "../api";

export default defineComponent({
  name: "Groupcard",
  components: { iconSelection },
  props: {
    group: Object,
    edit: Boolean,
  },
  data: function() {
    return {
      name: String,
      icon: String,
      iconSelVis: false,
      edited: false,
    };
  },
  methods: {
    // getImgPath() {
    //   let image = "";
    //   try {
    //     image = require('../assets/icons/'+this.icon+'.svg');
    //   } catch (error) {
    //     image = require('../assets/icons/home.svg');
    //   }
    //   return image;
    // },
    setNewIcon(icon) {
      this.icon = icon;
      this.iconSelVis = false;
      this.edited = true;
    },
    postChange() {
      this.edited = false;
      updateGroup(this.group.id, this.name, this.group.type, this.icon);
    },
    removeGroup() {
      deleteGroup(this.group.id);
    },
    changeIcon() {
      if (this.edit) {
        this.iconSelVis = true;
      }
    },
  },
  watch: {
    edit: function(val) {
      this.iconSelVis = false;
      if (!val && this.edited) {
        this.postChange();
      }
    },
  },
  created() {
    this.name = this.group.name;
    if (this.group.icon) {
      this.icon = this.group.icon;
    } else {
      this.icon = "home";
    }
  },
});
</script>

<style scoped lang="scss">
.room_box {
  width: 300px;
  height: 300px;
  background: #36363a;
  margin: 5px;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  text-align: left;
  overflow: hidden;
  position: relative;

  &:hover {
    box-shadow: inset 0 0 10px #000000;
  }

  .room_box_container {
    display: flex;
    align-items: flex-end;
    width: 100%;
    height: 100%;
    position: relative;

    .room_box_content {
      display: flex;
      flex-direction: column;
      font-size: 28px;
      color: white;
      width: 100%;

      .icon {
        width: 70px;
        font-size: 60px;
        color: white;
      }

      .icon_editing {
        border: 2px solid rgb(255, 255, 255);
        margin-bottom: 5px;
        cursor: pointer;
      }

      .room_name {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        width: 200px;
        font-size: 24px;
        font-weight: 600;

        &:focus {
          outline: none;
        }
      }

      .room_name_editing {
        padding-left: 5px;
      }

      .room_name_normal {
        cursor: pointer;
        background: none;
        border: none;
        color: white;
        margin-top: 4px;
      }

      .removeBtn {
        position: absolute;
        top: 0;
        right: 0;
        width: 30px;
        filter: invert(100%) sepia(3%) saturate(13%) hue-rotate(81deg) brightness(106%) contrast(106%);
        cursor: pointer;
      }

      .iconSelWrapper {
        position: absolute;
        top: -20px;
        left: -20px;

        .close_btn {
          width: 30px;
          height: 30px;
          top: 10px;
          right: 10px;
          position: absolute;
          cursor: pointer;
          z-index: 3;
        }

        .filter {
          filter: invert(16%) sepia(5%) saturate(711%) hue-rotate(201deg) brightness(93%) contrast(83%);
        }
      }
    }
  }
}

.room_box_editing {
  cursor: default;

  &:hover {
    box-shadow: none;
  }
}
</style>
