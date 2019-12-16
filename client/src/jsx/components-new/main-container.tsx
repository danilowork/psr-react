import React, { Component } from 'react'
import styled from 'styled-components'
import { Location } from 'history'
import { observer, inject } from '../../../node_modules/mobx-react';

import Header from '../components-new/header'
import Footer from '../components-new/footer'
import { RouteIndicatorBar } from '../styled/styles'
import TeamsUsersSideBar from '../components-new/teams-users-sidebar'
import { User } from '../data-types';

const MainArea = styled.div`
  width: 100%;
  margin-top: 180px;
  min-height: 600px;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;`;

const getHeaderText = (user: any) => {
  if (window.location.pathname.includes('/pending-invites')) return 'Pending Invites';
  if (window.location.pathname.includes('/help-center')) return 'Help Center';
  if (window.location.pathname.includes('/athlete-log')) return 'Athlete log';
  if (window.location.pathname.includes('/create-team')) return 'Create New Team';
  if (!window.location.pathname.includes('/assess') || !user) return 'Dashboard';
  return `${user.first_name} ${user.last_name}'s Assessment`;
};

interface MainContainerProps {
  className?: string
  user: User
  location: Location
  history: any
  sidebarStatus?: { expanded: boolean }
}

@inject('user', 'sidebarStatus')
@observer
export class MainContainer extends Component<MainContainerProps, {}> {

  render() {
    return <div className={this.props.className}>
      <div className="row expanded">
        <Header curActive="Dashboard"
                location={this.props.location}
                showProfile={true}
                history={this.props.history}/>
        <MainArea>
          <RouteIndicatorBar expanded={!this.props.sidebarStatus!.expanded}
                            fullWidth={window.location.pathname.includes('/assess')}>
            {getHeaderText(this.props.user)}
          </RouteIndicatorBar>
          {this.props.sidebarStatus!.expanded && <TeamsUsersSideBar/>}
          {this.props.children}
        </MainArea>
      </div>
      <Footer/>
    </div>
  }
}

export default MainContainer;