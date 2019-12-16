import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Route, Link, Switch, RouteComponentProps } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import { CSSTransitionGroup } from 'react-transition-group'

import ReturnToPlay from './return-to-play'
import AddNote from './add-note'
import EditNote from './edit-note'
import ViewNote from './view-note'
import Header from '../components-new/header'
import Footer from '../components/footer'
import { User } from '../data-types';
import { TransitionGroupContainer, ContentContainer } from '../styled/components'
import { RouteIndicatorBar } from '../styled/styles'
import TeamsUsersSideBar from '../components-new/teams-users-sidebar'
import styled from '../styled/styled-components'
import MainContainer from '../components-new/main-container'
import { MainContentSectionWithSidebar } from '../components-new/section'

const NewNoteButton = styled(Link)`
  color: black;
  background: white;
  height: 30px;
  width: 150px;
  border-radius: 3px;
  font-size: 0.75rem;
  line-height: 2rem;
  text-align: center;
  margin-right: 15px;`

const SmallPlusSign = styled.span.attrs({ className: 'psr-icons icon-plus' })`
  font-size: 0.6rem;
  font-weight: bold;
  margin-right: 8px;`


interface AthleteLogProps extends RouteComponentProps<{}> {
  user: User
  sidebarStatus?: {
    expanded: boolean,
    hidden?: boolean,
  }
}

@inject('user', 'sidebarStatus')
@observer
class AthleteLogRoute extends Component<AthleteLogProps, {}> {

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  renderNewNoteButton() {
    if (!this.props.location.pathname.endsWith('/athlete-log')) return;
    return <NewNoteButton to='/athlete-log/add-note'>
      <SmallPlusSign/>Add a New Note
    </NewNoteButton>;
  }

  render() {

    return (
      <MainContainer history={this.props.history}
                     location={this.props.location}
                     user={this.props.user}
                     sidebarStatus={this.props.sidebarStatus}>
        <MainContentSectionWithSidebar expanded={!(this.props.sidebarStatus && this.props.sidebarStatus.expanded)}>
          <Switch key={this.props.location.pathname} location={this.props.location}>
            <Route exact path='/athlete-log' component={ReturnToPlay}/>
            <Route exact path='/athlete-log/add-note' component={AddNote}/>
            <Route exact path='/athlete-log/edit-note/:type/:id' component={EditNote}/>
            <Route exact path='/athlete-log/view-note/:type/:id/:coachId?' component={ViewNote}/>
          </Switch>
        </MainContentSectionWithSidebar>
      </MainContainer>
    )
  }
}

export default AthleteLogRoute