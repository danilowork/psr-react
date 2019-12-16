import React, {Component} from 'react'
import {Route, Link, Switch} from 'react-router-dom'
import {extendObservable, computed, observe} from 'mobx'
import {observer, inject, Provider} from 'mobx-react'

import Api from '../api'
import ContentCard from './components/content-card'
import AthleteOverview from './components/athlete-overview'
import AthleteTechnical from './components/athlete-technical'
import AthletePhysical from './components/athlete-physical'
import AthleteFundamental from './components/athlete-fundamental'
import AthleteMental from './components/athlete-mental'
import AthleteStatus from './components/athlete-status'
import DP from '../utils/data-proc'
import {getAvatar, userIsOrganisation} from "../utils/utils";

export default inject('user', 'setUser', 'assDefs')(observer(class AthleteManagement extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { user: computed(() => this.props.user),
                       curComp: 'overview',
                       assessments: null,
                       curSport: '',
                       curSubCat: 0,
                       assDefs: computed(() => this.props.assDefs),
                       linkedAthlete: computed(() =>
                                        this.user &&
                                        this.user.linked_users.find(u => u.id == this.props.match.params.a_id)),
                       allowedSports: computed(() => {
                                        if (this.linkedAthlete) {
                                          return this.linkedAthlete.granted_assessment_top_categories
                                                   .reduce((acc, cat) => {
                                                      if (cat.id < 10000) {
                                                        acc.push(cat.name);
                                                      }
                                                      return acc;
                                                   }, []);
                                        } else {
                                          return [];
                                        }
                                      }),
                       subSports: computed(() => { return DP.getSubSports(this.props.assDefs,
                                                                          this.user,
                                                                          this.props.match.params.a_id)}),
                       subSportChoices: computed(() => { return this.subSports.map(sc => sc.name); }),
                       curSubsport: '',
                       curSubsportIndex: computed(() => {
                                           return this.subSportChoices.findIndex(c => c == this.curSubsport)
                                         }),
                       curSubsportId: 0,
                       curType: 0,
                       forContentCard: computed(() => this.getForContentCard())
                     });
  }

  getForContentCard() {
    const themeColor = {'athlete': 'red', 'coach': 'blue', 'organisation': 'purple'}[this.linkedAthlete.user_type];
    let props = { themeColor: themeColor, sports: this.allowedSports };
    if (this.linkedAthlete) {
      props.name = `${this.linkedAthlete.first_name} ${this.linkedAthlete.last_name}`;
      props.tagline = this.linkedAthlete.tagline;
      props.avatar = this.linkedAthlete.profile_picture_url || getAvatar(this.linkedAthlete);
    }
    return props;
  }

  componentDidMount() {

    if (this.props.match.params.a_id) {
      Api.retrieveAssessments(this.props.match.params.a_id)
        .then(assessments => {
          this.assessments = assessments;
        })
        .catch(err => { console.log(err) });
    } else {
      this.props.history.push('/dashboard/directory');
    }

    observe(this, 'allowedSports',
            change => { if (change.newValue.length) {
                          this.curSport = change.newValue[0].toLowerCase();
                          if (this.overview) {
                            this.overview.wrappedInstance.setSport(this.curSport);
                          }
                        } });
  }

  componentWillUnmount(){
    $('body').scrollTop(0);
  }

  setSport = (ev, sport) => {

    $(ev.target).siblings().removeClass('active');
    $(ev.target).addClass('active');
    this.curSport = sport.toLowerCase();
    this.curType = 0;

    const cat = this.subSports.find(sc => sc.nameTop == sport);

    this.curSubsport = cat.name;
    this.curSubsportId = cat.id;

    if (this.overview) {
      this.overview.wrappedInstance.setSport(this.curSport);
    }
  }

  render() {
    const dashboardLabel = userIsOrganisation(this.props.user) ? 'Athletes' : 'Dashboard';
    const dashboardUrl = userIsOrganisation(this.props.user) ? '/dashboard/organisation-directory' : '/dashboard/directory';

    const andAssesLabel = userIsOrganisation(this.props.user) ? '' : 'and assess ';

    return (
      <Provider assessments={this.assessments} team={null}>
        <div ref="me">
          <div className="breadcrumbs">
            <Link to={dashboardUrl}>{dashboardLabel}</Link><span> / </span>
            <span>{this.linkedAthlete ? this.linkedAthlete.first_name + ' ' + this.linkedAthlete.last_name : ''}
            </span>
          </div>
          <div className="row align-center main-content-container">
            <div className="column content-column">
                <h2 className="content-heading">
                  {'Review ' + (andAssesLabel) + (this.linkedAthlete ? this.linkedAthlete.first_name : '') + "'s skills."}
                </h2>
                <div className="group-section">
                  <ContentCard {...this.forContentCard}/>
                </div>

                {'overview' == this.curComp ?
                  <div className="group-section">
                  <h3 className="group-heading">Sports</h3>
                  <div className="button-group sports">
                    {this.allowedSports.map((sport, i) =>
                      <button className={"button border" + (0 == i ? " active" : "")}
                              key={i}
                              onClick={(ev) => { this.setSport(ev, sport); }}>{sport}</button>)}
                  </div>
                </div> : null }

              <div className="pill-nav-container">
                <div className="pill-nav">
                    <Link to={'/dashboard/directory/athlete-management/'+ this.props.match.params.a_id + '/overview'}
                          className={'nav-item ' + (this.props.match.params.action == 'overview' ? 'active' : '')}>Overview</Link>
                    <Link to={'/dashboard/directory/athlete-management/' + this.props.match.params.a_id + '/status'}
                      className={"nav-item " + (this.props.match.params.action == 'status' ? 'active' : '')}>Status & Goals</Link>
                    <Link to={'/dashboard/directory/athlete-management/'+ this.props.match.params.a_id + '/technical-competence' +
                      (this.props.match.params.subSport ? '/' + this.props.match.params.subSport : '') +
                      (this.props.match.params.cat_id ? '/' + this.props.match.params.cat_id : '')}
                      className={"nav-item " + (this.props.match.params.action === 'technical-competence' ? 'active' : '')}
                      >
                      Technical Competence
                    </Link>
                    <Link to={'/dashboard/directory/athlete-management/'+ this.props.match.params.a_id + '/physical-competence'}
                      className={"nav-item " + (this.props.match.params.action == 'physical-competence' ? 'active' : '')}
                      >Physical Competence</Link>

                    <Link to={'/dashboard/directory/athlete-management/'+ this.props.match.params.a_id + '/fundamental-movement-skills'}
                      className={"nav-item " + (this.props.match.params.action == 'fundamental-movement-skills' ? 'active' : '')}
                      >Fundamental Movement Skills</Link>


                    <Link to={'/dashboard/directory/athlete-management/'+ this.props.match.params.a_id + '/leadership'}
                      className={"nav-item " + (this.props.match.params.action == 'leadership' ? 'active' : '')}>Leadership</Link>

                </div>
              </div>

              <div className="tab-content-container">

                <Switch key={location.pathname} location={location}>
                  <Route exact path='/dashboard/directory/athlete-management/:a_id/overview'
                         render={(props) => <AthleteOverview {...props}
                                                             ref={r => { this.overview = r }}
                                                             curSport={this.curSport} />} />

                  <Route exact path='/dashboard/directory/athlete-management/:a_id/physical-competence'
                         component={AthletePhysical} />

                  <Route exact path='/dashboard/directory/athlete-management/:a_id/fundamental-movement-skills'
                         component={AthleteFundamental} />

                  <Route exact path='/dashboard/directory/athlete-management/:a_id/leadership'
                         component={AthleteMental} />

                  <Route exact path='/dashboard/directory/athlete-management/:a_id/status'
                         component={AthleteStatus} />

                  <Route path='/dashboard/directory/athlete-management/:a_id/technical-competence/:subSport?/:cat_id?'
                         component={AthleteTechnical} />
                  </Switch>

                  <div className="tab-content" ref="teams">

                  </div>

                  <div className="tab-content" ref="return">

                  </div>

                  <div className="tab-content" ref="achieve">

                  </div>
                </div>
            </div>
          </div>
        </div>
      </Provider>
    )
  }
}))
