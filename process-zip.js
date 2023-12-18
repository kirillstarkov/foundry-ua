import archiver from "archiver";
import { createWriteStream } from "node:fs";

const output = createWriteStream("ua-ua.zip");
const archive = archiver("zip", {
	zlib: { level: 9 }
});

console.log("Packing into ZIP...");

archive.on("error", function (err) {
	throw err;
});
archive.directory("ua-ua", false);
archive.pipe(output);
archive.finalize();
