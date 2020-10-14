// arg 是用来解析参数的
import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main'
// 解析参数的函数
function parseArgumentIntoOptions(params) {
    console.log(params);
    const args = arg({
        '--git': Boolean,
        '--yes': Boolean,
        '--install': Boolean,
        '-g': '--git',
        '-y': '--yes',
        '-i': '--install'
    },
    {
        argv: params.slice(2),
    });
    console.log('args', args);
    return {
        skipPrompts: args['--yes'] || false,
        git: args['--git'] || false,
        template: args._[0],
        runInstall:args['--install'] || false
    }
}
// 和用户进行交互
async function promptForMissingOptions(options) {
    const defaultTemplate = 'JavaScript';
    // 与用户交互的问题
    const question = [];
    // 如果有就用默认的 不进行询问
    if (options.skipPrompts) {
        return {
            ...options,
            template: options.template || defaultTemplate,
        }
    }
    // 如果没有跳过 就问用户
    if (!options.template) {
        question.push({
            type: 'list', // 选择
            name: 'template',
            message: 'Please choose which project template to use',
            choices: ['JavaScript', 'TypeScript'],
            default: defaultTemplate,
        }) 
    }
    if (!options.git) {
        question.push({
            type: 'confirm', // 确定
            name: 'git',
            message: 'Initialize a git repository?',
            default: false,
        })
    };
    const answer = await inquirer.prompt(question);
    return {
        ...options,
        template: options.template || answer.template,
        git: options.git || answer.git
    }
}
export async function cli(args) {
    let options = parseArgumentIntoOptions(args);
    options = await promptForMissingOptions(options);
    await createProject(options)
    console.log('args', options);
}