<!--***-->
<template>
  <div class="event-list">
    <h1>
      Verfügbare Automatisierungen
      <span class="add-button" title="Automatisierung hinzufügen" @click="selectedAutomation = emptyAutomation">&#43;</span>
    </h1>
    <div class="table-wrapper">
      <table>
        <thead>
        <tr><th>Id</th><th>Status</th><th>Name</th><th>Start</th><th>Ende</th><th>Actions</th></tr>
        </thead>
        <tbody>
        <tr v-if="automations && !automations.length">
          <td colspan="6" class="text-center text-bold empty-indicator">
            Keine Automatisierungen gefunden
          </td>
        </tr>
        <tr v-if="!automations">
          <td colspan="6" class="text-center text-bold empty-indicator">
            Lade...
          </td>
        </tr>
        <tr v-for="automation in automations" :key="automation.id"
            v-bind:class="{ inactive: ![undefined, true].includes(automation.active)}"
            @click="selectedAutomation = automation">
          <td>{{ automation.id }}</td>
          <td :class="[undefined, true].includes(automation.active) ? 'text-success' : 'text-danger'">
            {{ [undefined, true].includes(automation.active) ? "Aktiv" : "Inaktiv" }}
          </td>
          <td>{{ automation.name }}</td>
          <td :class="automation.startDate && (new Date()).getTime() < (new Date(automation.startDate)).getTime() ? 'text-bold' : ''">
            {{ automation.startDate ? (new Date(automation.startDate)).toLocaleDateString("de-DE") : "-" }}
          </td>
          <td :class="automation.endDate && (new Date()).getTime() > (new Date(automation.endDate)).getTime() ? 'text-danger' : ''">
            {{ automation.endDate ? (new Date(automation.endDate)).toLocaleDateString("de-DE") : "-" }}
          </td>
          <td :class="!automation.actions.length ? 'text-danger' : ''">{{ automation.actions.length }}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <AutomationModal v-if="selectedAutomation"
                @closed="selectedAutomation = undefined;"
                @cancel="getAutomations()"
                :selectedAutomation="selectedAutomation">
    </AutomationModal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AutomationModal from "@/views/Automations/components/AutomationModal.vue";
import { getAutomations } from "@/api";
import { Automation } from "@/views/Automations/models";

export default defineComponent({
  name: "AutomationList",
  components: { AutomationModal },
  props: {
    automations: Array
  },
  methods: {
    getAutomations() {
      getAutomations();
    }
  },
  data() {
    return {
      selectedAutomation: undefined,
      get emptyAutomation(): Automation {
        return { name: "", startDate: undefined, endDate: undefined, active: true, actions: [] };
      }
    };
  }
});
</script>

<style scoped lang="scss">

.add-button {
  padding: 0 5px 5px 5px;
  user-select: none;
  position: absolute;
  cursor: pointer;
  font-size: 30px;
  font-weight: bolder;
  color: green;
  top: 15px;
  right: 20px;
}

.table-wrapper {
  overflow-x: auto;

  table {
    margin-top: 30px;
    width: 100%;
    border-collapse: collapse;
    overflow-x: scroll;

    thead {
      font-weight: bold;

      th {
        border-bottom: 1px solid #afafaf;
      }
    }

    td, th {
      min-width: 50px;
      white-space: nowrap;

      &:first-of-type {
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 220px;

        @media (max-width: 700px) {
          max-width: 100px;
        }
      }

      user-select: none;
      text-align: left;
      padding: 10px;
      transition: all 0.1s;

      &:not(:first-of-type) {
        text-align: right;
      }

      &.empty-indicator {
        padding-top: 2rem;
        padding-bottom: 1rem;
      }
    }

    tbody {
      cursor: pointer;

      tr {
        &.inactive {
          opacity: 0.5;
        }

        &:hover td {
          background-color: rgba(0, 0, 0, 0.05);
        }

        &:not(:last-of-type) td {
          border-bottom: 1px solid #e3e3e3;
        }
      }
    }
  }
}
</style>
