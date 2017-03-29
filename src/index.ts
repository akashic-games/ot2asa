import * as fs from "fs-extra";
import * as path from "path";
import * as commander from "commander";
import * as C from "./Converter";

const PROGRAM_VERSION = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8")).version;
const DEFAULT_PREFIXES = "pj_,bn_,sk_,an_";

commander
	.version(PROGRAM_VERSION)
	.usage("[options] info.txt")
	.option("-o, --out-dir <outDir>", "set output directory", "./")
	.option("-p, --add-prefix", "add prefix to each file")
	.option(
		"-P, --set-prefix <[pj],[bn],[sk],[an]>",
		"set prefixes. default: " + DEFAULT_PREFIXES,
		(list: string) => list.split(",")
	)
	.option("-i, --image-asset-name <name>", "set image asset name")
	.option("-r, --root-bone-name <name>", "set root bone name")
	.option("-c, --cell-base-name <name>", "set cell base name")
	.option("-C, --cell-size", "add cell size as user data")
	.option("-f, --fps <FPS>", "set FPS", 30)
	.parse(process.argv);

if (commander.args.length === 0) {
	commander.outputHelp();
	process.exit(0);
} else if (commander.args.length > 1) {
	console.error("too many files");
	process.exit(1);
}

const prefixes = createPrefixFromParam((<any>commander).setPrefix, (<any>commander).addPrefix);
if (prefixes && prefixes.length < DEFAULT_PREFIXES.split(",").length) {
	console.error("Error: too few prefixes");
	process.exit(1);
}

const fileName = commander.args[0];
const outDir = <string>((<any>commander).outDir);

const option = {
	imageAssetName: (<any>commander).imageAssetName || path.basename(fileName, path.extname(fileName)),
	rootBoneName: (<any>commander).rootBoneName,
	cellBaseName: (<any>commander).cellBaseName,
	prefixes: prefixes,
	cellSizeUserData: !!(<any>commander).cellSize,
	fps: (<any>commander).fps
};

C.convert(fileName, outDir, option, (err?: Error) => {
	if (err) {
		throw err;
	}
});

function createPrefixFromParam(param: any, isPrefixed: boolean): string[] {
	if (Array.isArray(param)) {
		return param;
	} else if (isPrefixed === true) {
		return DEFAULT_PREFIXES.split(",");
	} else {
		return undefined;
	}
}
