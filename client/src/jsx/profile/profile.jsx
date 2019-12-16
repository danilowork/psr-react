import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {extendObservable, computed} from 'mobx'
import {observer, inject} from 'mobx-react'
import GetVideoId from 'get-video-id'
import moment from 'moment'

import Api from '../api'
import ContentCard from '../dashboard/components/content-card'
import AwardCard from '../dashboard/components/award-card'
import AwardCardGR from '../dashboard/components/award-card-gr'
import SchoolCard from '../dashboard/components/school-card'
import VideoField from '../components/video-field'
import SportsPopup from './sports-popup'
import SaveConfirmation from '../components/save-confirmation'
import DP from '../utils/data-proc';
import { getAvatar } from '../utils/utils';

const MY_VIDEOS_TO_SHOW = 3;
const MY_ACHIEVEMENTS_TO_SHOW = 3;
const GOALS_TO_SHOW = 3;
const SCHOOLS_TO_SHOW = 3;

export default inject('user', 'setUser')(observer(class Profile extends Component {

  constructor() {
    super();

    extendObservable(this, {
      user: computed(() => this.props.user),
      sports: computed(() => {
               if (!this.user) return [];

               const chosen = this.user.chosen_sports
                                .filter(s => s.is_chosen);
               return chosen.map(s => s.sport);
             }),
      goals: [],
      noGoal: computed(() => 0 == this.goals.length),
      pendingGoals: computed(() => this.goals.filter(g => !g.is_achieved)),
      goalsAchieved: computed(() => this.goals.filter(g => g.is_achieved)),
      forContentCard: computed(() => this.getForContentCard()),
      videos: [],
      newVideos: [],
      newVideoComps: [],
      awards: [],
      sportsPopupTab: null,
      assessments: null,
      assDefs: null,
      categories: computed(() => ['Connection', 'Character']),
      mentalDefs: computed(() => this.getMentalDefs()),
      athleteCoachAssessments: computed(() => this.getAthleteCoachAssessments(this.mentalDefs)),
      leadershipAverages: computed(() => this.getLeadershipAverages(this.assessments)),
      allMyVideosShown: this.getAllMyStatsShownDefaultState(),
      allMyAchievementsShown: this.getAllMyStatsShownDefaultState(),
      allPendingGoalsShown: this.getAllMyStatsShownDefaultState(),
      allAchievedGoalsShown: this.getAllMyStatsShownDefaultState(),
      allSchoolsShown: this.getAllMyStatsShownDefaultState(),
    });
  }

  getForContentCard() {
    let data = { themeColor: 'red', sports: [] };

    if (this.user) {
      const themeColor = {'athlete': 'red', 'coach': 'blue', 'organisation': 'purple'}[this.user.user_type];
      data.name = `${this.user.first_name} ${this.user.last_name}`;
      data.themeColor = themeColor;
      data.tagline = this.user.tagline;
      data.avatar = this.user.profile_picture_url || getAvatar(this.user);
    }
    return data;
  }

  getAllMyStatsShownDefaultState = () => this.props && this.props.user && this.props.user.user_type !== 'athlete';

  playerUrls = { 'vimeo': 'https://player.vimeo.com/video/',
                 'youtube': 'https://www.youtube.com/embed/' }

  // playerSize = { 'vimeo': { width: 640, height: 360 },
  //                'youtube': { width: 560, height: 315 } }

  getMentalDefs() {
    return DP.getMentalDefs(
      this.assDefs,
      this.assessments,
      false,
      false,
    )
  }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    Api.retrieveGoals()
      .then(goals => {

        this.goals = goals;
      })
      .catch(err => console.log(err));

    this.getVideos();

    this.retrieveAwards();

    if (this.user && this.user.user_type === 'coach')
      this.retrieveAssessments();
  }

  componentWillUnmount(){
    $('body').scrollTop(0);
  }

  retrieveAssessments = () => {
    if (this.assessments && this.assessments.length) return;

    Promise.all([Api.listAssessment(), Api.retrieveAssessments()])
      .then(([assessmentDefs, assessments]) => {
        this.assDefs = assessmentDefs;
        this.assessments = assessments;
      })
      .catch(err => { console.log(err) });
  };

  getLeadershipAverages(assessments) {
    if (!assessments) return;

    let data = this.getAssessmentEvents(assessments);

    // Check subj/obj and ensure assessed_id is the current user
    data = data.filter(item => item.assessed_id !== item.assessor_id && item.assessed_id === this.user.id);

    // Deduplicate
    data = [...new Set(data)];

    // Count averages
    return data.reduce((acc, item) => {
      if (!acc[item.assessment_id])
        acc[item.assessment_id] = {
          'avg': null,
          'values': [],
        };

      acc[item.assessment_id].values = [
        ...acc[item.assessment_id].values,
        parseFloat(item.value)
      ];

      const values = acc[item.assessment_id].values;
      acc[item.assessment_id].avg = values.reduce((a, b) => a + b) / values.length;

      return acc;
    }, {});
  }

  getAssessmentEvents(data) {
    let res = [];

    data.forEach(item => {
      if (item.childs)
        res = [...res, ...this.getAssessmentEvents(item.childs)];
      else if (item.length)
        res = [...res, ...item];
      else
        res.push(item);
    });

    return res
  }

  getCurDefs() {
    if (!this.athleteCoachAssessments || !this.athleteCoachAssessments.length) return [];

    const res = this.athleteCoachAssessments.filter(
        item => item.childs.filter(
            child => this.categories.indexOf(child.name) !== -1));

    return res.length ? res[0] : [];
  }

  getAthleteCoachAssessments(parentChilds, parentItem) {
    if (!parentChilds) return [];

    const filteredChilds = parentChilds.reduce((filtered, item) => {
      if (item.childs) {
        filtered.push(this.getAthleteCoachAssessments(item.childs, item));
      } else if (item.relationship_types.find(x => x.type === 'athlete_coach')) {
        filtered.push(item);
      }
      return filtered;
    }, []);

    if (parentItem) {
      parentItem.childs = filteredChilds;
      return parentItem;
    }
    return filteredChilds;
  }

  getVideos = () => {

    Api.getVideos()
      .then(videos => {
        this.videos = videos;
        this.newVideos = [];
      })
      .catch(err => {
        console.log(err);
      });
  }

  retrieveAwards = () => {

    Api.retrieveAwards()
      .then(awards => {

        this.awards = awards;
      })
      .catch(err => {
        console.log(err);
      });
  }

  addVideoFields = () => {
    this.newVideos.push({ url: '' });
  }

  submitVideos = (ev) => {
    ev.preventDefault();

    let newVideosValid = true;
    const forSave = [];

    for(let i = 0; i < this.newVideos.length; i++) {
      if( i==0 || this.newVideos[i].url) {
        const videoId = GetVideoId(this.newVideos[i].url);
        if (!videoId) {
          newVideosValid = false;
          this.newVideoComps[i].showError();
        } else {
          this.newVideoComps[i].hideError();
          forSave.push(this.newVideos[i]);
        }
      } else {
        this.newVideoComps[i].hideError();
      }
    }
    if(!newVideosValid) return;
    this.saveVideos(forSave);
  }

  saveVideos = (forSave) => {

    Api.addVideo(forSave)
      .then(response => {

        this.getVideos();
      })
      .catch(err => {
        console.log(err);
      });
  }

  clearNewVideos = () => {
      this.newVideos = []
  }

  showSportsPopup = () => {
      this.sportsPopupTab = 'CURRENT'
  }

  onSportsPopupClose = () => {
      this.sportsPopupTab = null
  }

  onSportsPopupTabClick = (tab) => {
      this.sportsPopupTab = tab
  }

  showPopup = () => {
    $('#save-confirmation').foundation('open');
  }

  showSaveConfirmation = () => {
    this.refs.saveConfirmation.showConfirmation();
  }

  onCancel = () => {
    this.props.history.push('/profile')
  }

  renderLeadershipScore() {
    if (!this.user || this.user.user_type !== 'coach' || !this.leadershipAverages) return;

    return (
      <div className="group-section">
        <h3 className="group-heading">My Leadership Score Cards</h3>

        {this.renderLeadershipScoreCards()}
      </div>
    )
  }

  renderLeadershipScoreCards() {
    return this.categories.map(category => {
      const curDef = this.athleteCoachAssessments && this.athleteCoachAssessments[0].childs ?
          this.athleteCoachAssessments[0].childs.find(a => a.name === category) : null;

      const averages = this.leadershipAverages;

      return (
        <div key={category} className={'leadership-score-card'}>

          {/* Category title */}
          <legend className="skillset-heading">{category}</legend>

          {/* Category assessments */}
          <div className={"card graph-card coach"}>
            {curDef ?
              <ul className="no-bullet">
              {curDef.childs.map(skill =>
                <li className="row rating-row" key={skill.name}>

                  {/* Name */}
                  <div className="small-11 column">
                    <label>
                      {skill.name}
                    </label>
                  </div>

                  {/* Value */}
                  <div className="small-1 column">
                    <label className={'leadership-score-value'}>
                      {averages[skill.id] ? averages[skill.id].avg.toFixed(2) : ''}
                    </label>
                  </div>
                </li>
              )}
              </ul> : null}

          </div>
        </div>);
    });
   }

  toggleShowAllMyVideos = () => {
    this.allMyVideosShown = !this.allMyVideosShown
  };

  toggleShowAllMyAchievements = () => {
    this.allMyAchievementsShown = !this.allMyAchievementsShown
  };

  toggleShowAllPendingGoals = () => {
    this.allPendingGoalsShown = !this.allPendingGoalsShown
  };

  toggleShowAllAchievedGoals = () => {
    this.allAchievedGoalsShown = !this.allAchievedGoalsShown
  };

  toggleShowAllSchoolsGoals = () => {
    this.allSchoolsShown = !this.allSchoolsShown
  };

  getMyStatsAndShowMoreText(isShown, itemList, limit) {
    const itemListFiltered = isShown ? itemList : itemList.slice(0, limit);
    const showMoreNum = itemList.length > limit ? itemList.length - limit : 0;
    const showMoreText = isShown ? 'See less' : 'See all';
    const showMoreBtn = showMoreNum > 0;
    const smallClass = showMoreBtn ? 'small-6' : '';

    return {itemListFiltered, showMoreText, showMoreBtn, smallClass}
  }

  renderMyVideos() {
    const { itemListFiltered, showMoreText, showMoreBtn, smallClass } =
    this.getMyStatsAndShowMoreText(
      this.allMyVideosShown,
      this.videos,
      MY_VIDEOS_TO_SHOW,
    );

    return <div>
      <h3 className={`group-heading ${smallClass}`}>My Videos</h3>

      {showMoreBtn &&
      <div className={`group-heading ${smallClass} text-right link-text`}
           onClick={this.toggleShowAllMyVideos}>
        {showMoreText}
      </div>}

      {itemListFiltered.map(v => (
        <div className="responsive-embed widescreen" key={v.id}>
          <iframe src={`${this.playerUrls[v.video_type]}${v.video_id}`}
                  width="560"
                  height="315"
                  frameBorder="0"
                  allowFullScreen/>
        </div>))}
    </div>
  }

  renderMyAchievements() {
    const { itemListFiltered, showMoreText, showMoreBtn, smallClass } =
    this.getMyStatsAndShowMoreText(
      this.allMyAchievementsShown,
      this.awards,
      MY_ACHIEVEMENTS_TO_SHOW,
    );

    return <div className="group-section">
      <h3 className={`group-heading ${smallClass}`}>My Achievements</h3>

      {showMoreBtn &&
      <div className={`group-heading ${smallClass} text-right link-text`}
           onClick={this.toggleShowAllMyAchievements}>
        {showMoreText}
      </div>}

      {itemListFiltered.map(award =>
          <AwardCard imgId={award.badge_id - 1}
                     title={award.title}
                     content=''
                     key={award.id}
                     team={award.team || ''}
                     footer={moment(award.date).format('MMM D, YYYY')}
                     link={`/profile/edit-achievement/${award.id}/p`} />)}

      <Link to="/profile/add-achievement/p" className="add-wrap">
        <span className="psr-icons icon-add"/><span>Add achievement</span>
      </Link>
    </div>
  }

  renderPendingGoals() {
    const { itemListFiltered, showMoreText, showMoreBtn, smallClass } =
    this.getMyStatsAndShowMoreText(
      this.allPendingGoalsShown,
      this.pendingGoals,
      GOALS_TO_SHOW,
    );

    return <div>
      <h3 className={`group-title ${smallClass}`}>Active</h3>

      {this.noGoal &&
      <AwardCardGR isGrey={true}
                   title="No current goals"
                   content="Add one with the pencil icon!"
                   footer="-"
                   link="/profile/add-goal" />}

      {showMoreBtn &&
      <div className={`group-title ${smallClass} text-right link-text`}
           onClick={this.toggleShowAllPendingGoals}>
        {showMoreText}
      </div>}

      {itemListFiltered.map(goal =>
        <AwardCardGR isGrey={true}
                     title="Goal"
                     key={goal.id}
                     content={goal.description}
                     footer={`Achieve by: ${moment(goal.achieve_by).format('MMM D, YYYY')}`}
                     link={`/profile/edit-goal/${goal.id}/p`} />)}

      <Link to="/profile/add-goal" className="add-wrap">
        <span className="psr-icons icon-add"/><span>Add goal</span>
      </Link>
    </div>
  }

  renderAchievedGoals() {
    if (!this.goalsAchieved.length) return null;

    const { itemListFiltered, showMoreText, showMoreBtn, smallClass } =
    this.getMyStatsAndShowMoreText(
      this.allAchievedGoalsShown,
      this.goalsAchieved,
      GOALS_TO_SHOW,
    );

    return <div className="group-section">
      <h3 className={`group-title ${smallClass}`}>Completed</h3>

      {showMoreBtn &&
      <div className={`group-title ${smallClass} text-right link-text`}
           onClick={this.toggleShowAllAchievedGoals}>
        {showMoreText}
      </div>}

      {itemListFiltered.map(goal =>
        <AwardCardGR isGrey={false}
                     title="Goal"
                     key={goal.id}
                     content={goal.description}
                     footer={`Achieve by: ${moment(goal.achieve_by).format('MMM D, YYYY')}`}
                     link={`/profile/edit-goal/${goal.id}/p`} />)}
    </div>
  }

  renderSchools() {
    if (!this.user || !this.user.schools || !this.user.schools.length) return;
    const { itemListFiltered, showMoreText, showMoreBtn, smallClass } =
    this.getMyStatsAndShowMoreText(
      this.allSchoolsShown,
      this.user.schools,
      SCHOOLS_TO_SHOW,
    );

    return <div className="group-section">
      <h3 className={`group-heading ${smallClass}`}>GPA</h3>

      {showMoreBtn &&
      <div className={`group-heading ${smallClass} text-right link-text`}
           onClick={this.toggleShowAllSchoolsGoals}>
        {showMoreText}
      </div>}

      {itemListFiltered.map(s =>
        <SchoolCard title={s.school}
                    attending={s.current}
                    gpa={s.gpa}
                    key={s.id} />)}
    </div>
  }

  renderSportList() {
    if (this.user && this.user.user_type === 'organisation') return;

    return <div className="group-section">
      <h3 className="group-heading">Current and future sports in PSR</h3>

      {this.sportsPopupTab &&
      <SportsPopup onClose={this.onSportsPopupClose}
                   onTabClick={this.onSportsPopupTabClick}
                   sportsPopupTab={this.sportsPopupTab}
                   onSubmit={this.showPopup}
                   onSuccess={this.showSaveConfirmation}
                   ref="profileForm"/>}

      {!this.sportsPopupTab &&
      <div className="text-left link-text"
           role="button"
           onClick={this.showSportsPopup}>
        See the full list
      </div>}
    </div>;
  }

  render() {

    return (
      <div className="row align-center main-content-container" ref="me">
        <div className="column content-column">

          <div className="group-section">
            <ContentCard {...this.forContentCard}
                         sports={this.sports}
                         link='/profile/edit'
                         status={["injured", "active"]}/>
          </div>

          {this.renderSchools()}
          {this.renderSportList()}
          {this.renderLeadershipScore()}

          <div className="group-section">
            {this.renderMyVideos()}

            <form>
              {this.newVideos.map((v, i) => <VideoField video={v}
                                                        key={i}
                                                        ref={r => {
                                                          this.newVideoComps[i] = r;
                                                        }}
                                                        videoIndex={i + 1}/>)}
              <div className="add-wrap" onClick={this.addVideoFields}>
                <span className="psr-icons icon-add"></span><span>Add video</span>
              </div>
              {this.newVideos.length ?
                <div>
                  <button type="submit"
                          onClick={this.submitVideos}
                          className="button expanded theme"
                          value="Save">Save
                  </button>

                  <div className="cancel text-center" onClick={this.clearNewVideos}>Cancel</div>
                </div>
                : null}

            </form>
          </div>

          {this.renderMyAchievements()}

          <div className="group-section">
            <h3 className="group-heading">Goals</h3>
            {this.renderPendingGoals()}
          </div>

          {this.renderAchievedGoals()}
        </div>

        <SaveConfirmation userType={this.user ? this.user.user_type : ""}
                          msg="Your change has been saved successfully."
                          onClose={this.onCancel}
                          ref="saveConfirmation"/>
      </div>
    )
  }
}))
