import fs from 'fs';
import { src, dest, task, series, parallel } from 'gulp';
import shell from 'gulp-shell';
import { escape } from 'querystring';

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

task('vite-build', shell.task(['tsc', 'vite build --config vite.config.ts --outDir ./dist/umd']));

task(
  'upload-dev',
  shell.task([
    'aws s3 sync ./dist/umd/ s3://public-szm/suzume-lib/dev/ --profile=suzume --metadata-directive REPLACE --cache-control max-age=0,no-cache,no-store,must-revalidate --acl public-read',
  ])
);

task(
  'copy-to-game',
  series(
    () => fs.promises.mkdir('../game/assets/Lib/Suzume/', { recursive: true }),
    () => src('./src/suzume.d.ts').pipe(dest('./dist/umd/')),
    () => src('./dist/umd/**/*').pipe(dest('../game/assets/Lib/Suzume/'))
  )
);

task(
  'upload-prod',
  async () => {
    const packageFile = await fs.promises.readFile('package.json', 'utf-8');
    const packageData = JSON.parse(packageFile);
    const version = packageData.version;
    await shell.task(`aws s3 sync ./dist/umd/ s3://public-szm/suzume-lib/${version}/ --profile=suzume --acl public-read`)();
  }
);

task('patch-game', async () => {
  const packageFile = await fs.promises.readFile('package.json', 'utf-8');
  const packageData = JSON.parse(packageFile);
  const version = packageData.version;

  const baseURL = 'https://public-szm.s3.ap-southeast-1.amazonaws.com/suzume-lib';

  const htmlFilePath = '../game/build-templates/web-mobile/index.html';
  let htmlFile = await fs.promises.readFile(htmlFilePath, 'utf-8');
  htmlFile = htmlFile.replace(new RegExp(escapeRegExp(baseURL) + '/.+/style.css'), `${baseURL}/${version}/style.css`);
  htmlFile = htmlFile.replace(new RegExp(escapeRegExp(baseURL) + '/.+/suzume.js'), `${baseURL}/${version}/suzume.js`);

  await fs.promises.writeFile(htmlFilePath, htmlFile, 'utf-8');
})

export const build = series('vite-build', 'copy-to-game', 'upload-dev');
export const release = parallel('upload-prod', 'patch-game');
