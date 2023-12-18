import path from "node:path";

const config = {
	root: "src/",
	base: "/modules/ua-ua/",
	publicDir: path.resolve(__dirname, "public"),
	build: {
		outDir: path.resolve(__dirname, "ua-ua"),
		minify: true,
		emptyOutDir: true,
		sourcemap: false,
		brotliSize: true,
		lib: {
			name: "ua-ua",
			entry: path.resolve(__dirname, "src/index.js"),
			formats: ["es"],
			fileName: "ua-ua"
		},
		rollupOptions: {
			external: [/^.\/fonts\/*/]
		}
	}
};

export default config;
