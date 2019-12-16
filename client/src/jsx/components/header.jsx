import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable} from 'mobx'
import {observer, inject} from 'mobx-react'

import logo from '../../images/logo.svg'
import { getAvatar } from '../utils/utils';

class Header extends Component {

  constructor() {
    super();
    extendObservable(this,
                     { clDashboard: '',
                       clProfile: '',
                       clReturnToPlay: '',
                       clSettings: '',                       
                       clPendingInvites: '',
                       clBlog: ''
                     });
    this.toggleNav = this.toggleNav.bind(this);
    this.closeNav = this.closeNav.bind(this);
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)).foundation();
    this['cl' + this.props.curActive] = 'active';
  }

  toggleNav() {
    $('.header-nav.mobile').slideToggle();
    $(ReactDOM.findDOMNode(this.refs.me)).toggleClass('expanded');
  }

  closeNav() {
    $('.header-nav.mobile').slideUp();
    $(ReactDOM.findDOMNode(this.refs.me)).removeClass('expanded');
  }

  toggleProfilePopup = () => {
    $(ReactDOM.findDOMNode(this.refs.profilePopup)).slideToggle();
    $(ReactDOM.findDOMNode(this.refs.downArrow)).toggleClass('open');
  }

  render() {
    return (
      <header className={"header" + ( this.props.showProfile ? " show-profile" : "" ) + ( this.props.fullWidth ? " full-width" : "")} ref="me">
        <div className="header-bar">
          <Link to="/" className="logo"><img src={logo} /></Link>
          <h1 className="title">{this.props.pageTitle}</h1>
          {this.props.showProfile ?
            <Link to="/profile">
              <div className="profile-bar">
                <div className="header-profile-pic-wrap">
                  <div className="profile-thumb"
                    style={{background: "url(" +
                    ((this.props.user && this.props.user.profile_picture_url) || getAvatar(this.props.user))
                    + ") #fff no-repeat center center"}}>
                  </div>
                  {/* <img src={(this.props.user && this.props.user.profile_picture_url) || DummyPic}
                       className="profile-thumb"/> */}
                       {/* comment for phase1 launch */}
                  {/* <div className="online-sign"></div> */}
                </div>
                <div className="user-stat show-for-large">
                  <h3 className="section-heading">{this.props.user && (this.props.user.first_name + ' ' + this.props.user.last_name)}</h3>
                  {/* <div className="small">Soccer</div> */}
                </div>
                {/* <div className="down-arrow" onClick={this.toggleProfilePopup} ref="downArrow">
                  <span className="psr-icons icon-down-arrow"></span>
                </div> */}
              </div>
            </Link>
           : null}

          {!!this.props.user &&
          <button className="nav-toggler hide-for-large" role="button" onClick={() => this.toggleNav()}>
            <span/>
            <span/>
            <span/>
            <span/>
          </button>}
        </div>
        <nav className="header-nav mobile" >
          <div className="nav-wrap">

            <ul className="nav no-bullet">
              <li><Link className={"nav-link " + this.clProfile} to="/profile" onClick={() => this.closeNav()}>Profile</Link></li>
              <li><Link className={"nav-link " + this.clDashboard} to="/dashboard" onClick={() => this.closeNav()}>Dashboard</Link></li>
              <li><Link className={"nav-link " + this.clReturnToPlay} to="/athlete-log" onClick={() => this.closeNav()}>Athlete Log</Link></li>
              <li><Link className={"nav-link " + this.clSettings} to="/settings" onClick={() => this.closeNav()}>Settings</Link></li>
              <li><Link className={"nav-link " + this.clPendingInvites} to="/dashboard/pending-invites" onClick={() => this.closeNav()}>Pending Invites</Link></li>
              <li><a className={"nav-link " + this.clBlog} href="http://personalsportrecord.com/blog/" target="_blank" onClick={() => this.closeNav()}>Resources</a></li>
              {this.props.user ?
                <li><Link className="nav-link " to="/logout" onClick={() => this.closeNav()}>Sign out</Link></li>
                :
                <li><Link className="nav-link " to="/login" onClick={() => this.closeNav()}>Login</Link></li>
              }
            </ul>
          </div>
        </nav>
        <div className="profile-popup" ref="profilePopup">
          <div className="popup-head">
            <div className="profile-thumb lg" style={{background: "url(" +
              ((this.props.user && this.props.user.profile_picture_url) ||
                getAvatar(this.props.user))
               + ") #fff no-repeat center center"}}>

            </div>
            {/* <img src={(this.props.user && this.props.user.profile_picture_url) || DummyPic}
                 className="profile-thumb lg"/> */}
            <div>
              <h3 className="section-heading">
                {this.props.user && (this.props.user.first_name + ' ' + this.props.user.last_name)}
              </h3>
              <p>"{this.props.user && this.props.user.tagline}"</p>
              <Link to="/profile" className="button border">View Profile</Link>
            </div>
          </div>
          <div className="popup-body">
            {/* <ul className="no-bullet">
              <li className="unread dark-text">unread message here</li>
            </ul> */}
            <Link to="/logout" className="signout-link">Sign out</Link>
          </div>
        </div>
      </header>
    )
  }
}

export default inject('user')(observer(Header))