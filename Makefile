BABEL = ./node_modules/babel/bin/babel.js

default: dist

dist: src
	@mkdir -p dist/
	$(BABEL) ./index.js --out-dir ./dist
	$(BABEL) ./config --out-dir ./dist/config
	$(BABEL) ./src --out-dir ./dist/src

clean:
	-rm -rf dist