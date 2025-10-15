const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// Load .env once and prepare keys for DefinePlugin (do not override global process)
const parsedEnv = (dotenv.config().parsed) || {};
const envKeys = Object.keys(parsedEnv).reduce((acc, key) => {
  acc[`process.env.${key}`] = JSON.stringify(parsedEnv[key]);
  return acc;
}, {});

const publicPath = '/';

module.exports = (webpackEnv, argv = {}) => {
  const modeFromArgv = argv.mode;
  const nodeEnv = process.env.NODE_ENV;
  const isProd = (modeFromArgv || nodeEnv) === 'production';

  return {
    mode: isProd ? 'production' : 'development',
    entry: path.join(__dirname, 'src', 'index.js'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: publicPath,
      filename: isProd ? 'js/[name].[contenthash:8].js' : 'js/[name].js',
      assetModuleFilename: 'assets/img/[name][ext][query]',
      clean: false, // we control cleaning via plugin only in prod
    },
    devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map',
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },
    devServer: {
      port: 3000,
      historyApiFallback: true,
      hot: true,
      client: {
        overlay: true,
      },
      static: {
        directory: path.resolve(__dirname, 'public'),
        watch: false,
      },
    },
    externals: {
      config: JSON.stringify({
        apiUrl: '',
        publicPath: '/',
      }),
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
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
            },
          },
        },
        {
          test: /\.css$/,
          use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'],
        },
        {
          test: /\.scss$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.(jpe?g|png|gif|woff2?|otf|eot|ttf|svg)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 4 * 1024,
            },
          },
        },
      ],
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'public', 'index.html'),
        filename: './index.html',
        favicon: './src/files/Icons/DaftarProIcon.svg',
      }),
      ...(isProd
        ? [
            new MiniCssExtractPlugin({
              filename: 'css/[name].[contenthash:8].css',
              chunkFilename: 'css/[id].[contenthash:8].css',
            }),
            new CleanWebpackPlugin({
              cleanOnceBeforeBuildPatterns: ['css/*.*', 'js/*.*', 'fonts/*.*', 'images/*.*'],
            }),
          ]
        : []),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
      }),
      new webpack.DefinePlugin({
        ...envKeys,
      }),
    ],
    snapshot: {
      managedPaths: [/^(.+?[\\\/]node_modules[\\\/])/],
    },
    optimization: {
      splitChunks: { chunks: 'all' },
      runtimeChunk: 'single',
    },
  };
};
