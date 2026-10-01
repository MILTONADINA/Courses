<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AuthServices from "../services/authServices.js";
import Utils from "../config/utils.js";

const router = useRouter();
const form = reactive({ userName: "", password: "" });
const error = ref("");
const loading = ref(false);

async function submit() {
  error.value = "";
  if (!form.userName.trim() || !form.password) {
    error.value = "Invalid username or password.";
    return;
  }
  loading.value = true;
  try {
    const response = await AuthServices.loginUser({ ...form });
    Utils.setStore("user", response.data);
    await router.push({ name: "home" });
  } catch (reason) {
    error.value = reason.response?.data?.message || "Invalid username or password.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card rounded="lg" elevation="4" class="pa-6">
          <h1 class="text-h4 mb-6">Sign in</h1>
          <v-alert v-if="error" type="error" density="compact" class="mb-4">{{ error }}</v-alert>
          <form @submit.prevent="submit">
            <v-text-field v-model="form.userName" label="Username" density="comfortable" rounded="lg" data-testid="userName" />
            <v-text-field v-model="form.password" label="Password" type="password" density="comfortable" rounded="lg" data-testid="password" />
            <v-btn type="submit" color="primary" variant="elevated" class="oc-cta" :loading="loading">Sign in</v-btn>
          </form>
          <router-link :to="{ name: 'register' }" class="d-inline-block mt-4">Create an account</router-link>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
