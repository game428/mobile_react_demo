import { Button, InputItem, WhiteSpace, WingBlank, Toast } from "antd-mobile";
import { useInput } from "@/utils/useInput";
import { useHistory } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { context } from "@/reducer";
import "./login.css";
//首先引入需要的图片路径
import Background from "@/assets/img/login_bg.jpg";
import logo from "@/assets/img/logo.png";
import fetch from "@/utils/fetch";

const Login = () => {
  let [state, dispatch] = useContext(context);
  let history = useHistory();
  let [phone, setPhone] = useInput("");
  const [isLogoin, setIsLogoin] = useState(false);
  // let wsURL = "wss://im.ekfree.com:18988";
  // let wsURL = "ws://192.168.0.114:18988";
  let $msim = window.$msim;
  const login = () => {
    if (isLogoin) {
      history.push("/chat");
      return;
    }
    if (!phone.value) {
      return Toast.info("请输入手机号码");
    }
    if (!state.curUserId) {
      let wsURL, imToken;
      Toast.loading("Loading...", 0);
      fetch
        .post("user/iminit", {
          uid: phone.value,
          ctype: 1,
        })
        .then((res) => {
          wsURL = res.data.url;
          imToken = res.data.token;
          return $msim.login({
            wsUrl: res.data.url,
            imToken: res.data.token,
            subAppId: 1,
          });
        })
        .then((loginRes) => {
          Toast.hide();
          window.localStorage.setItem("userId", phone.value);
          window.localStorage.setItem("wsUrL", wsURL);
          window.localStorage.setItem("imToken", imToken);
          dispatch({ type: "setUserId", payload: phone.value });
          history.push("/chat");
        })
        .catch((err) => {
          if (err?.msg) {
            Toast.info(err.msg);
          }
        });
    }
  };
  useEffect(() => {
    if (state.curUserId) {
      setPhone(state.curUserId);
      setIsLogoin(true);
      history.push("/chat");
    }
  }, [state.curUserId, setPhone, history]);
  return (
    <div className="login_wrapper">
      <img src={Background} alt="" className="logo_bg" />
      <div className="login_cont">
        <WingBlank>
          <div className="logo">
            <img className="logo_img" src={logo} alt="" />
          </div>
          <InputItem
            {...phone}
            type="number"
            maxLength="11"
            placeholder="输入手机号"
            disabled={isLogoin}
          >
            手机号码
          </InputItem>
          <WhiteSpace />
          <Button type="primary" onClick={login}>
            登录
          </Button>
          <WhiteSpace />
          <Button
            onClick={() => {
              history.push("/register");
            }}
          >
            注册
          </Button>
          <WhiteSpace />
        </WingBlank>
      </div>
    </div>
  );
};
export default Login;
