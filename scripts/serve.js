const { spawn } = require('child_process');

console.log("> gulp watch &");
const gulp = spawn('npx', ['gulp', 'watch'], { stdio: 'inherit', shell: true });

const args = process.argv.slice(2);
let angularTarget = 'serve';
const filteredArgs = [];

for (const arg of args) {
    if (arg.startsWith('--project=')) {
        continue;
    }
    if (arg.startsWith('--platform=')) {
        angularTarget = 'ionic-cordova-serve';
        continue;
    }
    filteredArgs.push(arg);
}

console.log(`> NODE_OPTIONS=--max-old-space-size=4096 ng run app:${angularTarget} ${filteredArgs.join(' ')}`);

const env = Object.assign({}, process.env, { NODE_OPTIONS: '--max-old-space-size=4096' });
const ng = spawn('npx', ['ng', 'run', `app:${angularTarget}`].concat(filteredArgs), { stdio: 'inherit', shell: true, env: env });

ng.on('close', (code) => {
    gulp.kill();
    process.exit(code);
});

gulp.on('close', (code) => {
    ng.kill();
    process.exit(code);
});
