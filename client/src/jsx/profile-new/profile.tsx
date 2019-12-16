import React, {Component} from 'react'
import {Link, RouteComponentProps} from 'react-router-dom'
import { computed, observable } from 'mobx'

import {observer, inject} from 'mobx-react'
import GetVideoId from 'get-video-id'
import moment from 'moment'

import Api from '../api'
import ContentCard from '../dashboard-new/components/content-card'
import AwardCard from '../dashboard-new/components/award-card'
import AwardCardGR from '../dashboard-new/components/award-card-gr'
import SchoolCard from '../dashboard-new/components/school-card'
import VideoField from '../components-new/video-field'
import SportsPopup from './sports-popup'
import SaveConfirmation from '../components-new/save-confirmation'

import DP from '../utils/data-proc';
import { getAvatar } from '../utils/utils';
import { User } from '../data-types';
import styled from '../styled/styled-components'
  
import { MainContentSection, MainSection } from '../components-new/section'
import { AssessmentButton, AssessmentButtonGroup, CancelButton } from '../dashboard-new/components/buttons'


const GroupHeading = styled.h3`
  color: #000;
  width: 100%;
  font-size: 2.2rem;
  font-family: "Poppins", "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
  margin-bottom: 0.4rem;`;

const Explanation = styled.p`
  font-family: Karla,'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
  font-size: 1rem;
  color: #000;`;

const StyledVideoRow = styled.div.attrs({className: 'row'})`
  position: relative;
  max-width: none;
`;

const StyledVideoCell = styled.div.attrs({className: 'small-6'})`
  padding-right: 10px;`;

const StyledVideoCellRight = StyledVideoCell.extend`
  padding-right: 0;
  padding-left: 10px;`;

const IFrameWrapper = styled.div.attrs({className: 'responsive-embed responsive-embed-profile-video'})`
`;

const PlusCircle = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  text-align: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-right: 10px;
  border-radius: 50%;
  background-image: linear-gradient(to bottom right, #32D2FA, #17A6F2);`

const LeadershipRow = styled.div`
  margin-left: 0;`;

const AddVideoForm = styled.form`
  position: relative;`;

const LeadershipHeaderHelpText = styled.p`
  font-weight: bold`;

const LeadershipCardContainer = styled.div`
  flex: 0 0 47%;
  padding: 0 0 1rem 0;
  margin-right: 30px;`;

const LeadershipCard = styled.div`
  padding: 0;
  border: 1px solid #BDC5D0;`;

const LeadershipList = styled.ul`
  margin-bottom: 0;`;

const LeadershipItem = styled.li`
  border: none !important;
  &.dark {
    background-color: #f9f9f9;
  }`;

const LeadershipName = styled.label`
  padding-left: 0.6rem;
  font-weight: bold;`;

const LeadershipValue = styled.div`
  margin-left: -2.2rem;`;

const SectionExplain = styled.p`
  font-size: 16px;
  font-family: 'Karla','Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
  color: black;`;

const LinkText = styled.span`
  cursor: pointer;
  font-size: 1.15rem;
  color: #17A6F2;`;

const PlayerUrls = { 'vimeo': 'https://player.vimeo.com/video/',
                       'youtube': 'https://www.youtube.com/embed/' };

const VideoRow = (props: {videos: any[], key: number, index: number}) =>
  <StyledVideoRow key={props.index}>
    <StyledVideoCell>
      <IFrameWrapper>
        <iframe src={`${PlayerUrls[props.videos[0].video_type]}${props.videos[0].video_id}`}
                frameBorder="0"
                width="100%"
                height="100%"
                allowFullScreen/>
      </IFrameWrapper>
    </StyledVideoCell>
    {2 == props.videos.length ?
      <StyledVideoCellRight>
        <IFrameWrapper>
        <iframe src={`${PlayerUrls[props.videos[1].video_type]}${props.videos[1].video_id}`}
                frameBorder="0"
                width="100%"
                height="100%"
                allowFullScreen/>
        </IFrameWrapper>
      </StyledVideoCellRight> : null}
  </StyledVideoRow>

const MY_VIDEOS_TO_SHOW = 3;
const MY_ACHIEVEMENTS_TO_SHOW = 3;
const GOALS_TO_SHOW = 3;
const SCHOOLS_TO_SHOW = 3;

interface ProfileProps extends RouteComponentProps<{}>{
  user?: User
}

@observer
class Profile extends Component<ProfileProps, {}> {

  getAllMyStatsShownDefaultState = () => 
    !!(this.props && this.props.user && this.props.user.user_type !== 'athlete');

  @computed get user() { return this.props.user; }
  @computed get sports() {
                  if (!this.user) return [];

                  const chosen = this.user.chosen_sports
                                  .filter(s => s.is_chosen);
                  return chosen.map(s => s.sport);
                }
  @observable goals = []
  @computed get noGoal() { return 0 == this.goals.length; }
  @computed get pendingGoals() { return this.goals.filter((g: any) => !g.is_achieved); }
  @computed get goalsAchieved() { return this.goals.filter((g: any) => g.is_achieved); }
  @observable videos = []
  @observable newVideos: {url: string}[] = []
  @observable newVideoComps: VideoField[] = []
  @observable awards = []
  @observable sportsPopupTab = ''
  @observable assessments: any = null
  @observable assDefs = null
  @computed get categories() { return ['Connection', 'Character']; }
  @computed get mentalDefs() { return this.getMentalDefs(); }
  @computed get athleteCoachAssessments() { return this.getAthleteCoachAssessments(this.mentalDefs); }
  @computed get leadershipAverages() { return this.getLeadershipAverages(this.assessments); }
  @observable allMyVideosShown: boolean = this.getAllMyStatsShownDefaultState()
  @observable allMyAchievementsShown = this.getAllMyStatsShownDefaultState()
  @observable allPendingGoalsShown = this.getAllMyStatsShownDefaultState()
  @observable allAchievedGoalsShown = this.getAllMyStatsShownDefaultState()
  @observable allSchoolsShown = this.getAllMyStatsShownDefaultState()


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
    if (this.assessments && this.assessments!.length) return;

    Promise.all([Api.listAssessment(), Api.retrieveAssessments()])
      .then(([assessmentDefs, assessments]) => {
        this.assDefs = assessmentDefs;
        this.assessments = assessments;
      })
      .catch(err => { console.log(err) });
  };

  getLeadershipAverages(assessments: any) {
    if (!assessments) return;

    let data = this.getAssessmentEvents(assessments);

    // Check subj/obj and ensure assessed_id is the current user
    data = data.filter((item: any) => item.assessed_id !== item.assessor_id && item.assessed_id === this.user!.id);

    // Deduplicate
    data = [...new Set(data)];

    // Count averages
    return data.reduce((acc: any, item: any) => {
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
      acc[item.assessment_id].avg = values.reduce((a: number, b: number) => a + b) / values.length;

      return acc;
    }, {});
  }

  getAssessmentEvents(data: any) {
    let res: any = [];

    data.forEach((item: any) => {
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
        (item: any) => item.childs.filter(
            (child: any) => this.categories.indexOf(child.name) !== -1));

    return res.length ? res[0] : [];
  }

  getAthleteCoachAssessments(parentChilds: any, parentItem?: any) {
    if (!parentChilds) return [];

    const filteredChilds = parentChilds.reduce((filtered: any, item: any) => {
      if (item.childs) {
        filtered.push(this.getAthleteCoachAssessments(item.childs, item));
      } else if (item.relationship_types.find((x: any) => x.type === 'athlete_coach')) {
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

  submitVideos = (ev: any) => {
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

  saveVideos = (forSave: any) => {

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
      this.sportsPopupTab = ''
  }

  onSportsPopupTabClick = (tab: string) => {
      this.sportsPopupTab = tab
  }

  showPopup = () => {
    $('#save-confirmation').foundation('open');
  }

  showSaveConfirmation = () => {
    (this.refs.saveConfirmation as SaveConfirmation) .showConfirmation();
  }

  onCancel = () => {
    this.props.history.push('/profile')
  }

  renderLeadershipScore() {
    if (!this.user || this.user.user_type !== 'coach' || !this.leadershipAverages) return;

    return (
      <div className="group-section">
        <h3 className="group-heading">My Leadership Score Cards</h3>
        <LeadershipHeaderHelpText>This is how your athletes are scoring your leadership skills</LeadershipHeaderHelpText>

        <LeadershipRow className="row">
          {this.renderLeadershipScoreCards()}
        </LeadershipRow>
      </div>
    )
  }

  renderLeadershipScoreCards() {
    return this.categories.map(category => {
      const curDef = this.athleteCoachAssessments && this.athleteCoachAssessments[0].childs ?
          this.athleteCoachAssessments[0].childs.find((a: any) => a.name === category) : null;

      const averages = this.leadershipAverages;

      return (
        <LeadershipCardContainer key={category} className={'leadership-score-card small-6'}>

          {/* Category title */}
          <legend className="skillset-heading">{category}</legend>

          {/* Category assessments */}
          <LeadershipCard className={"card graph-card coach"}>
            {curDef ?
              <LeadershipList className="no-bullet">
              {curDef.childs.map((skill: any, idx: number) =>
                <LeadershipItem className={`row rating-row ${idx % 2 ? '' : 'dark'}`} key={skill.name}>

                  {/* Name */}
                  <div className="small-11 column">
                    <LeadershipName>
                      {skill.name}
                    </LeadershipName>
                  </div>

                  {/* Value */}
                  <LeadershipValue className="small-1 column">
                    <label className={'leadership-score-value'}>
                      {averages[skill.id] ? averages[skill.id].avg.toFixed(2) : ''}
                    </label>
                  </LeadershipValue>
                </LeadershipItem>
              )}
              </LeadershipList> : null}

          </LeadershipCard>
        </LeadershipCardContainer>);
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

  getMyStatsAndShowMoreText(isShown: boolean, itemList: any, limit: number) {
    const itemListFiltered = isShown ? itemList : itemList.slice(0, limit);
    const showMoreNum = itemList.length > limit ? itemList.length - limit : 0;
    const showMoreText = isShown ? 'See less' : 'See all';
    const showMoreBtn = showMoreNum > 0;
    const smallClass = showMoreBtn ? 'small-6' : '';

    return {itemListFiltered, showMoreText, showMoreBtn, smallClass}
  }

  renderMyVideos() {

    const rows = this.videos.reduce((acc, video) => {
      if (0 == acc.length || 2 == acc[acc.length -1].length) {
        acc.push([video]);
      } else {
        acc[acc.length - 1].push(video);
      }
      return acc;
    }, [] as any[][]);

    return <div>
      <GroupHeading>My Videos</GroupHeading>
      <SectionExplain>Use this space to upload videos where you highlight your athletic skills</SectionExplain>
      {rows.map((v: any[], index: number) =>
        <VideoRow videos={v} key={index} index={index}/>)}
    </div>
  }

  renderMyAchievements() {
    return <div className="group-section">
      <GroupHeading>My Achievements</GroupHeading>
      <SectionExplain>Add your achievements as an athlete</SectionExplain>
      {this.awards.map((award: any) =>
        <AwardCard  imgId={award.badge_id}
                    title={award.title}
                    content=''
                    key={award.id}
                    team={award.team || ''}
                    footer={moment(award.date).format('MMM D, YYYY')}
                    link={`/profile/edit-achievement/${award.id}/p`} />)}
      <Link to="/profile/add-achievement/p" className="add-wrap">
        <PlusCircle><div style={{marginTop: -2}}>+</div></PlusCircle>
        <LinkText>Add Achievement</LinkText>
      </Link>
    </div>
  }

  renderPendingGoals() {
    const { itemListFiltered } = this.getMyStatsAndShowMoreText(
                                    this.allPendingGoalsShown,
                                    this.pendingGoals,
                                    GOALS_TO_SHOW,
                                  );

    return <div>
      <SectionExplain>Add goals to your profile to keep yourself accountable</SectionExplain>
      <h3 className='group-title' style={{color: 'black'}}>Active</h3>

      {itemListFiltered.map((goal: any) =>
        <AwardCardGR isGrey={true}
                     title="Goal"
                     key={goal.id}
                     content={goal.description}
                     footer={`Achieve by: ${moment(goal.achieve_by).format('MMM D, YYYY')}`}
                     link={`/profile/edit-goal/${goal.id}/p`} />)}

      <Link to="/profile/add-goal" className="add-wrap">
        <PlusCircle><div style={{marginTop: -2}}>+</div></PlusCircle>
        <LinkText>Add Goal</LinkText>
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

      {itemListFiltered.map((goal: any) =>
        <AwardCardGR isGrey={false}
                     title="Goal"
                     key={goal.id}
                     content={goal.description}
                     footer={`Achieve by: ${moment(goal.achieve_by).format('MMM D, YYYY')}`}
                     link={`/profile/edit-goal/${goal.id}/p`} />)}
    </div>
  }

  renderSchools() {
    if (!this.user!.schools || !this.user!.schools.length) return;
    const { itemListFiltered, showMoreText, showMoreBtn, smallClass } =
    this.getMyStatsAndShowMoreText(
      this.allSchoolsShown,
      this.user!.schools,
      SCHOOLS_TO_SHOW,
    );

    return <div className="group-section">
      <GroupHeading>GPA</GroupHeading>
      <Explanation>
        Add your GPA scores in high school, college, university, etc.
      </Explanation>

      {itemListFiltered.map((s: any) =>
        <SchoolCard title={s.school}
                    school_id={s.id}
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
        <LinkText role="button"
                  onClick={this.showSportsPopup}>
          See the full list
        </LinkText>}
    </div>;
  }

  render() {

    return (
      <MainContentSection id='main-content-section'>
        <div>
          <div className="group-section">
            <ContentCard name={`${this.user!.first_name} ${this.user!.last_name}`}
                         themeColor={{'athlete': 'red', 'coach': 'blue', 'organisation': 'purple'}[this.user!.user_type]}
                         tagline={this.user!.tagline}
                         avatar={this.user!.profile_picture_url || getAvatar(this.user)}
                         sports={this.sports}
                         link='/profile/edit'/>
          </div>
          <MainSection>
            {this.renderSchools()}
            {this.renderSportList()}
            {this.renderLeadershipScore()}
            <div className="group-section">
              {this.renderMyVideos()}
              <AddVideoForm>
                {this.newVideos.map((v, i) => <VideoField video={v}
                                                          key={i}
                                                          ref={r => {
                                                            if (r) this.newVideoComps[i] = r;
                                                          }}/>)}
                <div className="add-wrap" onClick={this.addVideoFields}>
                  <PlusCircle><div style={{marginTop: -2}}>+</div></PlusCircle>
                  <LinkText>Add Video</LinkText>
                </div>
                {this.newVideos.length ?
                  <AssessmentButtonGroup>
                    <CancelButton onClick={this.clearNewVideos}>Cancel</CancelButton>
                    <AssessmentButton type="submit" onClick={this.submitVideos} className="active">
                      Save
                    </AssessmentButton>
                  </AssessmentButtonGroup>
                  : null}
              </AddVideoForm>
            </div>
            {this.renderMyAchievements()}
            <div className="group-section">
              <GroupHeading>Goals</GroupHeading>
              {this.renderPendingGoals()}
            </div>

            {this.renderAchievedGoals()}
          </MainSection>
        </div>
        <SaveConfirmation userType={this.user ? this.user.user_type : ""}
                          msg="Your change has been saved successfully."
                          onClose={this.onCancel}
                          ref="saveConfirmation"/>
      </MainContentSection>
    )
  }
}

export default inject('user', 'setUser')(Profile);
