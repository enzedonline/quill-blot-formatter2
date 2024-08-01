const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production', 
  entry: './src/index.ts', 
  output: {
    filename: 'js/quill-blot-formatter2.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'umd',  
      name: 'QuillBlotFormatter2', 
    },
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    quill: 'Quill', 
    parchment: 'parchment'
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/css/quill-blot-formatter2.css', to: 'css' },
      ],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
