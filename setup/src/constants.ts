import * as core from '@actions/core';

// IMPORTANT: When updating "action-default" versions in the TOOLS record,
//            please make sure to update any corresponding version numbers 
//            in doc-resources/template-values.md accordingly to allow for 
//            proper version-specific links in the action documentation.  
export const TOOLS: Record<string, Record<string, Record<string, string>>> = {
    "fcli": { 
        "versionAliases": {"action-default": "2.1.0"},
        "cmds": {"win32": "fcli.exe", "linux": "fcli", "darwin": "fcli"}
    },
    "sc-client": { 
        "versionAliases": {"action-default": "23.1.0"},
        "cmds": {"win32": "scancentral.bat", "linux": "scancentral", "darwin": "scancentral"}
    },
    "vuln-exporter": { 
        "versionAliases": {"action-default": "2.0.4"},
        "cmds": {"win32": "FortifyVulnerabilityExporter.bat", "linux": "FortifyVulnerabilityExporter", "darwin": "FortifyVulnerabilityExporter"}
    },
    "fod-uploader": { 
        "versionAliases": {"action-default": "5.4.0"},
        "cmds": {"win32": "FoDUploader.bat", "linux": "FoDUploader", "darwin": "FoDUploader"}
    },
    "bugtracker-utility": { 
        "versionAliases": {"action-default": "4.12"},
        "cmds": {"win32": "FortifyBugTrackerUtility.bat", "linux": "FortifyBugTrackerUtility", "darwin": "FortifyBugTrackerUtility"}
    }
};
export const TOOL_VERSIONS = Object.keys(TOOLS)
    .reduce((map,toolName)=>map.set(toolName, getOrDefault(core.getInput(toolName), 'skip')), new Map());
export const EXPORT_PATH = core.getBooleanInput('export-path');
export const TOOL_DEFINITIONS = getOrDefault(core.getInput('tool-definitions'), 
    getOrDefault(process.env['TOOL_DEFINITIONS'], 'https://raw.githubusercontent.com/fortify/tool-definitions/main/v1/tool-definitions.yaml.zip'));
export const WORK_DIR = `${process.env['RUNNER_TEMP']}/fortify`

export const TOOL_DEFINITIONS_PUBLIC_KEY = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArij9U9yJVNc53oEMFWYp
NrXUG1UoRZseDh/p34q1uywD70RGKKWZvXIcUAZZwbZtCu4i0UzsrKRJeUwqanbc
woJvYanp6lc3DccXUN1w1Y0WOHOaBxiiK3B1TtEIH1cK/X+ZzazPG5nX7TSGh8Tp
/uxQzUFli2mDVLqaP62/fB9uJ2joX9Gtw8sZfuPGNMRoc8IdhjagbFkhFT7WCZnk
FH/4Co007lmXLAe12lQQqR/pOTeHJv1sfda1xaHtj4/Tcrq04Kx0ZmGAd5D9lA92
8pdBbzoe/mI5/Sk+nIY3AHkLXB9YAaKJf//Wb1yiP1/hchtVkfXyIaGM+cVyn7AN
VQIDAQAB
-----END PUBLIC KEY-----`;

export function getOrDefault(value: string|undefined, def: string) {
    return value && value.trim()!=''  ? value : def;
}