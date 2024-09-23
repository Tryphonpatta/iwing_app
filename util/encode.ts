function base64ToHex(base64: string): string {
    const binaryString = atob(base64);
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
    }
    let hexString = '';
    let num;
    for (let i = 0; i < byteArray.length; i++) {
        const hex = byteArray[i].toString(16).padStart(2, '0');
        hexString += hex;
    }
    return hexString;

}


const base64String = 'IA==';
const hexResult = Number(base64ToHex(base64String));
console.log(hexResult); // base64 to string result