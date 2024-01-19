import * as core from '@actions/core';
import * as fcli from './fcli'
import * as constants from './constants';
//import * as tc from '@actions/tool-cache';
//import * as exec from '@actions/exec';
//import * as fs from 'node:fs';
//import * as crypto from 'node:crypto';
//import * as tool from './tool';

export async function install(toolName: string, version: string) {
    switch(version) {
        case 'skip': break;
        case 'action-default': await installActionDefault(toolName); break;
        default: await installVersion(toolName, version); break;
    }
}

async function installActionDefault(toolName: string) {
    switch(toolName) {
        case 'fcli': await installActionDefaultFcli(); break;
        default: await installVersion(toolName, constants.TOOLS[toolName]['versionAliases']['action-default']); break;
    }
}

async function installActionDefaultFcli() {
    const fcliHelper = await fcli.InternalFcliHelper.instance();
    exportToolPathVariables('fcli', fcliHelper.internalFcliDir);
    exportToolCmdVariable('fcli', fcliHelper.internalFcliCmd);
    
}

async function installVersion(toolName: string, version: string) {
    const fcliHelper = await fcli.InternalFcliHelper.instance();
    const installPath = await fcliHelper.installWithFcli(toolName, version);
    exportToolPathVariables(toolName, installPath);
    const cmd = constants.TOOLS[toolName]["cmds"][process.platform];
    if ( cmd ) {
        exportToolCmdVariable(toolName, core.toPlatformPath(`${installPath}/bin/${cmd}`));
    }
}

function exportToolPathVariables(toolName: string, installPath: string): void {
  if (constants.EXPORT_PATH) {
      core.addPath(`${installPath}/bin`);
  }
  const varBaseName = getEnvVarBaseName(toolName);
  core.exportVariable(varBaseName+'_INSTALL_DIR', core.toPlatformPath(installPath));
  core.exportVariable(varBaseName+'_BIN_DIR', core.toPlatformPath(`${installPath}/bin`));
}

function exportToolCmdVariable(toolName: string, cmd: string) {
    core.exportVariable(`${getEnvVarBaseName(toolName)}_CMD`, cmd);
}

function getEnvVarBaseName(toolName: string) {
    return toolName.toUpperCase().replace('-','_');
}

