<script setup>
import { onMounted, ref } from "vue";
import StudentServices from "../services/studentServices.js";
import Utils from "../config/utils.js";

const user = Utils.getStore("user");
const isAdmin = user?.role === "admin";

const students = ref([]);
const error = ref("");
const loading = ref(false);
const showForm = ref(false);
const saving = ref(false);
const editing = ref(false);
const editingId = ref(null);

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const universityId = ref("");
const userName = ref("");
const password = ref("");

function formData() {
  const data = {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    universityId: universityId.value,
    userName: userName.value,
  };
  if (!editing.value) data.password = password.value;
  return data;
}

function clearForm() {
  firstName.value = "";
  lastName.value = "";
  email.value = "";
  universityId.value = "";
  userName.value = "";
  password.value = "";
}

async function loadStudents() {
  error.value = "";
  loading.value = true;
  try {
    const response = await StudentServices.listStudents();
    students.value = response.data;
  } catch (reason) {
    error.value = reason.response?.data?.message || "Request failed.";
  } finally {
    loading.value = false;
  }
}

function openAddForm() {
  error.value = "";
  editing.value = false;
  editingId.value = null;
  clearForm();
  showForm.value = true;
}

function openEditForm(student) {
  error.value = "";
  firstName.value = student.firstName;
  lastName.value = student.lastName;
  email.value = student.email;
  universityId.value = student.universityId;
  userName.value = student.userName;
  password.value = "";
  editing.value = true;
  editingId.value = student.id;
  showForm.value = true;
}

function requiredMessage() {
  const checks = [
    [firstName.value, "First name is required."],
    [lastName.value, "Last name is required."],
    [email.value, "Email is required."],
    [universityId.value, "University ID is required."],
    [userName.value, "Username is required."],
  ];
  if (!editing.value) checks.push([password.value, "Password is required."]);
  for (const [value, message] of checks) {
    if (!String(value).trim()) return message;
  }
  return "";
}

async function saveStudent() {
  error.value = "";
  const message = requiredMessage();
  if (message) {
    error.value = message;
    return;
  }

  saving.value = true;
  try {
    if (editing.value) await StudentServices.updateStudent(editingId.value, formData());
    else await StudentServices.createStudent(formData());
    showForm.value = false;
    await loadStudents();
  } catch (reason) {
    error.value = reason.response?.data?.message || "Request failed.";
  } finally {
    saving.value = false;
  }
}

async function deleteStudent(student) {
  error.value = "";
  try {
    await StudentServices.deleteStudent(student.id);
    await loadStudents();
  } catch (reason) {
    error.value = reason.response?.data?.message || "Request failed.";
  }
}

function cancelForm() {
  showForm.value = false;
  editing.value = false;
  editingId.value = null;
}

onMounted(async () => {
  await loadStudents();
});
</script>

<template>
  <v-container class="py-10" style="max-width: 900px">
    <v-card elevation="4" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4">Students</h1>
        <v-btn
          v-if="isAdmin"
          data-testid="create-student"
          color="primary"
          class="oc-cta"
          @click="openAddForm"
        >
          Add student
        </v-btn>
      </div>

      <v-alert v-if="error && !showForm" type="error" class="mb-4">{{ error }}</v-alert>

      <v-dialog v-model="showForm" max-width="520">
        <v-card rounded="lg" class="pa-6">
          <h2 class="text-h6 mb-4">{{ editing ? "Edit student" : "Add student" }}</h2>
          <v-alert v-if="error" type="error" density="compact" class="mb-4">{{ error }}</v-alert>
          <v-text-field v-model="firstName" label="First name" data-testid="firstName" density="comfortable" rounded="lg" />
          <v-text-field v-model="lastName" label="Last name" data-testid="lastName" density="comfortable" rounded="lg" />
          <v-text-field v-model="email" label="Email" data-testid="email" density="comfortable" rounded="lg" />
          <v-text-field v-model="universityId" label="University ID" data-testid="universityId" density="comfortable" rounded="lg" />
          <v-text-field v-model="userName" label="Username" data-testid="userName" density="comfortable" rounded="lg" />
          <v-text-field
            v-if="!editing"
            v-model="password"
            label="Password"
            type="password"
            data-testid="password"
            density="comfortable"
            rounded="lg"
          />
          <div class="d-flex ga-2">
            <v-btn data-testid="save-student" color="primary" variant="elevated" class="oc-cta" :loading="saving" @click="saveStudent">Save</v-btn>
            <v-btn variant="text" @click="cancelForm">Cancel</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <div v-if="loading">Loading students...</div>
      <div v-else-if="students.length === 0">No students found.</div>
      <div v-else>
        <v-card v-for="student in students" :key="student.id" variant="outlined" class="pa-4 mb-3">
          <div>{{ student.firstName }} {{ student.lastName }}</div>
          <div>{{ student.email }}</div>
          <div>{{ student.universityId }}</div>
          <div>{{ student.userName }}</div>
          <div v-if="isAdmin" class="d-flex ga-2 mt-2">
            <v-btn data-testid="edit-student" variant="text" @click="openEditForm(student)">Edit</v-btn>
            <v-btn data-testid="delete-student" variant="text" @click="deleteStudent(student)">Delete</v-btn>
          </div>
        </v-card>
      </div>
    </v-card>
  </v-container>
</template>
