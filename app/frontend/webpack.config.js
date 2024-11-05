// +------------------------------------------------+
// |         REDTETRIS FRONTEND DOCKERFILE          |
// +------------------------------------------------+

const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
    },
    resolve: {
        fallback: {
            path: require.resolve('path-browserify'),
            os: require.resolve('os-browserify/browser'),
            crypto: require.resolve('crypto-browserify'),
        },
    },
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        compress: true,
        port: process.env.REACT_APP_FRONTEND_PORT,
        setupMiddlewares: (middlewares, devServer) => {
            return middlewares;
        },
    },
};
