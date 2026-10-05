<script setup>
import { onMounted, reactive, ref } from "vue";
import SectionServices from "../services/sectionServices.js";
import SemesterServices from "../services/semesterServices.js";
import CourseServices from "../services/courseServices.js";
import FacultyServices from "../services/facultyServices.js";

const fields = [
  { key: "sectionNumber", message: "Section number is required." },
  { key: "semesterId", message: "Semester id is required." },
  { key: "courseId", message: "Course id is required." },
  { key: "facultyId", message: "Faculty member id is required." },
  { key: "daysOfWeek", message: "Days of week is required." },
  { key: "startTime", message: "Start time is required." },
  { key: "endTime", message: "End time is required." },
];

const timeFields = [
  { key: "startTime", label: "Start time", message: "Start time must be in HH:MM format." },
  { key: "endTime", label: "End time", message: "End time must be in HH:MM format." },
];

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const sections = ref([]);
const loading = ref(false);
const error = ref("");

const semesters = ref([]);
const courses = ref([]);
const faculty = ref([]);

const showForm = ref(false);
const editingId = ref(null);
const saving = ref(false);
const formError = ref("");
const form = reactive({
  sectionNumber: "",
  semesterId: null,
  courseId: null,
  facultyId: null,
  daysOfWeek: "",
  startTime: "",
  endTime: "",
});
const fieldErrors = reactive({
  sectionNumber: "",
  semesterId: "",
  courseId: "",
  facultyId: "",
  daysOfWeek: "",
  startTime: "",
  endTime: "",
});

function apiMessage(reason) {
  return reason.response?.data?.message || "Request failed.";
}

function courseTitle(course) {
  return `${course.courseNumber} ${course.courseName}`;
}

function instructorName(member) {
  return `${member.firstName} ${member.lastName}`;
}

function resetFieldErrors() {
  for (const { key } of fields) fieldErrors[key] = "";
}

async function loadSections() {
  error.value = "";
  loading.value = true;
  try {
    const response = await SectionServices.listSections();
    sections.value = response.data;
  } catch (reason) {
    error.value = apiMessage(reason);
  } finally {
    loading.value = false;
  }
}

async function loadChoices() {
  try {
    const [semesterResponse, courseResponse, facultyResponse] = await Promise.all([
      SemesterServices.listSemesters(),
      CourseServices.listCourses(),
      FacultyServices.listFaculty(),
    ]);
    semesters.value = semesterResponse.data;
    courses.value = courseResponse.data;
    faculty.value = facultyResponse.data;
  } catch (reason) {
    formError.value = apiMessage(reason);
  }
}

function openForm(section = null) {
  editingId.value = section ? section.id : null;
  form.sectionNumber = section ? section.sectionNumber : "";
  form.semesterId = section ? section.semesterId : null;
  form.courseId = section ? section.courseId : null;
  form.facultyId = section ? section.facultyId : null;
  form.daysOfWeek = section ? section.daysOfWeek : "";
  form.startTime = section ? section.startTime : "";
  form.endTime = section ? section.endTime : "";
  resetFieldErrors();
  formError.value = "";
  showForm.value = true;
  loadChoices();
}

function validate() {
  resetFieldErrors();
  for (const { key, message } of fields) {
    const value = form[key];
    if (value === null || value === undefined || String(value).trim() === "") fieldErrors[key] = message;
  }
  for (const { key, message } of timeFields) {
    if (!fieldErrors[key] && !timePattern.test(form[key])) fieldErrors[key] = message;
  }
  return fields.every(({ key }) => !fieldErrors[key]);
}

async function save() {
  formError.value = "";
  if (!validate()) return;

  const data = {
    sectionNumber: form.sectionNumber,
    semesterId: form.semesterId,
    courseId: form.courseId,
    facultyId: form.facultyId,
    daysOfWeek: form.daysOfWeek,
    startTime: form.startTime,
    endTime: form.endTime,
  };
  saving.value = true;
  try {
    if (editingId.value === null) {
      await SectionServices.createSection(data);
    } else {
      await SectionServices.updateSection(editingId.value, data);
    }
    showForm.value = false;
    await loadSections();
  } catch (reason) {
    formError.value = apiMessage(reason);
  } finally {
    saving.value = false;
  }
}

async function remove(section) {
  error.value = "";
  try {
    await SectionServices.deleteSection(section.id);
    await loadSections();
  } catch (reason) {
    error.value = apiMessage(reason);
  }
}

onMounted(loadSections);
</script>

<template>
  <v-container class="py-10" style="max-width: 1100px">
    <v-card rounded="lg" elevation="4" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4">Sections</h1>
        <v-btn data-testid="add-section" color="primary" variant="elevated" class="oc-cta" @click="openForm()">
          Add Section
        </v-btn>
      </div>

      <v-alert v-if="error" type="error" density="compact" class="mb-4">{{ error }}</v-alert>

      <div v-if="loading" class="d-flex align-center ga-2" data-testid="sections-loading">
        <v-progress-circular indeterminate color="primary" size="24" />
        Loading sections...
      </div>

      <div v-else-if="sections.length === 0 && !error">No sections yet.</div>

      <v-table v-else-if="sections.length > 0">
        <thead>
          <tr>
            <th>Semester</th>
            <th>Course</th>
            <th>Section</th>
            <th>Instructor</th>
            <th>Days</th>
            <th>Time</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="section in sections" :key="section.id" data-testid="section-row">
            <td>{{ section.semester.semsterName }}</td>
            <td>{{ courseTitle(section.course) }}</td>
            <td>{{ section.sectionNumber }}</td>
            <td>{{ instructorName(section.faculty) }}</td>
            <td>{{ section.daysOfWeek }}</td>
            <td>{{ section.startTime }}–{{ section.endTime }}</td>
            <td class="text-right">
              <v-btn data-testid="edit-section" variant="text" @click="openForm(section)">Edit</v-btn>
              <v-btn data-testid="delete-section" variant="text" @click="remove(section)">Delete</v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="showForm" max-width="560">
      <v-card rounded="lg" class="pa-6">
        <h2 class="text-h6 mb-4">{{ editingId === null ? "Add Section" : "Edit Section" }}</h2>

        <v-alert v-if="formError" type="error" density="compact" class="mb-4">{{ formError }}</v-alert>

        <v-select
          v-model="form.semesterId"
          label="Semester"
          :items="semesters"
          item-title="semsterName"
          item-value="id"
          :error-messages="fieldErrors.semesterId"
          density="comfortable"
          rounded="lg"
          data-testid="semesterId"
          @update:model-value="fieldErrors.semesterId = ''"
        />
        <v-select
          v-model="form.courseId"
          label="Course"
          :items="courses"
          :item-title="courseTitle"
          item-value="id"
          :error-messages="fieldErrors.courseId"
          density="comfortable"
          rounded="lg"
          data-testid="courseId"
          @update:model-value="fieldErrors.courseId = ''"
        />
        <v-select
          v-model="form.facultyId"
          label="Instructor"
          :items="faculty"
          :item-title="instructorName"
          item-value="id"
          :error-messages="fieldErrors.facultyId"
          density="comfortable"
          rounded="lg"
          data-testid="facultyId"
          @update:model-value="fieldErrors.facultyId = ''"
        />
        <v-text-field
          v-model="form.sectionNumber"
          label="Section number"
          :error-messages="fieldErrors.sectionNumber"
          density="comfortable"
          rounded="lg"
          data-testid="sectionNumber"
          @update:model-value="fieldErrors.sectionNumber = ''"
        />
        <v-text-field
          v-model="form.daysOfWeek"
          label="Days of week"
          :error-messages="fieldErrors.daysOfWeek"
          density="comfortable"
          rounded="lg"
          data-testid="daysOfWeek"
          @update:model-value="fieldErrors.daysOfWeek = ''"
        />
        <v-text-field
          v-for="field in timeFields"
          :key="field.key"
          v-model="form[field.key]"
          :label="field.label"
          placeholder="HH:MM"
          :error-messages="fieldErrors[field.key]"
          density="comfortable"
          rounded="lg"
          :data-testid="field.key"
          @update:model-value="fieldErrors[field.key] = ''"
        />

        <div class="d-flex ga-2">
          <v-btn data-testid="save-section" color="primary" variant="elevated" class="oc-cta" :loading="saving" @click="save">
            Save
          </v-btn>
          <v-btn data-testid="cancel-section" color="secondary" variant="text" @click="showForm = false">Cancel</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>
