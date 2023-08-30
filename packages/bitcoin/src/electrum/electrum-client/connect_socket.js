'use strict';

const connectSocket = (conn, port, host) => {
	return new Promise((resolve) => {
		const errorHandler = (e) => resolve({ error: true, data: e })
		conn.connect(port, host, () => {
			conn.removeListener('error', errorHandler);
			resolve({ error: false, data: { port, host } })
		});
		conn.on('error', errorHandler)
	})
};


module.exports = connectSocket
