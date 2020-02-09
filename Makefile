install: install-deps

develop:
	npx webpack-dev-server

install-deps:
	npm install

build:
	rm -rf public
	NODE_ENV=production npx webpack

lint:
	npx eslint .

publish:
	npm publish --dry run

.PHONY: test
