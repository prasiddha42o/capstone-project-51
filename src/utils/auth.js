import { users } from "../data/users";

export function loginUser(email, password) {
  return users.find(
    (u) => u.email === email && u.password === password
  );
}

export function registerUser(email, password, name) {
  const exists = users.some((u) => u.email === email);

  if (exists) {
    return { success: false, message: "User already exists" };
  }

  users.push({ email, password, name });

  return { success: true };
}