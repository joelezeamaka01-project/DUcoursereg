// Frontend Supabase Client
const SUPABASE_URL = "https://pptyamoqptxdkpbruvek.supabase.co";
const SUPABASE_KEY = "sb_publishable_84BqCFfmaxaSAe1V2snJ2A_YHj71kIU";

// Initialize Supabase client
async function initializeSupabaseClient() {
  const { createClient } = window.supabase;
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Load Supabase JS library dynamically
const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
script.onload = () => {
  window.supabaseClient = initializeSupabaseClient();
};
document.head.appendChild(script);

// Auth Functions
async function signUpUser(email, password, userData) {
  try {
    const client = await window.supabaseClient;
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Sign up error:", error);
    return { success: false, error: error.message };
  }
}

async function loginUser(email, password) {
  try {
    const client = await window.supabaseClient;
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
}

async function logoutUser() {
  try {
    const client = await window.supabaseClient;
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
  }
}

async function getCurrentUser() {
  try {
    const client = await window.supabaseClient;
    const { data } = await client.auth.getSession();
    return data?.session?.user || null;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

async function resetPassword(email) {
  try {
    const client = await window.supabaseClient;
    const { error } = await client.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: error.message };
  }
}

// Database Functions
async function getStudentData(userId) {
  try {
    const client = await window.supabaseClient;
    const { data, error } = await client
      .from("students")
      .select("*")
      .eq("auth_user_id", userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Get student data error:", error);
    return { success: false, error: error.message };
  }
}

async function updateStudentData(userId, updates) {
  try {
    const client = await window.supabaseClient;
    const { data, error } = await client
      .from("students")
      .update(updates)
      .eq("auth_user_id", userId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Update student data error:", error);
    return { success: false, error: error.message };
  }
}
