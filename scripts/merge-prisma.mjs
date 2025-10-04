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

function extractDeclarativeBlocks(source) {
  const lines = source.split(/\r?\n/);
  const blocks = [];
  let pendingComments = [];
  let current = null;
  let braceDepth = 0;

  const flushPending = () => {
    pendingComments = [];
  };

  for (const line of lines) {
    if (current) {
      current.lines.push(line);
      const openings = (line.match(/\{/g) ?? []).length;
      const closings = (line.match(/\}/g) ?? []).length;
      braceDepth += openings - closings;
      if (braceDepth <= 0) {
        blocks.push(current);
        current = null;
        braceDepth = 0;
        flushPending();
      }
      continue;
    }

    if (/^\s*(?:\/\/.*)?$/.test(line)) {
      pendingComments.push(line);
      continue;
    }

    const match = line.match(/^\s*(model|enum|type)\s+(\w+)/);
    if (match) {
      current = {
        kind: match[1],
        name: match[2],
        lines: [...pendingComments, line],
      };
      braceDepth = (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
      if (braceDepth <= 0) {
        blocks.push(current);
        current = null;
        braceDepth = 0;
        flushPending();
      }
    } else {
      flushPending();
    }
  }

  return blocks;
}

async function main() {
  const baseSchema = await readIfExists(BASE_SCHEMA);
  if (!baseSchema) {
    console.warn("⚠️  prisma/schema.prisma not found. Skipping merge.");
    return;
  }

  const declaredNames = new Set(
    extractDeclarativeBlocks(baseSchema).map((block) => block.name),
  );

  const moduleDirs = [path.join(ROOT, "modules")];
  const moduleFiles = (
    await Promise.all(moduleDirs.map((dir) => collectPrismaFragments(dir)))
  ).flat();

  const moduleContents = [];
  for (const file of moduleFiles) {
    const contents = await fs.readFile(file, "utf8");
    const relativePath = path.relative(ROOT, file);
    const blocks = extractDeclarativeBlocks(contents);
    const uniqueBlocks = blocks.filter((block) => {
      if (declaredNames.has(block.name)) {
        return false;
      }
      declaredNames.add(block.name);
      return true;
    });

    if (uniqueBlocks.length > 0) {
      const rendered = uniqueBlocks
        .map((block) => `// source: ${relativePath}\n${block.lines.join("\n").trim()}\n`)
        .join("\n");
      moduleContents.push(rendered);
    }
  }

  const mergedModuleContent = moduleContents.join("\n");
  await fs.writeFile(MODULE_OUTPUT, mergedModuleContent, "utf8");

  const merged = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY.\n// Run \`npm run db:merge\` to re-create it.\n\n${baseSchema.trim()}\n\n${mergedModuleContent}`;
  await fs.writeFile(MERGED_OUTPUT, merged, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
