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
    entry:{
        app: ['babel-polyfill', path.resolve(__dirname, 'src/index')]
    },
    output:{
        path: path.resolve(__dirname, 'build'),
        filename:'index-[hash:7].js'
    },

    module:{
        loaders:[
            {
                test:/\.(js|jsx)$/,
                loaders: ['babel-loader?compact=false'],
                exclude: /node_modules/
            },
            {
                test: /\.less$/,
                include: [path.resolve(__dirname, 'src/assets/style'),'node_modules'],
                loader: ExtractTextPlugin.extract(['css', 'less'], { publicPath: '../'})
            },
            {
                test: /\.less$/,
                exclude: [path.resolve(__dirname, 'src/assets/style'),'node_modules'],
                loader: ExtractTextPlugin.extract("style-loader", "css-loader?modules&importLoaders=1&localIdentName=[name]_[local]_[hash:base64:5]!less-loader", { publicPath: '../'})
            },
            {
                test: /.(jpg|png)$/,
                loader:'url?name=images/[name][sha512:hash:base64:7].[ext]&limit=1000'
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
    plugins:[
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.CommonsChunkPlugin('common.js'),
        new ExtractTextPlugin("./css/[name]-[hash].css"),
        new HtmlWebpackPlugin({
            title: "Webpack",
            filename: 'index.html',
            template: 'src/index_prod.html',
            favicon: 'src/assets/images/healthd.ico',
            isProduction: false
        })
    ]
};