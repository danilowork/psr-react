import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { observer, inject } from 'mobx-react'
import styled from 'styled-components'

import Api from '../api'
import SaveConfirmation from '../components-new/save-confirmation'
import TeamProfileForm from './components/team-profile-form'
import { userIsOrganisation } from "../utils/utils";
import { mediaMax } from "../styled/theme";

const ContentCol = styled.div`
  ${mediaMax.xxlarge`max-width: 72%; flex: 0 0 72%;`}
  color: black;
  background-color: #f9f9f9;
  padding: 30px 40px;`;

class CreateTeam extends Component {

  constructor(props) {
    super(props);
    this.state = {
      apiMsg: "There is problem processing your request, pleaes try again later.",
    };
  }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)).foundation();

    if (!this.props.user) {
      Api.getUser()
        .then(user => {
          this.props.setUser(user);
        })
        .catch(err => this.props.history.push('/login'));
    } else {
    }
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  onSave = () => {
    this.refs.teamProfileForm.wrappedInstance.trySubmit();
  };

  onCancel = () => {
    if (userIsOrganisation(this.props.user)) {
      this.props.history.push('/dashboard/organisation-teams');
    } else {
      this.props.history.push('/dashboard/directory')
    }
  };

  submitForm = (team, pictureForm, invitees) => {
    $('#save-confirmation').foundation('open');

    Api.createTeam(team)
      .then(team => {
        if (pictureForm) {
          Api.uploadTeamProfilePic(pictureForm, team.id)
            .then(result => {
              this.sendInvites(invitees, team.id);
            })
            .catch(err => {
              // console.log(err)
              this.showApiError();
            });
        } else {
          this.sendInvites(invitees, team.id);
        }

      })
      .catch(err => {
        if (err) {
          let apiMsg = err.responseJSON.detail;
          this.setState({ apiMsg: apiMsg });
        }
        this.showApiError();
      });
  };

  sendInvites = (invitees, teamId) => {

    const toSend = invitees.reduce((acc, invitee) => {
      if (invitee) acc.push(invitee);

      return acc;
    }, []);

    if (toSend.length) {
      Api.sendInvitation(toSend.map(email => ({
        recipient: email,
        recipient_type: 'athlete',
        team_id: teamId
      })))
        .then(result => {
          this.refreshUser();
        })
    } else {
      this.refreshUser();
    }
  };

  refreshUser = () => {
    Api.getUser()
      .then(user => {
        this.props.setUser(user);
      })
      .catch(err => console.log(err));
    this.showConfirmation();
  };

  showApiError = () => {
    this.refs.saveConfirmation.showApiError();
  };

  showConfirmation = () => {
    this.refs.saveConfirmation.showConfirmation();
  };

  render() {
    return (
      <div className="create-team" ref="me">
        <div className="row align-center main-content-container">
          <ContentCol>
            <TeamProfileForm onSubmit={this.submitForm}
                             onSuccess={this.showConfirmation}
                             onApiError={this.showApiError}
                             ref="teamProfileForm"/>
          </ContentCol>
        </div>

        <SaveConfirmation userType={userIsOrganisation(this.props.user) ? "organisation" : "coach"}
                          msg="New team has been created successfully."
                          apiMsg={this.state.apiMsg}
                          onClose={this.onCancel}
                          ref="saveConfirmation"/>
      </div>
    )
  }
}

export default inject('user', 'setUser')(observer(CreateTeam))
