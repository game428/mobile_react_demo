// import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import IM from "msim";

window.$IM = IM;
window.$msim = IM.create();
ReactDOM.render(<App />, document.getElementById("root"));

reportWebVitals();
