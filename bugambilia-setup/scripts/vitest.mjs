// Arranca Vitest con la letra de unidad en mayúscula.
// En Windows, si la terminal abre la carpeta como "c:\..." (minúscula, como la de VS Code),
// Vitest carga dos copias de sí mismo y falla con "Cannot read properties of undefined
// (reading 'config')" antes de correr las pruebas. En macOS/Linux no cambia nada.
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const cwd = process.cwd().replace(/^[a-z]:/, (unidad) => unidad.toUpperCase());
const vitest = join(cwd, "node_modules", "vitest", "vitest.mjs");
const { status } = spawnSync(process.execPath, [vitest, ...process.argv.slice(2)], { cwd, stdio: "inherit" });
process.exit(status ?? 1);
