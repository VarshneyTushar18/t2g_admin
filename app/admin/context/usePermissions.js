"use client";

import { useMemo } from "react";
import { canPerform, permissionsMapFromUser } from "@/lib/modulePermissions";

export function usePermissions(user) {
  return useMemo(() => {
    const permissions = permissionsMapFromUser(user);
    const isSuperAdmin = user?.role === "super_admin";

    return {
      permissions,
      can: (moduleKey, action) =>
        isSuperAdmin ? true : canPerform(user, moduleKey, action),
      canView: (moduleKey) =>
        isSuperAdmin ? true : canPerform(user, moduleKey, "view"),
      canWrite: (moduleKey) =>
        isSuperAdmin
          ? true
          : canPerform(user, moduleKey, "add") && canPerform(user, moduleKey, "edit"),
      canAdd: (moduleKey) =>
        isSuperAdmin ? true : canPerform(user, moduleKey, "add"),
      canEdit: (moduleKey) =>
        isSuperAdmin ? true : canPerform(user, moduleKey, "edit"),
      canDelete: (moduleKey) =>
        isSuperAdmin ? true : canPerform(user, moduleKey, "delete"),
      isReadOnly: (moduleKey) => {
        if (isSuperAdmin) return false;
        return (
          canPerform(user, moduleKey, "view") &&
          !canPerform(user, moduleKey, "add") &&
          !canPerform(user, moduleKey, "edit") &&
          !canPerform(user, moduleKey, "delete")
        );
      },
    };
  }, [user]);
}
