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

export const base64ToDecimal = (base64String: string): number => {
  // Decode the base64 string into a Uint8Array (byte array)
  const binaryString = atob(base64String);
  let result = 0;

  // Convert the byte array to a decimal number
  for (let i = 0; i < binaryString.length; i++) {
    result = result * 256 + binaryString.charCodeAt(i);
  }

  return result;
};

export const hexstringtoDecimal = (hexString: string): number => {
  return parseInt(hexString, 16);
};
