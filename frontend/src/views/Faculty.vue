<script setup>
import { onMounted, reactive, ref } from "vue";
import FacultyServices from "../services/facultyServices.js";

const fields = [
  { key: "firstName", label: "First name", message: "First name is required." },
  { key: "lastName", label: "Last name", message: "Last name is required." },
  { key: "dept", label: "Department", message: "Department is required." },
];

const faculty = ref([]);
const loading = ref(false);
const error = ref("");

const showForm = ref(false);
const editingId = ref(null);
const saving = ref(false);
const formError = ref("");
const form = reactive({ firstName: "", lastName: "", dept: "" });
const fieldErrors = reactive({ firstName: "", lastName: "", dept: "" });

function apiMessage(reason) {
  return reason.response?.data?.message || "Request failed.";
}

function resetFieldErrors() {
  for (const { key } of fields) fieldErrors[key] = "";
}

async function loadFaculty() {
  error.value = "";
  loading.value = true;
  try {
    const response = await FacultyServices.listFaculty();
    faculty.value = response.data;
  } catch (reason) {
    error.value = apiMessage(reason);
  } finally {
    loading.value = false;
  }
}

function openForm(member = null) {
  editingId.value = member ? member.id : null;
  for (const { key } of fields) form[key] = member ? member[key] : "";
  resetFieldErrors();
  formError.value = "";
  showForm.value = true;
}

function validate() {
  let valid = true;
  for (const { key, message } of fields) {
    fieldErrors[key] = form[key].trim() ? "" : message;
    if (fieldErrors[key]) valid = false;
  }
  return valid;
}

async function save() {
  formError.value = "";
  if (!validate()) return;

  const data = { firstName: form.firstName, lastName: form.lastName, dept: form.dept };
  saving.value = true;
  try {
    if (editingId.value === null) {
      await FacultyServices.createFaculty(data);
    } else {
      await FacultyServices.updateFaculty(editingId.value, data);
    }
    showForm.value = false;
    await loadFaculty();
  } catch (reason) {
    formError.value = apiMessage(reason);
  } finally {
    saving.value = false;
  }
}

async function remove(member) {
  error.value = "";
  try {
    await FacultyServices.deleteFaculty(member.id);
    await loadFaculty();
  } catch (reason) {
    error.value = apiMessage(reason);
  }
}

onMounted(loadFaculty);
</script>

<template>
  <v-container class="py-10" style="max-width: 900px">
    <v-card rounded="lg" elevation="4" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4">Faculty</h1>
        <v-btn data-testid="add-faculty" color="primary" variant="elevated" class="oc-cta" @click="openForm()">
          Add Faculty
        </v-btn>
      </div>

      <v-alert v-if="error" type="error" density="compact" class="mb-4">{{ error }}</v-alert>

      <div v-if="loading" class="d-flex align-center ga-2" data-testid="faculty-loading">
        <v-progress-circular indeterminate color="primary" size="24" />
        Loading faculty members...
      </div>

      <div v-else-if="faculty.length === 0 && !error">No faculty members yet.</div>

      <v-table v-else-if="faculty.length > 0">
        <thead>
          <tr>
            <th>First name</th>
            <th>Last name</th>
            <th>Department</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in faculty" :key="member.id" data-testid="faculty-row">
            <td>{{ member.firstName }}</td>
            <td>{{ member.lastName }}</td>
            <td>{{ member.dept }}</td>
            <td class="text-right">
              <v-btn data-testid="edit-faculty" variant="text" @click="openForm(member)">Edit</v-btn>
              <v-btn data-testid="delete-faculty" variant="text" @click="remove(member)">Delete</v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="showForm" max-width="520">
      <v-card rounded="lg" class="pa-6">
        <h2 class="text-h6 mb-4">{{ editingId === null ? "Add Faculty" : "Edit Faculty" }}</h2>

        <v-alert v-if="formError" type="error" density="compact" class="mb-4">{{ formError }}</v-alert>

        <v-text-field
          v-for="field in fields"
          :key="field.key"
          v-model="form[field.key]"
          :label="field.label"
          :error-messages="fieldErrors[field.key]"
          density="comfortable"
          rounded="lg"
          :data-testid="field.key"
          @update:model-value="fieldErrors[field.key] = ''"
        />

        <div class="d-flex ga-2">
          <v-btn data-testid="save-faculty" color="primary" variant="elevated" class="oc-cta" :loading="saving" @click="save">
            Save
          </v-btn>
          <v-btn data-testid="cancel-faculty" color="secondary" variant="text" @click="showForm = false">Cancel</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>
