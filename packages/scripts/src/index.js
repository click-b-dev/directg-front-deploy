#!/usr/bin/env node

import { main } from "./cli/main.js";

main(process.argv.slice(2)).catch((error) => {
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
