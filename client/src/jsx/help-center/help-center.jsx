import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Route, Switch, Link} from 'react-router-dom'
import {extendObservable, computed} from 'mobx'
import {observer, inject} from 'mobx-react'
import moment from 'moment'

import Api from '../api'

import Header from '../components/header'
import Sidebar from '../components/sidebar'
import Footer from '../components/footer'
import SubmitBar from '../components/util-bar'


import HelpForm from './help-form'
import SaveConfirmation from '../components/save-confirmation'


export default inject('user', 'setUser')(observer(class extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { user: computed(() => this.props.user),
                       age: '',
                       help: { organization: '',
                               coach_name: '',
                               date: 'm/d/yyyy',
                               //i_agree: false,
                               details: '',
                               name: '' } });
  }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {

    if(!this.props.user) {
      Api.getUser()
        .then(user => {
          this.props.setUser(user);

          this.age = moment().diff(this.user.date_of_birth, 'years',false);
          //this.help.name = this.user.first_name + ' ' + this.user.last_name;

        })
        .catch(err => this.props.history.push('/login'));
    } else {
      this.age = moment().diff(this.user.date_of_birth, 'years',false);
      //this.help.name = this.user.first_name + ' ' + this.user.last_name;
    }
  }

  componentWillUnmount(){
    $('body').scrollTop(0);
  }

  onClose = () => {
    this.props.history.push('/help-center')
  }

  submitForm = (helpData) => {
    $('#save-confirmation').foundation('open');

    //console.log(this.help);
    //console.log(helpData);
    /*
    organization: <str>,
    coach_name: <str>, 
    date: <date>,
    details: <str>,
    name: <str|optional>
    */

    Api.submitHelpForm(helpData)
      .then(result => {
        this.showConfirmation();
      })
      .catch(err => {
        this.showApiError(); 
      })
      
  }

  triggerSubmit = () => {
    $("#help-form").trigger("submit");
  }

  showApiError = () => {
    this.refs.saveConfirmation.showApiError();
  }

  showConfirmation = () => {
    this.refs.saveConfirmation.showConfirmation();
  }

  render() {


    //console.log(this.age + ' yrs old');
    return (
      
      <div>

      <SubmitBar title='Let someone know' btnText='Submit' noAutoPopup={true} onCancel={this.onClose} onSave={this.triggerSubmit} readonly={false}/>

      <div className="row align-center main-content-container">
        <div className="column content-column">


        {this.age > 19 ?
          <div className="group-section"><p>Keeping you safe is very important to us.  If there is ever a time when a team mate, support staff, coach or anyone around the team hurts 
          you or makes you feel uncomfortable or abused, by using:</p>
          <ol>
          <li>offensive words,</li>
          <li>unwarranted and unwelcome physical contact, or</li>
          <li>lewd or suggestive language,</li>
          </ol>
          <p>we encourage you to report such behavior to whoever you feel is the best person to resolve the situation.</p>
          <p>If you prefer, we would be pleased to help you. We cannot promise to fix your problem, but we promise to bring it to the attention of 
          people who have the power to help.  Just fill in our form telling us what happened.  You do not have to tell us your name, although knowing 
          your name would be useful.  We DO need you to tell us what happened to you and the name(s) of the person or persons whose conduct you are 
          reporting.  We will pass on the completed form to someone who can evaluate, investigate and adjudicate it.</p>
          <p>Tell us to whom you feel we should send your form, if you know.  Otherwise, we will pass it on to your sports club / organization</p></div> :
          <div className="group-section"><p>Keeping you safe is very important to us.  If there is ever a time when a team mate, support staff, coach or anyone around the team hurts 
          you or makes you feel bad by using words or by touching you, we believe you should tell the best person to fix the problem.</p>
          <p>If you prefer, we would be pleased to help you. We cannot promise to fix your problem, but we promise to bring it to the attention of 
          people who have the power to help.  Just fill in our form telling us what happened.  You do not have to tell us your name, although knowing 
          your name would be useful.  We DO need you to tell us what happened to you and who made you feel hurt or bad, so we can help it stop.</p>
          <p>Tell us to who you feel we should send your form to, if you know.  Otherwise, we will pass it on to your sports club / organization.</p></div> }

        
          <HelpForm onSubmit={this.submitForm}
                  onSuccess={this.showConfirmation}
                  onApiError= {this.showApiError}
                  ref="helpForm"
                  help={this.help} />
        
          <SaveConfirmation userType={this.user && this.user.user_type}
            msg="Your form has been submitted successfully."
            apiMsg="There is problem processing your request, pleaes try again later."
            onClose={this.onClose}
            ref="saveConfirmation"/>
            

        </div>
      </div>     
      </div>
          
    )
  }
}))
