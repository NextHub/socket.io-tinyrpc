BROWSERIFY := node_modules/.bin/browserify
JSHINT := node_modules/.bin/jshint
MOCHA := node_modules/.bin/mocha

all:
	@mkdir -p ./dist/
	@echo "// socket.io-tinyrpc-`node -pe \"require('./package.json').version\"`\n" \
		"`$(BROWSERIFY) ./lib/client \
		    --transform babelify \
			--exclude bluebird \
			--exclude socket.io-client \
			--standalone TinyRPCClient`" > ./dist/socket.io-tinyrpc.js

clean:
	@rm -rf dist/

test: lint test-unit

lint:
	@$(JSHINT) -e es6 lib/ test/

test-unit:
	@$(MOCHA) --recursive -r ./test/init

