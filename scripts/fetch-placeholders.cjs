const fs = require('fs');
const path = require('path');
const https = require('https');

const members = [
  { name: 'Edusei Mikel', file: 'edusei-mikel.png' },
  { name: 'Edward Mugambi', file: 'edward-mugambi.png' },
  { name: 'Justine Maiyo', file: 'justine-maiyo.png' },
  { name: 'Collete Moindi', file: 'collete-moindi.png' },
  { name: 'Nzilani Micah', file: 'nzilani-micah.png' }
];

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filepath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file async. (But we don't check the result)
      reject(err.message);
    });
  });
};

async function main() {
  const outputDir = path.join(__dirname, '../public/assets/team');
  
  // Ensure directory exists
  if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const member of members) {
    const url = `https://placehold.co/400x400/0f172a/06b6d4.png?text=${encodeURIComponent(member.name)}`;
    const filepath = path.join(outputDir, member.file);
    try {
      await downloadImage(url, filepath);
    } catch (e) {
      console.error(`Failed to download ${member.name}:`, e);
    }
  }
}

main();
