let runtimeParser = function() {
	function parseProgram(src) {
		let program = [];
		let labels = {};
		let funcs = {};

		let lines = src.split('\n');
		let _inside_func = false;
		for (let ln in lines) {
			let l = lines[ln].trim();
			if (l === '' || l.startsWith('/')) {
				program.push([]);
				continue;
			}

			// label
			if (l[0] === '#') {
				labels[l.slice(1).trim()] = ln;
			}
			if (l.startsWith('def ')) {
				funcs[l.slice(3).trim()] = ln;
				_inside_func = true;
			}
			if (l.trim() === 'end') {
				_inside_func = false;
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
			} else if (c != ' ') {
				current += c;
			} else {
				tokens.push(current);
				current = ''
			}
		}
		if (current !== '') {
			tokens.push(current);
		}
		return tokens;
	}

	return {
		parse: parseProgram
	};
};
