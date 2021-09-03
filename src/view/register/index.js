import { Button, InputItem, WhiteSpace, WingBlank, Toast } from "antd-mobile";
import { useInput } from "@/utils/useInput";
import { useHistory } from "react-router-dom";
import Background from "@/assets/img/login_bg.jpg";
import logo from "@/assets/img/logo.png";
import fetch from "@/utils/fetch";

const Register = () => {
  let history = useHistory();
  let [phone] = useInput("");
  let [nickName] = useInput("");
  let url =
    "https://msim-test-1252460681.cos.na-siliconvalley.myqcloud.com/pers/612FA7A3-144E-4978-A75C-9D9277167292.jpeg";

  const register = () => {
    if (!phone.value) {
      return Toast.info("请输入手机号码");
    }
    if (!nickName.value) {
      return Toast.info("请输入昵称");
    }
    Toast.loading("Loading...", 0);
    fetch
      .post("user/reg", {
        uid: phone.value,
        nick_name: nickName.value,
        avatar: url,
        verified: true, // 是否认证
        gold: true, // 是否是gold
        gold_exp_time: 0, // gold过期时间
        approved: true, // 是否是过审
        disabled: false, // 是否disable
        blocked: false, //	是否block
        hold: false, // 是否im hold
        deleted: false, // 是否im deleted
      })
      .then((res) => {
        Toast.success("注册成功");
        history.push("/login");
      });
  };
  return (
    <div className="login_wrapper">
      <img src={Background} alt="" className="logo_bg" />
      <div className="login_cont">
        <WingBlank>
          <div className="logo">
            <img className="logo_img" src={logo} alt="" />
          </div>
          <InputItem {...phone} type="number" placeholder="输入手机号">
            手机号码
          </InputItem>
          <InputItem {...nickName} type="number" placeholder="输入昵称">
            昵称
          </InputItem>
          <WhiteSpace />
          <Button type="primary" onClick={register}>
            注册
          </Button>
          <WhiteSpace />
        </WingBlank>
      </div>
    </div>
  );
};

export default Register;
