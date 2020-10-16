import chalk from 'chalk';
import fs from 'fs';
import ncp from "ncp";
import path from 'path';
import { promisify } from "util";
import Listr from 'listr';
import execa from 'execa';
// 执行npm install 
import { projectInstall } from 'pkg-install';

const access = promisify(fs.access);
const copy = promisify(ncp);

// copy 文件
async function copyTemplateFiles(options) {
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false,
    });
};
// 执行 git init 
async function initGit(params) {
    const result = await execa('git', ['init'], {
        cwd: params.targetDirectory
    });
    if (result.failed) {
        return Promise.reject(new Error('Failed to initialize git'));
    };
    return;
}
// 返回一个创建 项目的命令
export async function createProject(options) {
    options = {
        ...options,
        targetDirectory: options.targetDirectory || process.cwd()
    }
    const currentFileUrl = import.meta.url;
    console.log('currentFileUrl', currentFileUrl);
    const templateDir = path.resolve(
        new URL(currentFileUrl).pathname,
        '../../templates',
        options.template
    );
    options.templateDirectory = templateDir;
    console.log(templateDir);
    try {
        await access(templateDir, fs.constants.R_OK);
    } catch (err) {
        console.error('%s Invalid template name', chalk.red.bold('ERROR'));
        process.exit(1);
    }
    console.log('Copy project files');
    // 这是一个执行栈 会一次执行里面的每一个对象
    const task = new Listr([{
        title: 'Copy project files',
        task: () => copyTemplateFiles(options)
    }, {
        title: 'Initialize git',
        task: () => initGit(options),
        enabled:() => options.git,
        },
    {
        title: 'Initialize dependencies',
        task: () =>
            projectInstall({
                cwd: options.targetDirectory,
            }),
        skip: () =>
            !options.runInstall
                ? 'Pass --install to automatically install dependencies'
                : undefined,
    }]);
    await task.run();
    console.log('%s Project ready', chalk.green.bold('DONE'));
    return true;
}
