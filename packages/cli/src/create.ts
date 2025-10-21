import { exec } from 'child_process'
import { promisify } from 'util'
import { mkdir, writeFile, cp } from 'fs/promises'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const execAsync = promisify(exec)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export interface CreateProjectOptions {
  projectName: string
  template: string
  model?: string
  apiKey?: string
  skipInstall?: boolean
  skipGit?: boolean
}

export async function createProject(options: CreateProjectOptions) {
  const { projectName, template, model, apiKey, skipInstall, skipGit } = options

  // Create project directory
  const projectPath = resolve(process.cwd(), projectName)
  await mkdir(projectPath, { recursive: true })

  // Get the repository root (3 levels up from dist/create.js)
  const repoRoot = resolve(__dirname, '../../../..')
  const templatePath = join(repoRoot, 'examples', `${getTemplateName(template)}`)

  // Copy template files
  await cp(templatePath, projectPath, {
    recursive: true,
    filter: (src) => {
      // Skip node_modules, .next, dist, and other build artifacts
      const skipDirs = ['node_modules', '.next', 'dist', '.netlify', '.turbo']
      return !skipDirs.some((dir) => src.includes(dir))
    },
  })

  // Create .env file with API key if provided
  if (apiKey && model) {
    const isOpenAI = model.startsWith('gpt')
    const envKey = isOpenAI ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY'
    const envContent = `${envKey}=${apiKey}\n`

    await writeFile(join(projectPath, '.env'), envContent)
  }

  // Update package.json name
  const packageJsonPath = join(projectPath, 'package.json')
  try {
    const packageJson = await import(packageJsonPath, { assert: { type: 'json' } })
    packageJson.default.name = projectName
    await writeFile(packageJsonPath, JSON.stringify(packageJson.default, null, 2))
  } catch (error) {
    // If import fails, try reading and writing as text
    const fs = await import('fs/promises')
    const content = await fs.readFile(packageJsonPath, 'utf-8')
    const pkg = JSON.parse(content)
    pkg.name = projectName
    await fs.writeFile(packageJsonPath, JSON.stringify(pkg, null, 2))
  }

  // Install dependencies
  if (!skipInstall) {
    await execAsync('npm install', { cwd: projectPath })
  }

  // Initialize git
  if (!skipGit) {
    try {
      await execAsync('git init', { cwd: projectPath })
      await execAsync('git add .', { cwd: projectPath })
      await execAsync('git commit -m "Initial commit from create-uni-ai-app"', {
        cwd: projectPath,
      })
    } catch (error) {
      // Git init is optional, so we don't fail if it doesn't work
    }
  }
}

function getTemplateName(template: string): string {
  const map: Record<string, string> = {
    nextjs: 'nextjs-chat',
    express: 'express-api',
    netlify: 'netlify-chat',
  }
  return map[template] || template
}
