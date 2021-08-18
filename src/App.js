import "./App.css";
import { HashRouter as Router } from "react-router-dom";
import { Toast } from "antd-mobile";
import { initState, context as Context, reducer } from "./reducer";
import { useCallback, useEffect, useReducer, useState } from "react";
import Routes from "./route";

const App = (props) => {
  const store = useReducer(reducer, initState);
  let [state, dispatch] = store;
  const [isInit, setIsInit] = useState(false);
  const $msim = window.$msim;
  const $IM = window.$IM;
  const location = window.location;

  const logoutClear = useCallback(() => {
    window.localStorage.removeItem("userId");
    window.localStorage.removeItem("wsUrL");
    window.localStorage.removeItem("imToken");
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
        // location.href = "/#/chat";
      }
    },
    [dispatch]
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
    $msim.on($IM.EVENT.CONVERSATION_LIST_UPDATED, updateChats);
    let userId = window.localStorage.getItem("userId") || null;
    if (userId) {
      setIsInit(false);
      let wsUrL = window.localStorage.getItem("wsUrL");
      let imToken = window.localStorage.getItem("imToken");
      Toast.loading("Loading...", 0);
      $msim
        .login({
          wsUrl: wsUrL,
          imToken: imToken,
        })
        .then((loginRes) => {
          Toast.hide();
          dispatch({ type: "setUserId", payload: userId });
          setIsInit(true);
        })
        .catch((err) => {
          setIsInit(true);
          logoutClear();
          if (err?.msg) {
            Toast.info(err.msg);
          }
        });
    } else {
      window.location.href = "/#/login";
      setIsInit(true);
    }
  }, [
    dispatch,
    $IM,
    $msim,
    kickedOut,
    updateChats,
    login,
    logout,
    logoutClear,
    tokenNotFound,
  ]);

  useEffect(() => {
    initListener();
  }, [initListener]);
  return isInit ? (
    <Context.Provider value={store}>
      <Router>
        <Routes />
      </Router>
    </Context.Provider>
  ) : null;
};

export default App;
