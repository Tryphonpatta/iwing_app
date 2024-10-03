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
  console.log("base64: ", base64);
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
