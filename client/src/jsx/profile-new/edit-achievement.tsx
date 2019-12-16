import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { RouteComponentProps } from 'react-router';
import styled from 'styled-components'

import Api from '../api'
import { User } from '../data-types';
import SaveConfirmation from '../components-new/save-confirmation';
import AchievementForm from '../components-new/achievement-form';
import history from '../history'

interface EditAchievementProps extends RouteComponentProps<{award_id: number,
                                                            from: string}>{
  user?: User
}

import { mediaMax } from "../styled/theme"

const ContentCol = styled.div`
  margin-top: 50px;
  ${mediaMax.xxlarge`max-width: 72%; flex: 0 0 72%;`}
  color: black;
  background-color: #f9f9f9;
  padding: 30px 40px;`;

@inject('user')
@observer
class EditAchievement extends Component<EditAchievementProps, {}> {
  private saveConfirmation: any;
  private achievementForm: any;

  constructor(props: any) {
    super(props);
    this.saveConfirmation = null;
    this.achievementForm = null;
  }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    Api.retrieveAward(this.props.match.params.award_id)
      .then(award => {
        this.achievementForm.wrappedInstance.setAward(award);
      })
      .catch(err => {
        console.log(err);
      });
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
    Api.updateAward(award)
      .then(response => {
        this.showConfirmation();
      })
      .catch(err => {
        this.showApiError();
      });
  };

  showApiError = () => {
    this.saveConfirmation.wrappedInstance.showApiError();
  };

  showConfirmation = () => {
    this.saveConfirmation.wrappedInstance.showConfirmation();
  };

  render() {
    return (
      <div className="edit-achievement" ref="me">
        <div className="row align-center main-content-container">
          <ContentCol>
            <AchievementForm onSubmit={this.submitForm}
                             onSuccess={this.showConfirmation}
                             onApiError={this.showApiError}
                             ref={(r) => this.achievementForm = r}/>
          </ContentCol>
        </div>
        <SaveConfirmation userType={this.props.user!.user_type}
            msg="Your change has been saved successfully."
            apiMsg="There is problem processing your request, pleaes try again later."
            onClose={this.onClose}
            ref={(r) => this.saveConfirmation = r}/>
      </div>
    )
  }
}

export default EditAchievement;
