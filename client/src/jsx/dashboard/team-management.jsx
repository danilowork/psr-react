import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Route, Switch, Link, NavLink, Redirect} from 'react-router-dom'
import {extendObservable, computed, observe} from 'mobx'
import {observer, inject, Provider} from 'mobx-react'
import { CSSTransitionGroup } from 'react-transition-group'

import Api from '../api'
import ContentCard from './components/content-card'
import TeamManagementDirectory from './team-management-directory'
import TeamManagementTechnical from './team-management-technical'
import TeamManagementPhysical from './team-management-physical'
import TeamManagementFundamental from './team-management-fundamental'
import TeamManagementLeadership from './team-management-leadership'
import TeamManagementStatus from './team-management-status'
import AvatarTeam from '../../images/avatar-team.png'
import { userIsOrganisation } from '../utils/utils';


export default inject('user')(observer(class TeamManagement extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { team: null,
                       forContentCard: computed(() => this.getForContentCard()),
                       teamId: computed(() => { return this.team ? this.team.id : 0 })
                     });
  }

  getForContentCard () {
    let data = { themeColor: userIsOrganisation(this.props.user) ? 'purple' : 'blue', sports: [] };
    if (this.team) {
      data.name = this.team.name;
      data.tagline = this.team.tagline;
      data.avatar = this.team.team_picture_url || AvatarTeam;
      data.sports = [this.team.sportName];
      data.season = this.team.season;
    }
    return data;
  }

  componentDidMount() {

    let teamLocal;

    if (this.props.match.params.t_id) {
      Api.getTeamInfo(this.props.match.params.t_id)
        .then(team => {
          teamLocal = team;
          return Api.getSports();
        })
        .then(sports => {
          teamLocal.sportName = sports.find(s => s.id == teamLocal.sport_id).name;
          this.team = teamLocal;
        })
        .catch(err => { console.log(err); });
    } else {
      this.props.history.push('/dashboard/directory');
    }
  }

  componentWillUnmount(){
    $('body').scrollTop(0);
  }

  renderBreadcrumbs() {
    let parentPath = '/dashboard/directory';
    let parentLabel = 'Dashboard';

    if (userIsOrganisation(this.props.user)) {
      parentPath = '/dashboard/organisation-teams';
      parentLabel = 'Teams';

    }

    return <div className="breadcrumbs">
      <Link to={parentPath}>{parentLabel}</Link><span> / </span>
      <span>{this.team ? this.team.name : ''}</span>
    </div>;
  }

  render() {

    return (
      <Provider team={this.team}>
        <div className="overview" ref="me">
          {this.renderBreadcrumbs()}
          <div className="row align-center main-content-container">
            <div className="column content-column">
              <div className="group-section">
                <ContentCard {...this.forContentCard}
                             link={`/dashboard/directory/team-management/${this.teamId}/edit`}/>
              </div>

                {
                  !userIsOrganisation(this.props.user) &&
                  <h2 className="content-heading">
                    To assess an athlete, select the player to assess by clicking on their name in your team directory.
                  </h2>
                }

              <div className="pill-nav-container">
                <div className="pill-nav">
                  <NavLink to={"/dashboard/directory/team-management/" + this.teamId + "/team-directory"}
                           className="nav-item">Team Directory</NavLink>
                  <NavLink to={"/dashboard/directory/team-management/" + this.teamId + "/status"}
                           className="nav-item">Status & Goals</NavLink>
                  <NavLink to={"/dashboard/directory/team-management/" + this.teamId + "/technical-competence"}
                           className="nav-item">Technical Competence</NavLink>
                  <NavLink to={"/dashboard/directory/team-management/" + this.teamId + "/physical-competence"}
                           className="nav-item">Physical Competence</NavLink>
                  <NavLink to={"/dashboard/directory/team-management/" + this.teamId + "/fundamental-movement-skills"}
                           className="nav-item">Fundamental Movement Skills</NavLink>
                  <NavLink to={"/dashboard/directory/team-management/" + this.teamId + "/leadership"}
                           className="nav-item">Leadership</NavLink>
                </div>
              </div>


              <Route render={({location}) => {

                return (
                  <CSSTransitionGroup className="transition-container" transitionName='dashboard-transition'
                                      transitionEnterTimeout={500}
                                      transitionLeaveTimeout={300}>
                    <Switch key={location.pathname} location={location}>
                      <Route exact path='/dashboard/directory/team-management/:t_id/team-directory'
                             component={TeamManagementDirectory}/>
                      <Route exact path='/dashboard/directory/team-management/:t_id/technical-competence'
                             component={TeamManagementTechnical}/>
                      <Route exact path='/dashboard/directory/team-management/:t_id/physical-competence'
                             component={TeamManagementPhysical}/>
                      <Route exact path='/dashboard/directory/team-management/:t_id/fundamental-movement-skills'
                             component={TeamManagementFundamental}/>
                      <Route exact path='/dashboard/directory/team-management/:t_id/leadership'
                             component={TeamManagementLeadership}/>
                      <Route exact path='/dashboard/directory/team-management/:t_id/status'
                             component={TeamManagementStatus}/>
                      <Route exact path='/dashboard/directory/team-management/:t_id?'
                             render={() =>
                               <Redirect
                                 to={`/dashboard/directory/team-management/${this.props.match.params.t_id}/team-directory`}/>}/>

                    </Switch>
                  </CSSTransitionGroup>)
              }}/>


            </div>
          </div>
        </div>
      </Provider>
    )
  }
}))
