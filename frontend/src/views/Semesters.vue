<script setup>
import { onMounted, ref } from "vue";
import SemesterServices from "../services/semesterServices.js";
import Utils from "../config/utils.js";

const user = Utils.getStore("user");
const isAdmin = user?.role === "admin";

const semesters = ref([]);
const error = ref("");
const loading = ref(false);
const loaded = ref(false);

const showForm = ref(false);
const saving = ref(false);
const editing = ref(false);
const editingId = ref(null);

const semsterName = ref("");
const startDate = ref("");
const endDate = ref("");

async function loadSemesters() {
  error.value = "";
  loading.value = true;

  try {
    const response = await SemesterServices.listSemesters();
    semesters.value = response.data;
    loaded.value = true;
  } catch (reason) {
    loaded.value = false;
    error.value =
      reason.response?.data?.message ||
      "Semesters could not be loaded.";
  } finally {
    loading.value = false;
  }
}

function openAddForm() {
  error.value = "";
  editing.value = false;
  editingId.value = null;

  semsterName.value = "";
  startDate.value = "";
  endDate.value = "";

  showForm.value = true;
}

function openEditForm(semester) {
  error.value = "";
  semsterName.value = semester.semsterName;
  startDate.value = semester.startDate;
  endDate.value = semester.endDate;
  editing.value = true;
  editingId.value = semester.id;
  showForm.value = true;
}

function requiredMessage() {
  if (!semsterName.value.trim()) return "Semester name is required.";
  if (!String(startDate.value).trim()) return "Start date is required.";
  if (!String(endDate.value).trim()) return "End date is required.";
  return "";
}

async function saveSemester() {
  error.value = "";
  const message = requiredMessage();
  if (message) {
    error.value = message;
    return;
  }

  const data = {
    semsterName: semsterName.value,
    startDate: startDate.value,
    endDate: endDate.value,
  };

  saving.value = true;
  try {
    if (editing.value) {
      await SemesterServices.updateSemester(
        editingId.value,
        data
      );
    } else {
      await SemesterServices.createSemester(data);
    }

    showForm.value = false;

    await loadSemesters();
  } catch (reason) {
    error.value =
      reason.response?.data?.message ||
      "Semester could not be saved.";
  } finally {
    saving.value = false;
  }
}

async function deleteSemester(semester) {
  error.value = "";

  try {
    await SemesterServices.deleteSemester(
      semester.id
    );

    await loadSemesters();
  } catch (reason) {
    error.value =
      reason.response?.data?.message ||
      "Semester could not be deleted.";
  }
}

function cancelForm() {
  showForm.value = false;
  editing.value = false;
  editingId.value = null;
}

onMounted(async () => {
  await loadSemesters();
});
</script>

<template>
  <v-container
    class="py-10"
    style="max-width: 900px"
  >
    <v-card elevation="4" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4">
          Semesters
        </h1>

        <v-btn
          v-if="isAdmin"
          data-testid="create-semester"
          color="primary"
          class="oc-cta"
          @click="openAddForm"
        >
          Add semester
        </v-btn>
      </div>

      <v-alert
        v-if="error && !showForm"
        type="error"
        class="mb-4"
      >
        {{ error }}
      </v-alert>

      <v-dialog
        v-model="showForm"
        max-width="520"
      >
        <v-card
          rounded="lg"
          class="pa-6"
        >
          <h2 class="text-h6 mb-4">
            {{ editing ? "Edit semester" : "Add semester" }}
          </h2>

          <v-alert
            v-if="error"
            type="error"
            density="compact"
            class="mb-4"
          >
            {{ error }}
          </v-alert>

          <v-text-field
            v-model="semsterName"
            label="Semester name"
            density="comfortable"
            rounded="lg"
            data-testid="semsterName"
          />

          <v-text-field
            v-model="startDate"
            label="Start date"
            type="date"
            density="comfortable"
            rounded="lg"
            data-testid="startDate"
          />

          <v-text-field
            v-model="endDate"
            label="End date"
            type="date"
            density="comfortable"
            rounded="lg"
            data-testid="endDate"
          />

          <div class="d-flex ga-2">
            <v-btn
              data-testid="save-semester"
              color="primary"
              variant="elevated"
              class="oc-cta"
              :loading="saving"
              @click="saveSemester"
            >
              Save
            </v-btn>

            <v-btn
              variant="text"
              @click="cancelForm"
            >
              Cancel
            </v-btn>
          </div>
        </v-card>
      </v-dialog>

      <div v-if="loading" class="text-secondary">
        Loading semesters...
      </div>

      <div
        v-else-if="loaded && semesters.length === 0"
        class="text-secondary"
      >
        No semesters found.
      </div>

      <div v-else-if="loaded">
        <v-card
          v-for="semester in semesters"
          :key="semester.id"
          variant="outlined"
          class="pa-4 mb-3"
        >
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h6 text-primary">
                {{ semester.semsterName }}
              </div>

              <div class="text-secondary">
                {{ semester.startDate }}
                -
                {{ semester.endDate }}
              </div>
            </div>

            <div
              v-if="isAdmin"
              class="d-flex ga-2"
            >
              <v-btn
                data-testid="edit-semester"
                variant="text"
                color="primary"
                @click="openEditForm(semester)"
              >
                Edit
              </v-btn>

              <v-btn
                data-testid="delete-semester"
                variant="text"
                color="primary"
                @click="deleteSemester(semester)"
              >
                Delete
              </v-btn>
            </div>
          </div>
        </v-card>
      </div>
    </v-card>
  </v-container>
</template>
