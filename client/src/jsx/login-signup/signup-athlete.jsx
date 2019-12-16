import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link, BrowserRouter as Router,  Route, Switch, withRouter} from 'react-router-dom'
import { CSSTransitionGroup } from 'react-transition-group'
import {extendObservable, computed} from 'mobx'
import {observer, inject} from 'mobx-react'

import Header from '../components/header'
import SignupProgress from '../components/signup-progress'
import PersonalInfo from './signup-personal-info'
import SignupPayment from './signup-payment'
import SignupProfile from './signup-profile'
import SignupConfirmation from '../components/signup-confirmation'
import ProfileConfirmation from '../components/profile-confirmation'
//import SetHeight from '../components/set-height'
import Api from '../api'


class SignupAthlete extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { curStep: 'personalInfo',
                       enabledStep: 'personalInfo',
                       athlete: null,
                       paymentComp: null,
                       curShownComp: null,
                       referral: computed(() => {
                         if (this.props.location && this.props.location.search) {
                           const params = new URLSearchParams(this.props.location.search);

                           return params.get('referral') || '';
                         }
                         return '';
                       }) });
  }

  componentWillMount() {

    $('.reveal-overlay').remove();
  }

  componentDidMount() {

    $(ReactDOM.findDOMNode(this.refs.motionContainer)).addClass('in')
      .one('transitionend', () => {
        if (null == this.paymentComp) {
          this.paymentComp = <SignupPayment ref={el => {this.refs["payment"] = el}}
                                            onNext={this.showSignupConfirmation}
                                            referral={this.referral}
                                            onSubmitPayment={this.showSignupBlocker}/>;
        }});

    $(ReactDOM.findDOMNode(this.refs.linkPanels)).addClass('active');


    if (this.props.match.params.step) {

      if (3 == this.props.match.params.step) {

        Api.getUser()
          .then(user => {
            this.athlete = user;
            this.props.setUser(user);
          })
          .catch(err => this.props.history.push('/login'));

        this.refs.profile.wrappedInstance.show();
        this.curShownComp = this.refs.profile;
        this.curStep = 'profile';
        this.enabledStep = 'profile';
      } else if (2 == this.props.match.params.step) {

        if (!this.refs['payment']) {
          this.paymentComp = <SignupPayment ref={el => {this.refs["payment"] = this.curShownComp = el;
                                                        if (el) el.wrappedInstance.show()}}
                                            onNext={() => this.showSignupConfirmation()}
                                            referral={this.referral}
                                            onSubmitPayment={this.showSignupBlocker}/>;
          this.curStep = 'payment';
          this.enabledStep = 'payment';
        }
      }
      history.replaceState(null, "", "/signup/athlete/");
    } else {
      this.refs.personalInfo.wrappedInstance.show();
      this.curShownComp = this.refs.personalInfo;
    }
  }

  changeRoute() {
    $(ReactDOM.findDOMNode(this.refs.motionContainer)).removeClass('in');
    $(ReactDOM.findDOMNode(this.refs.linkPanels)).removeClass('active');
  }

  onStepChange = (step) => {

    this.curStep = step;
    this.curShownComp.wrappedInstance.hide();
    if ('payment' == step && !this.refs['payment']) {
      this.paymentComp = <SignupPayment ref={el => {this.refs["payment"] = this.curShownComp = el;
                                                    if (el) el.wrappedInstance.show()}}
                                        onNext={() => this.showSignupConfirmation()}
                                        referral={this.referral}
                                        onSubmitPayment={this.showSignupBlocker}/>;
    } else {
      this.refs[step].wrappedInstance.show();
      this.curShownComp = this.refs[step];
    }

    switch (step) {
      case 'payment':
        if ('profile' != this.enabledStep) this.enabledStep = 'payment';
        break;
      case 'profile':
        this.enabledStep = 'profile';
    }

    this.scrollToTop();
  }

  scrollToTop = () => {
    let scrollContainer;
    if($(window).width() >= 1024) {
      scrollContainer = this.refs.transition;
    } else {
      scrollContainer = this.refs.content;
    }
    $(ReactDOM.findDOMNode(scrollContainer)).scrollTop(0);
  }

  toPayment = (athlete) => {

    this.athlete = athlete;
    this.onStepChange('payment');
  }

  showSignupConfirmation = () => {

    this.refs.signupConfirmation.showConfirmation();
  }

  showSignupBlocker = () => {
    this.scrollToTop();
    this.refs.signupConfirmation.openModal();
  }

  showProfileBlocker = () => {
    this.scrollToTop();
    this.refs.profileConfirmation.openModal();
  }

  checkInvite = () => {

    if (this.props.match.params.inviteToken) {

      Api.acceptInvitation(this.props.match.params.inviteToken)
        .then(response => {
          this.props.history.push('/invite-accepted/athlete' +
                                  '/' + this.props.match.params.firstName +
                                  '/' +  this.props.match.params.lastName +
                                  '/' + response.requester_id);
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      this.showProfileConfirmation();
    }
  }

  showProfileConfirmation = () => {
    this.refs.profileConfirmation.showConfirmation();
  }

  render() {
    return (
      <div className="content-container signup signup-athlete full-screen">

        <Header pageTitle="Sign up for Athletes" fullWidth={true}/>
        <div className="row expanded content link-panels" ref="content">

          {/*<div className="link-panels" ref="linkPanels">*/}
            <Link to="/signup/"
                  className="column small-12 large-4 signup-link athlete"
                  onClick={this.changeRoute.bind(this)}>For Athletes</Link>
            
            <Link to="/signup/coach/"
                  className="column small-12 large-4 signup-link coach"
                  onClick={this.changeRoute.bind(this)}>For Coaches</Link>
            
            <Link to="/signup/organisation/"
                  className="column small-12 large-4 signup-link organisation"
                  onClick={this.changeRoute.bind(this)}>For Organisations</Link>          
          {/*</div>*/}


          <div className="column small-12 medium-6 large-6 steps-container">
            <div className="motion-container" ref="motionContainer">

              <SignupProgress userType="athlete" step={this.curStep} enabledStep={this.enabledStep}
                              onStepChange={this.onStepChange}/>

              <div className="transition-container" ref="transition">
                <div className="column large-6 content-box back-button-box">
                  <Link to="/signup/" className="arrow-link" onClick={this.changeRoute.bind(this)}>&laquo; Back</Link>
                </div>

                <PersonalInfo ref="personalInfo" userType="athlete"
                              onNext={this.toPayment}/>
                { this.paymentComp }
                <SignupProfile ref="profile" onSubmit={this.showProfileBlocker}
                               onSuccess={this.checkInvite}/>
              </div>


              <SignupConfirmation
                  userType="athlete"
                  user={this.props.user}
                  ref="signupConfirmation"
                  onNext={() => this.onStepChange('profile')}
              />

                <ProfileConfirmation userType="athlete" ref="profileConfirmation"/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default inject('user', 'setUser')(observer(SignupAthlete))
