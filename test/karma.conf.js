/* eslint-env node */
/* eslint no-console: off */

const path = require('path');
const fse = require('fs-extra');
const root = path.dirname(__dirname);
fse.emptyDirSync(path.join(root, 'tmp'));

// https://blog.cepharum.de/en/post/natively-unit-testing-es6-modules-in-browser-including-coverage.html

module.exports = function (config) {
	const configuration = {
		basePath: root,

		frameworks: [
			'jasmine',
		],

		reporters: [
			'progress',
		],

		files: [
			{ pattern: 'jehon-*.js' },
			{ pattern: 'test/*-test.js' },
			{ pattern: '**/*', included: false, watched: false },
		],

		autoWatch: true,

		browsers: ['ChromeHeadlessNoSandbox'],

		customLaunchers: {
			ChromeHeadlessNoSandbox: {
				base: 'ChromeHeadless',
				flags: ['--no-sandbox']
			}
		},
	};

	config.set(configuration);
};
