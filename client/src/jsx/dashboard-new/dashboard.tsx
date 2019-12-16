import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Route, Switch, RouteComponentProps } from 'react-router-dom'
import { observable } from 'mobx'
import { observer, inject, Provider } from 'mobx-react'
import { CSSTransitionGroup } from 'react-transition-group'

import DashboardRoot from './dashboard-root'
import Overview from '../dashboard/overview'
import Technical from '../dashboard/technical-tactical'
import TechnicalAssessment from '../dashboard/assessments/technical'
import TechnicalHistory from '../dashboard/assessments/technical-history'
import Physical from '../dashboard/physical'
import Mental from '../dashboard/mental'
import TeamsOfAthlete from '../dashboard/teams-of-athlete'
import TeamsOfOrganisation from '../dashboard/teams-of-organisation'
import Status from './components/my-status'
import AddStatus from '../dashboard/add-status'
import EditStatus from '../dashboard/edit-status'
import PhysicalAssessment from '../dashboard/assessments/physical'
import PhysicalHistory from '../dashboard/assessments/physical-history'
import Fundamental from '../dashboard/fundamental'
import FundamentalAssessment from '../dashboard/assessments/fundamental'
import FundamentalHistory from '../dashboard/assessments/fundamental-history'
import MentalAssessment from '../dashboard/assessments/mental'
import CoachAssessment from '../dashboard/assessments/coach'
import MentalHistory from '../dashboard/assessments/mental-history'
import Directory from '../dashboard/directory'
import OrganisationDirectory from '../dashboard/organisation-directory'
import OrganisationSupport from './organisation-support'
import AthleteManagement from '../dashboard/athlete-management'
import AddSport from '../dashboard/add-sport'
import Invite from '../dashboard/invite'
import PendingInvites from './pending-invites'
import Api from '../api'
import CreateTeam from './create-team'
import TeamManagement from '../dashboard/team-management'
import TeamTechnicalAssess from '../dashboard/assessments/team-technical'
import TeamPhysicalAssess from '../dashboard/assessments/team-physical'
import TeamFundamentalAssess from '../dashboard/assessments/team-fundamental'
import TeamLeadershipAssess from '../dashboard/assessments/team-leadership'
import EditTeam from '../dashboard/edit-team'
import TeamAthleteManagement from '../dashboard/team-athlete'
import { User, SingleAss, AssCategory, AssSubcategory } from '../data-types'
import Assess from './assess'
import MainContainer from '../components-new/main-container'

interface DashBoardProps extends RouteComponentProps<{}> {
  user: User
  sidebarStatus?: { expanded: boolean }
}

@inject('user', 'sidebarStatus')
@observer
class DashBoard extends Component<DashBoardProps, {}> {

  @observable assDefs = undefined
  @observable assessments: AssCategory[] | undefined
  @observable needAssessments = true
  gettingAssessement = false

  componentWillMount() {
    const me: any = $(ReactDOM.findDOMNode(this.refs.me)!);

    me.foundation();

    this.checkRoute();
  }

  componentWillUnmount(){
    $('body').scrollTop(0);
  }

  checkRoute = () => {

    const subRoute = this.props.match.url.match(/\/dashboard\/([\w-]*)\/?/);

    if (subRoute && subRoute.length > 1) {
      if ('coach' == this.props.user.user_type) {
        if (this.props.match.url.indexOf('new-assessment') < 0) {
          if (['technical-competence', 'physical-competence', 'fundamental-movement-skills', 'leadership'].find(r => r == subRoute[1])) {
            this.props.history.push('/dashboard/directory');
            this.needAssessments = false;
          }
        }
      } else {
        if ('directory' == subRoute[1]) {
          this.props.history.push('/dashboard/overview');
          this.needAssessments = false;
        }
      }
    }
    if (this.needAssessments) {
      this.retrieveAssessments();
    }
  }

  retrieveAssessments = () => {
    this.gettingAssessement = true;
    Promise.all([Api.listAssessment(), Api.retrieveAssessments()])
      .then(([assessmentDefs, assessments]) => {
              const physical = assessments.find((cat: any) => cat.id == 10000)!;

              physical.childs = physical.childs.map((subCat: any) => {
                console.log(subCat);
                subCat.childs = subCat.childs.map((ass: any) => {
                  if (undefined == ass.is_flat) {
                    ass = ass.map((v: any) => {
                      v.value = parseInt(v.value as any);
                      return v;
                    });
                  } else {
                    ass.childs = ass.childs.map((v: any) => {
                      v.value = parseInt(v.value as any);
                      return v;
                    });
                  }
                  return ass;
                });
                return subCat;
              });
              this.assessments = assessments;
              this.assDefs = assessmentDefs;
              this.gettingAssessement = false;
            })
      .catch(err => { console.log(err) });
  }

  refreshAssessment = () => {

    Api.retrieveAssessments()
      .then(assessments => { this.assessments = assessments; });
  }

  render() {
    if (this.needAssessments && !this.assessments) {
      if (!this.gettingAssessement) {
        this.retrieveAssessments();
      }
      return null;
    }
    const { user } = this.props;

    return (
      <Provider assDefs={this.assDefs}
                assessments={this.assessments}
                refreshAssessment={this.refreshAssessment}>
        <MainContainer className={"content-container dashboard " + user.user_type}
                       user={user}
                       location={this.props.location}
                       sidebarStatus={this.props.sidebarStatus}
                       history={this.props.history}>

          <Route render={({location}) => {
            let switchKey = location.pathname;

            if (location.pathname.indexOf('dashboard/directory/athlete-management') > 0) {
              switchKey = '/dashboard/directory/athlete-management';
            } else if (location.pathname.indexOf('dashboard/directory/team-management') > 0){
              switchKey = '/dashboard/directory/team-management';
            }
            return (
              <CSSTransitionGroup className="transition-container" transitionName='dashboard-transition'
                                  transitionEnterTimeout={500}
                                  transitionLeaveTimeout={300} >
                <Switch key={switchKey} location={location}>
                  <Route exact path='/dashboard/overview'
                         render={(props) => <Overview {...props} /> } />
                  <Route path='/dashboard/technical-competence/:sport/new-assessment/:a_id?'
                         component={TechnicalAssessment} />
                  <Route exact path='/dashboard/technical-competence/:sport/history/:date' component={TechnicalHistory} />
                  <Route exact path='/dashboard/technical-competence/:sport?' component={Technical} />
                  <Route exact path='/dashboard/physical-competence/new-assessment/:cat_id?/:a_id?'
                         component={PhysicalAssessment} />
                  <Route exact path='/dashboard/physical-competence/:cat_id/history/:date' component={PhysicalHistory} />
                  <Route exact path='/dashboard/physical-competence/:cat_id?' component={Physical} />
                  <Route exact path='/dashboard/fundamental-movement-skills/new-assessment/:cat_id?/:a_id?'
                         component={FundamentalAssessment} />
                  <Route exact path='/dashboard/fundamental-movement-skills/:cat_id/history/:date' component={FundamentalHistory} />
                  <Route exact path='/dashboard/fundamental-movement-skills/:cat_id?' component={Fundamental} />
                  <Route exact path='/dashboard/leadership/new-assessment/:catIndex?/:aId?'
                         component={MentalAssessment} />
                  <Route exact path='/dashboard/my-coaches/:coach_id?/new-assessment/' component={CoachAssessment} />
                  <Route exact path='/dashboard/leadership/:catIndex/history/:date' component={MentalHistory} />
                  <Route exact path='/dashboard/leadership' component={Mental} />
                  <Route exact path='/dashboard/team' component={TeamsOfAthlete} />
                  <Route exact path='/dashboard/organisation-teams' component={TeamsOfOrganisation} />
                  <Route exact path='/dashboard/my-status/add' component={AddStatus} />
                  <Route exact path='/dashboard/my-status/edit/:precompete_id' component={EditStatus} />
                  <Route exact path='/dashboard/my-status' component={Status} />
                  <Route path='/dashboard/directory/athlete-management/:a_id/:action?'
                         component={AthleteManagement} />
                  <Route path='/dashboard/directory/team-management/:t_id/athlete/:a_id/:action?'
                         component={TeamAthleteManagement} />
                  <Route exact path='/dashboard/directory/create-team' component={CreateTeam} />
                  <Route exact path='/dashboard/directory/team-management/:t_id/invite/:invitee'
                         component={Invite} />
                  <Route exact path='/dashboard/directory/team-management/:t_id/technical-competence/new-assessment/:a_id/:s_id'
                         component={TeamTechnicalAssess} />
                  <Route exact path='/dashboard/directory/team-management/:t_id/physical-competence/new-assessment/:a_id/:ass_id'
                         component={TeamPhysicalAssess} />
                  <Route exact path='/dashboard/directory/team-management/:t_id/fundamental-movement-skills/new-assessment/:a_id/:ass_id'
                         component={TeamFundamentalAssess} />
                  <Route exact path='/dashboard/directory/team-management/:t_id/leadership/new-assessment/:a_id/:ass_id'
                         component={TeamLeadershipAssess} />
                  <Route exact path='/dashboard/directory/team-management/:t_id/edit'
                         component={EditTeam} />
                  <Route path='/dashboard/directory/team-management/:t_id'
                         component={TeamManagement} />
                  <Route exact path='/dashboard/directory' component={Directory} />
                  <Route exact path='/dashboard/organisation-directory' component={OrganisationDirectory} />
                  <Route exact path='/dashboard/invite-to-team/:t_id' component={Invite} />
                  <Route exact path='/dashboard/invite' component={Invite} />
                  <Route exact path='/dashboard/pending-invites' component={PendingInvites} />
                  <Route exact path='/dashboard/add-sport' component={AddSport} />
                  <Route exact path='/dashboard/contact-psr' component={OrganisationSupport} />
                  <Route exact path='/dashboard/assess/:step1?/:step2?/:step3?' component={Assess} />
                  <Route exact path="/dashboard" component={DashboardRoot} />
                </Switch>
          </CSSTransitionGroup>)}} />
        </MainContainer>
      </Provider>
    )
  }
}

export default DashBoard;
