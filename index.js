const fs = require('fs');

let filesInDir = fs.readdirSync('./');

// Filter HTML Files
let htmlFiles = filesInDir.filter((file) => {
  // fs.statSync(file).isFile()
  return file.match(/[\w,\d]+\.html/g) ;
});

htmlFiles.forEach((file) => {
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


          writeIntoFile(fileToRead, data);
        }

      });
    }
  });
});

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

function writeIntoFile(file, data) {
  fs.writeFile(file, data, { encoding: 'utf-8' }, (err, data) => {
    if (err) {
      console.log(`can't write to file: ${file}`)
    }
    console.log(`The file ${file} has been saved!`);
  });
}