import React, { Component } from 'react'
import { extendObservable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'
import styled from 'styled-components'
import moment from 'moment'

import Api from '../api'
import HelpForm from './help-form'
import SaveConfirmation from '../components/save-confirmation'
import { H } from '../styled/components'
import { mediaMax } from '../styled/theme'

const ContentCol = styled.div`
  ${mediaMax.xxlarge`max-width: 72%; flex: 0 0 72%;`}
  color: black;
  background-color: #f9f9f9;
  padding: 30px 40px;`;

const StyledH = styled(H)`
  margin-bottom: -0.9rem;`;

const P = styled.p`
  font-size: 0.9rem;`;

const LI = styled.li`
  font-size: 0.9rem;
`;

export default inject('user', 'setUser', 'sidebarStatus')(observer(class HelpCenter extends Component {

  constructor() {
    super();
    extendObservable(this, {
      user: computed(() => this.props.user),
      age: '',
      help: {
        organization: '',
        coach_name: '',
        date: 'm/d/yyyy',
        //i_agree: false,
        details: '',
        name: ''
      }
    });
  }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    if (!this.props.user) {
      Api.getUser()
        .then(user => {
          this.props.setUser(user);
          this.age = moment().diff(this.user.date_of_birth, 'years', false);
        })
        .catch(err => this.props.history.push('/login'));
    } else {
      this.age = moment().diff(this.user.date_of_birth, 'years', false);
    }
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  onClose = () => {
    this.props.history.push('/help-center')
  };

  submitForm = (helpData) => {
    $('#save-confirmation').foundation('open');

    Api.submitHelpForm(helpData)
      .then(result => {
        this.showConfirmation();
      })
      .catch(err => {
        this.showApiError();
      })
  };

  triggerSubmit = () => {
    $("#help-form").trigger("submit");
  };

  showApiError = () => {
    this.refs.saveConfirmation.showApiError();
  };

  showConfirmation = () => {
    this.refs.saveConfirmation.showConfirmation();
  };

  render() {
    return (
      <div>
        <div className="row align-center main-content-container">
          <ContentCol className="column content-column">
            <StyledH>Let someone know</StyledH>
            <hr/>
            {this.age > 19 ?
              <div className="group-section"><P>Keeping you safe is very important to us. If there is ever a time when a
                team mate, support staff, coach or anyone around the team hurts
                you or makes you feel uncomfortable or abused, by using:</P>
                <ol>
                  <LI>offensive words,</LI>
                  <LI>unwarranted and unwelcome physical contact, or</LI>
                  <LI>lewd or suggestive language,</LI>
                </ol>
                <P>we encourage you to report such behavior to whoever you feel is the best person to resolve the
                  situation.</P>
                <P>If you prefer, we would be pleased to help you. We cannot promise to fix your problem, but we promise
                  to bring it to the attention of
                  people who have the power to help. Just fill in our form telling us what happened. You do not have to
                  tell us your name, although knowing
                  your name would be useful. We DO need you to tell us what happened to you and the name(s) of the
                  person or persons whose conduct you are
                  reporting. We will pass on the completed form to someone who can evaluate, investigate and adjudicate
                  it.</P>
                <P>Tell us to whom you feel we should send your form, if you know. Otherwise, we will pass it on to your
                  sports club / organization</P></div> :
              <div className="group-section"><P>Keeping you safe is very important to us. If there is ever a time when a
                team mate, support staff, coach or anyone around the team hurts
                you or makes you feel bad by using words or by touching you, we believe you should tell the best person
                to fix the problem.</P>
                <P>If you prefer, we would be pleased to help you. We cannot promise to fix your problem, but we promise
                  to bring it to the attention of
                  people who have the power to help. Just fill in our form telling us what happened. You do not have to
                  tell us your name, although knowing
                  your name would be useful. We DO need you to tell us what happened to you and who made you feel hurt
                  or bad, so we can help it stop.</P>
                <P>Tell us to who you feel we should send your form to, if you know. Otherwise, we will pass it on to
                  your sports club / organization.</P></div>}

            <HelpForm onSubmit={this.submitForm}
                      onSuccess={this.showConfirmation}
                      onApiError={this.showApiError}
                      history={this.props.history}
                      ref="helpForm"
                      help={this.help}/>

            <SaveConfirmation userType={this.user && this.user.user_type}
                              msg="Your form has been submitted successfully."
                              apiMsg="There is problem processing your request, pleaes try again later."
                              onClose={this.onClose}
                              ref="saveConfirmation"/>
          </ContentCol>
        </div>
      </div>
    )
  }
}))
