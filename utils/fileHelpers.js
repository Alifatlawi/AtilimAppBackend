const fs = require('fs');

function saveDataToFile(data, filepath) {
  fs.writeFile(filepath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log(`Data written to file ${filepath}`);
    }
  });
}

module.exports = {
  saveDataToFile,
};
