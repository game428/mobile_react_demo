import { useState, useImperativeHandle, forwardRef, useContext } from "react";
import { context } from "@/reducer";
import { Button, Toast } from "antd-mobile";
import emojiMap from "@/assets/emoji/emojiMap.json";
import "./msgSend.css";
import More from "@/components/more";
import Emoji from "@/components/emoji";

const MsgSend = forwardRef((props, ref) => {
  console.log("send");
  const $msim = window.$msim;
  const [state, dispatch] = useContext(context);
  const [msgText, setMsgText] = useState("");
  useImperativeHandle(ref, () => {
    return {
      resend: resend,
    };
  });
  // 选择表情
  const selectEmoji = (emoji) => {
    setMsgText(msgText + emoji.key);
  };
  const clearMsg = (e) => {
    let strEnd = msgText.length;
    if (e) {
      strEnd = e.target.selectionEnd;
    }
    if (strEnd === 0) return;
    let temp = msgText;
    let curKey = msgText.slice(strEnd - 1, strEnd);
    if (curKey === "]") {
      let left = msgText.lastIndexOf("[", strEnd - 1);
      if (left > -1) {
        let img = temp.slice(left, strEnd);
        if (emojiMap[img]) {
          setMsgText(msgText.slice(0, left) + msgText.slice(strEnd));
          if (e) {
            setTimeout(() => {
              e.target.setSelectionRange(left - 1, left - 1);
            }, 0);
          }
          return;
        }
      }
    }
    setMsgText(msgText.slice(0, strEnd - 1) + msgText.slice(strEnd));
    if (e) {
      setTimeout(() => {
        e.target.setSelectionRange(strEnd - 1, strEnd - 1);
      }, 0);
    }
  };
  const deleteKey = (e) => {
    if (e.keyCode === 8) {
      e.preventDefault();
      clearMsg(e);
    }
  };

  // 发送文本消息
  const sendText = () => {
    if (!msgText.trim()) {
      setMsgText("");
      return Toast.info("不能发空消息");
    }
    let msgObj = $msim.createTextMessage({
      to: props.uid,
      payload: {
        text: msgText,
      },
    });
    setMsgText("");
    dispatch({ type: "addMsg", payload: msgObj });
    props.scrollBottom();
    sendMsg(msgObj);
  };

  // 发送消息
  const sendMsg = (msgObj) => {
    $msim
      .sendMessage(msgObj)
      .then((res) => {
        msgObj.sendStatus = res.data.sendStatus;
        msgObj.msgId = res.data.msgId;
        dispatch({ type: "updateMsg", payload: msgObj });
        console.log(state, 14);
      })
      .catch((err) => {
        msgObj.sendStatus = 2;
        dispatch({ type: "updateMsg", payload: msgObj });
        return Toast.info({
          message: err?.msg || err,
        });
      });
  };

  // 重发
  const resend = (msgObj) => {
    msgObj.sendStatus = 0;
    dispatch({ type: "updateMsg", payload: msgObj });
    $msim
      .resendMessage(msgObj)
      .then((res) => {
        msgObj.sendStatus = res.data.sendStatus;
        msgObj.msgId = res.data.msgId;
        dispatch({ type: "updateMsg", payload: msgObj });
      })
      .catch((err) => {
        msgObj.sendStatus = 2;
        dispatch({ type: "updateMsg", payload: msgObj });
        return Toast.info({
          message: err?.msg || err,
        });
      });
  };

  return (
    <div className="send_wrapper">
      <div className="send_input">
        <input
          className="msg_input"
          value={msgText}
          onClick={props.hideAll}
          onChange={(e) => {
            setMsgText(e.target.value);
          }}
          onKeyDown={deleteKey}
          type="text"
          placeholder="发送聊天内容"
        />
        <i
          className="emoji_btn iconfont icon-biaoqing"
          onClick={props.showEmoji}
        ></i>
        {msgText.length > 0 ? (
          <Button type="primary" size="small" inline onClick={sendText}>
            发送
          </Button>
        ) : (
          <i className="iconfont icon-jjia-" onClick={props.showMore}></i>
        )}
      </div>
      <div className={"more_cont" + (props.isHideMore ? " hide_height" : "")}>
        <More {...props} sendMsg={sendMsg} />
      </div>
      <div className={"more_cont" + (props.isHideEmoji ? " hide_height" : "")}>
        <Emoji selectEmoji={selectEmoji} clearMsg={clearMsg} />
      </div>
    </div>
  );
});

export default MsgSend;
