const {
  override,
  fixBabelImports,
  addWebpackAlias,
  addPostcssPlugins,
  addWebpackPlugin,
} = require("customize-cra");
const path = require("path");
const addCustomize = () => (config) => {
  // 关闭sourceMap
  config.devtool = false;
  // 配置打包后的文件位置
  config.output.publicPath = "./";
  return config;
};
//引入该插件
const CompressionWebpackPlugin = require("compression-webpack-plugin");
//匹配此 {RegExp} 的资源
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

module.exports = override(
  fixBabelImports("import", {
    libraryName: "antd-mobile",
    style: "css",
  }),
  addWebpackPlugin(
    new CompressionWebpackPlugin({
      filename: "[path].gz[query]", //目标资源名称
      algorithm: "gzip",
      test: productionGzipExtensions, //处理所有匹配此 {RegExp} 的资源
      threshold: 10240, //只处理比这个值大的资源。按字节计算(楼主设置10K以上进行压缩)
      minRatio: 0.8, //只有压缩率比这个值小的资源才会被处理
    })
  ),
  addPostcssPlugins([
    require("postcss-pxtorem")({
      rootValue: 16,
      propList: ["*"],
    }),
  ]),
  addWebpackAlias({
    ["@"]: path.resolve(__dirname, "src"),
  }),
  addCustomize()
);
