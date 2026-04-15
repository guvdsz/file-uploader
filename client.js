const net = require("net");
const fs = require("fs/promises");

const socket = net.createConnection({ port: 5050 }, async () => {
	const filePath = "./test.txt";
	const fh = await fs.open(filePath, "r");
	const fileStream = fh.createReadStream();

	fileStream.on("data", (buffer) => {
		const canContinue = socket.write(buffer);

		if (!canContinue) {
			socket.pause();
		}
	});

	socket.on("drain", () => {
		socket.resume();
	});

	fileStream.on("end", () => {
		socket.end();
	});
});
