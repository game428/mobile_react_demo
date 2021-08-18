import {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { context } from "@/reducer";
import { NavBar, Icon, PullToRefresh, ListView, Toast } from "antd-mobile";
import "./message.css";
import MsgSend from "@/components/msgSend";
import MsgItem from "@/components/msgItem";

const Message = (router, a, b) => {
  const $msim = window.$msim;
  const $IM = window.$IM;
  const params = router.match.params;
  let uid = parseInt(params.uid);
  const [state, dispatch] = useContext(context);
  const ds = useMemo(() => {
    return new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1.msgId !== row2.msgId,
    });
  }, []);
  const [dataSource, setDataSource] = useState(ds);
  const [hasMore, setHasMore] = useState(true);
  const msgRef = useRef();
  const msgSendRef = useRef();
  const [isHideMore, setHideMore] = useState(true);
  const [isHideEmoji, setHideEmoji] = useState(true);
  const hideAll = () => {
    if (!isHideMore) setHideMore(true);
    if (!isHideEmoji) setHideEmoji(true);
  };
  const showMore = () => {
    if (isHideMore) setHideMore(false);
    if (!isHideEmoji) setHideEmoji(true);
  };
  const showEmoji = () => {
    if (isHideEmoji) setHideEmoji(false);
    if (!isHideMore) setHideMore(true);
  };
  const renderItem = (rowData, sectionID, rowID) => {
    return (
      <MsgItem
        key={rowData.onlyId}
        message={rowData}
        isSelf={rowData.fromUid !== uid}
        revoke={revoke}
        resend={() => {
          msgSendRef.current.resend(rowData);
        }}
      ></MsgItem>
    );
  };

  const initMessage = useCallback(
    (msgId) => {
      $msim
        .getMessageList({
          conversationID: params.conversationID,
          msgEnd: msgId,
        })
        .then((res) => {
          let msgs = res.data.messages;
          setHasMore(res.data.hasMore);
          if (msgs && msgs.length > 0) {
            dispatch({ type: "addMsgs", payload: msgs });
            if (!msgId) {
              scrollBottom();
            }
          }
        })
        .catch((err) => {
          return Toast.info(err?.msg || err);
        });
    },
    [$msim, dispatch, params]
  );

  // 模拟加载更多数据
  const loadData = useCallback(() => {
    let msgId;
    let msgList = state.msgList;
    if (msgList.length > 0) {
      msgId = msgList[0].msgId;
    }
    initMessage(msgId);
  }, [initMessage, state.msgList]);

  const revoke = (msgObj) => {
    $msim
      .revokeMessage({
        conversationID: msgObj.conversationID,
        msgId: msgObj.msgId,
      })
      .then((res) => {
        msgObj.type = 31;
        return Toast.success("撤回成功");
      })
      .catch((err) => {
        return Toast.info(err?.msg || err);
      });
  };

  const scrollBottom = () => {
    console.log("滚动");
    setTimeout(() => {
      let scrollHeight = msgRef.current.getInnerViewNode().scrollHeight;
      msgRef.current.scrollTo(0, scrollHeight);
    }, 0);
  };

  // 接收消息
  const received = useCallback(
    (options) => {
      console.log("接收到消息", options, params);
      let newMsg = options.data[0];
      if (newMsg.conversationID === params.conversationID) {
        dispatch({ type: "updateMsgs", payload: options.data });
        if (newMsg.fromUid === uid || options.data.length > 1) {
          $msim.setMessageRead({
            conversationID: newMsg.conversationID,
          });
        }
      }
    },
    [dispatch, $msim, params, uid]
  );
  // 撤回消息
  const revoked = useCallback(
    (options) => {
      console.log("接收到撤回消息", options);
      let newMsg = options.data[0];
      if (newMsg.conversationID === params.conversationID) {
        dispatch({ type: "revokeMsgs", payload: options.data });
      }
    },
    [dispatch, params]
  );

  useEffect(() => {
    $msim.on($IM.EVENT.MESSAGE_RECEIVED, received);
    $msim.on($IM.EVENT.MESSAGE_REVOKED, revoked);
    if (state.curConversationID === null) {
      dispatch({ type: "changeChat", payload: params.conversationID });
    } else if (state.msgList.length === 0) {
      loadData();
    } else {
      setDataSource(ds.cloneWithRows([...state.msgList]));
    }
    return () => {
      $msim.off($IM.EVENT.MESSAGE_RECEIVED);
      $msim.off($IM.EVENT.MESSAGE_REVOKED);
    };
  }, [
    router,
    a,
    b,
    state.msgList,
    ds,
    $IM,
    $msim,
    received,
    revoked,
    loadData,
    dispatch,
    state.curConversationID,
    params.conversationID,
  ]);

  return (
    <div className="content">
      <NavBar
        mode="light"
        icon={<Icon type="left" />}
        onLeftClick={() => router.history.goBack()}
      >
        {router.match.params.conversationID}
      </NavBar>
      <div
        className={
          "message_list_wrapper" + (isHideMore && isHideEmoji ? "" : " more")
        }
        onClick={hideAll}
      >
        <ListView
          ref={msgRef}
          className="message_list"
          initialListSize={20}
          renderHeader={() => {
            return hasMore ? null : (
              <div className="no_more">没有更多数据了</div>
            );
          }}
          dataSource={dataSource}
          pullToRefresh={
            <PullToRefresh distanceToRefresh={100} onRefresh={loadData} />
          }
          renderRow={renderItem}
        />
      </div>
      <MsgSend
        ref={msgSendRef}
        uid={uid}
        hideAll={hideAll}
        showMore={showMore}
        showEmoji={showEmoji}
        scrollBottom={scrollBottom}
        isHideMore={isHideMore}
        isHideEmoji={isHideEmoji}
      />
    </div>
  );
};

export default Message;
