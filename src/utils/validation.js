import { users } from "../data/users";

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateLogin(email, password) {
  return users.find(
    (u) => u.email  === email && u.password === password
  );
}