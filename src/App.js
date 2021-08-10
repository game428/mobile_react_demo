import "./App.css";
import { HashRouter as Router } from "react-router-dom";
import { Toast } from "antd-mobile";
import { initState, context as Context, reducer } from "./reducer";
import { useCallback, useEffect, useReducer, useState } from "react";
import Routes from "./route";
import fetch from "@/utils/fetch";

const App = (props) => {
  const store = useReducer(reducer, initState);
  let dispatch = store[1];
  const [isInit, setIsInit] = useState(false);
  const $msim = window.$msim;
  const $IM = window.$IM;
  const location = window.location;

  const logoutClear = useCallback(() => {
    window.localStorage.removeItem("userId");
    dispatch({ type: "clear" });
    location.href = "/#/login";
  }, [dispatch, location]);

  // 网络状态监听
  const wsChange = (options) => {
    console.log("连接状态变更", options);
  };
  // 登录
  const login = useCallback(
    (options) => {
      console.log("登录成功", options);
      let userId = window.localStorage.getItem("userId");
      if (userId) {
        dispatch({ type: "setUserId", payload: userId });
        location.href = "/#/chat";
      }
    },
    [dispatch, location]
  );
  // 退出
  const logout = useCallback(
    (options) => {
      logoutClear();
    },
    [logoutClear]
  );
  // 被踢
  const kickedOut = useCallback(
    (options) => {
      logoutClear();
    },
    [logoutClear]
  );
  // token失效
  const tokenNotFound = useCallback(
    (options) => {
      logoutClear();
    },
    [logoutClear]
  );
  // 同步会话状态
  const syncChats = (options) => {
    console.log("同步会话", options);
  };
  // 接收消息
  const received = useCallback(
    (options) => {
      console.log("接收到消息", options);
      dispatch({ type: "updateMsgs", payload: options.data });
    },
    [dispatch]
  );
  // 撤回消息
  const revoked = useCallback(
    (options) => {
      console.log("接收到撤回消息", options);
      dispatch({ type: "revokeMsgs", payload: options.data });
    },
    [dispatch]
  );
  // 更新会话
  const updateChats = useCallback(
    (options) => {
      console.log("会话列表更新", options.data);
      dispatch({ type: "updateChats", payload: options.data });
    },
    [dispatch]
  );

  const initListener = useCallback(() => {
    $msim.on($IM.EVENT.CONNECT_CHANGE, wsChange);
    $msim.on($IM.EVENT.LOGIN, login);
    $msim.on($IM.EVENT.LOGOUT, logout);
    $msim.on($IM.EVENT.KICKED_OUT, kickedOut);
    $msim.on($IM.EVENT.TOKEN_NOT_FOUND, tokenNotFound);
    $msim.on($IM.EVENT.SYNC_CHATS_CHANGE, syncChats);
    $msim.on($IM.EVENT.MESSAGE_RECEIVED, received);
    $msim.on($IM.EVENT.MESSAGE_REVOKED, revoked);
    $msim.on($IM.EVENT.CONVERSATION_LIST_UPDATED, updateChats);
    let userId = window.localStorage.getItem("userId") || null;
    if (userId) {
      setIsInit(false);
      Toast.loading("Loading...", 0);
      fetch
        .post("user/iminit", {
          uid: userId,
          ctype: 1,
        })
        .then((res) => {
          return $msim.login({
            wsUrl: res.data.url,
            imToken: res.data.token,
          });
        })
        .then((loginRes) => {
          Toast.hide();
          window.localStorage.setItem("userId", userId);
          dispatch({ type: "setUserId", payload: userId });
          setIsInit(true);
          // window.location.href= "/#/chat"
        })
        .catch((err) => {
          setIsInit(true);
          if (err?.msg) {
            Toast.info(err.msg);
          }
        });
    } else {
      setIsInit(true);
    }
  }, [
    dispatch,
    $IM,
    $msim,
    kickedOut,
    received,
    revoked,
    updateChats,
    login,
    logout,
    tokenNotFound,
  ]);

  useEffect(() => {
    initListener();
  }, [initListener]);
  return (
    <Context.Provider value={store}>
      {isInit ? (
        <Router>
          <Routes />
        </Router>
      ) : null}
    </Context.Provider>
  );
};

export default App;
