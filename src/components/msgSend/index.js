import { useState, useImperativeHandle, forwardRef, useContext } from "react";
import { context } from "@/reducer";
import COS from "@/assets/js/cos-js-sdk-v5.min.js";
import { Icon, Button, Grid, Toast } from "antd-mobile";
import emojiJson from "@/assets/emoji/emoji.json";
import emojiMap from "@/assets/emoji/emojiMap.json";
import "./msgSend.css";

const MsgSend = forwardRef((props, ref) => {
  let $msim = window.$msim;
  let $IM = window.$IM;
  let [state, dispatch] = useContext(context);
  const [msgText, setMsgText] = useState("");
  const moreData = [
    {
      className: "more_item iconfont icon-tupian",
      onClick: () => {},
    },
  ];
  useImperativeHandle(ref, () => {
    return {
      resend: resend,
    };
  });
  // 选择表情
  const selectEmoji = (emoji) => {
    console.log(141, msgText + emoji.key);
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
      to: state.curChat.uid,
      payload: {
        text: msgText,
      },
    });
    setMsgText("");
    if (msgObj) {
      sendMsg(msgObj);
    }
  };

  // 发送消息
  const sendMsg = (msgObj) => {
    dispatch({ type: "addMsg", payload: msgObj });
    let oldMsg = state.msgList[state.msgList.length - 1];
    props.scrollBottom();
    $msim
      .sendMessage(msgObj)
      .then((res) => {
        oldMsg.sendStatus = res.data.sendStatus;
        oldMsg.msgId = res.data.msgId;
        dispatch({ type: "updateMsgs", payload: [msgObj] });
      })
      .catch((err) => {
        oldMsg.sendStatus = $IM.TYPES.SEND_STATE.BFIM_MSG_STATUS_SEND_FAIL;
        dispatch({ type: "updateMsgs", payload: [msgObj] });
        return Toast.info({
          message: err?.msg || err,
        });
      });
  };

  // 重发
  const resend = (msgObj) => {
    msgObj.sendStatus = 0;
    $msim
      .resendMessage(msgObj)
      .then((res) => {
        msgObj.sendStatus = res.data.sendStatus;
        msgObj.msgId = res.data.msgId;
      })
      .catch((err) => {
        msgObj.sendStatus = 2;
        return Toast.info({
          message: err?.msg || err,
        });
      });
  };

  let bucket = "msim-1252460681";
  let region = "ap-chengdu";
  let cos = new COS({
    SecretId: "AKIDiARZwekKIK7f18alpjsqdOzmQAplexA5",
    SecretKey: "f7MLJ3YnoX2KLKBmBeAVeWNVLaYEmGYa",
  });

  // 选择图片
  const selectImg = (e) => {
    let file = e.target.files[0];
    console.log(41, e.target, file);
    if (
      file.type === "image/jpg" ||
      file.type === "image/jpeg" ||
      file.type === "image/gif" ||
      file.type === "image/png"
    ) {
      // im_image
      // im_video
      // im_voice
      e.target.value = "";
      let fileExtension = file.type.slice(6).toLowerCase();
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (e) {
        let image = new Image();
        image.src = e.target.result;
        image.onload = function () {
          let width = this.width;
          let height = this.height;
          let msgObj = $msim.createImageMessage({
            to: state.curChat.uid,
            payload: {
              height: height,
              width: width,
              url: "",
              progress: 0,
            },
          });
          let name = new Date().getTime();
          props.hideAll();
          cos.putObject(
            {
              Bucket: bucket /* 必须 */,
              Region: region /* 存储桶所在地域，必须字段 */,
              Key: `im_image/${name}.${fileExtension}` /* 必须 */,
              Body: file,
              onProgress: (progressData) => {
                msgObj.progress = progressData.percent * 100;
              },
            },
            (err, data) => {
              if (data && data.statusCode === 200) {
                msgObj.url = "https://" + data.Location;
                if (msgObj) {
                  sendMsg(msgObj);
                }
              }
            }
          );
        };
      };
    } else {
      Toast.info("目前只支持jpg,jpeg,png,gif格式文件");
    }
  };

  return (
    <div className="footer_wrapper">
      <div className="footer_input">
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
          className="emoji_btn lg_icon iconfont icon-biaoqing"
          onClick={props.showEmoji}
        ></i>
        {msgText.length > 0 ? (
          <Button type="primary" size="small" inline onClick={sendText}>
            发送
          </Button>
        ) : (
          <i
            className="lg_icon iconfont icon-jjia-"
            onClick={props.showMore}
          ></i>
        )}
      </div>
      <div
        className={
          "footer_more more_wrapper " + (props.isHideMore ? "is_head_more" : "")
        }
      >
        <div className="more_cont">
          <Grid
            data={moreData}
            itemStyle={{ margin: "0 10px" }}
            hasLine={false}
            renderItem={(dataItem) => (
              <div className="grid_item bg_w">
                <i
                  className={dataItem.className}
                  onClick={dataItem.onClick}
                ></i>
                <input
                  type="file"
                  className="file_input"
                  accept="image/*"
                  onChange={selectImg}
                />
              </div>
            )}
          />
        </div>
      </div>
      <div
        className={
          "footer_more emoji_wrapper " +
          (props.isHideEmoji ? "is_head_more" : "")
        }
      >
        <div className="more_cont">
          <Grid
            data={emojiJson}
            itemStyle={{ margin: "0 10px" }}
            columnNum={7}
            hasLine={false}
            renderItem={(dataItem) => (
              <div
                className="grid_item"
                onClick={() => {
                  selectEmoji(dataItem);
                }}
              >
                <img
                  className="emoji_item"
                  src={require("@/assets/emoji/" + dataItem.url).default}
                  alt={dataItem.key}
                />
              </div>
            )}
          />
        </div>
        <div className="clear_btn">
          <Icon type="cross" size="md" onClick={() => clearMsg()} />
        </div>
      </div>
    </div>
  );
});

export default MsgSend;
