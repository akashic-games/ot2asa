import * as g from "@akashic/akashic-engine"; (<any>global).g = g;
import * as asa from "@akashic-extension/akashic-animation";

export class MetaData {
	imageCount: number;
	width: number;
	height: number;
	paddedWidth: number;
	paddedHeight: number;
	hImageCount: number;
	vImageCount: number;
	topPadding: number;
	bottomPadding: number;
	leftPadding: number;
	rightPadding: number;
	hSpace: number;
	vSpace: number;

	get sheetWidth(): number {
		return this.paddedWidth * this.hImageCount;
	}

	get sheetHeight(): number {
		return this.paddedHeight * this.vImageCount;
	}

	constructor();
	constructor(metaText: string);
	constructor(metaText?: string) {
		if (metaText) {
			parseMetaText(metaText, this);
		}
	}
}

export function parseMetaText(metaText: string, data?: MetaData): MetaData {
	data = data || new MetaData();

	const lines = metaText.split("\n");
	for (let i = 0; i < lines.length; i++) {
		const tokens = lines[i].split(":");
		if (tokens.length < 2) {
			continue;
		}
		const key = tokens[0].trim();
		const val = tokens[1].trim();

		switch (key) {
			case "Total Images":
				data.imageCount = parseInt(val, 10);
				break;
			case "Individual Image Width":
				data.width = parseInt(val, 10);
				break;
			case "Individual Image Height":
				data.height = parseInt(val, 10);
				break;
			case "Individual Image Width with Padding":
				data.paddedWidth = parseInt(val, 10);
				break;
			case "Individual Image Height with Padding":
				data.paddedHeight = parseInt(val, 10);
				break;
			case "Images Across":
				data.hImageCount = parseInt(val, 10);
				break;
			case "Images Down":
				data.vImageCount = parseInt(val, 10);
				break;
			case "Top Padding":
				data.topPadding = parseInt(val, 10);
				break;
			case "Bottom Padding":
				data.bottomPadding = parseInt(val, 10);
				break;
			case "Left Padding":
				data.leftPadding = parseInt(val, 10);
				break;
			case "Right Padding":
				data.rightPadding = parseInt(val, 10);
				break;
			case "Horizontal Space Between Images":
				data.hSpace = parseInt(val, 10);
				break;
			case "Vertical Space Between Images":
				data.vSpace = parseInt(val, 10);
				break;
			default:
				console.warn("Unknown property found(" + key + "), skip.");
		}

	}

	return data;
}

function createCellName(baseName: string, index: number): string {
	return baseName + "_" + index;
}

export function createSkin(name: string, imageAssetName: string, cellBaseName: string, metaData: MetaData): asa.Skin {
	const skin = new asa.Skin();
	skin.name = name;
	skin.imageAssetName = imageAssetName;
	skin.imageSizeH = metaData.sheetWidth;
	skin.imageSizeW = metaData.sheetHeight;

	let index = 0;
	for (let j = 0; j < metaData.vImageCount; j++) {
		for (let i = 0; i < metaData.hImageCount; i++) {
			const cell = new asa.Cell();
			cell.name = createCellName(cellBaseName, index++);
			cell.size.width = metaData.width;
			cell.size.height = metaData.height;
			cell.pos.x = metaData.paddedWidth * i + metaData.leftPadding;
			cell.pos.y = metaData.paddedHeight * j + metaData.topPadding;
			skin.cells[cell.name] = cell;
		}
	}

	return skin;
}

function createCellCurve(skinName: string, cellBaseName: string, metaData: MetaData): asa.AnimeParams.Curve<asa.AnimeParams.CellValue> {
	const curve = new asa.AnimeParams.Curve<asa.AnimeParams.CellValue>();
	curve.attribute = "cv";

	for (let i = 0; i < metaData.imageCount; i++) {
		const cellValue = new asa.AnimeParams.CellValue();
		cellValue.skinName = skinName;
		cellValue.cellName = createCellName(cellBaseName, i);

		const keyFrame = new asa.AnimeParams.KeyFrame<asa.AnimeParams.CellValue>();
		keyFrame.time = i;
		keyFrame.value = cellValue;
		keyFrame.ipType = "linear";

		curve.keyFrames.push(keyFrame);
	}
	return curve;
}

function createPositionCurve(attribute: string, value: number): asa.AnimeParams.Curve<number> {
	const curve = new asa.AnimeParams.Curve<number>();

	curve.attribute = attribute;
	const xKeyFrame = new asa.AnimeParams.KeyFrame<number>();
	xKeyFrame.time = 0;
	xKeyFrame.value = value;
	curve.keyFrames.push(xKeyFrame);

	return curve;
}

export function createAnimation(
	name: string, rootBoneName: string, skinName: string, cellBaseName: string, fps: number,
	metaData: MetaData): asa.AnimeParams.Animation {

	const curveTie = new asa.AnimeParams.CurveTie();
	curveTie.boneName = rootBoneName;
	curveTie.curves.push(createPositionCurve("tx", metaData.width / 2));
	curveTie.curves.push(createPositionCurve("ty", metaData.height / 2));
	curveTie.curves.push(createCellCurve(skinName, cellBaseName, metaData));

	const anim = new asa.AnimeParams.Animation();
	anim.name = name;
	anim.fps = fps;
	anim.frameCount = metaData.imageCount;
	anim.curveTies[curveTie.boneName] = curveTie;

	return anim;
}

export function createBoneSet(name: string, rootBoneName: string): asa.BoneSet {
	const bone = new asa.Bone();
	bone.name = rootBoneName;
	bone.arrayIndex = 0;
	const boneSet = new asa.BoneSet(name, [bone]);

	return boneSet;
}
