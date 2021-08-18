import HomeFooter from "@/components/homeFooter";
import {
  List,
  Switch,
  Button,
  WhiteSpace,
  WingBlank,
  Toast,
} from "antd-mobile";
import { useHistory } from "react-router-dom";
import { useContext, useState } from "react";
import { context } from "@/reducer";
import "./my.css";
const Item = List.Item;

const My = () => {
  const $msim = window.$msim;
  let [state, dispatch] = useContext(context);
  let history = useHistory();
  const [isFF, setIsFF] = useState(false);
  const logout = () => {
    $msim
      .logout()
      .then((res) => {
        dispatch({ type: "clear" });
        window.localStorage.removeItem("userId");
        window.localStorage.removeItem("wsUrL");
        window.localStorage.removeItem("imToken");
        history.push("/login");
      })
      .catch((err) => {
        return Toast.info({
          message: err?.msg || err,
        });
      });
  };
  return (
    <div className="my_wrapper">
      <div className="my_main">
        <WingBlank>
          <div className="avatar">
            <img
              src={require("@/assets/img/curUser.jpg").default}
              className="avatar_img"
              alt=""
            />
          </div>
          <List className="my-list">
            <Item extra={state.curUserId}>用户ID</Item>
            <Item extra={<Switch checked={isFF} onChange={setIsFF} />}>
              是否付费
            </Item>
            <Item extra={<Switch checked={isFF} onChange={setIsFF} />}>
              是否认证
            </Item>
          </List>
          <WhiteSpace />
          <Button type="warning" onClick={logout}>
            退出
          </Button>
          <WhiteSpace />
        </WingBlank>
      </div>
      <HomeFooter selectedTab="my"></HomeFooter>
    </div>
  );
};

export default My;
