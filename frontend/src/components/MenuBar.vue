<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AuthServices from "../services/authServices.js";
import Utils from "../config/utils.js";

const router = useRouter();
const user = ref(Utils.getStore("user"));
const error = ref("");

async function signOut() {
  error.value = "";
  try {
    await AuthServices.logoutUser();
    Utils.removeItem("user");
    window.dispatchEvent(new CustomEvent("user-logged-out"));
    user.value = null;
    await router.push({ name: "login" });
  } catch (reason) {
    error.value = reason.response?.data?.message || "Logout failed.";
  }
}
</script>

<template>
  <v-app-bar v-if="user" color="primary">
    <v-btn :to="{ name: 'semesters' }" variant="text">Semesters</v-btn>
    <v-btn v-if="user?.role === 'admin'" :to="{ name: 'courses' }" variant="text">Courses</v-btn>
    <v-btn v-if="user?.role === 'admin'" :to="{ name: 'faculty' }" variant="text">Faculty</v-btn>
    <v-btn v-if="user?.role === 'admin'" :to="{ name: 'students' }" variant="text">Students</v-btn>
    <v-btn v-if="user?.role === 'admin'" :to="{ name: 'sections' }" variant="text">Sections</v-btn>
    <v-btn data-testid="sign-out" variant="text" @click="signOut">Sign out</v-btn>
  </v-app-bar>
  <v-alert v-if="error" type="error" density="compact">{{ error }}</v-alert>
</template>
