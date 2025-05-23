const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: ["quasar"],

  pluginOptions: {
    quasar: {
      importStrategy: "kebab",
      rtlSupport: false,
    },
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:7005',
        changeOrigin: true
      }
    }
  }
});
