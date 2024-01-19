/* eslint-disable @typescript-eslint/no-explicit-any */
//import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';
import StreamZip from 'node-stream-zip';
import * as yaml from 'yaml';
import * as constants from './constants';
import * as fs from 'fs-extra';
import * as crypto from 'node:crypto';

export class InternalFcliHelper {
    constructor(internalFcliDir : string) {
        this.internalFcliDir = internalFcliDir;
        this.internalFcliCmd = this.#getInternalFcliCmd(internalFcliDir);
    }
    internalFcliDir: string;
    internalFcliCmd: string;
    static #instance: InternalFcliHelper|undefined;
    static async instance() : Promise<InternalFcliHelper> {
        if ( !InternalFcliHelper.#instance ) {
            InternalFcliHelper.#instance = await InternalFcliHelper.#createInstance();
        }
        return InternalFcliHelper.#instance;
    }
    static async #createInstance() : Promise<InternalFcliHelper> {
        const toolDefinitions = await ToolDefinitions.load(constants.TOOL_DEFINITIONS);
        const internalFcliDir = await InternalFcliHelper.#downloadAndExtract(toolDefinitions); 
        const internalFcliHelper = new InternalFcliHelper(internalFcliDir);
        await internalFcliHelper.#updateToolDefinitions(toolDefinitions);
        return internalFcliHelper;
    }
    static async #downloadAndExtract(toolDefinitions: ToolDefinitions) : Promise<string> {
        const version = constants.TOOLS['fcli']['versionAliases']['action-default'];
        const versionDescriptors = await toolDefinitions.getVersionDescriptors('fcli');
        const versionDescriptor = versionDescriptors.getVersionDescriptor(version);
        if ( !versionDescriptor ) {
            throw `No tool definition found for fcli ${version}`;
        }
        return await versionDescriptor.downloadAndExtract();
    }
    async run(args: Array<string>) {
        await exec.exec(this.internalFcliCmd, args);
    }
    async installWithFcli(toolName: string, version:string) : Promise<string> {
        const destDir = `${constants.WORK_DIR}/${toolName}/${version}`;
        if ( !fs.existsSync(destDir) ) {
            await this.run(['tool', toolName, 'install', '-v', version, '-d', destDir]);
        }
        return destDir;
    }
    async #updateToolDefinitions(toolDefinitions: ToolDefinitions) : Promise<void> {
        //await this.run(['tool', 'config', 'update', '-f', toolDefinitions.toolDefinitionsZip]);
    }
    #getInternalFcliCmd(internalFcliDir: string) {
        const internalFcliBinDir = `${internalFcliDir}/bin`;
        if (fs.existsSync(`${internalFcliBinDir}/fcli.jar`)) {
            return `java -jar ${internalFcliBinDir}/fcli.jar`;
        } else if (fs.existsSync(`${internalFcliBinDir}/fcli.exe`)) {
            return `${internalFcliBinDir}/fcli.exe`;
        } else if (fs.existsSync(`${internalFcliBinDir}/fcli`)) {
            return `${internalFcliBinDir}/fcli`;
        } else {
            throw `No fcli executable found in ${internalFcliBinDir}`;
        }
    }
}

class ToolDefinitions {
    constructor(toolDefinitionsZip: string) {
        this.toolDefinitionsZip = toolDefinitionsZip;
    }
    toolDefinitionsZip: string;
    async getVersionDescriptors(toolName: string) {
        return await VersionDescriptors.load(this.toolDefinitionsZip, toolName);
    }
    static async load(src: string) : Promise<ToolDefinitions> {
        return new ToolDefinitions(await ToolDefinitions.#downloadToolDefinitions(src));
    }
    static async #downloadToolDefinitions(src: string) {
        const dest = `${constants.WORK_DIR}/tool-definitions/${Buffer.from(src).toString('base64')}.zip`;
        if ( !fs.existsSync(dest) ) {
            await tc.downloadTool(src, dest);
        }
        return dest;
    }
}

class VersionDescriptors {
    constructor(toolName: string, versionDescriptors: Array<VersionDescriptor>) { 
        this.#versionDescriptors = versionDescriptors;
        this.toolName = toolName;
    }
    #versionDescriptors : Array<VersionDescriptor>;
    toolName: string
    static async load(toolDefinitionsZip: string, toolName: string) : Promise<VersionDescriptors> {
        const zip = new StreamZip.async({file: toolDefinitionsZip});
        const data = await zip.entryData(`${toolName}.yaml`);
        await zip.close();
        return new VersionDescriptors(toolName, yaml.parse(data.toString('utf8'))['versions'].map((obj:any)=>new VersionDescriptor(toolName, obj)));
    }
    getVersionDescriptor(version: string) {
        return this.#versionDescriptors.find(v=>v.matches(version));
    }
}

class VersionDescriptor {
    constructor(toolName: string, obj: any) {
        this.toolName = toolName;
        this.version = obj.version;
        this.aliases = obj.aliases;
        this.artifact = this.#getArtifact(obj.artifacts);
    }
    toolName: string;
    version: string;
    aliases: Array<string>;
    artifact: ArtifactDescriptor;
    #getArtifact(obj: any) : ArtifactDescriptor {
        // TODO Type determination is currently fcli-specific (only supporting
        //      x64 and defaulting to java for non-matching platforms); if we
        //      ever want to reuse this code for other tool installations, this
        //      will need to be updated.
        const type = `${process.platform}/x64`;
        const artifactObj = obj[type] ? obj[type] : obj['java'];
        if ( !artifactObj ) { throw `No suitable installation candidate found for ${type}`; }
        const result = Object.assign(new ArtifactDescriptor, artifactObj);
        result.toolName = this.toolName;
        return result;
    }
    matches(version: string) {
        return this.version==version || this.aliases.find(alias=>alias==version);
    }
    async downloadAndExtract() {
        return await this.artifact.downloadAndExtract();
    }
}

class ArtifactDescriptor {
    toolName: string = "";
    name: string = "";
    downloadUrl: string = "";
    rsa_sha256: string = "";
    async downloadAndExtract() {
        const destDir = this.getDestDir();
        if ( !fs.existsSync(destDir) || fs.readdirSync(destDir).length === 0 ) {
            const binDir = `${destDir}/bin`;
            const file = await tc.downloadTool(this.downloadUrl);
            await this.#verify(file);
            if ( this.downloadUrl.endsWith(".zip") ) {
                await tc.extractZip(file, binDir);
            } else if ( this.downloadUrl.endsWith(".tgz") ) {
                await tc.extractTar(file, binDir);
            } else if (this.downloadUrl.endsWith(".jar") ) {
                await fs.ensureDir(binDir);
                await fs.copyFile(file, `${binDir}/${this.name}`);
            } else {
                throw `Unexpected file extension in download URL ${this.downloadUrl}`;
            }
            await fs.rm(file);
        }
        return destDir;
    }
    getDestDir() : string {
        return `${constants.WORK_DIR}/${this.toolName}/${Buffer.from(this.downloadUrl).toString('base64')}`;
    }
    async #verify(file: string) {
        const verifier = crypto.createVerify('RSA-SHA256');
        const readable = fs.createReadStream(file);
        // For some reason, readable.pipe(verifier) doesn't work
        for await (const chunk of readable) {
            verifier.update(chunk);
        }
        if (!verifier.verify(constants.TOOL_DEFINITIONS_PUBLIC_KEY, this.rsa_sha256, 'base64')) {
            console.log(constants.TOOL_DEFINITIONS_PUBLIC_KEY)
            console.log(this.rsa_sha256)
            throw `File signature verification failed for ${this.downloadUrl}`;
        }
    }
}