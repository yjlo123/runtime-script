let runtimeParser = function() {
	function parseProgram(src) {
		let program = [];
		let labels = {}

		let lines = src.split('\n');
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
			
			let lineTokens = tokenizeLine(l);
			program.push(lineTokens);
		}

		return {
			program,
			labels
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
				while (i < line.length && line[i] !== '\'') {
					current += line[i];
					i++;
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
