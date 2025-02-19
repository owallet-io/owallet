/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const imageFileNames = () => {
  const array = fs
    .readdirSync('src/assets/images/noels')
    .filter((file) => {
      if (file.indexOf('@') >= 0) {
        return false;
      }
      return (
        file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
      );
    })
    .map((file) => {
      return {
        imageName: file
          .replace('.png', '')
          .replace('.jpg', '')
          .replace('.jpeg', ''),
        imageType: file.slice(file.indexOf('.')),
      };
    });
  return Array.from(new Set(array));
};
const generate = () => {
  const properties = imageFileNames()
    .map((item) => {
      return `${item.imageName
        .replace(/-/g, '_')
        .toLocaleLowerCase()}: require('./${item.imageName}${
        item.imageType
      }'),`;
    })
    .join('\n   ');
  const string = `export const imagesNoel = {
    ${properties}
};
`;
  fs.writeFileSync('src/assets/images/noels/index.ts', string, 'utf8');
};
generate();
