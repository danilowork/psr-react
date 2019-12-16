import React, {Component} from 'react'
import {Route, Link, Switch} from 'react-router-dom'
import {extendObservable, computed} from 'mobx'
import {observer, inject, Provider} from 'mobx-react'

import Api from '../api'
import ContentCard from './components/content-card'
import AthleteOverview from './components/athlete-overview'
import AthleteTechnical from './components/athlete-technical'
import AthletePhysical from './components/athlete-physical'
import AthleteFundamental from './components/athlete-fundamental'
import AthleteMental from './components/athlete-mental'
import AthleteStatus from './components/athlete-status'
import AvatarRed from '../../images/avatar-red.png'
import { userIsOrganisation } from '../utils/utils';

export default inject('user', 'assDefs')(observer(class TeamAthleteManagement extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { user: computed(() => this.props.user),
                       team: null,
                       curComp: 'overview',
                       assessments: null,
                       curSport: computed(() => {
                                   if (!(this.props.assDefs && this.team)) return '';
                                   return this.props.assDefs.find(def => def.id == this.team.sport_id).name
                                 }),
                       curSubCat: 0,
                       assDefs: computed(() => this.props.assDefs),
                       athlete: computed(() => this.team &&
                                               this.team.athletes.find(a => a.id == this.props.match.params.a_id)),
                       forContentCard: computed(() => {
                                         let props = { themeColor: 'red',
                                                       sports: [this.curSport] }
                                         if (this.athlete) {
                                           props.name = `${this.athlete.first_name} ${this.athlete.last_name}`,
                                           props.tagline = this.athlete.tagline;
                                           props.avatar = this.athlete.profile_picture_url || AvatarRed;
                                         }
                                         return props;
                                       })
                     });
  }

  componentDidMount() {


    if (this.props.match.params.a_id && this.props.match.params.t_id) {

      Api.getTeamInfo(this.props.match.params.t_id)
        .then(team => {
          this.team = team;
          console.log('teamm', this.team)
          return Api.retrieveAssessments(this.props.match.params.a_id, this.props.match.params.t_id);
        })
        .then(assessments => {
          this.assessments = assessments;
        })
        .catch(err => { console.log(err) });
    } else {
      this.props.history.push('/dashboard/directory');
    }
  }

  componentWillUnmount(){
    $('body').scrollTop(0);
  }

  render() {

    const andAssesLabel = userIsOrganisation(this.props.user) ? '' : 'and assess ';

    return (
      <Provider assessments={this.assessments} team={this.team}>
        <div ref="me">
          <div className="breadcrumbs">
            <Link to="/dashboard/directory">Dashboard</Link><span> / </span>
            <Link to={"/dashboard/directory/team-management/" + (this.team && this.team.id) + "/team-directory"}>{this.team && this.team.name}</Link><span> / </span>
            <span>{this.athlete ? this.athlete.first_name + ' ' + this.athlete.last_name : ''}
            </span>
          </div>
          <div className="row align-center main-content-container">
            <div className="column content-column">
                <h2 className="content-heading">
                  {'Review ' + (andAssesLabel) + (this.athlete ? this.athlete.first_name : '') + "'s skills."}
                </h2>
                <div className="group-section">
                  <ContentCard {...this.forContentCard}/>
                </div>

              <div className="pill-nav-container">
                <div className="pill-nav">
                    <Link to={'/dashboard/directory/team-management/' + this.props.match.params.t_id + '/athlete/' +
                              this.props.match.params.a_id + '/overview'}
                          className={'nav-item ' + (this.props.match.params.action == 'overview' ? 'active' : '')}>Overview</Link>
                    <Link to={'/dashboard/directory/team-management/' + this.props.match.params.t_id +
                              '/athlete/' + this.props.match.params.a_id + '/technical'}
                          className={"nav-item " + ('technical' == this.props.match.params.action ? 'active' : '')}
                      >Technical Competence
                    </Link>
                    <Link to={'/dashboard/directory/team-management/' + this.props.match.params.t_id + '/athlete/' +
                              this.props.match.params.a_id + '/physical-competence'}
                          className={"nav-item " + (this.props.match.params.action == 'physical-competence' ? 'active' : '')}
                      >Physical Competence</Link>
                    <Link to={'/dashboard/directory/team-management/' + this.props.match.params.t_id + '/athlete/' +
                              this.props.match.params.a_id + '/fundamental-movement-skills'}
                          className={"nav-item " + (this.props.match.params.action == 'fundamental-movement-skills' ? 'active' : '')}
                      >Fundamental Movement Skills</Link>
                    <Link to={'/dashboard/directory/team-management/' + this.props.match.params.t_id + '/athlete/' +
                              this.props.match.params.a_id + '/leadership'}
                          className={"nav-item " + (this.props.match.params.action == 'leadership' ? 'active' : '')}>Leadership</Link>
                    <Link to={'/dashboard/directory/team-management/' + this.props.match.params.t_id + '/athlete/' +
                              this.props.match.params.a_id + '/status'}
                          className={"nav-item " + (this.props.match.params.action == 'status' ? 'active' : '')}>Status & Goals</Link>
                </div>
              </div>

              <div className="tab-content-container">

                <Switch key={location.pathname} location={location}>
                  <Route exact path='/dashboard/directory/team-management/:t_id/athlete/:a_id/overview'
                         render={(props) => <AthleteOverview {...props}
                                                             curSport={this.curSport} />} />

                  <Route exact path='/dashboard/directory/team-management/:t_id/athlete/:a_id/physical-competence'
                         component={AthletePhysical} />

                  <Route exact path='/dashboard/directory/team-management/:t_id/athlete/:a_id/fundamental-movement-skills'
                         component={AthleteFundamental} />
                         
                  <Route exact path='/dashboard/directory/team-management/:t_id/athlete/:a_id/leadership'
                         component={AthleteMental} />

                  <Route exact path='/dashboard/directory/team-management/:t_id/athlete/:a_id/technical'
                         component={AthleteTechnical} />
                  <Route exact path='/dashboard/directory/team-management/:t_id/athlete/:a_id/status'
                         component={AthleteStatus} />
                </Switch>
              </div>
            </div>
          </div>
        </div>
      </Provider>
    )
  }
}))
