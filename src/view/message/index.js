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

const Message = (router) => {
  let $msim = window.$msim;
  let [state, dispatch] = useContext(context);
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
    let uid = state?.curChat?.uid;
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
          conversationID: state?.curChat?.conversationID,
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
    [$msim, dispatch, state.curChat]
  );

  // 模拟加载更多数据
  const loadData = useCallback(() => {
    let msgId;
    let msgList = state?.msgList || [];
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
    setTimeout(() => {
      let scrollHeight = msgRef.current.getInnerViewNode().scrollHeight;
      msgRef.current.scrollTo(0, scrollHeight);
    }, 0);
  };

  useEffect(() => {
    if (state.msgList.length === 0) {
      loadData();
    } else {
      setDataSource(ds.cloneWithRows([...state.msgList]));
    }
  }, [state.msgList, ds, loadData]);

  return (
    <div className="content">
      <NavBar
        mode="light"
        icon={<Icon type="left" />}
        onLeftClick={() => window.history.back()}
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
