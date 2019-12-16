import React, { Component } from 'react'
import { extendObservable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'
import styled from 'styled-components'

import Api from '../api'
import OrganisationSupportForm from './components/organisation-support-form'
import SaveConfirmation from '../components/save-confirmation'
import { MainContentSectionWithSidebar } from '../components-new/section'
import { mediaMax } from "../styled/theme";
import { H } from "../styled/components";

const ContentCol = styled.div`
  ${mediaMax.xxlarge`max-width: 72%; flex: 0 0 72%;`}
  color: black;
  background-color: #f9f9f9;
  padding: 30px 40px;`;

const StyledH = styled(H)`
  margin-bottom: -0.9rem;`;

const P = styled.p`
  font-size: 0.9rem;`;

export default inject('user', 'setUser', 'sidebarStatus')(observer(class extends Component {

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
    return <MainContentSectionWithSidebar expanded={!(this.props.sidebarStatus && this.props.sidebarStatus.expanded)}>
      <div>
        <div className="row align-center main-content-container">
          <ContentCol className="column content-column">
            <StyledH>Let someone know</StyledH>
            <hr/>
            <div className="group-section">
              <P>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
                voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </P>

              <OrganisationSupportForm onSubmit={this.submitForm}
                                       onSuccess={this.showConfirmation}
                                       onApiError={this.showApiError}
                                       setSupportType={this.setSupportType}
                                       history={this.props.history}
                                       supportType={this.organisationSupport.supportType}
                                       ref="organisationSupportForm"
                                       organisationSupport={this.organisationSupport}/>

              <SaveConfirmation userType={this.user && this.user.user_type}
                                msg="Your form has been submitted successfully."
                                apiMsg="There is problem processing your request, pleaes try again later."
                                onClose={this.onClose}
                                ref="saveConfirmation"/>
            </div>
          </ContentCol>
        </div>
      </div>
    </MainContentSectionWithSidebar>
  }
}))
