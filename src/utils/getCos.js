import COS from "@/assets/js/cos-js-sdk-v5.min.js";
let cosOptions = null;
// 获取cosKey
const getCos = () => {
  return new Promise((resolve, reject) => {
    const $msim = window.$msim;
    $msim
      .getCosKey()
      .then((res) => {
        cosOptions.cosConfig = res.data;
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// 初始化cos
const initCos = () => {
  return new Promise((resolve, reject) => {
    getCos().then((initOptions) => {
      let temCos = new COS({
        SecretId: initOptions.id,
        SecretKey: initOptions.key,
        SecurityToken: initOptions.token,
        Timeout: initOptions.expTime,
        getAuthorization: (options, callback) => {
          getCos().then((data) => {
            callback({
              TmpSecretId: data.id,
              TmpSecretKey: data.key,
              SecurityToken: data.token,
              // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
              StartTime: data.startTime, // 时间戳，单位秒，如：1580000000
              ExpiredTime: data.expTime, // 时间戳，单位秒，如：1580000900
            });
          });
        },
      });
      cosOptions.cos = temCos;
      resolve();
    });
  });
};

export function getCosOptions() {
  return new Promise((resolve, reject) => {
    if (cosOptions === null) {
      console.log(11);
      cosOptions = {};
      initCos().then(() => {
        console.log(22);
        resolve(cosOptions);
      });
    } else {
      console.log(33);
      resolve(cosOptions);
    }
  });
}
