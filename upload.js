import fs from 'fs';
import path from 'path';
import downloader from 'image-downloader';
import minimist from 'minimist';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// get the url from the command line
const url = minimist(process.argv).url;
const local = minimist(process.argv).local;
console.log(url);

// create folder for images if it doesn't exist
const projectDir = path.join(__dirname);
console.log(projectDir);
const timestamp = Date.now();
const dir = path.join(projectDir, 'images');
const folder = path.join(dir, timestamp.toString());

export async function createImageFolder() {
  console.log(projectDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
  if (!local) {
    downloadImage(url, folder).then(() => {
      // commit the image to github
      const command = `
      git add --all; \
      git commit -m "Add image ${timestamp}"; \
      git push origin main});
    `;
      exec(command, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(stdout);
        console.log(stderr);
      });
    });
  } else {
    copyImage(url, folder).then(() => {
      // commit the image to github
      const command = `
      git add --all; \
      git commit -m "Add image ${timestamp}"; \
      git push origin main});
    `;
      exec(command, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(stdout);
        console.log(stderr);
      });
    });
  }
}

async function downloadImage(url, folder) {
  const name = url.split('/').pop();
  const options = {
    url,
    dest: path.resolve(folder, name),
    extractFilename: false,
  };

  return downloader
    .image(options)
    .then(({ filename, image }) => {
      console.log('Saved to', filename);
      console.log(
        'The image is at',
        `https://raw.githubusercontent.com/tedtalksbits/staticImageServer/main/images/${timestamp}/${name}`
      );
    })
    .catch((err) => {
      console.error(err);
    });
}

async function copyImage(imgPath) {
  console.log(imgPath);
  // copy image to folder
  const name = imgPath.split('\\').pop();
  console.log(name);

  return fs.copyFile(imgPath, path.resolve(folder, name), (err) => {
    if (err) throw err;
    console.log('The image was copied to the folder');
    console.log(
      'The image is at',
      `https://raw.githubusercontent.com/tedtalksbits/staticImageServer/main/images/${timestamp}/${name}`
    );
  });
}

function validImage(url) {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];
  const fileExtension = url.split('.').pop();

  return validExtensions.includes(fileExtension);
}

createImageFolder();
