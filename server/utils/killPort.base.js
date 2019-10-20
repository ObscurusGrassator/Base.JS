const sh = require('shell-exec');
const error = require('shared/utils/error.base.js');

/**
 * Kill all process on port.
 * 
 * @param {Number} port
 * @param {'udp' | 'tcp'} method
 */
async function killPort(port, method = 'tcp') {
	let killing, result;

	if (process.platform === 'win32') {
		killing = await sh(`Get-Net${method === 'udp' ? 'UDP' : 'TCP'}Connection -LocalPort ${port}`);
		result = await sh(`Stop-Process -Id (Get-Net${method === 'udp' ? 'UDP' : 'TCP'}Connection -LocalPort ${port}).OwningProcess -Force`);
	} else {
		killing = await sh(`lsof -i ${method === 'udp' ? 'udp' : 'tcp'}:${port} | grep ${method === 'udp' ? 'UDP' : 'LISTEN'}`);
		result = await sh(`lsof -i ${method === 'udp' ? 'udp' : 'tcp'}:${port} | grep ${method === 'udp' ? 'UDP' : 'LISTEN'} | awk '{print $2}' | xargs kill -9 && sleep 1s`);
	}

	if (killing.stdout) {
		console.warn('Killing process on port', port, ':\n', killing.stdout);
	}
	if (result.stderr) {
		return Promise.reject(error(result.cmd + ':\n' + result.stderr));
	}
}

module.exports = killPort;
