const promisify = require('shared/utils/promisify.base');
const { exec } = require('child_process');
const error = require('shared/utils/error.base.js');

/**
 * Kill all process on port.
 * 
 * @param {Number} port
 * @param {'udp' | 'tcp'} [method = 'tcp']
 */
async function killPort(port, method = 'tcp') {
	let killing, result;

	if (process.platform === 'win32') {
		killing = await promisify(exec, `Get-Net${method === 'udp' ? 'UDP' : 'TCP'}Connection -LocalPort ${port}`).catch(e => '');
	} else {
		killing = await promisify(exec, `lsof -i ${method === 'udp' ? 'udp' : 'tcp'}:${port} | grep ${method === 'udp' ? 'UDP' : 'LISTEN'}`).catch(e => '');
		// killing = await promisify(exec, `lsof -t -i:${port} -s${method === 'udp' ? 'UDP' : 'TCP'}:LISTEN`).catch(e => '');
	}

	if (killing) {
		console.warn('Killing process on port', port, ':\n', killing);

		if (process.platform === 'win32') {
			result = await promisify(exec, `Stop-Process -Id (Get-Net${method === 'udp' ? 'UDP' : 'TCP'}Connection -LocalPort ${port}).OwningProcess -Force`).catch(e => '');
		} else {
			result = await promisify(exec, `kill -9 $(lsof -t -i:${port} -s${method === 'udp' ? 'UDP' : 'TCP'}:LISTEN) && sleep 1s`).catch(e => '');
			// result = await promisify(exec, `lsof -i ${method === 'udp' ? 'udp' : 'tcp'}:${port} | grep ${method === 'udp' ? 'UDP' : 'LISTEN'} | awk '{print $2}' | xargs kill -9 && sleep 1s`).catch(e => '');
		}
	}
}

module.exports = killPort;
