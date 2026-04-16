const net = require("net");
const fs = require("fs/promises");

const socket = net.createConnection({ port: 5050 }, async () => {
	const filePath = process.argv[2];
	const fileName = process.argv[2].split("/").pop();
	const fh = await fs.open(filePath, "r");
	const fileStream = fh.createReadStream();
	const stats = await fh.stat();

	socket.write(`${fileName}|${stats.size}-----`);

	fileStream.on("data", (buffer) => {
		const canContinue = socket.write(buffer);

		if (!canContinue) {
			socket.pause();
		}
	});

	socket.on("data", (buffer) => {
		console.log(buffer.toString());
	});

	socket.on("drain", () => {
		socket.resume();
	});

	fileStream.on("end", () => {
		socket.end();
		fh.close();
	});
});
