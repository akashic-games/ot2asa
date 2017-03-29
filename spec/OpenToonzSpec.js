"use strict";

const ot = require("../lib/OpenToonz.js");

function getCurveByAttr(curves, attr) {
    for (let i = 0; i < curves.length; i++) {
        if (curves[i].attribute === attr) {
            return curves[i];
        }
    }
    return null;
}

describe("OpenToonz.", function () {
    const metaText = ""
        + "Total Images: 6\n"
        + "Individual Image Width: 152\n"
        + "Individual Image Height: 148\n"
        + "Individual Image Width with Padding: 222\n"
        + "Individual Image Height with Padding: 178\n"
        + "Images Across: 3\n"
        + "Images Down : 2\n"
        + "Top Padding: 10\n"
        + "Bottom Padding: 20\n"
        + "Left Padding: 30\n"
        + "Right Padding: 40\n"
        + "Horizontal Space Between Images: 70\n"
        + "Vertical Space Between Images: 30\n"

	describe("parseMetaText()", function() {
		it("should return MetaData correctly", function() {

            const meta = ot.parseMetaText(metaText);

            expect(meta.imageCount).toBe(6);
            expect(meta.width).toBe(152);
            expect(meta.height).toBe(148);
            expect(meta.paddedWidth).toBe(222);
            expect(meta.paddedHeight).toBe(178);
            expect(meta.hImageCount).toBe(3);
            expect(meta.vImageCount).toBe(2);
            expect(meta.topPadding).toBe(10);
            expect(meta.bottomPadding).toBe(20);
            expect(meta.leftPadding).toBe(30);
            expect(meta.rightPadding).toBe(40);
            expect(meta.hSpace).toBe(70);
            expect(meta.vSpace).toBe(30);
            expect(meta.sheetWidth).toBe(meta.paddedWidth * meta.hImageCount);
            expect(meta.sheetHeight).toBe(meta.paddedHeight * meta.vImageCount);
        });
    });

    describe("createSkin()", function() {
        it("should return asa.Skin correctly", function() {
            const meta = new ot.MetaData(metaText);
            const skin = ot.createSkin("mySkinName", "myImageAssetName", "myCellBaseName", meta);

            expect(skin.name).toBe("mySkinName");
            expect(skin.imageAssetName).toBe("myImageAssetName");
            expect(skin.imageSizeW).toBe(356);
            expect(skin.imageSizeH).toBe(666);
            expect(skin.cells["myCellBaseName_0"].pos.x).toBe(30);
            expect(skin.cells["myCellBaseName_0"].pos.y).toBe(10);
            expect(skin.cells["myCellBaseName_0"].size.width).toBe(152);
            expect(skin.cells["myCellBaseName_0"].size.height).toBe(148);
            expect(skin.cells["myCellBaseName_0"].pivot.x).toBe(0);
            expect(skin.cells["myCellBaseName_0"].pivot.y).toBe(0);
            expect(skin.cells["myCellBaseName_0"].rz).toBe(0);
            expect(skin.cells["myCellBaseName_0"].name).toBe("myCellBaseName_0");
        });
    });

    describe("createAnimation()", function() {
        it("should return asa.Animation correctly", function() {
            const meta = new ot.MetaData(metaText);
            const anim = ot.createAnimation("myAnimName", "myRootBoneName", "mySkinName", "myCellBaseName", 15, meta);

            expect(anim.name).toBe("myAnimName");
            expect(anim.fps).toBe(15);
            expect(anim.frameCount).toBe(6);

            expect(anim.curveTies["myRootBoneName"]).toBeDefined();

            let curve = getCurveByAttr(anim.curveTies["myRootBoneName"].curves, "tx");
            expect(curve).not.toBeNull();
            expect(curve.keyFrames.length).toBe(1);
            expect(curve.keyFrames[0].time).toBe(0);
            // half of 'Individual Image Width'
            expect(curve.keyFrames[0].value).toBe(76);

            curve = getCurveByAttr(anim.curveTies["myRootBoneName"].curves, "ty");
            expect(curve).not.toBeNull();
            expect(curve.keyFrames.length).toBe(1);
            expect(curve.keyFrames[0].time).toBe(0);
            // half of 'Individual Image Height'
            expect(curve.keyFrames[0].value).toBe(74);

            curve = getCurveByAttr(anim.curveTies["myRootBoneName"].curves, "cv");
            expect(curve).toBeDefined();
            expect(curve.keyFrames.length).toBe(6);
            expect(curve.keyFrames[0].value.skinName).toBe("mySkinName");
            expect(curve.keyFrames[0].value.cellName).toBe("myCellBaseName_0");
            expect(curve.keyFrames[0].ipType).toBe("linear");
            expect(curve.keyFrames[5].value.skinName).toBe("mySkinName");
            expect(curve.keyFrames[5].value.cellName).toBe("myCellBaseName_5");
            expect(curve.keyFrames[5].ipType).toBe("linear");
        });
    });

    describe("createBoneSet()", function() {
        it("should return asa.BoneSet correctly", function() {
            const boneSet = ot.createBoneSet("myBoneSetName", "myRootBoneName");
            expect(boneSet.name).toBe("myBoneSetName");
            expect(boneSet.bones.length).toBe(1);
            expect(boneSet.bones[0].name).toBe("myRootBoneName");
            expect(boneSet.bones[0].arrayIndex).toBe(0);
        });
    });
});
