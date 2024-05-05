const fs = require('fs-extra');
const path = require('path');

function move(source, temp) {
    const sourceDir = path.join(__dirname, '..', source);
    const tempDir = path.join(__dirname, '..', temp);

    // Ensure the temporary directory exists
    fs.ensureDirSync(tempDir);

    // Copy the directory from dist to temp
    fs.copySync(sourceDir, tempDir);

    console.log('Post-build operation complete to:', temp);
}

move("temp/mongoose/browser", "dist/modules/mongoose/browser");
move("temp/sequelize/browser", "dist/modules/sequelize/browser");