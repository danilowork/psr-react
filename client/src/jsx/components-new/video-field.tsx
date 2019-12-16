import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {observer} from 'mobx-react'

interface VideoFieldProps {
  video: any
  removeVideo?: (id: number) => void
}

@observer
class VideoField extends Component<VideoFieldProps, {}> {


  updateVideoUrl = (ev: any) => {

    this.props.video.url = ev.target.value;
  }

  removeVideo = () => {
    if (this.props.removeVideo) {
      this.props.removeVideo(this.props.video.id);
    }
  }

  showError = () => {
    $(ReactDOM.findDOMNode(this.refs.me)!).addClass('is-invalid-label');
    $(ReactDOM.findDOMNode(this.refs.formErr)!).addClass('is-visible');
  }

  hideError = () => {
    $(ReactDOM.findDOMNode(this.refs.me)!).removeClass('is-invalid-label');
    $(ReactDOM.findDOMNode(this.refs.formErr)!).removeClass('is-visible');
  }

  render() {

    return <label ref="me" className="video-item">{this.props.video.name}
      {this.props.video.id ?
        <span className="psr-icons icon-remove"
              onClick={this.removeVideo}></span> :
        <textarea value={this.props.video.url}
                  onChange={this.updateVideoUrl}
                  placeholder="Paste your Youtube or Vimeo URL here">
        </textarea>}
      <span className="form-error" ref="formErr">
        Please enter a valid youtube or vimeo video url.
      </span>
    </label>
  }
}

export default VideoField