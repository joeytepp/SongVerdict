import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "font-awesome/css/font-awesome.css";
import "./App.css";
import Home from "./Home";
import GoodList from "./GoodList";
import BadList from "./BadList";

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/lists/good" component={GoodList} />
          <Route path="/lists/bad" component={BadList} />
          <Route exact path="/" component={Home} />
        </Switch>
      </Router>
    );
  }
}

export default App;
