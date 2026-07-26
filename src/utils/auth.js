import { buildApiUrl } from "./api";

/**
 * LOGIN USER
 */
export async function loginUser(email, password) {
  try {
    const res = await fetch(buildApiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // backend error (wrong credentials, etc.)
    if (!res.ok) {
      return {
        success: false,
        message: data.error || "Login failed",
      };
    }

    // save user
    localStorage.setItem("wa_user", JSON.stringify(data.user));

    return {
      success: true,
      user: data.user,
    };
  } catch (err) {
    return {
      success: false,
      message: "Server not reachable",
    };
  }
}

/**
 * REGISTER USER
 */
export async function registerUser(name, email, password) {
  try {
    const res = await fetch(buildApiUrl("/api/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.error || "Registration failed",
      };
    }

    localStorage.setItem("wa_user", JSON.stringify(data.user));

    return {
      success: true,
      user: data.user,
    };
  } catch (err) {
    return {
      success: false,
      message: "Server not reachable",
    };
  }
}

/**
 * GET CURRENT USER
 */
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("wa_user"));
  } catch {
    return null;
  }
}

/**
 * LOGOUT USER
 */
export function logoutUser() {
  localStorage.removeItem("wa_user");
}