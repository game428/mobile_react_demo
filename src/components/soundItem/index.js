import "./soundItem.css";
import { useState, useEffect, useCallback } from "react";
const SoundItem = (props) => {
  const message = props.message;
  let soundTimer = null;
  const [playing, setPlaying] = useState(false);
  const [soundState, setSoundState] = useState(3);
  const soundIcon = useCallback(() => {
    return `iconfont ${
      props.isSelf
        ? "sound_right icon-sound-right"
        : "sound_left icon-sound-left"
    }-${soundState}`;
  }, [soundState, props.isSelf]);

  const play = () => {
    setPlaying(true);
    clearInterval(soundTimer);
    setSoundState(1);
    soundTimer = setInterval(() => {
      setSoundState((state) => {
        if (state < 3) {
          return state + 1;
        } else {
          return 1;
        }
      });
    }, 500);
  };
  const stop = () => {
    setPlaying(false);
    clearInterval(soundTimer);
    setSoundState(3);
  };
  const start = () => {
    if (!playing) {
      props.playSound({
        play: play,
        stop: stop,
        message: message,
      });
    } else {
      props.stopSound();
    }
  };
  useEffect(() => {
    return () => {
      if (playing) {
        stop();
        props.stopSound();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="sound_item" onClick={start}>
      <i className={soundIcon()}></i>
      {`${message.duration}"`}
    </div>
  );
};

export default SoundItem;
