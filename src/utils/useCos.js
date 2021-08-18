import { useContext } from "react";
import { context } from "@/reducer";
import COS from "@/assets/js/cos-js-sdk-v5.min.js";

export function useCos() {
  const $msim = window.$msim;
  const [state, dispatch] = useContext(context);
  console.log(state, 141);

  // 初始化cos
  function initCos(config) {
    let cosOptions = config;
    dispatch({
      type: "setCos",
      payload: new COS({
        getAuthorization: (options, callback) => {
          if (cosOptions) {
            callback({
              TmpSecretId: cosOptions.id,
              TmpSecretKey: cosOptions.key,
              SecurityToken: cosOptions.token,
              // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
              StartTime: cosOptions.startTime, // 时间戳，单位秒，如：1580000000
              ExpiredTime: cosOptions.expTime, // 时间戳，单位秒，如：1580000900
            });
            cosOptions = null;
          } else {
            getCos((data) => {
              callback({
                TmpSecretId: data.id,
                TmpSecretKey: data.key,
                SecurityToken: data.token,
                // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
                StartTime: data.startTime, // 时间戳，单位秒，如：1580000000
                ExpiredTime: data.expTime, // 时间戳，单位秒，如：1580000900
              });
            });
          }
        },
      }),
    });
  }

  // 获取cosKey
  function getCos(callback) {
    $msim.getCosKey().then((res) => {
      dispatch({
        type: "setCosConfig",
        payload: res.data,
      });
      callback(res.data);
    });
  }
  return [(v) => initCos(v), (v) => getCos(v)];
}
