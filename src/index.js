import path from "path";
import fs from "fs";
import parseArgs from "minimist";
import { exec } from "child_process";
import util from "util";

const promiseExec = util.promisify(exec);

const log = console.log;

const replace = (str, i, o) => str.split(i).join(o);

const main = async () => {
  const { ext, input, unlink } = parseArgs(process.argv.slice(2), {
    boolean: ["unlink"],
    string: ["input", "ext"],
    alias: { i: ["input"], e: ["ext"], u: ["unlink"] },
    default: { input: "./", ext: "", unlink: false }
  });

  const files = fs
    .readdirSync(input)
    .filter(f => !ext || path.extname(f) === ext);

  log(`Perfoming the following operation: `);
  log(`applicable files: \n${files.map(f => `  - ${f}`).join("\n")}`);

  await Promise.all(
    files.map(async f => {
      const inFile = path.join(input, f);
      const outFile = path.join(input, replace(f, ext, ".mp3"));
      if (fs.existsSync(outFile)) {
        fs.unlinkSync(outFile);
      }
      await promiseExec(
        `ffmpeg "${outFile}" -i "${inFile}" -codec:a libmp3lame -qscale:a 1`
      );
      if (unlink) {
        await fs.unlinkSync(inFile);
      }
    })
  );
};

main();
