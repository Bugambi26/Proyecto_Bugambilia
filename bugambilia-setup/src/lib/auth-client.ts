import { createAuthClient } from "better-auth/react";

// Cliente de Better Auth para componentes de cliente del panel.
// Sin baseURL: el sitio y la API comparten dominio.
export const authClient = createAuthClient();
