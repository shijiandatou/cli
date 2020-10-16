// arg 是用来解析参数的
// import arg from 'arg';
// 解析 参数用的
import commander from 'commander';
import { createProject } from './main';
import { version } from "./content";
const program = commander.program;

// 解析参数的函数
// function parseArgumentIntoOptions(params) {
//     console.log(params);
//     const args = arg({
//         '--git': Boolean,
//         '--yes': Boolean,
//         '--install': Boolean,
//         '-g': '--git',
//         '-y': '--yes',
//         '-i': '--install'
//     },
//     {
//         argv: params.slice(2),
//     });
//     console.log('args', args);
//     return {
//         skipPrompts: args['--yes'] || false,
//         git: args['--git'] || false,
//         template: args._[0],
//         runInstall:args['--install'] || false
//     }
// }
// 和用户进行交互
// async function promptForMissingOptions(options) {
//     const defaultTemplate = 'JavaScript';
//     // 与用户交互的问题
//     const question = [];
//     // 如果有就用默认的 不进行询问
//     if (options.skipPrompts) {
//         return {
//             ...options,
//             template: options.template || defaultTemplate,
//         }
//     }
//     console.log(options);
    
//     // 如果没有跳过 就问用户
//     if (!options.template) {
//         question.push({
//             type: 'list', // 选择
//             name: 'template',
//             message: 'Please choose which project template to use',
//             choices: ['JavaScript', 'TypeScript'],
//             default: defaultTemplate,
//         }) 
//     }
//     if (!options.git) {
//         question.push({
//             type: 'confirm', // 确定
//             name: 'git',
//             message: 'Initialize a git repository?',
//             default: false,
//         })
//     };
//     const answer = await inquirer.prompt(question);
//     return {
//         ...options,
//         template: options.template || answer.template,
//         git: options.git || answer.git
//     }
// }
const ask = {
    // 创建的命令
    create: {
        command: 'create <project-name>',
        alias: 'c',
        description: 'create a project',
        examples:['fe-cli create <project-name> [options]']
    },
    '*': {
        command:'*',
        alias: '',
        description: 'command not found',
        examples:[]
   }
}
// 脚手架的入口
export async function cli() {
    program
        .command('create <projectName>')
        .alias('c')
        .option('-g, --git', 'Initialize git')
        .option('-y, --yes', 'Default project')
        .option('-i, --install', 'Initialize dependencies')
        .description('create a project')
        .action((projectName, cmdObj) => {
            const options = {
                name: projectName,
                git: cmdObj.git || false,
                yes: cmdObj.yes || false,
                install: cmdObj.install || false
            }
            require('./create.js')(options)
        });
    program
        .command('*')
        .description('command not found')
        .action((s) => {
            console.log('command not found');
        })
    // Object.keys(ask).forEach(action => {
    //     console.log(process.argv);
    //     program
    //         .command(ask[action].command)
    //         .alias(ask[action].alias)
    //         .option('-g, --git', 'Initialize git')
    //         .option('-y, --yes', 'Default project')
    //         .option('-i, --install', 'Initialize dependencies')
    //         .description(ask[action].description)
    //         .arguments('<cmd> [env]')
    //         .action((cmd, env) => {
    //             console.log(cmd, env);
    //             if (action === '*') {
    //                 console.log(ask[action].description);
    //             } else {
    //                 // require('')
    //             }
    //         })
  
    // })
    // 获取版本
    program.version(version);
    program.on('--help', () => {
        console.log('\nExamples:');
        Object.keys(ask).forEach(action => { 
            ask[action].examples.forEach(item => {
                console.log(item);
            })
        })
    })
    // 解析参数
    // program
    //     .option('-t, --git', 'git init');
    program.parse(process.argv);
    
    // let options = parseArgumentIntoOptions(args);
    // options = await promptForMissingOptions(options);
    // await createProject(options)
    // console.log('args', options);
}