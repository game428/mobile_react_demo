import React from "react";
import Login from "@/view/login";
import Home from "@/view/layout";
import Message from "@/view/message";
import { Switch, Route } from "react-router-dom";

// eslint-disable-next-line import/no-anonymous-default-export
function AppRoute() {
  return (
    <Switch>
      <Route path="/home" component={Home} />
      <Route path="/message/:conversationID" component={Message} />
      <Route path="/login" component={Login} />
      <Route path="*" component={Login} />
    </Switch>
  );
}
export default AppRoute;
