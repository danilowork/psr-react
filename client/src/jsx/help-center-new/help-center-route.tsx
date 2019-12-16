import React, { Component } from 'react'
import { Route, Switch, RouteComponentProps } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import { CSSTransitionGroup } from 'react-transition-group'

import HelpCenterInfo from './help-center-info'
import HelpCenterForm from './help-center'
import MainContainer from '../components-new/main-container'
import { MainContentSectionWithSidebar } from '../components-new/section'
import { User } from '../data-types';

interface HelpCenterRouteProps extends RouteComponentProps<{}>{
  user?: User
  sidebarStatus?: { expanded: boolean }
}

@inject('user', 'sidebarStatus')
@observer
class HelpCenterRoute extends Component<HelpCenterRouteProps, {}> {

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  render() {
    return <MainContainer history={this.props.history}
                          location={this.props.location}
                          user={this.props.user!}
                          sidebarStatus={this.props.sidebarStatus}>
      <MainContentSectionWithSidebar expanded={!(this.props.sidebarStatus && this.props.sidebarStatus.expanded)}>
        <Route render={({ location }) => {
          return (
            <CSSTransitionGroup className="transition-container"
                                transitionName='dashboard-transition'
                                transitionEnterTimeout={500}
                                transitionLeaveTimeout={300}>
              <Switch key={location.pathname} location={location}>
                <Route exact path='/help-center' component={HelpCenterInfo}/>
                <Route exact path='/help-center/form' component={HelpCenterForm}/>
              </Switch>
            </CSSTransitionGroup>
          )
        }}/>
      </MainContentSectionWithSidebar>
    </MainContainer>
  }
}

export default HelpCenterRoute;
