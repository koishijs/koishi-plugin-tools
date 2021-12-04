import { Context, Logger, Quester } from 'koishi'

const logger = new Logger('glot')

const LANGUAGES = [
  'assembly', 'ats', 'bash', 'c', 'clojure', 'cobol', 'coffeescript', 'cpp', 'crystal', 'csharp',
  'd', 'elixir', 'elm', 'erlang', 'fsharp', 'go', 'groovy', 'haskell', 'idris', 'java', 'javascript',
  'julia', 'kotlin', 'lua', 'mercury', 'nim', 'nix', 'ocaml', 'perl', 'php', 'python', 'raku',
  'ruby', 'rust', 'scala', 'swift', 'typescript',
]

const GLOT_BASE = 'https://glot.io/api';

async function run(http: Quester, language: string, code: string) {
  try {
    return await http.post(`/run/${language}/latest`, {
      files: [{
        name: 'koishi',
        content: code,
      }]
    })
  } catch(e) {
    logger.error(e)
    return null
  }
}

export interface GlotOptions {
  apiToken: string
  defaultLanguage: string
}

export const name = 'glot'

export function apply(ctx: Context, options: GlotOptions) {
  const pluginOptions = {
    defalutLanguage: 'javascript',
    ...options
  }
  const http = ctx.http.extend({
    endpoint: GLOT_BASE,
    headers: {
      'Authorization': `Token ${options.apiToken}`,
    }
  })
  ctx.command('glot <code:rawtext>', '运行代码')
    .usage(`由 glot.io 提供的代码运行\n支持的语言: ${LANGUAGES.join(', ')}`)
    .option('language', '-l <language:string>')
    .example("glot console.log('Hello World!')")
    .action(async ({ options }, code) => {
      const language = options.language ?? pluginOptions.defaultLanguage
      if (!LANGUAGES.includes(language)) {
        return '不支持的语言。'
      }
      const res = await run(http, language, code)
      if (!res) {
        return '请求出错。'
      }
      if (res.error) {
         return `运行出错: ${res.error}\n${res.stderr}`
      }
      return res.stdout + res.stderr
    })
}