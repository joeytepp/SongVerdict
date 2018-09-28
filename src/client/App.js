import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "font-awesome/css/font-awesome.css";
import "./App.css";
import Home from "./Home";
import { GoodList, BadList, AllList } from "./List";

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/lists/good" component={GoodList} />
          <Route path="/lists/bad" component={BadList} />
          <Route path="/lists/all" component={AllList} />
        </Switch>
      </Router>
    );
  }
}

export default App;
