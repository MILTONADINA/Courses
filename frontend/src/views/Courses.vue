<script setup>
import { onMounted, ref } from "vue";
import CourseServices from "../services/courseServices.js";
import Utils from "../config/utils.js";

const user = Utils.getStore("user");
const isAdmin = user?.role === "admin";

const courses = ref([]);
const error = ref("");
const loading = ref(false);
const showForm = ref(false);
const saving = ref(false);
const editing = ref(false);
const editingId = ref(null);

const courseNumber = ref("");
const courseName = ref("");
const courseDescription = ref("");
const courseSemesters = ref("");
const courseFrequency = ref("");
const courseHours = ref("");
const courseDept = ref("");

const fields = [
  ["courseNumber", courseNumber, "Course number is required."],
  ["courseName", courseName, "Course name is required."],
  ["courseDescription", courseDescription, "Course description is required."],
  ["courseSemesters", courseSemesters, "Course semesters is required."],
  ["courseFrequency", courseFrequency, "Course frequency is required."],
  ["courseHours", courseHours, "Course hours is required."],
  ["courseDept", courseDept, "Course department is required."],
];

function formData() {
  return {
    courseNumber: courseNumber.value,
    courseName: courseName.value,
    courseDescription: courseDescription.value,
    courseSemesters: courseSemesters.value,
    courseFrequency: courseFrequency.value,
    courseHours: courseHours.value,
    courseDept: courseDept.value,
  };
}

function clearForm() {
  courseNumber.value = "";
  courseName.value = "";
  courseDescription.value = "";
  courseSemesters.value = "";
  courseFrequency.value = "";
  courseHours.value = "";
  courseDept.value = "";
}

async function loadCourses() {
  error.value = "";
  loading.value = true;
  try {
    const response = await CourseServices.listCourses();
    courses.value = response.data;
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

function openEditForm(course) {
  error.value = "";
  courseNumber.value = course.courseNumber;
  courseName.value = course.courseName;
  courseDescription.value = course.courseDescription;
  courseSemesters.value = course.courseSemesters;
  courseFrequency.value = course.courseFrequency;
  courseHours.value = course.courseHours;
  courseDept.value = course.courseDept;
  editing.value = true;
  editingId.value = course.id;
  showForm.value = true;
}

function requiredMessage() {
  for (const [, field, message] of fields) {
    if (!String(field.value).trim()) return message;
  }
  return "";
}

async function saveCourse() {
  error.value = "";
  const message = requiredMessage();
  if (message) {
    error.value = message;
    return;
  }

  saving.value = true;
  try {
    if (editing.value) await CourseServices.updateCourse(editingId.value, formData());
    else await CourseServices.createCourse(formData());
    showForm.value = false;
    await loadCourses();
  } catch (reason) {
    error.value = reason.response?.data?.message || "Request failed.";
  } finally {
    saving.value = false;
  }
}

async function deleteCourse(course) {
  error.value = "";
  try {
    await CourseServices.deleteCourse(course.id);
    await loadCourses();
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
  await loadCourses();
});
</script>

<template>
  <v-container class="py-10" style="max-width: 900px">
    <v-card elevation="4" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4">Courses</h1>
        <v-btn
          v-if="isAdmin"
          data-testid="create-course"
          color="primary"
          class="oc-cta"
          @click="openAddForm"
        >
          Add course
        </v-btn>
      </div>

      <v-alert v-if="error && !showForm" type="error" class="mb-4">{{ error }}</v-alert>

      <v-dialog v-model="showForm" max-width="520">
        <v-card rounded="lg" class="pa-6">
          <h2 class="text-h6 mb-4">{{ editing ? "Edit course" : "Add course" }}</h2>
          <v-alert v-if="error" type="error" density="compact" class="mb-4">{{ error }}</v-alert>
          <v-text-field v-model="courseNumber" label="Course number" data-testid="courseNumber" density="comfortable" rounded="lg" />
          <v-text-field v-model="courseName" label="Course name" data-testid="courseName" density="comfortable" rounded="lg" />
          <v-text-field v-model="courseDescription" label="Course description" data-testid="courseDescription" density="comfortable" rounded="lg" />
          <v-text-field v-model="courseSemesters" label="Course semesters" data-testid="courseSemesters" density="comfortable" rounded="lg" />
          <v-text-field v-model="courseFrequency" label="Course frequency" data-testid="courseFrequency" density="comfortable" rounded="lg" />
          <v-text-field v-model="courseHours" label="Course hours" data-testid="courseHours" density="comfortable" rounded="lg" />
          <v-text-field v-model="courseDept" label="Course department" data-testid="courseDept" density="comfortable" rounded="lg" />
          <div class="d-flex ga-2">
            <v-btn data-testid="save-course" color="primary" variant="elevated" class="oc-cta" :loading="saving" @click="saveCourse">Save</v-btn>
            <v-btn variant="text" @click="cancelForm">Cancel</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <div v-if="loading">Loading courses...</div>
      <div v-else-if="courses.length === 0">No courses found.</div>
      <div v-else>
        <v-card v-for="course in courses" :key="course.id" variant="outlined" class="pa-4 mb-3">
          <div class="text-h6">{{ course.courseName }}</div>
          <div>{{ course.courseNumber }}</div>
          <div>{{ course.courseDescription }}</div>
          <div>{{ course.courseSemesters }}</div>
          <div>{{ course.courseFrequency }}</div>
          <div>{{ course.courseHours }}</div>
          <div>{{ course.courseDept }}</div>
          <div v-if="isAdmin" class="d-flex ga-2 mt-2">
            <v-btn data-testid="edit-course" variant="text" @click="openEditForm(course)">Edit</v-btn>
            <v-btn data-testid="delete-course" variant="text" @click="deleteCourse(course)">Delete</v-btn>
          </div>
        </v-card>
      </div>
    </v-card>
  </v-container>
</template>
