import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed, observe} from 'mobx'
import {observer, inject} from 'mobx-react'
import loadImage from 'blueimp-load-image'

import Select from '../../components/select'
import Api from '../../api'
import {userIsOrganisation} from "../../utils/utils";

class TeamProfileForm extends Component {

  constructor() {
    super();
    extendObservable(this, {
      team: {
        name: '',
        status: 'active',
        sport_id: '',
        season: '',
        location: '',
        is_private: false,
        tagline: '',
        sportEngineId: null,
      },
      teamIn: computed(() => this.props.team),
      newTeam: true,
      athleteEmails: [''],
      coachEmails: [''],
      athletesExtraFields: [],
      coachesExtraFields: [],
      athletesNumExtra: computed(() => {
        return this.athletesExtraFields.length;
      }),
      coachesNumExtra: computed(() => {
        return this.coachesNumExtra.length;
      }),
      profileImgOrg: '',
      profileImg: '',
      imageBlank: computed(() => !this.profileImgOrg.length),
      profileImgChanged: false,
      sportChoices: [],
      curSportIndex: 0,
      sportEngineOn: false,
      gotAthletesCsv: false,
      gotCoachesCsv: false,
    });
  }

  componentDidMount() {
    if (undefined !== this.props.team) {
      if (null === this.props.team) {
        const disposer = observe(this,
          'teamIn',
          change => {
            if (change.newValue) {
              this.team = this.teamIn;
              this.profileImgOrg = this.team.team_picture_url;
              disposer();
            }
          });
      } else {
        this.team = this.props.team;
        this.profileImgOrg = this.team.team_picture_url;
      }
      this.newTeam = false;
    }

    Api.getSports()
      .then(result => {
        this.sports = result;
        this.sportChoices = result.map(s => s.name);
        this.team.sport_id = this.sports[this.curSportIndex].id;
      })
      .catch(err => console.log(err));

    $(ReactDOM.findDOMNode(this.refs.teamProfileForm)).foundation();
    if(this.profileImgOrg) {
      this.updateProfilePicClass(this.profileImgOrg)
    }

    observe(this,
            'profileImgOrg',
            change => {
              if (change.newValue) {
                this.updateProfilePicClass(change.newValue);
              }
            });
    this.initValidation();
  }

  initValidation = () => {
    $(ReactDOM.findDOMNode(this.refs.teamProfileForm))
      .on("forminvalid.zf.abide", (ev,frm) => {
        ev.preventDefault();
        this.scrollToError();
      })
      .on("formvalid.zf.abide", (ev,frm) => {
        this.submitChange()
      })
      .on("submit", ev => {
        ev.preventDefault();
      });
  };

  turnOffValidation = () => {
    $(ReactDOM.findDOMNode(this.refs.teamProfileForm))
      .off("forminvalid.zf.abide")
      .off('submit');
  };

  updateProfilePicClass = (newValue) =>{
    const img = new Image();
    img.src = newValue;
    img.onload = function() {
      if(this.width >= this.height) {
        $('.profile-pic').removeClass('portrait').addClass('landscape');
      } else {
        $('.profile-pic').removeClass('landscape').addClass('portrait');
      }
    }
  };

  scrollToError = () => {
    const errorField = $('.form-error.is-visible')[0];
    $('body').scrollTop(errorField.offsetTop -80);
  };


  setName = e => {
    this.team.name = e.target.value;
  };

  setLocation = e => {
    this.team.location = e.target.value;
  };

  setSlogan = e => {
    this.team.tagline = e.target.value;
  };

  setSport = sport => {
    this.curSportIndex = this.sports.findIndex(s => s.name == sport);
    this.team.sport_id = this.sports[this.curSportIndex].id;
  };

  setSeason = e => {
    this.team.season = e.target.value;
  };

  trySubmit = () => {
    $(ReactDOM.findDOMNode(this.refs.teamProfileForm)).submit();
  };

  submitChange = e => {
    if (e) {
      e.preventDefault();
    }
    let pictureForm = null;

    if (this.profileImgChanged) {
      pictureForm = new FormData();

      pictureForm.append('team_picture', $('#profilePic')[0].files[0]);
    }
    if (this.props.onSubmit) {
      const emails = this.athleteEmails.concat(this.coachEmails).filter(String);
      this.props.onSubmit(this.team, pictureForm, emails);
    }
  };

  readURL = (e) => {
    const self = this;
    loadImage(
         e.target.files[0],
         function (img) {
           self.profileImgChanged = true;
           self.profileImg = true;

             $('.profile-pic').empty().append(img)
         },
         {
           aspectRatio: 1,
           orientation: true,
         }
     );
  };

  updateCoachEmail = (email, index) => {
    this.coachEmails[index] = email;
    if (index > 1) {
      this.refs['email' + index].value = email;
    }
  };

  updateAthleteEmail = (email, index) => {
    this.athleteEmails[index] = email;
    if (index > 1) {
      this.refs['email' + index].value = email;
    }
  };

  addAthleteEmailFields = () => {
    const curIndex = this.athletesNumExtra + 1;

    this.athleteEmails.push('');
    this.athletesExtraFields.push(<label key={curIndex}>Email
                            <input type="email" placeholder="Athlete's email address"
                                   ref={i => { this.refs['email' + curIndex] = i;
                                               this.turnOffValidation();
                                               Foundation.reInit('abide');
                                               this.initValidation() }}
                                   onChange={e => { this.updateAthleteEmail(e.target.value, curIndex) }}/>
                            <span className="form-error">Please enter a valid email address.</span>
                          </label>);
  };

  addCoachEmailFields = () => {
    const curIndex = this.coachesNumExtra + 1;

    this.coachEmails.push('');
    this.coachesExtraFields.push(<label key={curIndex}>Email
                            <input type="email" placeholder="Coach's email address"
                                   ref={i => { this.refs['email' + curIndex] = i;
                                               this.turnOffValidation();
                                               Foundation.reInit('abide');
                                               this.initValidation() }}
                                   onChange={e => { this.updateCoachEmail(e.target.value, curIndex) }}/>
                            <span className="form-error">Please enter a valid email address.</span>
                          </label>);
  };

  showInfoPrivacy = () => {
    $(ReactDOM.findDOMNode(this.refs.infoPopupPrivacy)).addClass('active').outerWidth();
    $(ReactDOM.findDOMNode(this.refs.infoPopupPrivacy)).addClass('fade-in');
    $(ReactDOM.findDOMNode(this.refs.infoIconPrivacy)).fadeOut();
  };

  hideInfoPrivacy = () => {
    const self = $(ReactDOM.findDOMNode(this.refs.infoPopupPrivacy));
    self.removeClass('fade-in').one('transitionend', () => self.removeClass('active'));
    $(ReactDOM.findDOMNode(this.refs.infoIconPrivacy)).fadeIn();
  };

  showInfoSportEngine = () => {
    $(ReactDOM.findDOMNode(this.refs.infoPopupSportEngine)).addClass('active').outerWidth();
    $(ReactDOM.findDOMNode(this.refs.infoPopupSportEngine)).addClass('fade-in');
    $(ReactDOM.findDOMNode(this.refs.infoIconSportEngine)).fadeOut();
  };

  hideInfoSportEngine = () => {
    const self = $(ReactDOM.findDOMNode(this.refs.infoPopupSportEngine));
    self.removeClass('fade-in').one('transitionend', () => self.removeClass('active'));
    $(ReactDOM.findDOMNode(this.refs.infoIconSportEngine)).fadeIn();
  };

  showInfoSportEngineId = () => {
    $(ReactDOM.findDOMNode(this.refs.infoPopupSportEngineId)).addClass('active').outerWidth();
    $(ReactDOM.findDOMNode(this.refs.infoPopupSportEngineId)).addClass('fade-in');
    $(ReactDOM.findDOMNode(this.refs.infoIconSportEngineId)).fadeOut();
  };

  hideInfoSportEngineId = () => {
    const self = $(ReactDOM.findDOMNode(this.refs.infoPopupSportEngineId));
    self.removeClass('fade-in').one('transitionend', () => self.removeClass('active'));
    $(ReactDOM.findDOMNode(this.refs.infoIconSportEngineId)).fadeIn();
  };

  updateIsPrivate = e => {
    this.team.is_private = e.target.checked;
  };

  updateSportEngineIsOn = e => {
    this.sportEngineOn = e.target.checked;
    if (this.sportEngineOn) {
      this.showInfoSportEngineId()
    } else {
      this.hideInfoSportEngineId()
    }
  };

  renderPrivacySetting() {
    if (!userIsOrganisation(this.props.user)) return;

    return <div className="switch-block last">
      <div className="custom-select">
        <label>Privacy setting
          <span className="psr-icons icon-info" onClick={this.showInfoPrivacy} ref="infoIconPrivacy"/>
          <div className="info-popup" ref="infoPopupPrivacy">
            <div className="info-popup-header">
              <span className="psr-icons icon-info"/>
              <span className="psr-icons icon-x" onClick={this.hideInfoPrivacy}/>
            </div>
            <div className="info-popup-body">
              <p>Select whether this team is private or public.<br/>
                Private teams are visible only to the organisation that parents them.<br/>
                Public teams are visible outside the organisation that parents them.<br/>
                This can be changed through the team settings.</p>
            </div>
          </div>
        </label>
      </div>
      <span className="value left">Public</span>
      <div className="switch small">
        <input className="switch-input"
               type="checkbox" checked={this.team.is_private}
               name="isPrivate"
               id="isPrivate"
               onChange={this.updateIsPrivate}/>
        <label className="switch-paddle" htmlFor="isPrivate">
          <span className="show-for-sr">is private?</span>
        </label>
      </div>
      <span className="value right">Private</span>
    </div>
  }

  renderSportsEngine() {
    if (!userIsOrganisation(this.props.user)) return;

    //TODO: Finish this when we're ready start working with SportEngine API
    return;

    return <div>
      <div className="switch-block">
        <div className="custom-select">
          <label>Integrate with Sports Engine
            <span className="psr-icons icon-info" onClick={this.showInfoSportEngine} ref="infoIconSportEngine"/>
            <div className="info-popup" ref="infoPopupSportEngine">
              <div className="info-popup-header">
                <span className="psr-icons icon-info"/>
                <span className="psr-icons icon-x" onClick={this.hideInfoSportEngine}/>
              </div>
              <div className="info-popup-body">
                <p>We have partnered with Sports Engine to create the ultimate management tool for your teams.
                  By enabling Sports Engine you will be able to lorem ipsum dolor sit amet, consectetur adipiscing elit,
                  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </div>
            </div>
          </label>
        </div>
        <span className="value left">Off</span>
        <div className="switch small">
          <input className="switch-input"
                 type="checkbox" checked={this.sportEngineOn}
                 name="sportEngineOn"
                 id="sportEngineOn"
                 onChange={this.updateSportEngineIsOn}/>
          <label className="switch-paddle" htmlFor="sportEngineOn">
            <span className="show-for-sr">is on?</span>
          </label>
        </div>
        <span className="value right">On</span>
      </div>
      {!!this.sportEngineOn && this.renderSportEngineId()}
    </div>
  }

  renderSportEngineId = () =>
    <div className="custom-select">
      <label>
        <div className="info-popup" ref="infoPopupSportEngineId">
          <div className="info-popup-body">
            <p>In order to import team data from Sports Engine, you need to enter the team numeric ID found in the settings
            menu of your Sports Engine team. This is a 6-digit number.</p>
          </div>
        </div>
      </label>
    </div>;

  renderInviteAthletes = () => {
    return <div className="content-section team-csv-section">
        <h2 className="section-heading">Invite athletes to the team</h2>
        {!this.gotAthletesCsv && <div>
          <label>Via Email
          <input type="email"
                 placeholder="Athlete's email address"
                 value={this.athleteEmails[0]}
                 onChange={e => {
                   this.updateAthleteEmail(e.target.value, 0)
                 }}/>
          <span className="form-error">Please enter a valid email address.</span>
        </label>
        {this.athletesExtraFields}
        <div className="custom-select">
          <div className="add-wrap" onClick={this.addAthleteEmailFields}>
            <span className="psr-icons icon-add"/>
            <span>Add more</span>
          </div>
        </div>
      </div>}

      <label>Via CSV file</label>
        <p className="team-csv-invite-hint">Upload a CSV file with a list of email contacts to invite in bulk!</p>
        <input type="file"
               id="csvAthletes"
               onChange={this.handleAthletesFile}
               accept=".csv" />
        <span className="form-error">Please enter a valid email address.</span>
    </div>
  };

  renderInviteCoaches = () => {
    if (!userIsOrganisation(this.props.user)) return;

    return <div className="content-section team-csv-section">
      <h2 className="section-heading">Invite coaches to the team</h2>
      {!this.gotCoachesCsv && <div>
        <label>Via Email
          <input type="email"
                 placeholder="Coach's email address"
                 value={this.coachEmails[0]}
                 onChange={e => {
                   this.updateCoachEmail(e.target.value, 0)
                 }}/>
          <span className="form-error">Please enter a valid email address.</span>
        </label>
        {this.coachesExtraFields}
        <div className="custom-select">
          <div className="add-wrap" onClick={this.addCoachEmailFields}>
            <span className="psr-icons icon-add"/>
            <span>Add more</span>
          </div>
        </div>
      </div>}

      <label>Via CSV file</label>
        <p className="team-csv-invite-hint">Upload a CSV file with a list of email contacts to invite in bulk!</p>
        <input type="file"
               id="csvCoaches"
               onChange={this.handleCoachesFile}
               accept=".csv" />
        <span className="form-error">Please enter a valid email address.</span>
    </div>
  };

  handleAthletesFile = event =>
    this.handleFiles(event, true);

  handleCoachesFile = event =>
    this.handleFiles(event, false);

  handleFiles = (event, isAthletes) => {
    try {
      if (window.FileReader) {
        const file = event.target.files[0];
        const reader = new FileReader();
        // Read file into memory as UTF-8
        reader.readAsText(file);
        reader.onload = isAthletes ? this.athletesFileReadingFinished : this.coachesFileReadingFinished;
        reader.onerror = this.errorHandler;
      } else {
        alert('FileReader is not supported in this browser. Please contact PSR support.');
      }
    } catch (e) {
      alert('Error while reading the CSV file.')
    }
  };

  processData = csv => {
    const allTextLines = csv.split(/\r\n|\n/);
    const lines = allTextLines.map(data => data.split(/[,;]/));
    return [].concat(...lines);
  };

  athletesFileReadingFinished = event => {
    try {
      const csvEmails = this.processData(event.target.result);
      this.athleteEmails = csvEmails.filter(String) || [''];
      this.gotAthletesCsv = true;
    } catch (e) {
      alert('Error while processing the CSV file.')
    }
  };

  coachesFileReadingFinished = event => {
    const csvEmails = this.processData(event.target.result);
    this.coachEmails = csvEmails.filter(String) || [''];
    this.gotCoachesCsv = true;
  };

  errorHandler = event => {
    if (event.target.error.name === "NotReadableError") alert("Cannot read file!")
  };

  render() {
    return (
      <form data-abide noValidate id="team-profile-form" ref="teamProfileForm">
        <div className="content-section ">
          <h2 className="section-heading">General</h2>
          <label>Team logo</label>
          <p className="pic-upload-note">For best profile image results, upload a portrait-style, square image.</p>
          <div className="profile-upload-wrap">
            <label htmlFor="profilePic" className="add-btn-lg upload-btn show" ref="uploadIcon">
              <span className="psr-icons icon-plus"></span>
            </label>
            <div className={"profile-pic " + (this.profileImgOrg || this.profileImg ? "show" : "")}

                 ref="profilePicDiv">
              <img src={this.profileImgOrg}
                   title="profile picture" ref="profileImg"/>
            </div>
          </div>
          <label htmlFor="profilePic" className="text-center body-text">{(this.imageBlank ? 'Add' : 'Edit') + ' ' +
          'team logo'}</label>
          <input type="file" id="profilePic" className="show-for-sr" ref="profilePic"
                 onChange={this.readURL}/>
          <label>Team Name
            <input type="text" name="name" placeholder="Type team name here" required
                   value={this.team && this.team.name}
                   onChange={this.setName}/>
            <span className="form-error">This field is required.</span>
          </label>
          {this.newTeam ?
            <Select choices={this.sportChoices}
                    onSelected={this.setSport}
                    required
                    title="Sport"
                    index={this.curSportIndex}/> :
            <label>Sport
              <input type="text" value={this.team.sportName} readOnly/>
            </label>
          }

          <label>Season
            <input type="text" name="season" placeholder="Enter the season or year here" required
                   maxLength="25"
                   value={this.team && this.team.season}
                   onChange={this.setSeason}/>
            <span className="form-error">This field is required.</span>
          </label>
          <label>City/Province/School
            <input type="text" name="tagline" placeholder="Enter here" required
                   value={this.team && this.team.location}
                   onChange={this.setLocation}/>
            <span className="form-error">This field is required.</span>
          </label>
          <label>Team Slogan
            <input type="text" name="teamSlogan" placeholder="Enter here" required
                   value={this.team && this.team.tagline}
                   onChange={this.setSlogan}/>
            <span className="form-error">This field is required.</span>
          </label>
        </div>

        {this.renderPrivacySetting()}
        {this.renderSportsEngine()}
        {this.renderInviteAthletes()}
        {/*{this.renderInviteCoaches()}*/}
      </form>
    )
  }
}

export default inject('user')(observer(TeamProfileForm))
