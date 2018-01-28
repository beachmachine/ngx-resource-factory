"use strict";


/**
 * Module imports
 */
const
    path = require('path');


module.exports = {
    devtool: 'inline-source-map',

    module: {
        rules: [
            /**
             * Bundle configurations
             */
            {
                test: /\.(ts|tsx)$/,
                use: [
                    'ts-loader'
                ]
            }
        ]
    },
    plugins: [],
    resolve: {
        extensions: [
            '.ts',
            '.tsx',
            '.js',
            '.jsx'
        ],
        modules: [
            path.resolve(__dirname, '..', 'src'),
            path.resolve(__dirname, '..', 'node_modules')
        ]
    }
};
