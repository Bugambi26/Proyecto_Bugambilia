import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Endpoints de Better Auth: iniciar y cerrar sesión, recuperación, etc.
export const { GET, POST } = toNextJsHandler(auth);
