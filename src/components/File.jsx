import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './File.css';

class File extends Component {
  constructor() {
    super();
    this.state = {
    };
  }

  /* Props contains: Name, Link, Image */
  // export default function File(props) {
  render() {
    const {
      userId, data, copyFunc, fId, displayed, openChildrenFunc, fileObj,
    } = this.props;
    const {
      id, webViewLink, iconLink, name, mimeType,
    } = data;
    if (displayed) {
      if (mimeType !== 'application/vnd.google-apps.folder') {
      // if file
        return (
          <div className="file-container">
            <div className="file-image-container">
              <a href={webViewLink} target="blank">
                <img className="file-img" src={iconLink} alt="File icon" />
              </a>
            </div>
            <div className="file-name">
              <a href={webViewLink} target="blank">
                {name}
                {' '}
              </a>
            </div>
            <button type="button" className="copy-btn" onClick={() => copyFunc(userId, id)}>Copy</button>
          </div>
        );
      }
      // if folder
      return (
        <div className="file-container">
          <div className="file-image-container">
            <img className="file-img" src={iconLink} alt="File icon" />
          </div>
          <div className="file-name">
            <a href={webViewLink} target="_blank">{name}</a>
          </div>
          <button type="button" className="copy-btn" onClick={() => openChildrenFunc(userId, fileObj, fId)}>Open</button>
        </div>
      );
    } return null;
  }
}

File.propTypes = {
  userId: PropTypes.number.isRequired,
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.arrayOf(PropTypes.string)])).isRequired,
  copyFunc: PropTypes.func.isRequired,
  fId: PropTypes.number.isRequired,
  displayed: PropTypes.bool.isRequired,
  openChildrenFunc: PropTypes.func.isRequired,
  fileObj: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf()])),
};

File.defaultProps = {
  fileObj: {},
};

export default File;
