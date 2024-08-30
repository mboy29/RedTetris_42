// +------------------------------------------------+
// |         REDTETRIS FRONTEND DOCKERFILE          |
// +------------------------------------------------+

/*
    This file is the webpack configuration file for 
    the frontend of the Red Tetris project.

    This file is used to compile the frontend code
    and serve it to the browser.
*/

// +----------------- REQUIREMENTS -----------------+

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// +------------------- MODULES --------------------+

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
    module: {
        rules: [
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
            loader: 'babel-loader',
            },
        },{
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader'],
        }, {
            test: /\.(scss|sass)$/,
            use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
            ],
        },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
        template: './public/index.html',
        }),
        new MiniCssExtractPlugin({
        filename: 'styles.css',
        }),
    ],
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        compress: true,
        port: 3000,
        setupMiddlewares: (middlewares, devServer) => {
        return middlewares;
        },
    },
};
