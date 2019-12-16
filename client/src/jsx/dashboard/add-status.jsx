import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { extendObservable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import UtilBar from '../components/util-bar'
import Api from '../api'
import SaveConfirmation from '../components/save-confirmation'
import StatusForm from './components/status-form'
import { Column, Header, HeaderH1, HeaderP } from '../dashboard/components/styled'

class AddStatus extends Component {

  constructor() {
    super();
    extendObservable(this, {
      user: computed(() => this.props.user),
      isApiErr: false,
      apiErrMsg: "There is problem processing your request, pleaes try again later.",
      assessmentId: computed(() => this.getAssessment()),
      isNewDashboard: computed(() => this.props.isNewDashboard),
    });
  }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)).foundation();
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  onSave = () => {
    this.refs.statusForm.wrappedInstance.trySubmit();
  };

  onCancel = (e) => {
    if (e) e.preventDefault();

    if (this.isNewDashboard) {
      this.props.history.push(`/dashboard`);
    } else {
      this.props.history.push('/dashboard/my-status');
    }
  };

  onClose = () => {
    if (this.isApiErr) return;
    this.onCancel();
  };

  submitForm = (preCompeteStatus) => {
    $('#save-confirmation').foundation('open');

    if (!preCompeteStatus.team_id) {
      delete preCompeteStatus.team_id;
    }
    Api.addPreCompetitionAss(preCompeteStatus)
      .then(result => {
        this.isApiErr = false;
        this.showConfirmation();
      })
      .catch(err => {
        if (400 === err.status) {
          const errObj = JSON.parse(err.responseText);
          if (errObj.date) {
            this.apiErrMsg = errObj.date;
          }
        }
        this.isApiErr = true;
        this.showApiError();
      });
  };

  showApiError = () => {
    this.refs.saveConfirmation.showApiError();
  };

  showConfirmation = () => {
    this.refs.saveConfirmation.showConfirmation();
  };

  renderUtilBar = () =>
    !this.isNewDashboard &&
    <UtilBar title="Pre-Competiton Status"
             onCancel={this.onCancel}
             onSave={this.onSave}
             noAutoPopup={true}/>;

  renderHeader = () =>
    !!this.isNewDashboard &&
    <Header isNewDashboard={this.isNewDashboard}>
      <HeaderH1 isNewDashboard={this.isNewDashboard}>Pre-Competiton Status</HeaderH1>
      <HeaderP isNewDashboard={this.isNewDashboard}>
        Fill out the assessment sheet to track your progress and visualize it on our graphs
      </HeaderP>
    </Header>;

  getColClass = () => `column ${this.isNewDashboard ? '' : 'content-column'}`;
  getDashboardClass = () => this.isNewDashboard ? 'new-dashboard' : '';

  render() {
    return (
      <div className={`add-status ${this.getDashboardClass()}`} ref="me">
        {this.renderUtilBar()}
        <div className="row align-center main-content-container">
          <Column className={this.getColClass()}
                  isNewDashboard={this.isNewDashboard}>
            {this.renderHeader()}
            <StatusForm isNewDashboard={this.isNewDashboard}
                        onSubmit={this.submitForm}
                        onSuccess={this.showConfirmation}
                        onApiError={this.showApiError}
                        history={this.props.history}
                        ref="statusForm"/>
          </Column>
        </div>

        <SaveConfirmation userType={this.user && this.user.user_type}
                          msg="Pre-Competiton status has been created successfully."
                          apiMsg={this.apiErrMsg}
                          isNewDashboard={this.isNewDashboard}
                          onClose={this.onClose}
                          ref="saveConfirmation"/>
      </div>
    )
  }
}

export default inject('user')(observer(AddStatus))
