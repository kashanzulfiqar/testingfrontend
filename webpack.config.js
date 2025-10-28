const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const env = dotenv.config().parsed;

// reduce it to a nice object
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

// Add process definition
const definePlugin = new webpack.DefinePlugin({
  'process': JSON.stringify({}),
  ...envKeys
});

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const publicPath = '/';

module.exports = {
  mode: "production",
  entry: path.join(__dirname, "src", "index.js"),
  output: {
    path:path.resolve(__dirname, "dist"),
    publicPath: publicPath, // base path where referenced files will be look for
  },
  devServer: {
    port: 3000,
    historyApiFallback: true,
  },
  externals: {
   config: JSON.stringify({
       apiUrl: '',
       publicPath : '/'            
   })
 },
 resolve: {
   extensions: ['.tsx', '.ts', '.js', '.jsx'],
   alias: {
          Assets: path.resolve(__dirname, 'src/assets/'),
       },
 },
  module: {
    rules: [
           {
             test: /\.(js|jsx)$/,
             exclude: /node_modules/,
             use: {
               loader: "babel-loader"
             }
           },
           {
               test: /\.css$/,
               use: ['style-loader', 'css-loader'],
           },
           {
             test: /\.scss$/,
             use: [
               {
                 loader: MiniCssExtractPlugin.loader
               },
               'css-loader',
               {
                 loader: "sass-loader"
               }
             ]
           },
           {
             test: /\.(jpe?g|png|gif|woff|woff2|otf|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
             use: [
                 {
                     loader: 'url-loader',
                     options: {
                         limit: 1000,
                         name : 'assets/img/[name].[ext]'
                     }
                 }
             ]
         }
       ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "index.html"),
      filename: "./index.html",
      favicon: './src/files/Icons/DaftarProIcon.svg'
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
      chunkFilename: "css/[id].css"
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["css/*.*", "js/*.*", "fonts/*.*", "images/*.*"]
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    definePlugin,
  ],
}
