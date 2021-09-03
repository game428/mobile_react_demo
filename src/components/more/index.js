import { Toast, Grid } from "antd-mobile";
import { getCosOptions } from "@/utils/getCos";
import { useContext } from "react";
import { context } from "@/reducer";
const More = (props) => {
  console.log("more");
  const $msim = window.$msim;
  const [, dispatch] = useContext(context);
  const acceptTypes = ["image/jpg", "image/jpeg", "image/gif", "image/png"];
  const moreData = [
    {
      className: "more_item iconfont icon-tupian",
      onClick: () => {},
    },
  ];

  // 上传图片到云
  const uploadFile = (msgObj, fileExtension, file, options) => {
    let name = new Date().getTime();
    options.cos.putObject(
      {
        Bucket: options.cosConfig.bucket /* 必须 */,
        Region: options.cosConfig.region /* 存储桶所在地域，必须字段 */,
        Key: `${options.cosConfig.path}/${name}.${fileExtension}` /* 必须 */,
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
            props.sendMsg(msgObj);
          }
        }
      }
    );
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
          getCosOptions().then((options) => {
            uploadFile(msgObj, fileExtension, file, options);
          });
        };
      };
    } else {
      Toast.info("目前只支持jpg,jpeg,png,gif格式文件");
    }
  };
  return (
    <Grid
      data={moreData}
      itemStyle={{ margin: "0 10px" }}
      hasLine={false}
      renderItem={(dataItem) => (
        <div className="grid_item bg_w">
          <i className={dataItem.className} onClick={dataItem.onClick}></i>
          <input
            type="file"
            className="file_input"
            accept={acceptTypes.join()}
            onChange={selectImg}
          />
        </div>
      )}
    />
  );
};

export default More;
