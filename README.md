# Tiny RPC client/server library over [Socket.IO](http://socket.io/).

**DISCLAIMER** This library is experimental. Use at your own risk.

Provides the most basic RPC functionality over Socket.IO. It supports invoking remote functions both on server and on 
client. Library is baked on Promises, so every remote call returns Promise of result.

# Requirements

It currently requires Node.js >=4.0.0. Since it utilizes ES6 features. Use `babel` if you want to run it on older 
versions of Node.js.

# Install

    npm install git+https://git@github.com/NextHub/socket.io-tinyrpc.git
    
# Usage

### Server

	var RPCServer = require('socket.io-tinyrpc');
	
	var server = new RPCServer({
		double: (num) => 2 * num
	});
	
	server.listen(4000);

### Client

	var RPCClient = require('socket.io-tinyrpc/client');
	
	var client = new RPCClient();
	
	client.connect('http://localhost:4001')
		.then((exports) => exports.double(8))
		.then((result) => console.log(result));

### Browser

Browser build requires following points to be satisfied:

- `socket.io-client` as an `io` global variable (if you're using AMD modules just install it as dependency)
- `Promise` implementation as a `Promise` global variable
- ES6 `Map` implementation as a `Map` global variable

See `examples/` folder for examples.
