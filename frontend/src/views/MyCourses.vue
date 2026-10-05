<script setup>
import { onMounted, ref } from "vue";
import MyCoursesServices from "../services/myCoursesServices.js";

const courses = ref([]);
const error = ref("");
const loading = ref(false);
const loaded = ref(false);

async function loadCourses() {
  error.value = "";
  loading.value = true;
  try {
    const response = await MyCoursesServices.listMyCourses();
    courses.value = response.data;
    loaded.value = true;
  } catch (reason) {
    loaded.value = false;
    error.value = reason.response?.data?.message || "Request failed.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadCourses);
</script>

<template>
  <v-container class="py-10" style="max-width: 900px">
    <v-card elevation="4" class="pa-6">
      <h1 class="text-h4 mb-6">My courses</h1>
      <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
      <div v-if="loading">Loading...</div>
      <div v-else-if="loaded && courses.length === 0">No enrolled sections.</div>
      <div v-else-if="loaded">
        <v-card v-for="course in courses" :key="course.enrollmentId" variant="outlined" class="pa-4 mb-3">
          <div class="text-h6 text-primary">{{ course.courseName }}</div>
          <div class="text-secondary">{{ course.courseNumber }}</div>
          <div class="text-secondary">{{ course.sectionNumber }}</div>
          <div class="text-secondary">{{ course.semsterName }}</div>
          <div class="text-secondary">{{ course.daysOfWeek }}</div>
          <div class="text-secondary">{{ course.startTime }}–{{ course.endTime }}</div>
          <div class="text-secondary">{{ course.instructorName }}</div>
        </v-card>
      </div>
    </v-card>
  </v-container>
</template>
