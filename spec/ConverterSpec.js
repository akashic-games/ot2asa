"use strict"

const fs = require("fs-extra");
const existsFile = require('exists-file');
const C = require("../lib/Converter.js");

const TMP_DIR = "spec/tmp/";

describe("Converter", function () {

    beforeEach(function (done) {
        fs.remove(TMP_DIR, err => {
            if (err) {
                done.fail(err);
            } else {
                fs.ensureDir(TMP_DIR, err => {
                    if (err) {
                        done.fail(err);
                    } else {
                        done();
                    }
                });
            }
        });
    });

    it("should convert a file to 4 files at user's option", function(done) {
        const option = 	{
        	prefixes: ["P_", "B_", "S_", "A_"],
        	cellSizeUserData: true,
        };

        C.convert("spec/data/data.txt", TMP_DIR, option, function(err) {
            if (err) {
                done.fail(err);
            }

            expect(existsFile.sync(TMP_DIR + "P_data.asapj")).toBe(true);
            expect(existsFile.sync(TMP_DIR + "B_data.asabn")).toBe(true);
            expect(existsFile.sync(TMP_DIR + "S_data.asask")).toBe(true);
            expect(existsFile.sync(TMP_DIR + "A_data.asaan")).toBe(true);

            const asapj = fs.readJsonSync(TMP_DIR + "P_data.asapj").contents;
            expect(asapj.boneSetFileNames.length).toBe(1);
            expect(asapj.boneSetFileNames[0]).toBe("B_data.asabn");
            expect(asapj.skinFileNames.length).toBe(1);
            expect(asapj.skinFileNames[0]).toBe("S_data.asask");
            expect(asapj.animationFileNames.length).toBe(1);
            expect(asapj.animationFileNames[0]).toBe("A_data.asaan");
            expect(asapj.userData.cell.width).toBe(152);
            expect(asapj.userData.cell.height).toBe(148);

            done();
        });
    });

    afterEach(function(done) {
        fs.remove(TMP_DIR, err => {
            if (err) {
                done.fail(err);
            } else {
                done();
            }
        });
    });
});
