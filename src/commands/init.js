import Creator from '../models/Creator'
import path from 'path'

export default function init (program) {
  program
    .command('init [projectName]')
    .description('选择模板创建项目')
    .action((projectName, options) => {
      const inCurrent = projectName === '.' // 输入"."则在当前文件夹初始化项目
      const name = inCurrent ? path.relative('../', process.cwd()) : projectName // 获取项目名，如果早当前文件夹创建，则取当前文件夹名称
      const destDir = path.resolve(process.cwd(), projectName || '.') // 目标文件夹
      new Creator(name, destDir).create(options) // 开始初始化
    })
}
