import React from "react";
import "./Feed.css";
import FontAwesome from "react-fontawesome";

class Feed extends React.Component {
  render() {
    return (
      <div className={this.props.show ? "feed" : "invisible"}>
        <div className="feedMain" ref="feed">
          {this.props.list.map((message, key) => (
            <div className={`message ${message.icon}`} key={key}>
              <FontAwesome
                className={`${message.icon}-icon`}
                name={message.icon}
              />
              <strong align="left"> {`@${message.userName}`}: </strong>
              {message.message}
            </div>
          ))}
          <div class="message input">
            <input
              onKeyPress={this.props.submit}
              className="feedInput"
              placeholder="message"
            />
          </div>
        </div>
        <div className="inputContainer" />
      </div>
    );
  }

  componentDidUpdate() {
    if (this.refs.feed) {
      this.refs.feed.scrollTop = this.refs.feed.scrollHeight;
    }
  }
}

export default Feed;
