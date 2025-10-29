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
  mode: "development",
  entry: path.join(__dirname, "src", "index.js"),
  output: {
    path:path.resolve(__dirname, "dist"),
    publicPath: publicPath, // base path where referenced files will be look for
  },
optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        antd: {
          test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
          name: 'antd',
          priority: 20,
        },
        mui: {
          test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
          name: 'mui',
          priority: 20,
        },
        charts: {
          test: /[\\/]node_modules[\\/](chart\.js|apexcharts)[\\/]/,
          name: 'charts',
          priority: 15,
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
          name: 'react-vendor',
          priority: 30,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
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