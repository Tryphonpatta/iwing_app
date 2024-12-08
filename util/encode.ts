export function base64ToHex(base64: string): string {
  //   console.log("base64: ", base64);
  const binaryString = atob(base64);
  const byteArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }
  let hexString = "";
  let num;
  for (let i = 0; i < byteArray.length; i++) {
    const hex = byteArray[i].toString(16).padStart(2, "0");
    hexString += hex;
  }
  return hexString;
}

const base64String = "IA==";
const hexResult = Number(base64ToHex(base64String));
console.log(hexResult); // base64 to string result

export const hexstringtoDecimal = (hexString: string): number => {
  return parseInt(hexString, 16);
};

export const base64toDec = (base64: string): number => {
  // console.log("base64: ", base64);
  let i = 0;
  const hexArray = [];
  const hexstring = base64ToHex(base64);
  while (i < hexstring.length) {
    const hex = hexstring.slice(i, i + 2);
    hexArray.push(hex);
    i += 2;
  }
  hexArray.reverse();
  const hexString = hexArray.join("");
  return hexstringtoDecimal(hexString);
};

export const base64toDecManu = (base64: string): number => {
  // console.log("base64: ", base64);
  let i = 0;
  const hexArray = [];
  const hexstring = base64ToHex(base64);
  while (i < hexstring.length) {
    const hex = hexstring.slice(i, i + 2);
    hexArray.push(hex);
    i += 2;
  }
  hexArray.reverse();
  const hexString = hexArray.join("");
  return hexstringtoDecimal(hexString.slice(0, 4));
};

export function hexToBase64(hex: string): string {
  // Convert hex to bytes
  const bytes = new Uint8Array(
    hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  // Convert bytes to Base64
  const base64String = btoa(String.fromCharCode(...bytes));

  return base64String;
}

export function decToBase64(dec: number): string {
  const hex = dec.toString(16);
  return hexToBase64(hex);
}
