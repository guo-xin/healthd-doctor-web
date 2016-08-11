var autoprefixer = require('autoprefixer');
var webpack = require('webpack');
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require('path');

module.exports = {
    resolve: {
        extensions: ['', '.js', '.jsx'], //后缀名自动补全
        root: [
            path.resolve('./src')
        ]
    },
    entry: {
        app: ['babel-polyfill', path.resolve(__dirname, 'src/index')],
        vendor: [
            'react',
            'react-dom',
            'react-router',
            'redux',
            'react-redux',
            'redux-thunk',
            'redux-reset',
            'react-cookie',
            'isomorphic-fetch',
            'history',
            'es6-promise',
            'antd'
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index-[hash:7].js'
    },
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                loaders: ['babel-loader?cacheDirectory&compact=false&retainLines=true'],
                exclude: /node_modules/
            },
            {
                test: /\.less$/,
                include: [path.resolve(__dirname, 'src/assets/style'), 'node_modules/antd'],
                loader: ExtractTextPlugin.extract(['css', 'postcss', 'less'], {publicPath: '../'})
            },
            {
                test: /\.less$/,
                exclude: [path.resolve(__dirname, 'src/assets/style'), 'node_modules'],
                loader: ExtractTextPlugin.extract("style-loader", "css-loader?modules&importLoaders=1&localIdentName=[name]_[local]_[hash:base64:5]!postcss-loader!less-loader", {publicPath: '../'})
            },
            {
                test: /.(jpg|png)$/,
                loader: 'url?name=images/[name][sha512:hash:base64:7].[ext]&limit=1000'
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url?name=font/[hash:base64:5].[ext]&limit=10000&minetype=application/font-woff"
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file?name=font/[hash:base64:5].[ext]"
            },
            {
                test: /\.wav$/,
                loader: "file?name=media/[hash:base64:5].[ext]"
            }
        ]
    },

    postcss: [autoprefixer],

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity,
            filename: 'vendor.bundle.js'
        }),
        new ExtractTextPlugin("./css/[name]-[contenthash:7].css"),
        new HtmlWebpackPlugin({
            title: "Webpack",
            filename: 'index.html',
            template: 'src/index.html',
            favicon: 'src/assets/images/healthd.ico',
            isProduction: false
        })
    ],

    devServer: {
        proxy: {
            '/v2/parser/*': {
                target: "https://test.d.healthdoc.cn/healthd-tools",
                secure: false,
                changeOrigin: true
            },

            '/v2/oss/*': {
                target: "https://test.d.healthdoc.cn/healthd-tools",
                secure: false,
                changeOrigin: true
            },

            '/v2/lucene/*': {
                target: "https://test.d.healthdoc.cn/healthd-tools",
                secure: false,
                changeOrigin: true
            },

            '/v2/*': {
                target: "https://test.d.healthdoc.cn",
                secure: false,
                changeOrigin: true
            }
        }
    }

};