const {
  override,
  fixBabelImports,
  addWebpackAlias,
  addPostcssPlugins,
} = require("customize-cra");
const path = require("path");
const addCustomize = () => (config) => {
  // 关闭sourceMap
  config.devtool = false;
  // 配置打包后的文件位置
  config.output.publicPath = "./";
  return config;
};

module.exports = override(
  fixBabelImports("import", {
    libraryName: "antd-mobile",
    // libraryName: "zarm",
    style: "css",
  }),
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
