let runtimeParser = function() {
	function parseProgram(src) {
		let program = [];
		let labels = {
			global: {},
			function: {} // ISSUE: not used
		};
		let funcs = {};

		let lines = src.split('\n');
		let _current_func = null;
		for (let ln in lines) {
			let l = lines[ln].trim();
			if (l === '' || l.startsWith('/')) {
				program.push([]);
				continue;
			}

			// label
			if (l[0] === '#') {
				let labelName = l.slice(1).trim();
				if (_current_func !== null) {
					labels[_current_func][labelName] = ln;
				} else {
					labels['global'][labelName] = ln;
				}
			}
			if (l.startsWith('def ')) {
				let funcName = l.slice(3).trim().split(' ')[0];
				funcs[funcName] = ln;
				labels[funcName] = {};
				_current_func = funcName;
			}
			if (l.trim() === 'end') {
				_current_func = null;
			}
			let lineTokens = tokenizeLine(l);
			program.push(lineTokens);
		}

		return {
			program,
			labels,
			funcs
		};
	}

	function tokenizeLine(line) {
		let tokens = [];
		let current = '';
		for (let i = 0; i < line.length; i++) {
			let c = line[i];
			if (c === '\'') {
				// string
				if (current !== '') {
					tokens.push(current);
					current = '';
				}
				current += line[i];
				i++;
				while (i < line.length) {
					if (line[i] === '\'') {
						break;
					}
					let cc = line[i];
					if (cc === '\\') {
						i += 1;
						if (i >= line.length){
							console.error('Unterminated string');
						}
						cc = line[i];
						switch (cc) {
							case 'b':
								cc = '\b';
								break;
							case 'n':
								cc = '\n';
								break;
							case 't':
								cc = '\t';
								break;
						}
					}
					current += cc;
					i += 1;
				}
				current += line[i];
			} else if (c === '/') {
				// comment
				break;
			} else if (c === ' ') {
				// add token
				if (current.length > 0) {
					tokens.push(current);
					current = '';
				}
			} else {
				current += c;
			}
		}
		if (current.length > 0) {
			tokens.push(current);
		}
		return tokens;
	}

	return {
		parse: parseProgram
	};
};

if (typeof module === 'object') {
	module.exports = {
		runtimeParser
	};
}