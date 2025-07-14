const chalk = require('chalk');
const figlet = require('figlet');

function printBanner() {
    return new Promise((resolve, reject) => {
        figlet.text('ZEID BOT', {
            font: 'Standard',
            horizontalLayout: 'default',
            verticalLayout: 'default'
        }, (err, data) => {
            if (err) {
                log('Lỗi khi tạo banner' + err || err.message, 'error');
                return reject(err);
            }
            console.log(chalk.cyanBright(data));
            resolve();
        });
    });
}

function log(data, option) {
    switch (option) {
        case "warn":
            console.log(chalk.bold.hex("#FFD700")('[ ! ] » ') + data);
            break;
        case "error":
            console.log(chalk.bold.hex("#FF0000")('[ ! ] » ') + data);
            break;
        case "info":
            console.log(chalk.bold.hex("#00BFFF")('[ ! ] » ') + data);
            break;
        default:
            console.log(chalk.bold.hex("33FFCC")(`${option} » `) + data);
            break;
    }
}

module.exports = {
    log,
    printBanner
};
