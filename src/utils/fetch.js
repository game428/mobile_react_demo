import axios from "axios";
import { Toast } from "antd-mobile";
import sha1 from "js-sha1";
const timeout = 5000;
let baseURL = "https://im.ekfree.com:18788/";
const service = axios.create({
  // 设置axios 允许携带cookie
  // withCredentials: true,
  // 设置axios 请求过期时间
  timeout: timeout,
  // 设置axios 请求前置路径
  baseURL: baseURL,
});
// 设置axios 请求拦截
service.interceptors.request.use(
  (config) => {
    let secret = "asfasdasd123";
    let nonce = Math.ceil(Math.random() * 10e9);
    let timestamp = new Date().getTime() * 1000;
    let sig = sha1(secret + nonce + timestamp);
    config.headers["nonce"] = nonce;
    config.headers["timestamp"] = timestamp;
    config.headers["sig"] = sig;
    config.headers["appid"] = 1;
    // config.headers["X-Requested-With"] = "XMLHttpRequest";
    // config["crossDomain"] = true;
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);
service.interceptors.response.use(
  /**
   * 下面的注释为通过在response里，自定义code来标示请求状态
   * 当code返回如下情况则说明权限有问题，登出并返回到登录页
   * 如想通过xmlhttprequest来状态码标识 逻辑可写在下面error中
   * 以下代码均为样例，请结合自生需求加以修改，若不需要，则可删除
   */
  (response) => {
    const res = response.data;
    if (res && res.code === 0) {
      return response.data;
    } else {
      let msg = "接口参数错误";
      if (res.code === 2001) {
        msg = "图形验证码错误";
      } else if (res && res.msg) {
        msg = res.msg;
      }
      Toast.info(msg);
      return Promise.reject(res);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default service;
