const sh = require('shell-exec');
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
		killing = await sh(`Get-Net${method === 'udp' ? 'UDP' : 'TCP'}Connection -LocalPort ${port}`);
	} else {
		killing = await sh(`lsof -i ${method === 'udp' ? 'udp' : 'tcp'}:${port} | grep ${method === 'udp' ? 'UDP' : 'LISTEN'}`);
		// killing = await sh(`lsof -t -i:${port} -s${method === 'udp' ? 'UDP' : 'TCP'}:LISTEN`);
	}

	if (killing.stdout) {
		console.warn('Killing process on port', port, ':\n', killing.stdout);

		if (process.platform === 'win32') {
			result = await sh(`Stop-Process -Id (Get-Net${method === 'udp' ? 'UDP' : 'TCP'}Connection -LocalPort ${port}).OwningProcess -Force`);
		} else {
			// result = await sh(`lsof -i ${method === 'udp' ? 'udp' : 'tcp'}:${port} | grep ${method === 'udp' ? 'UDP' : 'LISTEN'} | awk '{print $2}' | xargs kill -9 && sleep 1s`);
			result = await sh(`kill -9 $(lsof -t -i:${port} -s${method === 'udp' ? 'UDP' : 'TCP'}:LISTEN) && sleep 1s`);
		}
	}
	if (result && result.stderr) {
		return Promise.reject(error(result.cmd + ':\n' + result.stderr));
	}
}

module.exports = killPort;
