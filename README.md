# Tiny RPC client/server library over [Socket.IO](http://socket.io/).

Provides the most basic RPC functionality over Socket.IO. It supports invoking remote functions both on server and on 
client. Library is baked on Promises, so every remote call returns Promise of result.

# Requirements

It currently requires Node.js >=4.0.0. Since it utilizes ES6 features. Use `babel` if you want to run it on older 
versions.

# Install

    npm install git+https://git@github.com/NextHub/socket.io-tinyrpc.git
    
# Usage

Server:

	var RPCServer = require('socket.io-tinyrpc');
	
	var server = new RPCServer({
		double: (num) => 2 * num
	});
	
	server.listen(4000);

Client:

	var RPCClient = require('socket.io-tinyrpc/client');
	
	var client = new RPCClient();
	
	client.connect('http://localhost:4001')
		.then((exports) => exports.double(8))
		.then((result) => console.log(result));
