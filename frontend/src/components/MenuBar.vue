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
    user.value = null;
    await router.push({ name: "login" });
  } catch (reason) {
    error.value = reason.response?.data?.message || "Sign out failed.";
  }
}
</script>

<template>
  <v-app-bar v-if="user" color="primary">
    <v-app-bar-title>Courses</v-app-bar-title>
    <v-btn data-testid="sign-out" variant="text" @click="signOut">Sign out</v-btn>
  </v-app-bar>
  <v-alert v-if="error" type="error" density="compact">{{ error }}</v-alert>
</template>
