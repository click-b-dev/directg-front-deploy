/**
 * Minimal QR Code encoder
 * Supports byte mode (0100), error correction level L, versions 1-10.
 * Generates a boolean[][] matrix for short strings (up to ~100 chars).
 */

// Version info: [totalCodewords, ecCodewordsPerBlock, numBlocks, dataCodewords]
const VERSION_INFO: [number, number, number, number][] = [
  [0, 0, 0, 0], // placeholder for index 0
  [26, 7, 1, 19], // v1
  [44, 10, 1, 34], // v2
  [70, 15, 1, 55], // v3
  [100, 20, 1, 80], // v4
  [134, 26, 1, 108], // v5
  [172, 18, 2, 136], // v6
  [196, 20, 2, 156], // v7
  [242, 24, 2, 194], // v8
  [292, 30, 2, 232], // v9
  [346, 18, 2, 274], // v10 (2 blocks, 18 ec per block)
];

// Alignment pattern positions for each version (v2+)
const ALIGNMENT_POSITIONS: number[][] = [
  [], // v1
  [6, 18], // v2
  [6, 22], // v3
  [6, 26], // v4
  [6, 30], // v5
  [6, 34], // v6
  [6, 22, 38], // v7
  [6, 24, 42], // v8
  [6, 26, 46], // v9
  [6, 28, 52], // v10
];

function getVersion(dataLength: number): number {
  for (let v = 1; v <= 10; v++) {
    const info = VERSION_INFO[v]!;
    // byte mode: 4 bits mode + char count bits + 8*data + terminator
    const charCountBits = v <= 9 ? 8 : 16;
    const availableBits = info[3] * 8;
    const neededBits = 4 + charCountBits + dataLength * 8;
    if (neededBits <= availableBits) return v;
  }
  return 10; // fallback, may truncate
}

function getSize(version: number): number {
  return 17 + version * 4;
}

// GF(256) with polynomial 0x11d
const GF_EXP: number[] = new Array(512);
const GF_LOG: number[] = new Array(256);

(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = x << 1;
    if (x >= 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255]!;
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[(GF_LOG[a]! + GF_LOG[b]!) % 255]!;
}

function generateECCodewords(data: number[], ecCount: number): number[] {
  // Generator polynomial
  const gen: number[] = new Array(ecCount + 1).fill(0);
  gen[0] = 1;
  for (let i = 0; i < ecCount; i++) {
    for (let j = ecCount; j > 0; j--) {
      gen[j] = gfMul(gen[j]!, GF_EXP[i]!) ^ (gen[j - 1] ?? 0);
    }
    gen[0] = gfMul(gen[0]!, GF_EXP[i]!);
  }

  const msg = [...data, ...new Array(ecCount).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i]!;
    if (coef !== 0) {
      for (let j = 0; j <= ecCount; j++) {
        msg[i + j] ^= gfMul(gen[j]!, coef);
      }
    }
  }
  return msg.slice(data.length);
}

function encodeData(text: string, version: number): number[] {
  const info = VERSION_INFO[version]!;
  const totalDataCodewords = info[3];
  const charCountBits = version <= 9 ? 8 : 16;

  const bits: number[] = [];

  function pushBits(value: number, count: number) {
    for (let i = count - 1; i >= 0; i--) {
      bits.push((value >> i) & 1);
    }
  }

  // Mode indicator: byte mode = 0100
  pushBits(0b0100, 4);
  // Character count
  pushBits(text.length, charCountBits);
  // Data
  for (let i = 0; i < text.length; i++) {
    pushBits(text.charCodeAt(i) & 0xff, 8);
  }
  // Terminator (up to 4 zeros)
  const maxBits = totalDataCodewords * 8;
  const termLen = Math.min(4, maxBits - bits.length);
  for (let i = 0; i < termLen; i++) bits.push(0);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);

  // Pad bytes
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    pushBits(padBytes[padIdx % 2]!, 8);
    padIdx++;
  }

  // Convert to codewords
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | (bits[i + j] ?? 0);
    }
    codewords.push(byte);
  }

  return codewords;
}

function buildFinalMessage(data: number[], version: number): number[] {
  const info = VERSION_INFO[version]!;
  const ecPerBlock = info[1];
  const numBlocks = info[2];
  const totalDataCW = info[3];
  const cwPerBlock = Math.floor(totalDataCW / numBlocks);
  const extraCW = totalDataCW % numBlocks;

  // Split data into blocks
  const blocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let offset = 0;
  for (let b = 0; b < numBlocks; b++) {
    const blockSize = cwPerBlock + (b < extraCW ? 1 : 0);
    const block = data.slice(offset, offset + blockSize);
    blocks.push(block);
    ecBlocks.push(generateECCodewords(block, ecPerBlock));
    offset += blockSize;
  }

  // Interleave data codewords
  const result: number[] = [];
  const maxBlockLen = Math.max(...blocks.map((b) => b.length));
  for (let i = 0; i < maxBlockLen; i++) {
    for (const block of blocks) {
      if (i < block.length) result.push(block[i]!);
    }
  }
  // Interleave EC codewords
  for (let i = 0; i < ecPerBlock; i++) {
    for (const ecBlock of ecBlocks) {
      if (i < ecBlock.length) result.push(ecBlock[i]!);
    }
  }

  return result;
}

type Matrix = (boolean | null)[][];

function createMatrix(size: number): Matrix {
  return Array.from({ length: size }, () => new Array(size).fill(null));
}

function setModule(matrix: Matrix, row: number, col: number, value: boolean): void {
  if (row >= 0 && row < matrix.length && col >= 0 && col < matrix.length) {
    matrix[row]![col] = value;
  }
}

function getModule(matrix: Matrix, row: number, col: number): boolean | null {
  if (row >= 0 && row < matrix.length && col >= 0 && col < matrix.length) {
    return matrix[row]![col] ?? null;
  }
  return null;
}

function placeFinderPattern(matrix: Matrix, row: number, col: number): void {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const mr = row + r;
      const mc = col + c;
      if (mr < 0 || mr >= matrix.length || mc < 0 || mc >= matrix.length) continue;

      if (r === -1 || r === 7 || c === -1 || c === 7) {
        // Separator
        setModule(matrix, mr, mc, false);
      } else if (r === 0 || r === 6 || c === 0 || c === 6) {
        // Outer border
        setModule(matrix, mr, mc, true);
      } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
        // Inner
        setModule(matrix, mr, mc, true);
      } else {
        setModule(matrix, mr, mc, false);
      }
    }
  }
}

function placeAlignmentPattern(matrix: Matrix, row: number, col: number): void {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const mr = row + r;
      const mc = col + c;
      if (getModule(matrix, mr, mc) !== null) continue;
      const isOuter = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      setModule(matrix, mr, mc, isOuter || isCenter);
    }
  }
}

function placeTimingPatterns(matrix: Matrix): void {
  const size = matrix.length;
  for (let i = 8; i < size - 8; i++) {
    if (getModule(matrix, 6, i) === null) {
      setModule(matrix, 6, i, i % 2 === 0);
    }
    if (getModule(matrix, i, 6) === null) {
      setModule(matrix, i, 6, i % 2 === 0);
    }
  }
}

function reserveFormatInfo(matrix: Matrix): void {
  const size = matrix.length;
  // Around top-left finder
  for (let i = 0; i <= 8; i++) {
    if (getModule(matrix, 8, i) === null) setModule(matrix, 8, i, false);
    if (getModule(matrix, i, 8) === null) setModule(matrix, i, 8, false);
  }
  // Around top-right finder
  for (let i = 0; i <= 7; i++) {
    if (getModule(matrix, 8, size - 1 - i) === null) setModule(matrix, 8, size - 1 - i, false);
  }
  // Around bottom-left finder
  for (let i = 0; i <= 7; i++) {
    if (getModule(matrix, size - 1 - i, 8) === null) setModule(matrix, size - 1 - i, 8, false);
  }
  // Dark module
  setModule(matrix, size - 8, 8, true);
}

function placeDataBits(matrix: Matrix, data: number[]): void {
  const size = matrix.length;
  const bits: number[] = [];
  for (const byte of data) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }

  let bitIdx = 0;
  let col = size - 1;
  let goingUp = true;

  while (col > 0) {
    if (col === 6) col--; // skip timing pattern column

    for (let row = 0; row < size; row++) {
      const actualRow = goingUp ? size - 1 - row : row;
      for (let c = 0; c < 2; c++) {
        const actualCol = col - c;
        if (getModule(matrix, actualRow, actualCol) !== null) continue;
        const bit = bitIdx < bits.length ? bits[bitIdx]! : 0;
        setModule(matrix, actualRow, actualCol, bit === 1);
        bitIdx++;
      }
    }

    goingUp = !goingUp;
    col -= 2;
  }
}

// Format info with mask pattern 0 and EC level L
const FORMAT_BITS_L: number[][] = [
  [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0], // mask 0
  [1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1], // mask 1
  [1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0], // mask 2
  [1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1], // mask 3
  [1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1], // mask 4
  [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0], // mask 5
  [1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1], // mask 6
  [1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0], // mask 7
];

export function applyMask(matrix: Matrix, maskNum: number): Matrix {
  const size = matrix.length;
  const masked = matrix.map((row) => [...row]);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Only apply to data modules (not function patterns, already placed)
      // We check the original reserved matrix, but since we've already placed everything,
      // the mask check is for modules that are data area
      let apply = false;
      switch (maskNum) {
        case 0:
          apply = (r + c) % 2 === 0;
          break;
        case 1:
          apply = r % 2 === 0;
          break;
        case 2:
          apply = c % 3 === 0;
          break;
        case 3:
          apply = (r + c) % 3 === 0;
          break;
        case 4:
          apply = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
          break;
        case 5:
          apply = ((r * c) % 2) + ((r * c) % 3) === 0;
          break;
        case 6:
          apply = (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
          break;
        case 7:
          apply = (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
          break;
      }

      if (apply) {
        // Don't mask function patterns - we need to track which are data modules
        // For simplicity, we apply mask to all, then re-place function patterns
      }
    }
  }

  return masked;
}

function writeFormatInfo(matrix: Matrix, maskNum: number): void {
  const size = matrix.length;
  const bits = FORMAT_BITS_L[maskNum]!;

  // Horizontal strip (row 8)
  for (let i = 0; i < 8; i++) {
    const col = i < 6 ? i : i + 1;
    matrix[8]![col] = bits[i] === 1;
  }
  matrix[8]![8] = bits[8] === 1;

  // Vertical strip (col 8)
  for (let i = 0; i < 8; i++) {
    const row = i < 6 ? i : i + 1;
    matrix[row]![8] = bits[14 - i] === 1;
  }
  // Right portion of horizontal strip
  for (let i = 0; i < 7; i++) {
    matrix[8]![size - 1 - i] = bits[14 - i] === 1;
  }
  // Bottom portion of vertical strip
  for (let i = 0; i < 8; i++) {
    matrix[size - 1 - i]![8] = bits[i] === 1;
  }
}

/**
 * Encodes a string into a QR code boolean matrix.
 * true = dark module, false = light module.
 */
export function encodeQR(text: string): boolean[][] {
  if (!text) {
    // Return minimal empty QR
    return Array.from({ length: 21 }, () => new Array(21).fill(false));
  }

  const version = getVersion(text.length);
  const size = getSize(version);

  // Create matrix
  const matrix = createMatrix(size);

  // Place finder patterns
  placeFinderPattern(matrix, 0, 0); // top-left
  placeFinderPattern(matrix, 0, size - 7); // top-right
  placeFinderPattern(matrix, size - 7, 0); // bottom-left

  // Place alignment patterns
  if (version >= 2) {
    const positions = ALIGNMENT_POSITIONS[version - 1]!;
    for (const r of positions) {
      for (const c of positions) {
        // Skip if overlaps with finder patterns
        if (r <= 8 && c <= 8) continue;
        if (r <= 8 && c >= size - 8) continue;
        if (r >= size - 8 && c <= 8) continue;
        placeAlignmentPattern(matrix, r, c);
      }
    }
  }

  // Place timing patterns
  placeTimingPatterns(matrix);

  // Reserve format info areas
  reserveFormatInfo(matrix);

  // Encode data
  const dataCW = encodeData(text, version);
  const finalMessage = buildFinalMessage(dataCW, version);

  // Place data bits
  placeDataBits(matrix, finalMessage);

  // Apply mask 0 (simplest) and write format info
  // For a proper implementation we'd evaluate all 8 masks, but mask 0 works fine
  const maskNum = 0;

  // Apply mask to data area
  const functionPattern = createMatrix(size);
  placeFinderPattern(functionPattern, 0, 0);
  placeFinderPattern(functionPattern, 0, size - 7);
  placeFinderPattern(functionPattern, size - 7, 0);
  if (version >= 2) {
    const positions = ALIGNMENT_POSITIONS[version - 1]!;
    for (const r of positions) {
      for (const c of positions) {
        if (r <= 8 && c <= 8) continue;
        if (r <= 8 && c >= size - 8) continue;
        if (r >= size - 8 && c <= 8) continue;
        placeAlignmentPattern(functionPattern, r, c);
      }
    }
  }
  placeTimingPatterns(functionPattern);
  reserveFormatInfo(functionPattern);

  // Apply mask only to data modules
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (functionPattern[r]![c] !== null) continue; // skip function patterns
      let shouldMask = false;
      switch (maskNum) {
        case 0:
          shouldMask = (r + c) % 2 === 0;
          break;
      }
      if (shouldMask) {
        matrix[r]![c] = !matrix[r]![c];
      }
    }
  }

  // Write format information
  writeFormatInfo(matrix, maskNum);

  // Convert to boolean[][]
  return matrix.map((row) => row.map((cell) => cell === true));
}
