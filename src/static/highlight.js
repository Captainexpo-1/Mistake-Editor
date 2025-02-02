class SyntaxHighlighter {
	constructor() {
		this.keywords = new Set([
			"variable",
			"is",
			"open",
			"close",
			"impure",
			"function",
			"end",
			"returns",
			"lifetime",
			"true",
			"false",
			"public",
			"randomize",
			"type",
			"number",
			"boolean",
			"unit",
			"jump",
			"new",
			"class",
			"inherits",
			"has",
			"match",
			"case",
			"cases",
			"otherwise",
			"member",
			"then",
			"of",
			"do",
			"use",
			"from",
			"with",
		]);

		this.stringPattern = /^"(?:\\"|[^"])*"|'(?:\\'|[^'])*'$/m;
		this.numberPattern = /^[0-9]+$/m;
	}

	getSingleTokens(code) {
		// split code into single tokens
		// e.g. "15  16" = ["15", "  ", "16"]
		code = code.replace("\t", "   ");
		const tokens = [];
		let currentToken = "";
		for (let i = 0; i < code.length; i++) {
			const char = code[i];
			if (/\s/.test(char)) {
				if (currentToken) {
					tokens.push(currentToken);
					currentToken = "";
				}
				tokens.push(char);
			} else {
				currentToken += char;
			}
		}
		if (currentToken) {
			tokens.push(currentToken);
		}
		return tokens;
	}

	containsAlpha(str) {
		return /[a-zA-Z]/.test(str);
	}

	san(str) {
		return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}

	highlight(code) {
		let blockStack = [];
		const tokens = this.getSingleTokens(code);
		let line = 1;
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];

			if (token.startsWith("comment")) {
				let comment = token;
				while (i + 1 < tokens.length && tokens[i + 1] !== "\n") {
					comment += tokens[i + 1];
					tokens.splice(i, 1);
				}
				tokens[i] = `<span class="comment">${comment}</span>`;
			} else if (token.startsWith("string")) {
				let comment = token;
				while (i + 1 < tokens.length && tokens[i] !== "close") {
					comment += tokens[i + 1];
					tokens.splice(i, 1);
				}
				tokens[i] = `<span class="string">${this.san(comment)}</span>`;
			} else if (this.keywords.has(token)) {
				if (["open", "case", "returns", "cases", "otherwise"].includes(token)) {
					blockStack.push([token, line, i]);
				}
				if (["close"].includes(token)) {
					if (blockStack.length === 0) {
						tokens[i] = `<span class="error">${this.san(token)}</span>`;
						continue;
					}
					blockStack.pop();
				}
				tokens[i] = `<span class="keyword">${this.san(token)}</span>`;
			} else if (this.stringPattern.test(token)) {
				tokens[i] = `<span class="string">${this.san(token)}</span>`;
			} else if (this.numberPattern.test(token)) {
				tokens[i] = `<span class="number">${this.san(token)}</span>`;
			} else if (token === " ") {
				tokens[i] = "&nbsp;";
			} else if (token === "\n") {
				line++;
				tokens[i] = "<br>";
			} else if (token === "\t") {
				tokens[i] = "&nbsp;".repeat(5);
			} else if (!this.containsAlpha(token)) {
				tokens[i] = `<span class="identifier">${this.san(token)}</span>`;
			} else {
				tokens[i] = `<span class="error">${this.san(token)}</span>`;
			}
		}
		if (blockStack.length > 0) {
			while(blockStack.length > 0) {
				const [block, line, index] = blockStack.pop();
				tokens[index] = `<span class="error">${block}</span>`;
			}
		}
		return tokens.join("");
	}
}
