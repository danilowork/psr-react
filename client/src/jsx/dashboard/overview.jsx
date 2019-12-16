import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed, observe} from 'mobx'
import {observer, inject} from 'mobx-react'

import Api from '../api'
import ContentCard from './components/content-card'
import AvatarBlue from '../../images/avatar-blue.png'
import BarChart from './components/bar-chart'
import RadarChart from './components/radar-chart'
import Select from '../components/select'
import AwardCard from '../dashboard/components/award-card'
import Status from './status'

import LineChart from './components/line-chart'
import OverviewIntro from './components/overview-intro'
import DP from '../utils/data-proc'
import { userIsOrganisation } from '../utils/utils'
import EmptyPopup from './components/empty-popup'
import InfoPopupTechnicalPhysical from './components/info-popup-technical-physical'
import InfoPopupLeadership from './components/info-popup-leadership'
import {getLastAssessments, getLastLeadershipAssessments, hasAnyAssessments} from '../utils/assessments';
import moment from 'moment'


export default inject('user', 'assDefs', 'assessments')(observer(class Overview extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { user: computed(() => this.props.user),
                       curSport: '',
                       sports: [],
                       skills: [],
                       mentalAsses: [],
                       curType: 0,
                       emptyMsg: '',
                       actionLink: '',
                       emptyType: '',
                       infoPopupType: 'technicalPhysical',
                       skillSets: computed(() => { return DP.constructSkillSet(this.props.assDefs,
                                                                               this.props.assessments,
                                                                               this.curSport,
                                                                               this.curType,
                                                                               true) }),
                       flattenSkillSet: computed(() => {
                                          if ('rugby' == this.curSport ||
                                              'tennis' == this.curSport) return [];

                                          const ss = this.skillSets.reduce((acc, skillSet) => {
                                                       acc = acc.concat(skillSet.childs.slice());
                                                       return acc;
                                                     }, []);
                                          if (ss.length) {
                                            //this.getHistory(ss[0].assessment_id);
                                          }
                                          console.log('flattened', ss);
                                          return ss;
                                        }),
                       isRadarChart: computed(() => {
                                       return (('baseball' == this.curSport ||
                                                'basketball' == this.curSport ||
                                                'hockey' == this.curSport ||
                                                'soccer' == this.curSport ||
                                                'volleyball' == this.curSport) && this.flattenSkillSet.length);
                                     }),
                       myCoachesData: this.getMyCoachesData(),
                       curAthleteHistory: computed(() => {
                                            return DP.getAthleteHistory(this.skillSets) }),
                       physicalDefs: computed(() => this.getPhysicalDefs()),
                       mentalDefs: computed(() => this.getMentalDefs()),
                       lastPhysicalAssessments: computed(() => this.getLastPhysicalAssessments()),
                       lastLeadershipAssessments: computed(() => this.getLastLeadershipAssessments()),
                       singleLineLineChart: computed(() => {
                                              return (this.curSport && this.curSport.indexOf('track & field') >= 0) || (this.curSport && this.curSport.indexOf('rugby') >= 0) || (this.curSport && this.curSport.indexOf('speed skating') >= 0 )
                                            }),
                       subSports: computed(() => { return DP.getSubSports(this.props.assDefs, this.user)}),
                       subSportChoices: computed(() => { return this.subSports.map(sc => sc.name); }),
                       curSubsport: '',
                       curSubsportId: 0,
                     });
  }

  getPhysicalDefs() {
    return DP.getPhysicalDefs(
        this.props.assDefs,
        this.props.assessments,
        true,
  )};

  getMentalDefs() {
    return DP.getMentalDefs(
        this.props.assDefs,
        this.props.assessments,
        true,
  )};

  getLastPhysicalAssessments() {
    let data = getLastAssessments(this.physicalDefs);

    data.forEach(item => {
      item.history = DP.getHistory(
        this.physicalDefs,
        item.assessmentIdx,
        item.catIdx,
      )});

    return data
  };

  getLastLeadershipAssessments() {
    const skillSets = DP.constructSkillSet(
        this.props.assDefs,
        this.props.assessments,
        'general-leadership',
        0,
        true);

    const skillsMentalA = DP.getSkillsMental(skillSets, 0, true);
    return getLastLeadershipAssessments(skillsMentalA);
  };

  getMyCoachesData() {
    if (!this.user) return [];

    return this.user.linked_users.map(user => ({
        sports: user.teams,
        name: `${user.first_name} ${user.last_name}`,
        themeColor: 'blue',
        tagline: user.tagline,
        avatar: user.profile_picture_url || AvatarBlue,
        coach_id: user.id,
        key: user.id,
      })
  )};

  compoentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)).foundation();

    this.showSelectedSport();

    observe(this,
            'user',
            change => {
              if (change.newValue) {
                this.showSelectedSport();
                if (!this.props.user.chosen_sports.filter(cs => cs.is_displayed).length) {
                  this.showNoSports();
                } else if (!this.props.user.linked_users.length) {
                  this.showNoCoach();
                }
              }
            });

    if (!this.props.user) return;
    if (!this.props.user.chosen_sports.filter(cs => cs.is_displayed).length) {
      this.showNoSports();
    } else if (!this.props.user.linked_users.length && !window.emptyConnectionPopupShown) {
      this.showNoCoach();
      window.emptyConnectionPopupShown = true;
    }
  }

  componentWillUnmount(){
    $('body').scrollTop(0);
  }

  showNoSports = () => {
    if (userIsOrganisation(this.props.user)) return;

    this.emptyMsg = "Looks like you haven't chosen any sports yet. Don't worry, you can add them now.",
    this.actionLink = "/dashboard/add-sport";
    this.emptyType = "sport";

    this.showEmptyPopup();
  }

  showNoCoach = () => {
    if (userIsOrganisation(this.props.user)) return;

    this.emptyMsg = "Looks like you haven't connected to any coaches yet. Don't worry, you can invite your coach now.",
    this.actionLink = "/dashboard/invite";
    this.emptyType = "link";

    this.showEmptyPopup();
  }

  showEmptyPopup = () => {

    new Foundation.Reveal($('#empty-popup'));

    const popup = new Foundation.Reveal($('#empty-popup'));
    popup.open();
  }

  showSelectedSport = () => {

    if (!this.user) return;

    this.sports = this.user.chosen_sports.filter(s => s.is_displayed);

    if (this.sports.length) {
      this.setSport(null, this.sports[0].sport);
    }
  }

  updateSkills = () => {

    const curTopSportDef = this.props.assDefs.find(topSportDef => topSportDef.name.toLowerCase() ==
                                                                  this.curSport);
    if (!curTopSportDef || !curTopSportDef.childs.length) return;
    const curSubCatDef = curTopSportDef.childs[0];
    const curTopSportAss = this.props.assessments.find(topAss => topAss.name.toLowerCase() == this.curSport);
    const curSubCatAss = curTopSportAss.childs[0];

    // this.flattenSkillSet = DP.getFlattenedAss(curSubCatDef, curSubCatAss);
  };

  setSport = (ev, sport) => {

    if (ev) {
      $(ev.target).siblings().removeClass("active");
      $(ev.target).addClass("active");
    }
    this.curSport = sport.toLowerCase();
    //this.setSport(sport);
    if (this.props.assDefs && this.props.assessments) {
      this.updateSkills();
    }
  }

  popupTechnicalPhysical = () => {
    $('#info-popup-technical-physical').foundation('open');
  }

  popupLeadership = () => {
    $('#info-popup-leadership').foundation('open');
  }

  setSubsport = subSport => {
    this.curSubsport = subSport;

    const cat = this.subSports.find(sc => sc.name === subSport);

    if (cat.nameTop !== this.sport)
      this.sport = cat.nameTop.toLowerCase();

    this.curSubsportId = cat.id;
    this.curType = cat.indexInTopCat;
  };

  getMyCoaches() {
    if (!this.user || this.user.user_type !== 'athlete') return;

    return (
      <div className="group-section">
        <h3 className="group-heading">My Coaches</h3>

        {/* Invite button */}
        <div className="button-group sports">
          <Link to={{pathname: '/dashboard/invite', state: {from: 'overview'}}}
                className="button border icon">
            <span className="psr-icons icon-plus"/> Invite a coach
          </Link>
        </div>

        {this.getMyCoachesCards()}
      </div>
  )}

  getMyStatus() {
    if (!this.user || this.user.user_type !== 'athlete') return;

    return (
      <div>
        <div className="group-section my-status-header-section">
          <h3 className="group-heading my-status-header">My Status</h3>
        </div>
        <Status isOverviewPageWidget={true} />
      </div>
  )}

  getMyCoachesCards() {
    const data = this.getMyCoachesData();
    if (!data.length) return;

    return data.map(card => (
      <div key={card.coach_id} className="group-section my-coaches">
        <ContentCard {...card} />

        {/* Invite button */}
        <Link to={`/dashboard/my-coaches/${card.coach_id}/new-assessment/`} className="add-wrap">
         <span className="psr-icons icon-add"/>
          <span>Assess coach's leadership skills</span>
       </Link>
      </div>
    ))}

  getMySports() {
      return (
          <div className="group-section">
              <h3 className="group-heading">Sports</h3>
              <div className="button-group sports">
                  {this.sports.map((s, i) =>
                    <button key={i} className={"button border" + (0 == i ? " active" : "")}
                            onClick={(e) => this.setSport(e, s.sport)}>{s.sport}</button>)}
                  <Link to="/dashboard/add-sport" className="button border responsive add right">
                    <span className="psr-icons icon-plus"></span><span className="show-for-large">Add sport</span>
                  </Link>
              </div>
          </div>
      )}


  getAssessmentsOverview() {
    if (!this.curAthleteHistory) return;

    let subSportChoicesIdx = -1;
    if (this.subSportChoices) {
      subSportChoicesIdx = this.subSportChoices.findIndex(c => c === this.curSubsport);
      if (subSportChoicesIdx === -1) subSportChoicesIdx = 0;
    }

    return (
      <div>
        <div className="group-section">
          <div className="group-heading-wrap sports-filter-wrap row">
            <h3 className="group-heading column small-12">Select Your Assessment to View</h3>
            <div className="column small-12">
              <div className="sports-filter">
                <Select placeholder="select"
                        choices={this.subSportChoices}
                        onSelected={this.setSubsport}
                        index={subSportChoicesIdx}
                        ref="selSubCats"/>
              </div>
            </div>
          </div>
          <hr className="divider show-for-large"/>
        </div>

        <div className="group-section">
          <h3 className="group-heading">Assessment Overview</h3>
          <div className="button-group">
            <div className="row">
              {this.isRadarChart ? <div className="column">
                <RadarChart title="Athlete Overview"
                            subTitle="Technical/Tactical Skills"
                            onInfoPopup={this.popupTechnicalPhysical}
                            skills={this.flattenSkillSet} />
              </div> : null}

              {!this.isRadarChart ? <div className="column">
                <LineChart title="Athlete Overview"
                           singleLine={this.singleLineLineChart}
                           subTitle="Technical/Tactical Skills"
                           color="red"
                           unit={this.curAthleteHistory.unit}
                           onInfoPopup={this.popupTechnicalPhysical}
                           histories={this.curAthleteHistory.groups.length
                               ? this.curAthleteHistory.groups[0].histories
                               : []}
                           groups={this.curAthleteHistory.groups} />
              </div> : null}
            </div>
          </div>
        </div>
      </div>
    )
  }

  getPhysicalOverview() {
    return (
      this.lastPhysicalAssessments && this.lastPhysicalAssessments.length > 0 &&
      <div className="group-section">
        <h3 className="group-heading">Physical Overview</h3>

        {this.lastPhysicalAssessments.map(item => (
          <div>
            <h3 className="group-heading group-subheading">{`${item.assessment.name}: ${item.cat.name}`}</h3>
            <h2 className="group-heading group-subsubheading">{`Last entry on: ${moment(item.date_assessed).format('MMM D, YYYY')}`}</h2>
            <LineChart key={item.catIdx}
                       title="Athlete Progress"
                       subTitle=""
                       singleLine={true}
                       unit={item.history.unit}
                       onInfoPopup={this.popupTechnicalPhysical}
                       histories={item.history.histories}
                       ref='history'
                       infoBtn={false}/>
            </div>
        ))}
      </div>
  )}

  getLeadershipOverview() {
    const slicedAssessments = this.lastLeadershipAssessments && this.lastLeadershipAssessments.slice(0, 1) || [];

    return (
      slicedAssessments && slicedAssessments.length > 0 &&
      <div className="group-section">
        <h3 className="group-heading">Leadership</h3>

        {slicedAssessments.map(item => (
          <div>
            <h3 className="group-heading group-subheading">{item.assessment.name}</h3>
            <h2 className="group-heading group-subsubheading">{`Last entry on: ${moment(item.date_assessed).format('MMM D, YYYY')}`}</h2>
            <LineChart title="Athlete Progress"
                       subTitle=""
                       color="red"
                       singleLine={true}
                       unit="stars"
                       onInfoPopup={this.popupLeadership}
                       histories={this.lastLeadershipAssessments.map(s => ({ name: s.assessment.name, values: s.assessment.history }))} />
          </div>
        ))}
      </div>
    )
  }

  getOverview() {
    if (hasAnyAssessments(this.props.assessments))
      return this.getOverviewPageContents();

    return <OverviewIntro />
  }

  getOverviewPageContents() {
    return (
      <div className="column content-column">
        <h2 className="content-heading">
          {'Hi, ' + ((this.user && this.user.first_name) ? this.user.first_name : '') +'!'}
        </h2>

        {this.getMyCoaches()}

        {this.getMyStatus()}

        {this.getMySports()}

        {this.getAssessmentsOverview()}

        {this.getPhysicalOverview()}

        {this.getLeadershipOverview()}
      </div>
    )
  }

  render() {
    return (
      <div className="overview" ref="me">
        <div className="row align-center main-content-container">
          {this.getOverview()}
        </div>

        <InfoPopupTechnicalPhysical />
        <InfoPopupLeadership />
        <EmptyPopup ref="emptyPopup" userType={this.user && this.user.user_type}
          msg={this.emptyMsg} actionLink={this.actionLink}
          emptyType={this.emptyType}
        />
      </div>
    )
  }
}))
