const fs = require('fs');

module.exports = Inliner;

function Inliner() {
  let filesInDir = recursiveGetAllFiles('.');

  filesInDir = filesInDir.filter((file) => {
    return fs.statSync(file).isFile();
  });

  filesInDir.forEach((file) => {
    fs.open(file, 'r+', (err, fileToRead) => {
      if (err) {
        console.log(`can't read file: ${file}`)
      } else {
        fs.readFile(fileToRead, { encoding: 'utf-8' }, (err, data) => {
          if (err) {
            console.log(`can't read file: ${file}`)
          } else {
            const regex = /{{inline [\', \"][^}]+[\', \"]}}/g;

            let matches = regexMatchesInFile(data, regex);

            matches.forEach((match) => {
              let fileNameToInline = match.match(/[\', \"]([^}]+)[\', \"]/g);
              fileNameToInline = fileNameToInline[0].replace(/[", ']/g, '');
              let fileData = getInlinesFileData(fileNameToInline);
              data = data.replace(match, fileData);
            });

            writeIntoFile(fileToRead, data, file);
          }

        });
      }
    });
  });
}

function recursiveGetAllFiles(rootDir) {
  let files = [];
  files = getAllFilesInDirectory(rootDir, rootDir, rootDir);
  return files;
}

function getAllFilesInDirectory(dir, rootDir, appendDir) {
  let all = fs.readdirSync(dir) || [];

  all.forEach((entity) => {
    if (!entity.startsWith('.') && fs.statSync(`${dir}/${entity}`).isDirectory()) {
      all.push(...getAllFilesInDirectory(`${dir}/${entity}`, rootDir, entity));
    }
  });

  if (appendDir !== rootDir) {
    all = all.map(entity => {
      return `${appendDir}/${entity}`;
    });
  }

  return all;
}

// gets all matches in a file for a regex
function regexMatchesInFile(data, regex) {
  let matches = [], match;
  do {
    match = regex.exec(data);
    if (Array.isArray(match)) {
      matches = [...matches, match[0]];
    }
  } while (match);

  return matches;
}

function getInlinesFileData(fileNameToInline) {
  try {
    let data = fs.readFileSync(fileNameToInline, 'utf-8');
    return data;
  } catch(error) {
    return 'File Not Found';
    console.log(error);
  }
}

function writeIntoFile(file, data, fileName) {
  fs.writeFile(file, data, { encoding: 'utf-8' }, (err, data) => {
    if (err) {
      console.log(`can't write to file: ${fileName}`)
    }
    console.log(`The file ${fileName} has been inlined!`);
  });
}