import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'

import GeneralInfo from '../components/settings-general-info'
import CancelMembership from '../components/settings-cancel-membership'

class SettingsCoachGeneral extends Component {

  constructor() {
    super();
    extendObservable(this, {});
  }

  show() {
    $(ReactDOM.findDOMNode(this.refs.me)).addClass('active').outerWidth();
    $(ReactDOM.findDOMNode(this.refs.me)).addClass('fade-in');
  }

  hide() {
    const self = $(ReactDOM.findDOMNode(this.refs.me));
    self.removeClass('fade-in').one('transitionend', () => self.removeClass('active'))
  }

  render() {
    return (
      <div className="tab-content active fade-in" ref="me">
        <div className="row align-center main-content-container">
          <div className="column content-column">
            <GeneralInfo user={this.props.user} onSuccess={this.props.onSuccess}/>
            <CancelMembership userType="organisation" history={this.props.history}/>
          </div>
        </div>
      </div>
    )
  }
}

export default observer(SettingsCoachGeneral)
