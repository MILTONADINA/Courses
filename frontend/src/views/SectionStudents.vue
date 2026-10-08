<script setup>
import { computed, ref, watch } from "vue";
import SectionServices from "../services/sectionServices.js";

const props = defineProps({ id: { type: String, required: true } });

const section = ref(null);
const students = ref([]);
const loading = ref(false);
const error = ref("");

const heading = computed(() => {
  if (!section.value) return "Section students";
  const { courseNumber, courseName, sectionNumber, semsterName } = section.value;
  return `${courseNumber} ${courseName} — Section ${sectionNumber} (${semsterName})`;
});

const showEmpty = computed(() => !loading.value && section.value && students.value.length === 0);
const showTable = computed(() => !loading.value && students.value.length > 0);

function reset() {
  section.value = null;
  students.value = [];
  error.value = "";
}

async function load(id) {
  reset();
  loading.value = true;
  try {
    const { data } = await SectionServices.listSectionStudents(id);
    if (id !== props.id) return;
    section.value = data.section;
    students.value = data.students;
  } catch (reason) {
    if (id === props.id) error.value = reason.response?.data?.message || "Request failed.";
  } finally {
    if (id === props.id) loading.value = false;
  }
}

watch(() => props.id, load, { immediate: true });
</script>

<template>
  <v-container class="py-10" style="max-width: 1100px">
    <v-card rounded="lg" elevation="4" class="pa-6">
      <h1 class="text-h4 mb-6">{{ heading }}</h1>

      <v-alert v-if="error" type="error" density="compact" class="mb-4">{{ error }}</v-alert>

      <div v-if="loading" class="d-flex align-center ga-2" data-testid="section-students-loading">
        <v-progress-circular indeterminate color="primary" size="24" />
        Loading students...
      </div>

      <p v-if="showEmpty">No students enrolled.</p>

      <v-table v-if="showTable">
        <thead>
          <tr>
            <th>Last name</th>
            <th>First name</th>
            <th>University ID</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.id" data-testid="section-student-row">
            <td>{{ student.lastName }}</td>
            <td>{{ student.firstName }}</td>
            <td>{{ student.universityId }}</td>
            <td>{{ student.email }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>
