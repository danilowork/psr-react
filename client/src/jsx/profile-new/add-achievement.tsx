import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router'
import { extendObservable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'
import styled from 'styled-components'

import Api from '../api'
import SaveConfirmation from '../components-new/save-confirmation'
import AchievementForm from '../components-new/achievement-form'
import { mediaMax } from "../styled/theme"
import { User } from "../data-types";
import history from '../history'

const ContentCol = styled.div`
  margin-top: 50px;
  ${mediaMax.xxlarge`max-width: 72%; flex: 0 0 72%;`}
  color: black;
  background-color: #f9f9f9;
  padding: 30px 40px;`;

interface AddAchievementProps extends RouteComponentProps<{from: string}>{
  user?: User
}

@inject('user')
@observer
class AddAchievement extends Component<AddAchievementProps, {}> {

  private saveConfirmation: any;
  private achievementForm: any;
  private user: any;

  constructor(props: any) {
    super(props);
    extendObservable(this,
      { user: computed(() => this.props.user) });
    this.saveConfirmation = null;
    this.achievementForm = null;
  }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  onSave = () => {
    this.achievementForm.wrappedInstance.trySubmit();
  };

  onCancel = () => {
    if ('e' === this.props.match.params.from) {
      history.push('/profile/edit')
    } else {
      history.push('/profile')
    }
  };

  onClose = () => {
    if ('e' === this.props.match.params.from) {
      history.push('/profile/edit')
    } else {
      history.push('/profile')
    }
  };

  submitForm = (award: any) => {
    $('#save-confirmation').foundation('open');

    if (!award.location) delete award.location;
    if (!award.team) delete award.team;
    if (!award.compeition) delete award.compeition;

    Api.addAward(award)
      .then(result => {
        this.showConfirmation();
      })
      .catch(err => {
        this.showApiError();
      });
  };

  showApiError = () => {
    this.saveConfirmation.showApiError();
  };

  showConfirmation = () => {
    this.saveConfirmation.showConfirmation();
  };

  render() {
    return (
      <div className="add-achievement" ref="me">
        <div className="row align-center main-content-container">
          <ContentCol>
            <AchievementForm onSubmit={this.submitForm}
                             onSuccess={this.showConfirmation}
                             onApiError={this.showApiError}
                             ref={(r) => this.achievementForm = r}/>
          </ContentCol>
        </div>

        <SaveConfirmation userType={this.user && this.user.user_type}
                          msg="Your achievement has been added successfully."
                          apiMsg="There is problem processing your request, pleaes try again later."
                          onClose={this.onClose}
                          ref={(r) => this.saveConfirmation = r}/>
      </div>
    )
  }
}

export default inject('user')(observer(AddAchievement))
