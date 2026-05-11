declare module "bsdiff-node" {
  /**   await bsdiff.diff(oldFile, newFile, patchFile, function (result) {
        console.log('diff:' + String(result).padStart(4) + '%');
    }); */
  export function diff(
    oldFile: string,
    newFile: string,
    patchFile: string,
    callback?: (result: number) => void,
  ): Promise<void>;

  /**  await bsdiff.patch(oldFile, generatedFile, patchFile, function (result) {
        console.log('patch:' + String(result).padStart(4) + '%');
    }); */
  export function patch(
    oldFile: string,
    generatedFile: string,
    patchFile: string,
    callback?: (result: number) => void,
  ): Promise<void>;
}
