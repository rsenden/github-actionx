import * as core from '@actions/core';
import * as installer from './installer';
import * as constants from './constants';


/**
 * Main entrypoint for this GitHub Action. This function installs a fixed fcli
 * version for internal use, then iterates over the available tools to install
 * them if applicable.
 */
async function main(): Promise<void> {
	try {
        for ( const toolName of Object.keys(constants.TOOLS)) {
            await installer.install(toolName, constants.getOrDefault(core.getInput(toolName), 'skip'));
        }
	} catch (err) {
		core.setFailed("Action failed with error: " + err);
	}
}

main();
