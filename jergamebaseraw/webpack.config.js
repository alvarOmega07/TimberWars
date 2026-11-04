const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // Punto de entrada de la aplicación
  entry: './src/index.js',

  // Dónde se guarda el bundle generado
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true // Limpia la carpeta 'dist' antes de cada build
  },

  // Genera el HTML a partir de la plantilla e inyecta el bundle
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    }),
    // Copia los recursos (audio, imágenes...) a dist/assets
    new CopyWebpackPlugin({
      patterns: [{ from: 'public/assets', to: 'assets' }]
    })
  ],

  // Servidor de desarrollo con recarga automática
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    port: 3000,
    open: true, // Abre el navegador automáticamente
    hot: true
  },

  // Phaser supera el límite de tamaño recomendado; ocultamos ese aviso
  performance: { hints: false },

  mode: 'development'
};
