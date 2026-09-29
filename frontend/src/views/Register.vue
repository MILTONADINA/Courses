<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AuthServices from "../services/authServices.js";
import Utils from "../config/utils.js";
import { isValidEmail } from "../config/validation.js";

const router = useRouter();
const form = reactive({
  firstName: "", lastName: "", email: "", universityId: "",
  userName: "", password: "", confirmPassword: "",
});
const error = ref("");
const loading = ref(false);
const fields = [
  ["firstName", "First name"], ["lastName", "Last name"],
  ["email", "Email"], ["universityId", "University ID"],
  ["userName", "Username"], ["password", "Password"],
  ["confirmPassword", "Confirm password"],
];

function validate() {
  for (const [field, label] of fields) {
    if (!form[field].trim()) return `${label} is required.`;
  }
  if (!isValidEmail(form.email)) return "Enter a valid email address.";
  if (form.password.length < 8) return "Password must be at least 8 characters.";
  if (form.password !== form.confirmPassword) return "Passwords do not match.";
  return "";
}

async function submit() {
  error.value = validate();
  if (error.value) return;
  loading.value = true;
  try {
    const response = await AuthServices.registerUser({ ...form });
    Utils.setStore("user", response.data);
    await router.push({ name: "home" });
  } catch (reason) {
    error.value = reason.response?.data?.message || "Registration failed.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-container class="py-10" style="max-width: 560px">
    <v-card elevation="4" class="pa-6">
      <h1 class="text-h4 mb-6">Create an account</h1>
      <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
      <form @submit.prevent="submit">
        <v-text-field v-model="form.firstName" label="First name" data-testid="firstName" />
        <v-text-field v-model="form.lastName" label="Last name" data-testid="lastName" />
        <v-text-field v-model="form.email" label="Email" data-testid="email" />
        <v-text-field v-model="form.universityId" label="University ID" data-testid="universityId" />
        <v-text-field v-model="form.userName" label="Username" data-testid="userName" />
        <v-text-field v-model="form.password" label="Password" type="password" data-testid="password" />
        <v-text-field v-model="form.confirmPassword" label="Confirm password" type="password" data-testid="confirmPassword" />
        <v-btn type="submit" color="primary" class="oc-cta" :loading="loading">Register</v-btn>
      </form>
      <router-link :to="{ name: 'login' }" class="d-inline-block mt-4">Sign in</router-link>
    </v-card>
  </v-container>
</template>
