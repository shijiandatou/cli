import Inquirer from "inquirer";
import path from 'path';
import Listr from 'listr';
import shell from 'shelljs';
import execa from 'execa';
import ncp from "ncp";
import fs from 'fs'
import { promisify } from "util";
import MetalSmith from 'metalsmith';
import consolidate from 'consolidate';
const { render } = consolidate.ejs;

const copy = promisify(ncp);
const renderContent = promisify(render);111111
// 执行 git init 
async function initGit() {
    const result = await execa('git', ['init']);
    if (result.failed) {
        return Promise.reject(new Error('Failed to initialize git'));
    };
    return;
}
async function installProject() {
    await execa('npm', ['install']);
    return
}
// copy 文件
async function copyTemplateFiles(options) {
    return copy(options.templateDir, options.targetDirectory);
};
// 解析options
async function parseArgumentIntoOptions(options) {
    const yes = options.yes;
    // 默认用的是 js模板 
    const defaultTemplate = 'JavaScript';
    const question = [];
    if (yes) {
        return {
            ...options,
            template: defaultTemplate
        }
    }
    // TODO 增加模板 ts 

    // 是否初始化 git
    if (!options.git) {
        question.push({
            type: 'confirm',
            name: 'git',
            message: 'Initialize a git repository?',
            default: false,
        }) 
    }
    const answer = await Inquirer.prompt(question);
    return {
        ...options,
        git: answer.git || options.git,
        install: answer.install || options.install,
        template: defaultTemplate
    }
};
async function listFunc({ params, templateDir}) {
    // 这是一个执行栈 会一次执行里面的每一个对象
    const task = new Listr([{
        title: 'Copy Files',
        task: () => copyTemplateFiles({ templateDir, targetDirectory: process.cwd() })
    },
    {
        title: 'Initialize git',
        task: () => initGit(),
        enabled: () => params.git,
    },
    {
        title: 'Initialize dependencies',
        task: () => installProject(),
    }]);
    await task.run();
}
async function create(params) {
    // 首先是copy templates 下的模板 import.meta.url
    const templateUrl = new URL(import.meta.url).pathname;
    // 存放 模板的位置
    const templateDir = path.resolve(
        templateUrl,
        '../../templates',
        params.template.toLowerCase()
    );
    shell.rm('-rf', `${templateDir}/node_modules`);
    shell.mkdir(params.name);
    // // 进入项目中 进行初始化
    shell.cd(params.name);
    // 如果有ask 就是复杂模板 先填写用户信息 在进行拷贝
    if (fs.existsSync(path.join(templateDir, 'ask.js'))) {
        // 如果存在 ask.js 就不用ncp 进行copy了 
        listArr.shift();
        await new Promise((resolve, rejects) => {
            MetalSmith(__dirname)
                .source(templateDir)
                .destination(process.cwd())
                .use(async (files, metal, done) => {
                    const asks = require(path.join(templateDir, 'ask.js'));
                    const answer = await Inquirer.prompt(asks);
                    const metalObj = metal.metadata();
                    Object.assign(metalObj, answer);
                    delete files['ask.js'];
                    done()
                })
                .use((files, metal, done) => {
                    const obj = metal.metadata();
                    Object.keys(files).forEach(async (file) => {
                        if (file.includes('js') || file.includes('json')) {
                            // 文件内容
                            let content = files[file].contents.toString();
                            if (content.includes('<%=')) {
                                // 渲染
                                content = await renderContent(content, obj);
                                // 替换文件内容
                                files[file].contents = Buffer.from(content)
                            }
                        }
                    });
                    done();
                })
                .build(function (err) {
                    if (err) throw err;
                    resolve();
                });
        })
    }
    listFunc({ params, templateDir });
}
module.exports = async (options) => {
    // 解析参数函数
    let result = await parseArgumentIntoOptions(options);
    // 解析后 拿到参数 开始创建 项目
    create(result);
};
