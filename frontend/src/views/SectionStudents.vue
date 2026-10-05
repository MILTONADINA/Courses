<script setup>
import { ref, watch } from "vue";
import SectionServices from "../services/sectionServices.js";

const props = defineProps({ id: { type: String, required: true } });
const section = ref(null);
const students = ref([]);
const loading = ref(false);
const error = ref("");

watch(() => props.id, async (id, previousId, onCleanup) => {
  let active = true;
  onCleanup(() => { active = false; });
  section.value = null;
  students.value = [];
  error.value = "";
  loading.value = true;
  try {
    const response = await SectionServices.listSectionStudents(id);
    if (active) {
      section.value = response.data.section;
      students.value = response.data.students;
    }
  } catch (reason) {
    if (active) error.value = reason.response?.data?.message || "Request failed.";
  } finally {
    if (active) loading.value = false;
  }
}, { immediate: true });
</script>

<template>
  <v-container class="py-10" style="max-width: 1100px">
    <v-card rounded="lg" elevation="4" class="pa-6">
      <h1 class="text-h4 mb-6">
        <template v-if="section">{{ section.courseNumber }} {{ section.courseName }} — Section {{ section.sectionNumber }} ({{ section.semsterName }})</template>
        <template v-else>Section students</template>
      </h1>

      <v-alert v-if="error" type="error" density="compact" class="mb-4">{{ error }}</v-alert>

      <div v-if="loading" class="d-flex align-center ga-2" data-testid="section-students-loading" role="status">
        <v-progress-circular indeterminate color="primary" size="24" />
        Loading students...
      </div>
      <template v-else-if="section && !error">
        <div v-if="students.length === 0">No students enrolled.</div>
        <v-table v-else>
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
      </template>
    </v-card>
  </v-container>
</template>
