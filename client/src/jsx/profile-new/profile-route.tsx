import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Route, Switch, RouteComponentProps} from 'react-router-dom'
import {computed} from 'mobx'
import {observer, inject} from 'mobx-react'

import Profile from './profile'
import EditProfile from './edit-profile'
import AddAchievement from './add-achievement'
import EditAchievement from './edit-achievement'
import EditSchool from './edit-school'
import AddGoal from './add-goal'
import EditGoal from './edit-goal'
import Header from '../components-new/header'
import Footer from '../components-new/footer'
import { User } from '../data-types'
import { RouteIndicatorBar } from '../styled/styles'
import TeamsUsersSideBar from '../components-new/teams-users-sidebar'
import SettingsAthlete from './settings-athlete'
import { ContentContainer, TransitionGroupContainer } from '../styled/components'

interface ProfileRouteProps extends RouteComponentProps<{}> {
  user?: User
  sidebarStatus?: {expanded: boolean}
}

@inject('user', 'sidebarStatus')
@observer
class ProfileRoute extends Component<ProfileRouteProps, {}> {

  @computed get user() { return this.props.user!; }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentWillUnmount(){
    $('body').scrollTop(0);
  }

  render() {
    return (
      <ContentContainer>
        <div style={{paddingTop: '102px',
                      flex: 1,
                      display: 'flex',
                      minHeight: '600px'}}>
          <Header curActive="Profile"
                  showProfile={true}
                  location={this.props.location}
                  history={this.props.history}/>
          <RouteIndicatorBar expanded={!this.props.sidebarStatus!.expanded}>
            {this.props.match.path.indexOf('/settings') == 0 ? 'Settings' : 'Profile'}
          </RouteIndicatorBar>
          <TeamsUsersSideBar/>
          <TransitionGroupContainer transitionName='dashboard-transition'
                                    transitionEnterTimeout={500}
                                    transitionLeaveTimeout={300}
                                    expanded={!this.props.sidebarStatus!.expanded}>
            <Switch key={this.props.location.pathname} location={this.props.location}>
              <Route exact path='/profile' component={Profile} />
              <Route exact path='/profile/edit/' component={EditProfile} />
              <Route exact path='/profile/add-achievement/:from' component={AddAchievement} />
              <Route exact path='/profile/edit-achievement/:award_id/:from' component={EditAchievement} />
              <Route exact path='/profile/add-goal' component={AddGoal} />
              <Route exact path='/profile/edit-goal/:g_id/:from' component={EditGoal} />
              <Route exact path='/profile/edit-school/:s_id' component={EditSchool} />
              <Route exact path='/settings/athlete' component={SettingsAthlete} />
            </Switch>
          </TransitionGroupContainer>
        </div>
        <Footer />
      </ContentContainer>
    )
  }
}

export default ProfileRoute;