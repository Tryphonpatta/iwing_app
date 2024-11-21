// import React, { useState } from 'react';
// import { View, Text, Button, Alert } from 'react-native';
// import Svg, { Text as SvgText } from 'react-native-svg';
// import RNFS from 'react-native-fs';

// export default function ManualScreen() {
//   const [svgContent, setSvgContent] = useState('');

//   // Function to create SVG content
//   const generateSvg = () => {
//     const svgString = `
//       <svg width="200" height="50" xmlns="http://www.w3.org/2000/svg">
//         <text x="10" y="30" font-size="20" fill="black">Hello</text>
//       </svg>
//     `;
//     setSvgContent(svgString);
//     saveSvgFile(svgString);
//   };

//   // Function to save the SVG file
//   const saveSvgFile = async (svgString: string) => {
//     try {
//       const path = `${RNFS.DownloadDirectoryPath}/hello.svg`;
//       await RNFS.writeFile(path, svgString, 'utf8');
//       Alert.alert('Success', `SVG saved to ${path}`);
//     } catch (error) {
//       Alert.alert('Error', `Failed to save SVG: ${error}`);
//     }
//   };

//   return (
//     <View>
//       <View>
//         <Text>Hello</Text>
//       </View>
//       <Button title="Save Hello" onPress={generateSvg} />
//     </View>
//   );
// }
