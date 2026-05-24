import { execSync } from 'child_process'

function run(command) {
  console.log(`Running: ${command}`)
  execSync(command, { stdio: 'inherit' })
}

try {
  run('npm run build')
  run('npx vercel --prod --yes')
  console.log('✅ Vercel deployment finished successfully.')
} catch (error) {
  console.error('❌ Vercel deployment failed.')
  if (error instanceof Error) {
    console.error(error.message)
  }
  process.exit(1)
}
