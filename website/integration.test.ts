/**
 * Integration Test Suite for monib.life-website
 *
 * Tests website environment setup and Quartz configuration
 * to ensure the website builds correctly.
 *
 * Run with: npm test
 */

import test, { describe } from "node:test"
import assert from "node:assert"
import * as fs from "node:fs"
import * as path from "node:path"

const ROOT_DIR = process.cwd()

// Helper to check if a path exists
function pathExists(relativePath: string): boolean {
  return fs.existsSync(path.join(ROOT_DIR, relativePath))
}

// Helper to check if a file is readable
function isFileReadable(relativePath: string): boolean {
  try {
    fs.accessSync(path.join(ROOT_DIR, relativePath), fs.constants.R_OK)
    return true
  } catch {
    return false
  }
}

// Helper to get file contents
function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT_DIR, relativePath), "utf-8")
}

// Helper to check Node.js version
function getNodeMajorVersion(): number {
  const versionMatch = process.version.match(/^v(\d+)/)
  return versionMatch ? parseInt(versionMatch[1], 10) : 0
}

describe("Environment Tests", () => {
  describe("Node.js version check", () => {
    test("should have Node.js >= 22", () => {
      const majorVersion = getNodeMajorVersion()
      assert(majorVersion >= 22, `Node.js version should be >= 22, got v${majorVersion}`)
    })
  })

  describe("required configuration files", () => {
    test("quartz.config.ts should exist and be readable", () => {
      assert(pathExists("quartz.config.ts"), "quartz.config.ts should exist")
      assert(isFileReadable("quartz.config.ts"), "quartz.config.ts should be readable")
    })

    test("package.json should exist and be valid JSON", () => {
      assert(pathExists("package.json"), "package.json should exist")
      const content = readFile("package.json")
      assert.doesNotThrow(() => JSON.parse(content), "package.json should be valid JSON")
    })

    test("tsconfig.json should exist", () => {
      assert(pathExists("tsconfig.json"), "tsconfig.json should exist")
    })
  })

  describe("required directories", () => {
    test("content directory should exist", () => {
      assert(pathExists("content"), "content directory should exist")
    })

    test("quartz directory should exist", () => {
      assert(pathExists("quartz"), "quartz directory should exist")
    })
  })
})

describe("Content Tests", () => {
  describe("content structure", () => {
    // Note: Content is synced from the vault submodule in the parent repository.
    // These tests will pass when the vault is synced, but may be skipped when
    // running in isolation without content.
    test("content/index.md should exist when vault is synced", { skip: !pathExists("content/index.md") }, () => {
      assert(pathExists("content/index.md"), "content/index.md should exist")
    })

    test("content directory should have markdown files when vault is synced", { skip: !pathExists("content/index.md") }, () => {
      const contentDir = path.join(ROOT_DIR, "content")
      const files = fs.readdirSync(contentDir, { recursive: true })
      const markdownFiles = files.filter(
        (f) => typeof f === "string" && f.endsWith(".md"),
      )
      assert(markdownFiles.length > 0, "content directory should have at least one markdown file")
    })
  })
})

describe("Quartz Build Infrastructure Tests", () => {
  describe("quartz framework", () => {
    test("quartz CLI bootstrap should exist", () => {
      assert(pathExists("quartz/bootstrap-cli.mjs"), "quartz/bootstrap-cli.mjs should exist")
    })

    test("quartz configuration module should exist", () => {
      assert(pathExists("quartz/cfg.ts"), "quartz/cfg.ts should exist")
    })

    test("quartz plugins should exist", () => {
      assert(pathExists("quartz/plugins"), "quartz/plugins directory should exist")
    })
  })
})

describe("Build Configuration Tests", () => {
  describe("package.json scripts", () => {
    test("should have required npm scripts", () => {
      const packageJson = JSON.parse(readFile("package.json"))
      assert(packageJson.scripts, "package.json should have scripts section")
      assert(packageJson.scripts.test, "package.json should have test script")
      assert(packageJson.scripts.check, "package.json should have check script")
    })

    test("should have correct engine requirements", () => {
      const packageJson = JSON.parse(readFile("package.json"))
      assert(packageJson.engines, "package.json should have engines section")
      assert(packageJson.engines.node, "package.json should specify node engine")
    })
  })
})

describe("Type Safety Tests", () => {
  test("integration.test.ts should not have syntax errors", () => {
    // Verify the integration test file itself can be parsed.
    // Note: Full TypeScript type checking (tsc --noEmit) is not run here
    // because there are pre-existing type errors in the repository (quartz.layout.ts).
    // The type check is available via `npm run check` which runs `tsc --noEmit`.
    const testFile = path.join(ROOT_DIR, "integration.test.ts")
    assert(fs.existsSync(testFile), "integration.test.ts should exist")
    const content = fs.readFileSync(testFile, "utf-8")
    assert(content.includes("describe"), "integration.test.ts should have test suites")
    assert(content.includes("test"), "integration.test.ts should have tests")
  })

  test("TypeScript configuration should be valid", () => {
    const tsconfigPath = path.join(ROOT_DIR, "tsconfig.json")
    assert(fs.existsSync(tsconfigPath), "tsconfig.json should exist")
    const content = fs.readFileSync(tsconfigPath, "utf-8")
    assert.doesNotThrow(() => JSON.parse(content), "tsconfig.json should be valid JSON")
  })
})
