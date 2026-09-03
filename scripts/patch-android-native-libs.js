const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const patches = [
  {
    file: 'node_modules/react-native-worklets-core/android/build.gradle',
    find: '"-DJS_RUNTIME=${JS_RUNTIME}"',
    replace:
      '"-DJS_RUNTIME=${JS_RUNTIME}",\n' +
      '                "-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON"',
  },
  {
    file: 'node_modules/react-native-vision-camera/android/build.gradle',
    find: '"-DENABLE_FRAME_PROCESSORS=${enableFrameProcessors ? "ON" : "OFF"}"',
    replace:
      '"-DENABLE_FRAME_PROCESSORS=${enableFrameProcessors ? "ON" : "OFF"}",\n' +
      '                "-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON"',
  },
];

for (const patch of patches) {
  const filePath = path.join(root, patch.file);

  if (!fs.existsSync(filePath)) {
    continue;
  }

  const source = fs.readFileSync(filePath, 'utf8');

  if (source.includes('"-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON"')) {
    continue;
  }

  if (!source.includes(patch.find)) {
    throw new Error(`Unable to patch ${patch.file}`);
  }

  fs.writeFileSync(filePath, source.replace(patch.find, patch.replace));
}
