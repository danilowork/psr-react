import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed} from 'mobx'
import {observer, inject} from 'mobx-react'


const MenuCoach = props => (

  <div className="dashboard-menu">
    <Link to="/dashboard/directory"
          className={"db-menu-item" +
                     ('directory' == props.match.params.subMenu || '' == props.match.params.subMenu ? ' active' : '')}>
      Directory
    </Link>
    <Link to="/dashboard/directory/create-team"
          className={"db-menu-item" + ('create-team' == props.path ? ' active' : '')}>
      Create Teams / Invite Athletes
    </Link>
    {/*
    <Link to="/dashboard/pending-invites"
          className={"db-menu-item" + ('pending-invites' == props.match.params.subMenu ? ' active' : '')}>
      Pending Invites
    </Link>
    */}
    <div className="menu-shim"></div>
    {/* <Link to="/dashboard/chat"
          className={"db-menu-item" + ('chat' == props.path ? ' active' : '')}>
      Chat
    </Link> */}
  </div>
);

const MenuOrganisation = props => (
  <div className="dashboard-menu">
    <Link to="/dashboard/organisation-teams"
          className={"db-menu-item" +
          ('organisation-teams' === props.match.params.subMenu
          || window.location.pathname.includes('team-directory')
            ? ' active' : '')}>
      Teams
    </Link>
    <Link to="/dashboard/organisation-directory"
          className={"db-menu-item" +
          ('organisation-directory' === props.match.params.subMenu ||
          window.location.pathname.includes('athlete-management')
            ? ' active' : '')}>
      Athletes
    </Link>
    <Link to="/dashboard/directory/create-team"
          className={"db-menu-item" + ('directory/create-team' === props.match.params.subMenu ? ' active' : '')}>
      Create Teams / Invite Athletes
    </Link>
    <Link to="/dashboard/contact-psr"
          className={"db-menu-item" + ('contact-psr' === props.match.params.subMenu ? ' active' : '')}>
      Contact PSR
    </Link>
  </div>
);

const MenuAthlete = props => (

  <div className="dashboard-menu">
    <Link to="/dashboard/overview"
          className={"db-menu-item" +
                     ('overview' == props.match.params.subMenu || '' == props.match.params.subMenu ? ' active' : '')}>
      Overview
    </Link>
    <Link to="/dashboard/my-status"
          className={"db-menu-item" + ('my-status' == props.match.params.subMenu ? ' active' : '')}>
      My Status
    </Link>
    <Link to={'/dashboard/technical-competence/'}
          className={"db-menu-item" + (props.isTechnical ? ' active' : '')}>
      Technical Competence
    </Link>
    <Link to="/dashboard/physical-competence"
          className={"db-menu-item" + ('physical-competence' == props.match.params.subMenu ? ' active' : '')}>
      Physical Competence
    </Link>
    <Link to="/dashboard/fundamental-movement-skills"
          className={"db-menu-item" + ('fundamental-movement-skills' == props.match.params.subMenu ? ' active' : '')}>
      Fundamental Movement Skills
    </Link>
    <Link to="/dashboard/leadership"
          className={"db-menu-item" + ('leadership' == props.match.params.subMenu ? ' active' : '')}>
      Leadership
    </Link>
    <Link to="/dashboard/team"
          className={"db-menu-item" + ('team' == props.match.params.subMenu ? ' active' : '')}>
      Teams
    </Link>
  {/* 
    <Link to="/dashboard/pending-invites"
          className={"db-menu-item" + ('pending-invites' == props.match.params.subMenu ? ' active' : '')}>
      Pending Invites
    </Link>
  */}
    <div className="menu-shim"></div>
  </div>
)

class DashboardMenu extends Component {

  constructor() {
    super();
    extendObservable(this, {
      path: computed(() => this.props.match ? this.props.match.params.subMenu : ''),
      isTechnical: computed(() => this.props.match && this.props.match.params.subMenu === 'technical-competence'),
      userType: computed(() => !this.props.user ? 'athlete' : this.props.user.user_type),
      });
  }

  componentDidMount() {

    if (this.userType !== 'coach') {
      $(ReactDOM.findDOMNode(this.refs.me)).foundation();

      if(!Foundation.MediaQuery.atLeast('large')) {
        //todo, remove setTimeout for production
        setTimeout(function(){
          const screenWidth = $(window).width();
          let left;
          if($('.db-menu-item.active').length) {
            left = $('.db-menu-item.active').offset().left;
          } else {
            left = 0;
          }
          // console.log('left is', left)
          const eleWidth = $('.db-menu-item.active').outerWidth();
          const scrollLeft = left - ( screenWidth - eleWidth ) / 2 ;

          $(ReactDOM.findDOMNode(this.dashboardMenu)).animate({scrollLeft: scrollLeft}, 600)
        }.bind(this), 1500)
      }
    }
  }

  renderMenu = () => ({
    'coach': <MenuCoach match={this.props.match} ref={r => {this.dashboardMenu = r}} />,
    'athlete': <MenuAthlete match={this.props.match}
                            isTechnical={this.isTechnical}
                            ref={r => {this.dashboardMenu =r}}/>,
    'organisation': <MenuOrganisation match={this.props.match} ref={r => {this.dashboardMenu = r}} />,
    }[this.userType]);

  render() {
    return (
      <div className="dashboard-menu-container" ref="me">
        {this.renderMenu()}
      </div>
    )
  }
}

export default inject('user')(observer(DashboardMenu))