// this.size = size;
// this.sizeX = size.getX();
// this.sizeY = size.getY();
// this.sizeZ = size.getZ();
// this.totalVolume = (long) this.sizeX * (long) this.sizeY * (long) this.sizeZ;
// this.sizeLayer = (long) this.sizeX * (long) this.sizeZ;

// this.setBits(bits);

// Validate.inclusiveBetween(0L, this.arraySize - 1L, (long) index);
export default defineEventHandler(async (event) => {

// let startOffset = index * (long) this.bitsPerEntry;
// let startArrIndex = (int) (startOffset >> 6); // startOffset / 64
// let endArrIndex = (int) (((index + 1L) * (long) this.bitsPerEntry - 1L) >> 6);
// let startBitOffset = (int) (startOffset & 0x3F); // startOffset % 64

// if (startArrIndex == endArrIndex) {
//     return (int) (this.longArray[startArrIndex] >>> startBitOffset & this.maxEntryValue);
// } else {
//     let endOffset = 64 - startBitOffset;
//     return (int) ((this.longArray[startArrIndex] >>> startBitOffset | this.longArray[endArrIndex] << endOffset) & this.maxEntryValue);
// }

});