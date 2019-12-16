import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed} from 'mobx'
import {observer, inject} from 'mobx-react'

import UtilBar from '../components/util-bar'
import Api from '../api'
import AchievementForm from '../components/achievement-form'
import SaveConfirmation from '../components/save-confirmation'

class EditAchievement extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { user: computed(() => this.props.user),
                      });
  }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {

    Api.retrieveAward(this.props.match.params.award_id)
      .then(award => {
        this.refs.achievementForm.wrappedInstance.setAward(award);
      })
      .catch(err => {
        console.log(err);
      });
  }

  componentWillUnmount(){
    $('body').scrollTop(0);
  }

  onSave = () => {

    this.refs.achievementForm.wrappedInstance.trySubmit();
  }

  onCancel = () => {
    if ('e' == this.props.match.params.from) {
      this.props.history.push('/profile/edit')
    } else {
      this.props.history.push('/profile')
    }
  }

  onClose = () => {
    if ('e' == this.props.match.params.from) {
      this.props.history.push('/profile/edit')
    } else {
      this.props.history.push('/profile')
    }
  }

  submitForm = (award) => {
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
  }

  showApiError = () => {
    this.refs.saveConfirmation.showApiError();
  }

  showConfirmation = () => {
    this.refs.saveConfirmation.showConfirmation();
  }

  render() {

    return (
      <div className="edit-achievement" ref="me">
        <UtilBar title="Edit Achievement"
                 onCancel={this.onCancel}
                 onSave={this.onSave}
                 noAutoPopup={true}
               />
        <div className="row align-center main-content-container">
          <div className="column content-column">
            <AchievementForm onSubmit={this.submitForm}
                             onSuccess={this.showConfirmation}
                             onApiError= {this.showApiError}
                             ref="achievementForm"/>
          </div>
        </div>

        <SaveConfirmation userType={this.user && this.user.user_type}
            msg="Your change has been saved successfully."
            apiMsg="There is problem processing your request, pleaes try again later."
            onClose={this.onClose}
            ref="saveConfirmation"/>
      </div>
    )
  }
}

export default inject('user', 'setUser')(observer(EditAchievement))
