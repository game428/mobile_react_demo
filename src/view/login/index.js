import { Button, InputItem, WhiteSpace, WingBlank, Toast } from "antd-mobile";
import { useInput } from "@/utils/useInput";
import { useHistory } from "react-router-dom";
import { useContext, useState } from "react";
import { context } from "@/reducer";
import "./login.css";
//首先引入需要的图片路径
import Background from "@/assets/img/login_bg.jpg";
import logo from "@/assets/img/logo.png";

function Login() {
  let [state, dispatch] = useContext(context);
  let history = useHistory();
  let [phone, setPhone] = useInput("");
  const [isLogoin, setIsLogoin] = useState(false);
  let wsURL = "wss://im.ekfree.com:18988";
  // let wsURL = "ws://192.168.0.114:18988";
  let $msim = window.$msim;
  if (state?.curUserId) {
    setPhone(state.curUserId);
    setIsLogoin(true);
  }
  const login = () => {
    if (isLogoin) {
      history.push("/home");
      return;
    }
    if (!phone.value) {
      return Toast.info("请输入手机号码");
    }
    if (!state.curUserId) {
      Toast.Loading();
      $msim
        .login({
          wsUrl: wsURL,
          imToken: "testImToken",
          testId: phone.value,
        })
        .then((loginRes) => {
          Toast.hide();
          window.localStorage.setItem("userId", phone.value);
          dispatch({ type: "setUserId", payload: phone.value });
          // console.log(state, 3321);
          history.push("/home");
        })
        .catch((err) => {
          if (err?.msg) {
            Toast.info(err.msg);
          }
        });
    }
  };
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
        </WingBlank>
      </div>
    </div>
  );
}
export default Login;
