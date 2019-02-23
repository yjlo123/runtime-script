let runtimeCanvas = (function() {
	let colors = ['#000000', '#ffffff', '#d6a090', '#fe3b1e', '#a12c32', '#fa2f7a', '#fb9fda', '#e61cf7', '#992f7c', '#47011f', '#051155', '#4f02ec', '#2d69cb', '#00a6ee', '#6febff', '#08a29a', '#2a666a', '#063619', '#4a4957', '#8e7ba4', '#b7c0ff', '#acbe9c', '#827c70', '#5a3b1c', '#ae6507', '#f7aa30', '#f4ea5c', '#9b9500', '#566204', '#11963b', '#51e113', '#08fdcc']

	let canvas = document.getElementById('canvas');
	let ctx = canvas.getContext('2d');
	let width = canvas.width;
	let height = canvas.height;
	let widthInBlocks = 24;
	let heightInBlocks = 24;
	let blockSize = width / widthInBlocks;

	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, width, height);

	let pixels = [];

	function drawPixel(x, y, value) {
		x = parseInt(x)
		y = parseInt(y)
		pixels[widthInBlocks*x+y] = value;
		ctx.fillStyle = colors[parseInt(value)];

		ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
	}

	function drawText(x, y, text, size, color) {
		let fontSize = 10 * size;
		x = parseInt(x) * blockSize;
		y = parseInt(y) * blockSize + (fontSize-(2*(fontSize/10)));
		ctx.fillStyle = colors[parseInt(color)];
		
		ctx.font = fontSize + "px monospace";
		ctx.fillText(text, x, y);
	}

	function getPixel(x, y) {
		x = parseInt(x)
		y = parseInt(y)
		return pixels[widthInBlocks*x+y] | 0;
	}

	function clearCanvas() {
		for (let i = 0 ; i < widthInBlocks; i++) {
			for (let j = 0; j < heightInBlocks; j++) {
				drawPixel(i, j, 0);
			}
		}
	}

	return {
		drawPixel: drawPixel,
		getPixel: getPixel,
		drawText: drawText,
		clearCanvas: clearCanvas
	};
})();
