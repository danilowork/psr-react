import React, { Component } from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { RouteComponentProps } from 'react-router'
import styled from 'styled-components'

import Api from '../api'
import SaveConfirmation from '../components-new/save-confirmation'
import { User } from '../data-types'
import GoalForm from '../components-new/goal-form'
import { mediaMax } from "../styled/theme"

const ContentCol = styled.div`
  margin-top: 50px;
  ${mediaMax.xxlarge`max-width: 72%; flex: 0 0 72%;`}
  color: black;
  background-color: #f9f9f9;
  padding: 30px 40px;`;

interface EditGoalProps extends RouteComponentProps<{
  g_id: number,
  from: string
}> {
  user: User
}

@inject('user')
@observer
class EditGoal extends Component<EditGoalProps, {}> {

  @observable goal = {
    id: 0,
    description: '',
    achieve_by: '',
    is_achieved: false
  };

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    Api.getGoal(this.props.match.params.g_id)
      .then(goal => {
        this.goal = goal;
      })
      .catch(err => {
        console.log(err)
      });
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  onSave = () => {
    (this.refs.goalForm as GoalForm).trySubmit();
  };

  onCancel = () => {
    if ('p' == this.props.match.params.from) {
      this.props.history.push('/profile')
    } else {
      this.props.history.push('/profile/edit')
    }
  };

  onClose = () => {
    this.props.history.push('/profile')
  };

  submitForm = (goal: any) => {
    $('#save-confirmation').foundation('open');

    Api.updateGoal(this.goal.id, goal)
      .then(result => {
        this.showConfirmation();
      })
      .catch(err => {
        this.showApiError();
      })
  };

  showApiError = () => {
    const confirm = this.refs.saveConfirmation as SaveConfirmation;
    confirm.showApiError();
  };

  showConfirmation = () => {
    const confirm = this.refs.saveConfirmation as SaveConfirmation;
    confirm.showConfirmation();
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

        <SaveConfirmation userType={this.props.user!.user_type}
                          msg="Your change has been saved successfully."
                          apiMsg="There is problem processing your request, pleaes try again later."
                          onClose={this.onClose}
                          ref="saveConfirmation"/>
      </div>
    )
  }
}

export default EditGoal;
