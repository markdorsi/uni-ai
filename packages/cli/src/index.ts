#!/usr/bin/env node

import { Command } from 'commander'
import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import { createProject } from './create.js'
import { getTemplates } from './templates.js'

const program = new Command()

program
  .name('create-uni-ai-app')
  .description('Create a new Uni AI application')
  .version('0.1.0')
  .argument('[project-name]', 'Name of the project to create')
  .option('-t, --template <template>', 'Template to use (nextjs, express, netlify)')
  .option('--skip-install', 'Skip npm install')
  .option('--skip-git', 'Skip git initialization')
  .action(async (projectName, options) => {
    console.log(chalk.bold.cyan('\n🤖 Welcome to Uni AI SDK!\n'))
    console.log(chalk.gray('  Secure. Portable. Open.\n'))

    // Get project name if not provided
    if (!projectName) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          default: 'my-uni-ai-app',
          validate: (input) => {
            if (/^[a-z0-9-]+$/.test(input)) return true
            return 'Project name must contain only lowercase letters, numbers, and hyphens'
          },
        },
      ])
      projectName = answers.projectName
    }

    // Get template if not provided
    let template = options.template
    if (!template) {
      const templates = getTemplates()
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'template',
          message: 'Which template would you like to use?',
          choices: templates.map((t) => ({
            name: `${t.emoji} ${t.name} - ${t.description}`,
            value: t.id,
          })),
        },
      ])
      template = answers.template
    }

    // Get model preference
    const modelAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'model',
        message: 'Which AI model do you plan to use?',
        choices: [
          { name: 'GPT-4 (OpenAI)', value: 'gpt-4' },
          { name: 'GPT-3.5 Turbo (OpenAI)', value: 'gpt-3.5-turbo' },
          { name: 'Claude 3.5 Sonnet (Anthropic)', value: 'claude-3-5-sonnet' },
          { name: "I'll decide later", value: 'none' },
        ],
      },
    ])

    // Get API key
    let apiKey: string | undefined
    if (modelAnswers.model !== 'none') {
      const isOpenAI = modelAnswers.model.startsWith('gpt')
      const provider = isOpenAI ? 'OpenAI' : 'Anthropic'

      const keyAnswers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'provideKey',
          message: `Do you have a ${provider} API key to configure now?`,
          default: false,
        },
      ])

      if (keyAnswers.provideKey) {
        const keyInput = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: `Enter your ${provider} API key:`,
            mask: '*',
          },
        ])
        apiKey = keyInput.apiKey
      }
    }

    // Create the project
    const spinner = ora('Creating your project...').start()

    try {
      await createProject({
        projectName,
        template,
        model: modelAnswers.model,
        apiKey,
        skipInstall: options.skipInstall,
        skipGit: options.skipGit,
      })

      spinner.succeed(chalk.green('Project created successfully!'))

      // Success message
      console.log(chalk.bold('\n✨ Your Uni AI app is ready!\n'))
      console.log(chalk.gray('Next steps:\n'))
      console.log(chalk.cyan(`  cd ${projectName}`))

      if (!apiKey && modelAnswers.model !== 'none') {
        console.log(chalk.cyan(`  # Add your API key to .env`))
      }

      if (options.skipInstall) {
        console.log(chalk.cyan(`  npm install`))
      }

      console.log(chalk.cyan(`  npm run dev`))
      console.log()
      console.log(chalk.gray('Documentation: https://github.com/uni-ai/sdk'))
      console.log()
    } catch (error) {
      spinner.fail(chalk.red('Failed to create project'))
      console.error(error)
      process.exit(1)
    }
  })

program.parse()
