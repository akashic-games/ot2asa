import * as fs from "fs-extra";
import * as path from "path";
import * as g from "@akashic/akashic-engine"; (<any>global).g = g;
import * as asa from "@akashic-extension/akashic-animation";
import * as ot from "./OpenToonz";

const FILEFORMAT_VERSION = "2.0.0";
const FS_WRITE_OPTION = {encoding: "utf8"};
const ROOT_BONE_NAME = "root";
const CELL_BASE_NAME = "cell";

enum Prefix {
	Proj,
	Bone,
	Skin,
	Anim
}

interface ASAProject {
	boneSetFileNames: string[];
	skinFileNames: string[];
	animationFileNames: string[];
	userData: any[];
}

export interface Option {
	imageAssetName: string;
	rootBoneName?: string;
	cellBaseName?: string;
	prefixes?: string[];
	cellSizeUserData?: boolean;
	fps?: number;
}

export function convert(fileName: string, outDir: string, option: Option, callback: (err?: Error) => void): void {
	const fileNameBody = path.basename(fileName, path.extname(fileName));

	// normalize
	option.rootBoneName = option.rootBoneName || ROOT_BONE_NAME;
	option.cellBaseName = option.cellBaseName || CELL_BASE_NAME;
	option.prefixes = option.prefixes || ["", "", "", ""];
	option.fps = option.fps || 30;

	fs.ensureDir(outDir, err => {
		if (err) {
			callback(err);
		}

		fs.readFile(fileName, "utf8", (err, data) => {
			if (err) {
				callback(err);
			}

			const metaText = data.toString();
			const metaData = new ot.MetaData(metaText);

			try {
				const boneSet = ot.createBoneSet(fileNameBody, option.rootBoneName);
				const skin = ot.createSkin(fileNameBody, option.imageAssetName, option.cellBaseName, metaData);
				const animation = ot.createAnimation(fileNameBody, option.rootBoneName, skin.name, option.cellBaseName, option.fps, metaData);

				const boneSetFileNames = writeNamedObjects<asa.BoneSet>(
					[boneSet], ".asabn", outDir, FILEFORMAT_VERSION, option.prefixes[Prefix.Bone]);
				const skinFileNames = writeNamedObjects<asa.Skin>(
					[skin], ".asask", outDir, FILEFORMAT_VERSION, option.prefixes[Prefix.Skin]);
				const animationFileNames = writeNamedObjects<asa.AnimeParams.Animation>(
					[animation], ".asaan", outDir, FILEFORMAT_VERSION, option.prefixes[Prefix.Anim]);

				let userData: any = undefined;
				if (option.cellSizeUserData) {
					userData = {};
					userData.cell = {
						width: metaData.width,
						height: metaData.height
					};
				}

				writeProject(
					outDir,
					fileNameBody,
					boneSetFileNames,
					skinFileNames,
					animationFileNames,
					userData,
					option.prefixes[Prefix.Proj]
				);

				callback();
			} catch (err) {
				callback(err);
			}
		});
	});
}

function writeNamedObjects<T extends {name: string}>(objs: T[], ext: string, outDir: string, version: string, prefix: string): string[] {
	const fileNames: string[] = [];

	objs.forEach((obj: T) => {
		const json = JSON.stringify(new asa.Container(version, obj));
		const fileName = prefix + obj.name + ext;
		const fullPath = path.join(outDir, fileName);
		fs.writeFileSync(fullPath, json, FS_WRITE_OPTION);
		fileNames.push(fileName);
	});

	return fileNames;
}

function writeProject(
	outDir: string, fileBaseName: string,
	boneSetFileNames: string[], skinFileNames: string[], animationFileNames: string[],
	userData: any, prefix: string): void {
	const contents: ASAProject = {
		boneSetFileNames: boneSetFileNames,
		skinFileNames: skinFileNames,
		animationFileNames: animationFileNames,
		userData: userData
	};
	const con = new asa.Container(FILEFORMAT_VERSION, contents);

	fs.writeFileSync(path.join(outDir, prefix + fileBaseName + ".asapj"), JSON.stringify(con), FS_WRITE_OPTION);
}
