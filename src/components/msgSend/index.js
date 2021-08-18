import {
  useState,
  useImperativeHandle,
  forwardRef,
  useContext,
  useEffect,
} from "react";
import { context } from "@/reducer";
import COS from "@/assets/js/cos-js-sdk-v5.min.js";
import { Icon, Button, Grid, Toast } from "antd-mobile";
import emojiJson from "@/assets/emoji/emoji.json";
import emojiMap from "@/assets/emoji/emojiMap.json";
import "./msgSend.css";

const MsgSend = forwardRef((props, ref) => {
  const $msim = window.$msim;
  const $IM = window.$IM;
  const acceptTypes = ["image/jpg", "image/jpeg", "image/gif", "image/png"];
  const [state, dispatch] = useContext(context);
  const [msgText, setMsgText] = useState("");
  let temCos = null;
  let temConfig = null;
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

  // 上传图片到云
  const uploadFile = (msgObj, fileExtension, file) => {
    let name = new Date().getTime();
    console.log(444, state);
    let cos = state.cos || temCos;
    let config = temConfig || state.cosConfig;
    cos.putObject(
      {
        Bucket: config.bucket /* 必须 */,
        Region: config.region /* 存储桶所在地域，必须字段 */,
        Key: `${config.path}/${name}.${fileExtension}` /* 必须 */,
        Body: file,
        onProgress: (progressData) => {
          msgObj.progress = progressData.percent * 100;
          dispatch({ type: "updateMsg", payload: msgObj });
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

  // 获取cosKey
  const getCos = (callback) => {
    $msim.getCosKey().then((res) => {
      dispatch({
        type: "setCosConfig",
        payload: res.data,
      });
      temConfig = res.data;
      callback(res.data);
    });
  };

  // 初始化cos
  const initCos = (config) => {
    let cosOptions = config;
    temCos = new COS({
      getAuthorization: (options, callback) => {
        if (cosOptions) {
          callback({
            TmpSecretId: cosOptions.id,
            TmpSecretKey: cosOptions.key,
            SecurityToken: cosOptions.token,
            // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
            StartTime: cosOptions.startTime, // 时间戳，单位秒，如：1580000000
            ExpiredTime: cosOptions.expTime, // 时间戳，单位秒，如：1580000900
          });
          cosOptions = null;
        } else {
          getCos((data) => {
            callback({
              TmpSecretId: data.id,
              TmpSecretKey: data.key,
              SecurityToken: data.token,
              // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
              StartTime: data.startTime, // 时间戳，单位秒，如：1580000000
              ExpiredTime: data.expTime, // 时间戳，单位秒，如：1580000900
            });
          });
        }
      },
    });
    dispatch({
      type: "setCos",
      payload: temCos,
    });
  };

  // 选择图片
  const selectImg = (e) => {
    let file = e.target.files[0];
    if (acceptTypes.includes(file.type.toLowerCase())) {
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
            to: props.uid,
            payload: {
              height: height,
              width: width,
              url: e.target.result,
              progress: 0,
            },
          });
          dispatch({ type: "addMsg", payload: msgObj });
          props.hideAll();
          props.scrollBottom();
          if (state.cos || temCos) {
            uploadFile(msgObj, fileExtension, file);
          } else {
            console.log(111111, state);
            getCos((data) => {
              initCos(data);
              uploadFile(msgObj, fileExtension, file);
            });
          }
        };
      };
    } else {
      Toast.info("目前只支持jpg,jpeg,png,gif格式文件");
    }
  };

  // useEffect(() => {}, [state.cos, state.cosConfig]);

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
                  accept={acceptTypes.join()}
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
