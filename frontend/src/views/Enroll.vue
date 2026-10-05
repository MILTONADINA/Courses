<script setup>
import { computed, onMounted, ref, watch } from "vue";
import SemesterServices from "../services/semesterServices.js";
import SectionServices from "../services/sectionServices.js";
import EnrollmentServices from "../services/enrollmentServices.js";

const semesters = ref([]);
const semesterId = ref(null);
const sections = ref([]);
const enrollments = ref([]);
const initializing = ref(true);
const ready = ref(false);
const loadingSections = ref(false);
const busy = ref(false);
const error = ref("");
const loading = computed(() => initializing.value || loadingSections.value);
let sectionRequest = 0;

const showChange = ref(false);
const changing = ref(null);
const newSectionId = ref(null);
const saving = ref(false);
const changeError = ref("");
const availableSections = computed(() => sections.value.filter((section) => !enrollmentFor(section)));

function apiMessage(reason) {
  return reason?.response?.data?.message || "Request failed.";
}
function enrollmentFor(section) {
  return enrollments.value.find((enrollment) => enrollment.sectionId === section.id);
}
function sectionTitle(section) {
  return `${section.course.courseNumber} ${section.course.courseName} — ${section.sectionNumber} (${section.daysOfWeek} ${section.startTime}–${section.endTime})`;
}

onMounted(async () => {
  const results = await Promise.allSettled([
    SemesterServices.listSemesters(), EnrollmentServices.listEnrollments(),
  ]);
  if (results[0].status === "fulfilled") semesters.value = results[0].value.data;
  if (results[1].status === "fulfilled") enrollments.value = results[1].value.data;
  const failure = results.find((result) => result.status === "rejected");
  if (failure) error.value = apiMessage(failure.reason);
  ready.value = !failure;
  initializing.value = false;
});

watch(semesterId, async (id) => {
  const request = ++sectionRequest;
  sections.value = [];
  error.value = "";
  showChange.value = false;
  if (id === null) {
    loadingSections.value = false;
    return;
  }
  loadingSections.value = true;
  try {
    const response = await SectionServices.listSectionsBySemester(id);
    if (request === sectionRequest) sections.value = response.data;
  } catch (reason) {
    if (request === sectionRequest) error.value = apiMessage(reason);
  } finally {
    if (request === sectionRequest) loadingSections.value = false;
  }
});

async function toggleEnrollment(section) {
  if (busy.value) return;
  error.value = "";
  busy.value = true;
  const enrollment = enrollmentFor(section);
  try {
    if (enrollment) {
      await EnrollmentServices.deleteEnrollment(enrollment.id);
      enrollments.value = enrollments.value.filter((item) => item.id !== enrollment.id);
    } else {
      const response = await EnrollmentServices.createEnrollment({ sectionId: section.id });
      enrollments.value.push(response.data);
    }
  } catch (reason) {
    error.value = apiMessage(reason);
  } finally {
    busy.value = false;
  }
}

function openChange(section) {
  changing.value = enrollmentFor(section);
  newSectionId.value = null;
  changeError.value = "";
  showChange.value = true;
}

async function saveChange() {
  if (saving.value) return;
  changeError.value = "";
  if (newSectionId.value === null) {
    changeError.value = "Section id is required.";
    return;
  }
  saving.value = true;
  try {
    const response = await EnrollmentServices.updateEnrollment(changing.value.id, { sectionId: newSectionId.value });
    // Clear the selection before the enrolled section leaves the available choices.
    newSectionId.value = null;
    enrollments.value = enrollments.value.map((item) => item.id === changing.value.id ? response.data : item);
    showChange.value = false;
  } catch (reason) {
    changeError.value = apiMessage(reason);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <v-container class="py-10" style="max-width: 1100px">
    <v-card rounded="lg" elevation="4" class="pa-6">
      <h1 class="text-h4 mb-6">Enroll</h1>
      <v-alert v-if="error" type="error" density="compact" class="mb-4">{{ error }}</v-alert>
      <v-select
        v-if="semesters.length"
        v-model="semesterId"
        label="Semester"
        :items="semesters"
        item-title="semsterName"
        item-value="id"
        :disabled="!ready || busy || saving"
        density="comfortable"
        rounded="lg"
      />
      <div v-if="loading" class="d-flex align-center ga-2" data-testid="enroll-loading" role="status">
        <v-progress-circular indeterminate color="primary" size="24" />
        Loading...
      </div>
      <template v-else-if="ready">
        <div v-if="!semesters.length">No semesters available.</div>
        <div v-else-if="semesterId === null">Select a semester to view its sections.</div>
        <div v-else-if="!sections.length && !error">No sections for this semester.</div>
        <v-table v-else-if="sections.length">
          <thead>
            <tr><th>Course</th><th>Section</th><th>Instructor</th><th>Days</th><th>Time</th><th class="text-right">Actions</th></tr>
          </thead>
          <tbody>
            <tr v-for="section in sections" :key="section.id" data-testid="section-row">
              <td>{{ section.course.courseNumber }} {{ section.course.courseName }}</td>
              <td>{{ section.sectionNumber }}</td>
              <td>{{ section.faculty.firstName }} {{ section.faculty.lastName }}</td>
              <td>{{ section.daysOfWeek }}</td>
              <td>{{ section.startTime }}–{{ section.endTime }}</td>
              <td class="text-right">
                <v-btn :data-testid="enrollmentFor(section) ? 'drop' : 'enroll'" variant="text" :disabled="busy" @click="toggleEnrollment(section)">
                  {{ enrollmentFor(section) ? 'Drop' : 'Enroll' }}
                </v-btn>
                <v-btn v-if="enrollmentFor(section)" data-testid="change-section" variant="text" :disabled="busy" @click="openChange(section)">Change section</v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </template>
    </v-card>
    <v-dialog v-model="showChange" max-width="600" :persistent="saving">
      <v-card rounded="lg" class="pa-6">
        <h2 class="text-h6 mb-4">Change section</h2>
        <v-alert v-if="changeError" type="error" density="compact" class="mb-4">{{ changeError }}</v-alert>
        <div v-if="!availableSections.length" class="mb-4">No other sections available.</div>
        <v-select v-model="newSectionId" label="New section" :items="availableSections" :item-title="sectionTitle" item-value="id" :disabled="saving" density="comfortable" rounded="lg" />
        <div class="d-flex ga-2">
          <v-btn data-testid="save-change" color="primary" variant="elevated" class="oc-cta" :loading="saving" @click="saveChange">Save</v-btn>
          <v-btn data-testid="cancel-change" color="secondary" variant="text" :disabled="saving" @click="showChange = false">Cancel</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>
