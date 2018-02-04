require('babel-polyfill');
require('reflect-metadata');
require('zone.js/dist/zone');
require('zone.js/dist/async-test');
require('zone.js/dist/fake-async-test');
require('zone.js/dist/long-stack-trace-zone');
require('zone.js/dist/proxy');
require('zone.js/dist/sync-test');
require('zone.js/dist/jasmine-patch');


const
    browserTesting = require('@angular/platform-browser-dynamic/testing'),
    coreTesting = require('@angular/core/testing'),
    context = require.context(__dirname + '/../src/', true, /\.spec\.ts$/);


/*
 * Configure jasmine
 */
Error.stackTraceLimit = Infinity;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;


/*
 * Initialize Angular testing environment
 */
coreTesting.TestBed.resetTestEnvironment();
coreTesting.TestBed.initTestEnvironment(
    browserTesting.BrowserDynamicTestingModule,
    browserTesting.platformBrowserDynamicTesting()
);


/*
 * Load testing modules
 */
context.keys().forEach(context);
