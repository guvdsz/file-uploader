const net = require("net");
const fs = require("fs/promises");

const server = net.createServer(async (socket) => {
	const fh = await fs.open("./storage/test.txt", "w");
	const fhStream = fh.createWriteStream();

	socket.on("data", async (data) => {
		const canContinue = fhStream.write(data);

		if (!canContinue) {
			socket.pause();
		}
	});

	fhStream.on("drain", () => {
		socket.resume();
	});

	socket.on("end", () => {
		fh.close();
	});
});

server.listen(5050, () => console.log("Server is running..."));
