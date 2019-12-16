import React, {Component} from 'react'
import {Route, Switch, Link} from 'react-router-dom'
import {extendObservable, computed} from 'mobx'
import {observer, inject} from 'mobx-react'

import Api from '../api'
import OrganisationSupportForm from './components/organisation-support-form'
import SaveConfirmation from '../components/save-confirmation'


export default inject('user', 'setUser')(observer(class extends Component {

  constructor() {
    super();
    extendObservable(this,
      {
        user: computed(() => this.props.user),
        organisationSupport: {
          name: '',
          email: '',
          phoneNumber: '',
          supportType: 'General Inquiry',
          details: '',
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
        })
        .catch(err => this.props.history.push('/login'));
    }
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  submitForm = (data) => {
    console.log('data', data);
    $('#save-confirmation').foundation('open');

    Api.submitOrganisationSupportForm(data)
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

  setSupportType = supportType => {
    this.organisationSupport.supportType = supportType;
  };

  onClose = () => {
    this.props.history.push('/dashboard/organisation-teams');
  };

  render() {
    return (
      <div>
        <div className="row align-center main-content-container">
          <div className="column content-column">
            <div className="group-section">
              <h2 className="section-heading">Contact PSR for organisational support</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
                voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>

            <OrganisationSupportForm onSubmit={this.submitForm}
                                     onSuccess={this.showConfirmation}
                                     onApiError={this.showApiError}
                                     setSupportType={this.setSupportType}
                                     supportType={this.organisationSupport.supportType}
                                     ref="organisationSupportForm"
                                     organisationSupport={this.organisationSupport}/>

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
