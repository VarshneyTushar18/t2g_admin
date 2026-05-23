/** Super admin signs in here */
export const ADMIN_LOGIN_PATH = "/admin/login";

/** Team / staff sign in here (share this URL from Manage Users) */
export const TEAM_LOGIN_PATH = "/login";

export function adminLoginUrl(origin) {
  if (origin) return `${origin}${ADMIN_LOGIN_PATH}`;
  return (
    process.env.NEXT_PUBLIC_ADMIN_LOGIN_URL ||
    `https://manageadmin.tech2globe.tech${ADMIN_LOGIN_PATH}`
  );
}

export function teamLoginUrl(origin) {
  if (origin) return `${origin}${TEAM_LOGIN_PATH}`;
  return (
    process.env.NEXT_PUBLIC_TEAM_LOGIN_URL ||
    `https://manageadmin.tech2globe.tech${TEAM_LOGIN_PATH}`
  );
}

export function loginPathForRole(role) {
  return role === "super_admin" ? ADMIN_LOGIN_PATH : TEAM_LOGIN_PATH;
}
