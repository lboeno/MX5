import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { isAdminRole } from "../lib/roles";

type PermissionCache = Record<string, boolean>;

export function usePermission() {
  const { user, profile } = useAuth();
  const [cache, setCache] = useState<PermissionCache>({});
  const cacheRef = useRef<PermissionCache>({});
  const loadingRef = useRef<Set<string>>(new Set());

  const canAccess = useCallback(
    async (screen: string): Promise<boolean> => {
      if (!user || !profile) return false;

      if (isAdminRole(profile.role)) return true;

      if (screen in cacheRef.current) {
        return cacheRef.current[screen];
      }

      if (loadingRef.current.has(screen)) {
        return false;
      }

      loadingRef.current.add(screen);

      try {
        const { data: rolePerm, error: roleError } = await supabase
          .from("role_permissions")
          .select("screens")
          .eq("role", profile.role)
          .single();

        if (roleError) {
          loadingRef.current.delete(screen);
          return false;
        }

        const defaults = (rolePerm.screens as Record<string, boolean>) ?? {};
        const defaultValue = defaults[screen] ?? false;

        const { data: userPerm, error: userError } = await supabase
          .from("user_permissions")
          .select("screens")
          .eq("user_id", user.id)
          .maybeSingle();

        let result = defaultValue;

        if (!userError && userPerm?.screens && screen in (userPerm.screens as Record<string, boolean>)) {
          result = (userPerm.screens as Record<string, boolean>)[screen];
        }

        cacheRef.current[screen] = result;
        setCache((prev) => ({ ...prev, [screen]: result }));
        loadingRef.current.delete(screen);
        return result;
      } catch {
        loadingRef.current.delete(screen);
        return false;
      }
    },
    [user, profile]
  );

  const getCached = useCallback(
    (screen: string): boolean | undefined => {
      return cacheRef.current[screen];
    },
    []
  );

  const invalidateCache = useCallback(() => {
    cacheRef.current = {};
    setCache({});
  }, []);

  return { canAccess, getCached, invalidateCache, cache };
}
