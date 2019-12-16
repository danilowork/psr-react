import React, { Component } from 'react'
import { extendObservable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'
import styled from 'styled-components'

import Api from '../api'
import GoalForm from '../components-new/goal-form'
import SaveConfirmation from '../components/save-confirmation'
import { mediaMax } from "../styled/theme";

const ContentCol = styled.div`
  margin-top: 50px;
  ${mediaMax.xxlarge`max-width: 72%; flex: 0 0 72%;`}
  color: black;
  background-color: #f9f9f9;
  padding: 30px 40px;`;

class AddGoal extends Component {

  constructor() {
    super();
    extendObservable(this, {
      user: computed(() => this.props.user),
      goal: {
        description: '',
        achieve_by: 'm/d/yyyy',
        is_achieved: false
      }
    });
  }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  onSave = () => {
    this.refs.goalForm.wrappedInstance.trySubmit();
  };

  onCancel = () => {
    this.props.history.push('/profile/edit')
  };

  onClose = () => {
    this.props.history.push('/profile')
  };

  submitForm = (goal) => {
    $('#save-confirmation').foundation('open');

    Api.addGoal(goal)
      .then(result => {
        this.showConfirmation();
      })
      .catch(err => {
        this.showApiError();
      })
  };

  showApiError = () => {
    this.refs.saveConfirmation.showApiError();
  };

  showConfirmation = () => {
    this.refs.saveConfirmation.showConfirmation();
  };

  render() {
    return (
      <div className="add-goal" ref="me">
        <div className="row align-center main-content-container">
          <ContentCol>
            <GoalForm onSubmit={this.submitForm}
                      onSuccess={this.showConfirmation}
                      onApiError={this.showApiError}
                      goal={this.goal}
                      ref="goalForm"/>
          </ContentCol>
        </div>

        <SaveConfirmation userType={this.user && this.user.user_type}
                          msg="Your goal has been added successfully."
                          apiMsg="There is problem processing your request, pleaes try again later."
                          onClose={this.onClose}
                          ref="saveConfirmation"/>
      </div>
    )
  }
}

export default inject('user')(observer(AddGoal))
