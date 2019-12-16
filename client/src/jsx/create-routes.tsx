import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch, RouteComponentProps } from 'react-router-dom'
import { AppContainer } from 'react-hot-loader'
import { CSSTransitionGroup } from 'react-transition-group'
import {observable, computed} from 'mobx'
import {observer, Provider} from 'mobx-react'

import Home from './home'
import Login from './login-signup/login'
import Logout from './login-signup/logout'
import ForgetPassword from './login-signup/forget-password'
import ResetPassword from './login-signup/reset-password'
import SignupLanding from './login-signup/signup-landing'
import SignupAthlete from './login-signup/signup-athlete'
import SignupCoach from './login-signup/signup-coach'
import SignupOrganisation from './login-signup/signup-organisation'
import Settings from './profile/settings'
import SettingsAthlete from './profile/settings-athlete'
import SettingsCoach from './profile/settings-coach'
import SettingsOrganisation from './profile/settings-organisation'
import ProfileRoute from './profile/profile-route'
import ProfileRouteNew from './profile-new/profile-route'
import Dashboard from './dashboard/dashboard'
import DashboardNew from './dashboard-new/dashboard'
import ReturnToPlayRoute from './return-to-play/return-to-play-route'
import ReturnToPlayRouteNew from './return-to-play-new/return-to-play-route'
import InviteAccepted from './misc/invite-accepted'
import AcceptInvite from './misc/accept-invite'
import InviteHandler from './misc/invite-handler'
import Api from './api'
import GenerateTeam from './utils/generate-team'
import HelpCenterRoute from './help-center/help-center-route'
import HelpCenterRouteNew from './help-center-new/help-center-route'
import { stringStartsWith } from './utils/utils'
import { User } from './data-types'

@observer
class Routes extends Component<{}, {}> {

  @observable user: User | undefined
  @observable userRetrieved = false
  @observable sidebarStatus = {expanded: true}
  @computed get newDashboard() { return this.user && this.user.new_dashboard; }

  constructor(props: any) {
    super(props);
    Api.getUser()
      .then(user => {
        this.user = user;
        this.checkAthleteCreditCard(user);
        this.userRetrieved = true;
      })
      .catch(err => {
        history.pushState(null, 'login', '/login');
        this.userRetrieved = true;
      });
  }

  checkAthleteCreditCard(user: any) {
    const pathname = location.pathname;

    if (user &&
        user.user_type === 'athlete' &&
        user.payment_status === 'no_card' &&
        !stringStartsWith(pathname, '/signup/') &&
        !stringStartsWith(pathname, '/login') &&
        !stringStartsWith(pathname, '/logout')) {
      history.pushState(null, 'logout', '/logout');
    }
  }

  setUser = (user: any) => {
    this.user = user;
  }

  render() {
    return this.userRetrieved ?
      <Provider user={this.user} setUser={this.setUser}
                sidebarStatus={this.sidebarStatus}>
        <Router>
          <Route render={props => {
            const routeParts  = props.location.pathname.split('/');
            let rootPath;
            switch (routeParts[1]) {
              case 'signup':
                rootPath = routeParts[1] + routeParts[2];
                break;
              default:
                rootPath = routeParts[1];
            }

            return (
              <CSSTransitionGroup className="transition-container"
                                  transitionName='transition'
                                  transitionEnterTimeout={600}
                                  transitionLeaveTimeout={600}>
                <Switch key={rootPath} location={props.location}>
                  <Route exact path='/' component={Home} />
                  <Route exact path='/login/:recipient?/:firstName?/:lastName?/:inviteToken?' component={Login} />
                  <Route exact path='/logout' component={Logout} />
                  <Route exact path='/forget-password' component={ForgetPassword} />
                  <Route path='/reset-password/:token' component={ResetPassword} />
                  <Route exact path='/signup' component={SignupLanding} />
                  <Route exact path='/signup' component={SignupLanding} />
                  <Route path='/signup/athlete/accept-invite/:firstName/:lastName/:inviteToken'
                          component={SignupAthlete} />
                  <Route path='/signup/athlete/:step' component={SignupAthlete} />
                  <Route path='/signup/athlete' component={SignupAthlete} />
                  <Route path='/signup/coach/accept-invite/:firstName/:lastName/:inviteToken'
                          component={SignupCoach} />
                  <Route path='/signup/coach/:step' component={SignupCoach} />
                  <Route path='/signup/coach' component={SignupCoach} />
                  <Route path='/signup/organisation/:step' component={SignupOrganisation} />
                  <Route path='/signup/organisation' component={SignupOrganisation} />
                  <Route exact path='/settings' component={Settings} />
                  <Route path='/settings/athlete/permission/:coachId' component={SettingsAthlete} />
                  {this.newDashboard ?
                    <Route path='/settings/athlete' component={ProfileRouteNew} />
                    :
                    <Route path='/settings/athlete' component={SettingsAthlete} />
                  }
                  <Route path='/settings/coach' component={SettingsCoach} />
                  <Route path='/settings/organisation' component={SettingsOrganisation} />
                  <Route path='/profile' component={this.newDashboard ? ProfileRouteNew : ProfileRoute} />
                  <Route path='/dashboard/:topCat?/:subCat?' component={this.newDashboard ? DashboardNew : Dashboard} />
                  <Route path='/athlete-log' component={this.newDashboard ? ReturnToPlayRouteNew : ReturnToPlayRoute} />
                  <Route path='/help-center' component={this.newDashboard ? HelpCenterRouteNew : HelpCenterRoute} />
                  <Route path="/accept-invite/:recipient/:firstName/:lastName/:inviteToken"
                         component={AcceptInvite} />
                  <Route path="/invite-accepted/:recipient/:firstName/:lastName/:coachId"
                         component={InviteAccepted} />
                  {/* This route is needed because organisations don't have `lastName` */}
                  <Route path="/user-invite/:recipient/:inviter/:firstName//:token"
                         component={InviteHandler} />
                  <Route path="/user-invite/:recipient/:inviter/:firstName/:lastName/:token"
                         component={InviteHandler} />
                  <Route path="/generate-team" component={GenerateTeam} />
                </Switch>
              </CSSTransitionGroup>
            )}} />
        </Router>
      </Provider>
    : null;
  }
}

export default Routes
