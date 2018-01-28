const
    path = require('path'),
    puppeteer = require('puppeteer'),
    webpackConfig = require(path.resolve(__dirname, '..', 'webpack', 'webpack.test.js'));


// Set the binary path for the puppeteer chrome binary
process.env.CHROME_BIN = puppeteer.executablePath();


module.exports = function (config) {
    config.set({
        basePath: '.',
        frameworks: [
            'jasmine'
        ],
        plugins: [
            require('karma-jasmine'),
            require('karma-webpack'),
            require('karma-chrome-launcher'),
            require('karma-sourcemap-loader'),
            require('karma-spec-reporter')
        ],
        files: [
            'karma.entry.js'
        ],
        preprocessors: {
            'karma.entry.js': [
                'webpack',
                'sourcemap'
            ]
        },
        reporters: [
            'spec'
        ],
        browsers: [
            'ChromeHeadlessNoSandbox'
        ],
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--disable-web-security', '--no-sandbox']
            }
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        singleRun: false,
        webpack: webpackConfig
    });
};
