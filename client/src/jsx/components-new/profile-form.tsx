import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom'
import { observable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'
import loadImage from 'blueimp-load-image'
import GetVideoId from 'get-video-id'
import moment from 'moment'
import { History } from 'history'

import Api from '../api'
import AwardCard from '../dashboard/components/award-card'
import AwardCardGR from '../dashboard/components/award-card-gr'
import VideoField from './video-field'
import { GradientBtn, ButtonRow } from '../styled/components'
import { User } from '../data-types'
import styled from '../styled/styled-components'

const SaveBtnWrapper = styled.div`
  text-align: right;
  font-size: 16px;
  font-weight; bold;
  font-family: Poppins, "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
  margin-right: 30px;`

const CancelBtn = styled.div`
  cursor: pointer;
  font-size: 16px;
  font-family: Poppins, "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
  color: black;
  margin-right: 40px;`

interface SchoolProps {
  schoolIndex: number,
  school: { school: { id: number,
                      gpa: string,
                      current: boolean,
                      school: string },
            updated: boolean }
}

@observer
class School extends Component<SchoolProps, {}> {

  onGPAChanged = () => {

    this.props.school.school.gpa = $(`#gpa-${this.props.schoolIndex}`).val()! as string;
    this.onSchoolUpdate()
  };

  onAttendingChanged = (ev: React.ChangeEvent<HTMLInputElement>) => {

    this.props.school.school.current = ev.target.checked;
    this.onSchoolUpdate()
  };

  onSchoolNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {

    this.props.school.school.school = ev.target.value;
    this.onSchoolUpdate()
  };

  onSchoolUpdate = () => {
    this.props.school.updated = true;
  };

  render() {
    return (
      <div className="shool-field-group" id={`school-info-${this.props.schoolIndex}`}>
        <div className="gpa-section">
          <div className="gpa-wrap">
            <span>GPA</span><br/>
            <span className="gpa-value">{this.props.school.school.gpa}</span>
          </div>
          <div className="slider gpa-slider"
               aria-labelledby="GPALabel"
               aria-describedby="GPAHelpText"
               data-slider data-initial-start={this.props.school.school.gpa}
               data-end='4.0'
               data-step="0.1"
               onClick={this.onGPAChanged}>
            <span className="slider-handle"
                  aria-controls={`gpa-${this.props.schoolIndex}`}
                  data-slider-handle
                  role="slider"
                  tabIndex={1}></span>
            <span className="slider-fill" data-slider-fill></span>
            <input type="hidden"
                   id={`gpa-${this.props.schoolIndex}`}
                   onChange={this.onGPAChanged}/>
          </div>
          <div className="gpa-readings">
            <span>0</span>
            <span>1.0</span>
            <span>2.0</span>
            <span>3.0</span>
            <span>4.0</span>
          </div>
        </div>
        <fieldset>
          <legend>school</legend>
          <input type="text"
                 name="school"
                 placeholder="Enter you current school's name here"
                 value={this.props.school.school.school}
                 onChange={this.onSchoolNameChange}/>
          <div className="switch-container">
            <div className="switch-label">Currently attending</div>
            <div className="switch small">
              <input className="switch-input"
                     type="checkbox"
                     checked={this.props.school.school.current}
                     onChange={this.onAttendingChanged}
                     id={"isAttending" + this.props.school.school.id}
                     name="isAttending"/>
              <label className="switch-paddle" htmlFor={"isAttending" + this.props.school.school.id}>
                <span className="show-for-sr">Currently attending</span>
              </label>
            </div>
          </div>
        </fieldset>
      </div>
    )
  }
}

interface ProfileFormProps {
  user?: User
  setUser?: (u: User) => void
  forProfile: boolean
  onSubmit?: () => void
  onSuccess: () => void
  history: History
}

@inject('user', 'setUser')
@observer
class ProfileForm extends Component<ProfileFormProps, {}> {

  @computed get user() { return this.props.user; }
  @computed get profileImgOrg() { return this.user!.profile_picture_url; }
  @computed get imageBlank() { return !this.profileImgOrg.length; }
  @computed get noGoal() { return 0 == this.goals.length; }
  @computed get pendingGoals() { return this.goals.filter(g => !g.is_achieved); }
  @computed get goalsAchieved() { return this.goals.filter(g => g.is_achieved); }
  @computed get schools() { return this.user!.schools.map(school => ({ school, updated: false })); }
  @observable profileImg = ''
  @observable profileImgChanged = false
  @observable videos: any[] = []
  @observable newVideos: any[] = []
  @observable newVideoComps: any[] = []
  @observable goals: any[] = []
  @observable schoolAdded = false
  @observable awards: any[] = []
  
  componentDidMount() {

    $(ReactDOM.findDOMNode(this.refs.profileForm)!).foundation();

    if(this.profileImgOrg) {
      this.updateProfilePicClass(this.profileImgOrg)
    }

    $(ReactDOM.findDOMNode(this.refs.profileForm)!)
      .on("forminvalid.zf.abide", (ev,frm) => {
        ev.preventDefault();
        this.newVideosValidate();
        this.scrollToError();
        return;
      })
      .on("formvalid.zf.abide", (ev,frm) => {
        const newSchools = this.getNewSchools();
        const updatedSchools = this.getUpdatedSchools();
        const videosToSave = this.newVideosValidate();

        if(!videosToSave && updatedSchools.length === 0 &&
           newSchools.length === 0) return;
        this.submitChange(videosToSave, newSchools, updatedSchools)
      })
      .on("submit", ev => {
        ev.preventDefault();
      });

    if (!this.user) return;

    this.retrieveVideos();

    this.retrieveAwards();

    this.retrieveGoals();
  }

  componentDidUpdate() {

    if (this.schoolAdded) {
      this.schoolAdded = false;

      $(`#school-info-${this.schools.length - 1}`).foundation();
    }
  }

  getNewSchools() {
    return this.schools.filter(s => s.school.id < 0)
  }

  getUpdatedSchools() {
    return this.schools.filter(s => s.school.id > 0 && s.updated)
  }

  retrieveVideos = () => {

    Api.getVideos()
      .then(videos => {
        this.videos = videos.map((v: any) =>({ url: v.embed_url,
                                               id: v.id,
                                               name: v.video_name }));
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

  retrieveGoals = () => {

    Api.retrieveGoals()
      .then(goals => {

        this.goals = goals;
      })
      .catch(err => console.log(err));
  }

  newVideosValidate = () => {
    let newVideosValid = true;
    const forSave = [];
    if (this.newVideos.length) {
      for (let i = 0; i < this.newVideos.length; i++) {
        if (this.newVideos[i].url) {
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
    }
    return newVideosValid && forSave;
  }

  updateProfilePicClass = (newValue: string) =>{
    const img = new Image();
    img.src = newValue;
    img.onload = function() {
      const img = this as any;
      if (img.width >= img.height) {
        $('.profile-pic').removeClass('portrait').addClass('landscape');
      } else {
        $('.profile-pic').removeClass('landscape').addClass('portrait');
      }
    }
  }

  scrollToError = () => {

    const errorField = $('.form-error.is-visible')[0];

    let scrollContainer;
    if(this.props.forProfile) {
      //in edit profile page
      scrollContainer = $('body');
    } else {
      //in signup step
      if($(window).width()! >= 1024) {
        scrollContainer = $('.transition-container');
      } else {
        scrollContainer = $('.content');
      }
    }

    scrollContainer.scrollTop(errorField.offsetTop - 80);
  }

  setCountry = (country: string) => {

    this.user!.country = country;
  }

  setProvince = (province: string) => {

    this.user!.province_or_state = province;
  }

  updateChosen = (e: React.ChangeEvent<HTMLInputElement>) => {

    this.user!.chosen_sports.map(s => {
      if (0 == e.target.name.indexOf(s.sport)) s.is_chosen = e.target.checked;
    });
  }

  updateDisplay = (e: React.ChangeEvent<HTMLInputElement>) => {

    this.user!.chosen_sports.map(s => {
      if (0 ==  e.target.name.indexOf(s.sport)) s.is_displayed = e.target.checked;
    });
  }

  setFirstName = (e: React.ChangeEvent<HTMLInputElement>) => {

    this.user!.first_name = e.target.value;
  }

  setLastName = (e: React.ChangeEvent<HTMLInputElement>) => {

    this.user!.last_name = e.target.value;
  }

  setTagline = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.user!.tagline = e.target.value;
  }

  setReferralCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.user!.referral_code = e.target.value;
  }

  submitChange = (videosToSave: any, newSchools: any, updatedSchools: any) => {

    if (this.props.onSubmit) this.props.onSubmit();

    const newSchoolsProm = newSchools.map((school: any) =>
      Api.addSchool(school)
        .then(result => console.log(result))
        .catch(err => console.log(err))
    );

    const updatedSchoolsProm = updatedSchools.map((school: any) =>
      Api.updateSchool(school)
        .then(result => console.log(result))
        .catch(err => console.log(err))
    );

    let forSubmit = Object.assign({}, this.user);
    delete forSubmit['profile_picture_url'];

    Promise.all([newSchoolsProm, updatedSchoolsProm])
      .then(() => {
        Api.updateUser(forSubmit)
          .then(user => {
            this.props.setUser!(user);

            if (this.profileImgChanged) {
              const formData = new FormData();
              const fi = $('#profilePic')[0] as HTMLInputElement;
              formData.append('profile_picture', fi.files![0]);
              Api.uploadUserProfilePic(formData)
                .then(result => {
                  this.user!.profile_picture_url = result.profile_picture_url;
                  this.props.onSuccess();
                })
                .catch(err => console.log(err));
            } else {
              this.props.onSuccess();
            }
      })})
      .catch(err => console.log(err));

    let promiseVideos = null;

    if (videosToSave) {
      promiseVideos = Api.addVideo(videosToSave)
                        .then(result => {
                          console.log(result);
                        })
                        .catch(err => {
                          console.log(err);
                        });
    }

  }

  readURL = (e: React.ChangeEvent<HTMLInputElement>) => {
    const self = this;
    loadImage(
         e.target.files![0],
         function (img: any) {
           console.log(img)
           self.profileImgChanged = true;

             $('.profile-pic').empty().append(img)
         },
         {
           aspectRatio: 1,
           orientation: true,
         }
     );
  }

  removeVideo = (videoId: number) => {

    Api.deleteVideo(videoId)
      .then(response=> {

        this.retrieveVideos();
        console.log(response);
      })
      .catch(err => {
        console.log(err);
      });
  }

  addVideoFields = () => {

    this.newVideos.push({ url: '' });
  }

  addSchoolFields = () => {
    this.schools.push({ school: { gpa: '',
                                  user: this.user!.id,
                                  school: '',
                                  current: false,
                                  id: (this.schools.length + 1) * -1,
                                },
                        updated: false });
    this.schoolAdded = true;
  };

  renderSchools() {
    if (!this.user) return;
    if (this.user && this.user.user_type === 'organisation') return;

    return <div className="field-section">
      <h3 className="label light-text">My Education</h3>
      {this.schools.map((s, i) => <School school={s} key={s.school.id} schoolIndex={i} />)}

      <div className="add-wrap" onClick={this.addSchoolFields}>
        <span className="psr-icons icon-add"/><span>Add school</span>
      </div>
    </div>
  }

  renderPersonalInfo() {
    const label = this.user && this.user.user_type === 'organisation' ? 'Organisation Info' : 'Personal Info';

    return <fieldset>
      <legend className="section-heading">Personal Info</legend>
      <label>Profile pic</label>
      <p className="pic-upload-note">For best profile image results, upload a portrait-style, square image.</p>
      <div className="profile-upload-wrap">
        <label htmlFor="profilePic" className="add-btn-lg upload-btn show" ref="uploadIcon">
          <span className="psr-icons icon-plus"/>
        </label>
        <div className={"profile-pic " + (this.profileImgOrg || this.profileImg ? "show" : "")}
             ref="profilePicDiv">
          <img src={this.profileImgOrg}
               title="profile picture" ref="profileImg"/>
        </div>
      </div>
      <label htmlFor="profilePic"
             className="text-center body-text">{(this.imageBlank ? 'Add' : 'Edit') + ' profile pic'}</label>
      <input type="file" id="profilePic" className="show-for-sr" ref="profilePic"
             onChange={this.readURL}/>
      {this.renderFirstName()}
      {this.renderLastName()}
      <label>Catchphrase
        <input type="text" name="tagline" placeholder="Catch Phrase" required
               value={(this.user && this.user.tagline) || ''}
               onChange={this.setTagline}/>
        <span className="form-error">This field is required.</span>
      </label>
      {'athlete' === (this.user && this.user.user_type) ?
        <label>Do you have a referral code?
          <input type="text" placeholder="Enter it here"
                 value={(this.user && this.user.referral_code) || ''}
                 onChange={this.setReferralCode}/>
        </label> : ''}
    </fieldset>;
  }

  renderFirstName() {
    const label = this.user && this.user.user_type === 'organisation' ? 'Organisation name' : 'First Name';

    return <label>{label}
      <input type="text" name="fname" placeholder="First name" required
             value={(this.user && this.user.first_name) || ''}
             onChange={this.setFirstName}/>
      <span className="form-error">This field is required.</span>
    </label>;
  }

  renderLastName() {
    if (this.user && this.user.user_type === 'organisation') return;

    return <label>Last Name
      <input type="text" name="lname" placeholder="Last name" required
             value={(this.user && this.user.last_name) || ''}
             onChange={this.setLastName}/>
      <span className="form-error">This field is required.</span>
    </label>;
  }

  renderMainSports() {
    if (this.user && this.user.user_type === 'organisation') return;
    
    return <fieldset>
      <legend className="section-heading">Main sports</legend>
      {this.user && this.user.chosen_sports ?
        this.user.chosen_sports.map(s => (
          <div className="switch-container" key={s.sport}>
            <div className="switch-label">{s.sport}</div>
            <div className="switch small">
              <input className="switch-input"
                     type="checkbox" checked={s.is_chosen}
                     id={s.sport + 'chosen'}
                     name={s.sport + 'chosen'}
                     onChange={this.updateChosen}/>
              <label className="switch-paddle" htmlFor={s.sport + 'chosen'}>
                <span className="show-for-sr">{s.sport + 'chosen'}</span>
              </label>
            </div>
          </div>)) : null}
    </fieldset>;
  }

  renderDashboardDisplaySports() {
    if (this.user && this.user.user_type === 'organisation') return;

    return <fieldset>
      <legend className="section-heading">Dashboard display</legend>
      <label>Display stats from these sports on my dashboard:</label>
      {this.user && this.user.chosen_sports ?
        this.user.chosen_sports.map(s => (
          <div className="switch-container" key={s.sport}>
            <div className="switch-label">{s.sport}</div>
            <div className="switch small">
              <input className="switch-input"
                     type="checkbox" checked={s.is_displayed}
                     id={s.sport + 'display'}
                     name={s.sport + 'display'}
                     onChange={this.updateDisplay}/>
              <label className="switch-paddle" htmlFor={s.sport + 'display'}>
                <span className="show-for-sr">{s.sport + 'display'}</span>
              </label>
            </div>
          </div>)) : null}
    </fieldset>;
  }

  render() {
    return (
      <form data-abide noValidate id="profile-form" ref="profileForm">
        {this.renderPersonalInfo()}
        {this.renderMainSports()}
        {this.renderDashboardDisplaySports()}

        {this.props.forProfile ?
          <div>
            {this.renderSchools()}

            <div className="field-section">
              <h3 className="label light-text">My videos</h3>
              <p className="dark-text">
                Share your favourite videos and hightlight reels of your best plays from YouTube.
              </p>

              {this.videos.map((v, i) => <VideoField video={v}
                                                     key={i}
                                                     removeVideo={this.removeVideo}/>)}
              {this.newVideos.map((v, i) => <VideoField video={v}
                                                        key={i}
                                                        ref={r => {
                                                          this.newVideoComps[i] = r;
                                                        }}/>)}
              <div className="add-wrap" onClick={this.addVideoFields}><span className="psr-icons icon-add"/><span>Add video</span>
              </div>
            </div>
            <div className="field-section">
              <h3 className="label light-text">My Achievements</h3>
              {this.awards.map(award => <AwardCard key={award.id}
                                                   imgId={award.badge_id - 1}
                                                   title={award.title}
                                                   content=''
                                                   team={award.team || ''}
                                                   footer={moment(award.date).format('MMM D, YYYY')}
                                                   link={`/profile/edit-achievement/${award.id}/e`}/>)}
              <Link to="/profile/add-achievement/e" className="add-wrap">
                <span className="psr-icons icon-add"/><span>Add achievement</span>
              </Link>
            </div>
            <div className="field-section">
              <h3 className="label light-text">My goals</h3>
              {this.pendingGoals.map(goal =>
                <AwardCardGR key={goal.id}
                             isGrey={true}
                             title="Goal"
                             content={goal.description}
                             footer={`Achieve by: ${moment(goal.achieve_by).format('MMM D, YYYY')}`}
                             link={`/profile/edit-goal/${goal.id}/e`}/>)}
              {this.goalsAchieved.length ?
                <div className="group-section">
                  <h3 className="group-heading">Completed Goals</h3>
                  {this.goalsAchieved.map(goal => <AwardCardGR key={goal.id}
                                                               isGrey={false}
                                                               title="Goal"
                                                               content={goal.description}
                                                               footer={`Achieve by: ${moment(goal.achieve_by).format('MMM D, YYYY')}`}
                                                               link={`/profile/edit-goal/${goal.id}/e`}/>)}
                </div> : null}
              <Link to="/profile/add-goal" className="add-wrap">
                <span className="psr-icons icon-add"/><span>Add goal</span>
              </Link>
            </div>
          </div>
          : ''}
        <ButtonRow>
          <CancelBtn onClick={() => { this.props.history.goBack(); }}>
            Cancel
          </CancelBtn>
          <GradientBtn type="submit"
                        value="Save">
            Save
          </GradientBtn>
        </ButtonRow>
      </form>
    )
  }
}

export default ProfileForm;