#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PRISMA_DIR = path.join(ROOT, "prisma");
const BASE_SCHEMA = path.join(PRISMA_DIR, "schema.prisma");
const MODULE_OUTPUT = path.join(PRISMA_DIR, "_modules.prisma");
const MERGED_OUTPUT = path.join(PRISMA_DIR, "merged.prisma");

async function readIfExists(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function collectPrismaFragments(startDir) {
  const files = [];
  async function walk(dir) {
    let entries = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        return;
      }
      throw error;
    }

    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".prisma")) {
          files.push(fullPath);
        }
      }),
    );
  }

  await walk(startDir);
  return files;
}

async function main() {
  const baseSchema = await readIfExists(BASE_SCHEMA);
  if (!baseSchema) {
    console.warn("⚠️  prisma/schema.prisma not found. Skipping merge.");
    return;
  }

  const moduleDirs = [path.join(ROOT, "modules")];
  const moduleFiles = (
    await Promise.all(moduleDirs.map((dir) => collectPrismaFragments(dir)))
  ).flat();

  const moduleContents = await Promise.all(
    moduleFiles.map(async (file) => {
      const contents = await fs.readFile(file, "utf8");
      const relativePath = path.relative(ROOT, file);
      return `// source: ${relativePath}\n${contents.trim()}\n`;
    }),
  );

  const mergedModuleContent = moduleContents.join("\n");
  await fs.writeFile(MODULE_OUTPUT, mergedModuleContent, "utf8");

  const merged = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY.\n// Run \`npm run db:merge\` to re-create it.\n\n${baseSchema.trim()}\n\n${mergedModuleContent}`;
  await fs.writeFile(MERGED_OUTPUT, merged, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
