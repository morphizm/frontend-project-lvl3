const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(scss)$/,
        use: [{
          loader: 'style-loader', // inject CSS to page
        },
        {
          loader: 'css-loader', // translates CSS into CommonJS modules
        },
        {
          loader: 'sass-loader', // compiles Sass to CSS
        }],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'RSS',
      template: 'index.html',
    }),
  ],
};
