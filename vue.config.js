// vue.config.js（项目根目录，没有就新建）
module.exports = {
  // 静态资源路径适配
  publicPath: './',
  // 打包输出目录（默认dist，不用改）
  outputDir: 'dist',
  // 生产环境关闭 sourcemap（减小包体积）
  productionSourceMap: false,
  // 适配 Vercel 端口
  devServer: {
    port: 8080,
    open: true
  }
}
