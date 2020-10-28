const filesystem = require('fs');

function getAllFilesFromFolder(dir, ext) {
  let results = [];

  filesystem.readdirSync(dir).forEach((file) => {
    const path = `${dir}/${file}`;
    const stat = filesystem.statSync(path);

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFilesFromFolder(path));
    } else if (ext) {
      if (file.split('.').pop() === ext) results.push(file);
    } else results.push(file);
  });

  return results;
}

module.exports = getAllFilesFromFolder;
