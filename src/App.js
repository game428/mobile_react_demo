import "./App.css";
import { HashRouter as Router } from "react-router-dom";
import { initState, context, reducer } from "./reducer";
import { useReducer } from "react";
import Routes from "./route";
function App() {
  let store = useReducer(reducer, initState);
  let dispatch = store[1];
  let $msim = window.$msim;
  let $IM = window.$IM;
  let wsURL = "wss://im.ekfree.com:18988";
  function initListener() {
    $msim.on($IM.EVENT.CONNECT_CHANGE, wsChange);
    $msim.on($IM.EVENT.LOGIN, login);
    $msim.on($IM.EVENT.LOGOUT, logout);
    $msim.on($IM.EVENT.KICKED_OUT, kickedOut);
    $msim.on($IM.EVENT.TOKEN_NOT_FOUND, tokenNotFound);
    $msim.on($IM.EVENT.SYNC_CHATS_CHANGE, syncChats);
    $msim.on($IM.EVENT.MESSAGE_RECEIVED, received);
    $msim.on($IM.EVENT.MESSAGE_REVOKED, revoked);
    $msim.on($IM.EVENT.CONVERSATION_LIST_UPDATED, updateChats);
    // let userId = window.localStorage.getItem("userId") || null;
    let userId = null;
    if (userId) {
      // data.isInit = false;
      // const loading = $toast.loading({
      //   message: "登陆中...",
      //   forbidClick: true,
      //   duration: 0,
      //   loadingType: "spinner",
      // });
      $msim
        .login({
          // wsUrl: res.data.url,
          // imToken: res.data.token,
          wsUrl: wsURL,
          imToken: "testImToken",
          testId: userId,
        })
        .then((loginRes) => {
          // loading.close();
          // store.commit("setUserId", userId);
          // data.isInit = true;
        })
        .catch((err) => {
          if (err?.msg) {
            // $toast(err.msg);
          }
        });
    } else {
      // data.isInit = true;
    }
  }

  // 网络状态监听
  function wsChange(options) {
    console.log("连接状态变更", options);
  }
  // 登录
  function login(options) {
    console.log("登录成功", options);
    let userId = window.localStorage.getItem("userId");
    if (userId) {
      // dispatch({ type: "setUserId", payload: userId });
      console.log(userId, 11);
      // matchPath("/home", {
      //   path: "/home",
      // });
      // router.push({ name: "home" });
    }
  }
  // 退出
  function logout(options) {
    dispatch({ type: "clear" });
    // router.push({ name: "login" });
  }
  // 被踢
  function kickedOut(options) {
    dispatch({ type: "clear" });
    // router.push({ name: "login" });
  }
  // token失效
  function tokenNotFound(options) {
    dispatch({ type: "clear" });
    // router.push({ name: "login" });
  }
  // 同步会话状态
  function syncChats(options) {
    console.log("同步会话", options, store);
  }
  // 接收消息
  function received(options) {
    console.log("接收到消息", options);
    dispatch({ type: "updateMsgs", payload: options.data });
  }
  // 撤回消息
  function revoked(options) {
    console.log("接收到撤回消息", options);
    dispatch({ type: "revokeMsgs", payload: options.data });
  }
  // 更新会话
  function updateChats(options) {
    console.log("会话列表更新", options.data);
    dispatch({ type: "updateChats", payload: options.data });
  }
  initListener();
  return (
    <context.Provider value={store}>
      <Router>
        <Routes />
      </Router>
    </context.Provider>
  );
}

export default App;
