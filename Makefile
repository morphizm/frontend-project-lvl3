install: install-deps install-flow-typed

develop:
	npx webpack-dev-server

install-deps:
	npm install

build:
	rm -rf dist
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint .

start:
	npx babel-node src/bin/gendiff.js

publish:
	npm publish --dry run

test-coverage:
	npm test -- --coverage

.PHONY: test
