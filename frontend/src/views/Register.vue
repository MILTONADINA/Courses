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

const required = (label) => (v) => !!v?.trim() || `${label} is required.`;
// Same rules and messages as the register API; the first rule of each field is the required check.
const rules = {
  firstName: [required("First name")],
  lastName: [required("Last name")],
  email: [required("Email"), (v) => isValidEmail(v) || "Enter a valid email address."],
  universityId: [required("University ID")],
  userName: [required("Username")],
  password: [required("Password"), (v) => v.length >= 8 || "Password must be at least 8 characters."],
  confirmPassword: [required("Confirm password"), (v) => v === form.password || "Passwords do not match."],
};

// Check every required field before the format rules, in the same order as the API.
function validate() {
  const entries = Object.entries(rules);
  const ordered = [
    ...entries.map(([field, fieldRules]) => [field, fieldRules[0]]),
    ...entries.flatMap(([field, fieldRules]) => fieldRules.slice(1).map((rule) => [field, rule])),
  ];
  for (const [field, rule] of ordered) {
    const result = rule(form[field]);
    if (result !== true) return result;
  }
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
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card rounded="lg" elevation="4" class="pa-6">
          <h1 class="text-h4 mb-6">Create an account</h1>
          <v-alert v-if="error" type="error" density="compact" class="mb-4">{{ error }}</v-alert>
          <form @submit.prevent="submit">
            <v-text-field v-model="form.firstName" label="First name" :rules="rules.firstName" density="comfortable" rounded="lg" data-testid="firstName" />
            <v-text-field v-model="form.lastName" label="Last name" :rules="rules.lastName" density="comfortable" rounded="lg" data-testid="lastName" />
            <v-text-field v-model="form.email" label="Email" :rules="rules.email" density="comfortable" rounded="lg" data-testid="email" />
            <v-text-field v-model="form.universityId" label="University ID" :rules="rules.universityId" density="comfortable" rounded="lg" data-testid="universityId" />
            <v-text-field v-model="form.userName" label="Username" :rules="rules.userName" density="comfortable" rounded="lg" data-testid="userName" />
            <v-text-field v-model="form.password" label="Password" type="password" :rules="rules.password" density="comfortable" rounded="lg" data-testid="password" />
            <v-text-field v-model="form.confirmPassword" label="Confirm password" type="password" :rules="rules.confirmPassword" density="comfortable" rounded="lg" data-testid="confirmPassword" />
            <v-btn type="submit" color="primary" variant="elevated" class="oc-cta" :loading="loading">Register</v-btn>
          </form>
          <router-link :to="{ name: 'login' }" class="d-inline-block mt-4">Sign in</router-link>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
