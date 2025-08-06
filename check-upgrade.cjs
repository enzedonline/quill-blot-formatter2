#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const oldPkgPath = path.join(
  process.cwd(),
  'node_modules',
  '@enzedonline',
  'quill-blot-formatter2',
  'package.json'
);

if (fs.existsSync(oldPkgPath)) {
  try {
    const oldVersion = require(oldPkgPath).version;
    if (/^([0-2])\./.test(oldVersion)) {
      console.log('\n\x1b[33m%s\x1b[0m', '⚠ BLOTFORMATTER2 IMPORTANT NOTICE');
      console.log('\x1b[33m%s\x1b[0m', `You are upgrading from version ${oldVersion} to 3.x.`);
      console.log('\x1b[33m%s\x1b[0m', 'The import path has changed in version 3.0.0.');
      console.log('\x1b[33m%s\x1b[0m', 'See installation guide: https://github.com/enzedonline/quill-blot-formatter2?tab=readme-ov-file#installation\n');
    }
  } catch (e) {
    // Fail silently if something goes wrong
  }
}
