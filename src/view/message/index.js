import { useContext, useState, useEffect, useCallback, useRef } from "react";
import { context } from "@/reducer";
import { NavBar, Icon, Pull, ActivityIndicator } from "antd-mobile";
import "./message.css";
import MsgSend from "@/components/msgSend";

const REFRESH_STATE = {
  normal: 0, // 普通
  pull: 1, // 下拉刷新（未满足刷新条件）
  drop: 2, // 释放立即刷新（满足刷新条件）
  loading: 3, // 加载中
  success: 4, // 加载成功
  failure: 5, // 加载失败
};

const Message = (router) => {
  console.log(1, router);
  let $msim = window.$msim;
  let [state, dispatch] = useContext(context);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(REFRESH_STATE.normal);
  const msgRef = useRef();
  function hideAll() {}
  const loadData = () => {};
  return (
    <div className="content" onClick={hideAll}>
      <NavBar
        mode="light"
        icon={<Icon type="left" />}
        onLeftClick={() => window.history.back()}
      >
        {router.match.params.conversationID}
      </NavBar>
      <div className="message_list"></div>
      <MsgSend />
    </div>
  );
};

export default Message;
