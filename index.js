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
      // gets all matches in a file
      fs.readFile(fileToRead, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
          console.log(`can't read file: ${file}`)
        } else {
          let matches = [];
          const regex = /{{inline [\', \"][^}]+[\', \"]}}/g
          let match;
          do {
            match = regex.exec(data);
            if (Array.isArray(match)) {
              matches = [...matches, match[0]];
            }
          } while (match);
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

function getInlinesFileData(fileNameToInline) {
  console.log(fileNameToInline);
  let data = fs.readFileSync(fileNameToInline, 'utf-8');

  console.log(data);
  return data;
}

function writeIntoFile(file, data) {
  fs.writeFile(file, data, { encoding: 'utf-8' }, (err, data) => {
    if (err) {
      console.log(`can't write to file: ${file}`)
    }
    console.log(`The file ${file} has been saved!`);
  });
}