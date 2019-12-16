import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {extendObservable} from 'mobx'
import {inject, observer} from 'mobx-react'

import logo from '../../images/logo.svg'
import {userIsOrganisation} from "../utils/utils";

class SideNav extends Component {

  constructor() {
    super();
    extendObservable(this, {
      clDashboard: '',
      clProfile: '',
      clReturnToPlay: '',
      clSettings: '',
      clDashboardPendingInvites: '',
      clBlog: '',
      clHelpCenter: ''
    });
  }

  componentWillReceiveProps() {
    if (window.location.href.indexOf('dashboard/pending-invites') > 0) {
      this.clDashboardPendingInvites = 'active';
      this['cl' + this.props.curActive] = '';
    } else {
      this['cl' + this.props.curActive] = 'active';
      this.clDashboardPendingInvites = '';
    }
  }

  renderAthleteLog() {
    if (userIsOrganisation(this.props.user)) return;
    return <li><Link className={"nav-link " + this.clReturnToPlay} to="/athlete-log">Athlete Log</Link></li>;
  }

  renderHelpCenter() {
    if (userIsOrganisation(this.props.user)) return;
    return <li><Link className={"nav-link " + this.clHelpCenter} to="/help-center">Help Center</Link></li>;
  }

  render() {
    return (
      <div className="sidebar" ref="me">
        <Link to="/" className="logo"><img src={logo}/></Link>
        <nav className="side-nav desktop">
          <ul className="nav no-bullet">
            <li><Link className={"nav-link " + this.clProfile} to="/profile">Profile</Link></li>
            <li><Link className={"nav-link " + this.clDashboard} to="/dashboard">Dashboard</Link></li>
            {this.renderAthleteLog()}
            <li><Link className={"nav-link " + this.clSettings} to="/settings">Settings</Link></li>
            <li><Link className={"nav-link " + this.clDashboardPendingInvites} to="/dashboard/pending-invites">Pending
              Invites</Link></li>
            <li><a className={"nav-link " + this.clBlog} href="http://personalsportrecord.com/blog/"
                   target="_blank">Resources</a></li>
            {this.renderHelpCenter()}

            <li><Link className="nav-link " to="/logout">Sign out</Link></li>
          </ul>
        </nav>
      </div>
    )
  }
}

export default inject('user', 'setUser')(observer(SideNav))
