import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { extendObservable, computed, observe } from 'mobx'
import { observer, inject } from 'mobx-react'
import styled from 'styled-components'
import moment from 'moment'
import { Link } from 'react-router-dom'

import Api from '../api'
import Select from '../components/select'
import TwoStepConfirmation from '../components/two-step-confirmation'
import { MainContentSectionWithSidebar } from '../components-new/section'
import { H } from '../styled/components'

const HeaderHelpText = styled.p`
  color: black;
  text-align: left;
  font-size: 1rem;`;

const Email = styled.div`
  padding-bottom: 5px;
  font-size: 1.1rem;
  color: black;`;

const CoachName = styled(Email)`
  min-height: 31px;
  font-size: 1.2rem;
  font-weight: bold`;

const SentRow = styled.div`
  padding-top: 5px;`;

const ButtonBottomRow = styled.div`
  padding-top: 5px;`;

const SentInfo = styled.div`
  border-top: 1px solid #abb9ca;
  padding-top: 0.7rem;
  font-size: 1.1rem;
  color: black;`;

const ButtonLink = styled(Link)`
  color: #008cd8 !important;
  &:hover { color: darken(#008cd8, 15%) !important; }
  font-size: 1rem !important;`;

const ButtonIcon = styled.span`
  color: #008cd8 !important;
  &:hover { color: darken(#008cd8, 15%) !important; }`;

const ButtonIconResend = styled(ButtonIcon)`
  font-size: 0.7rem !important;`;

const ButtonIconDelete = styled(ButtonIcon)`
  font-size: 0.85rem !important;`;

const ClearAllLink = styled.div`
  color: #008cd8 !important;
  &:hover { color: darken(#008cd8, 15%) !important; }
  font-size: 1.1rem !important;`;

const SiglePending = (props) => (
  <div className="pending-invite">
    <div className="row">
      <div className="small-7 column ">
        <CoachName>{props.name}</CoachName>
        <Email>{props.email}</Email>
      </div>
      <div className="small-5 column text-right">
        <div>
          <ButtonLink to=""
                      onClick={props.resendPrompt}
                      className="link-text">
            resend
          </ButtonLink>&nbsp;
          <ButtonIconResend onClick={props.resendPrompt} className="psr-icons icon-resend"/>
        </div>
        <ButtonBottomRow>
          <ButtonLink to=""
                      onClick={props.removePrompt}
                      className="link-text">delete
          </ButtonLink>&nbsp;
          <ButtonIconDelete onClick={props.removePrompt} className="psr-icons icon-trash"/>
        </ButtonBottomRow>
      </div>
    </div>
    <SentRow className="row">
      <div className="small-12 column ">
        <SentInfo>{`Sent on: ${moment(props.dateSent).format('MMMM DD, YYYY')}`}</SentInfo>
      </div>
    </SentRow>
  </div>);

const TeamPendings = (props) => (
  <div className="content-section">
    <h3 className="group-heading">{props.name}</h3>
    {props.pendings.map(pending =>
      <SiglePending key={pending.id}
                    email={pending.recipient}
                    name={pending.name}
                    dateSent={pending.date_sent}
                    resendPrompt={() => {
                      props.resendPrompt(pending);
                    }}
                    removePrompt={() => {
                      props.removePrompt(pending);
                    }}/>)}
  </div>);

class PendingInvite extends Component {

  constructor() {
    super();
    extendObservable(this, {
      user: computed(() => this.props.user),
      curType: 'All',
      allPending: [],
      teamsPendings: [],
      individualPendings: [],
      curPending: null,
      apiErrorMsg: ''
    });
  }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)).foundation();

    if (this.user) {
      this.retrievePendings();
    } else {
      const disposer = observe(this,
        'user',
        change => {
          if (change.newValue) {
            this.retrievePendings();
            disposer();
          }
        });
    }
  }

  retrievePendings = () => {

    Api.getPendingInvites()
      .then(invites => {
        this.allPending = invites;

        this.teamsPendings = invites.filter(pending => pending.team_id > 0)
          .reduce((acc, p) => {
            let team = acc.find(tp => tp.team_id === p.team_id);
            if (team) {
              team.pendings.push(p);
            } else {
              let name = '';
              team = this.user.team_ownerships.find(t => t.id === p.team_id);
              if (team) {
                name = team.name;
              } else {
                team = this.user.team_memberships.find(t => t.id === p.team_id);
                if (team) {
                  name = team.name;
                }
              }
              acc.push({ name, team_id: p.team_id, pendings: [p] })
            }
            return acc;
          }, []);

        this.individualPendings = invites.filter(pending => !pending.team_id);
      })
      .catch(err => console.log(err));
  };

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  resendPrompt = (pending) => {
    this.curPending = pending;

    $('#resend-confirmation').foundation('open');
  };

  resendInvite = () => {
    this.refs.resendConfirmation.showSpinner();

    Api.resendInvite(this.curPending.id)
      .then(sendResult => {
        this.refs.resendConfirmation.showConfirmation();
        this.retrievePendings();
      })
      .catch(err => {
        this.apiErrorMsg = err.responseJSON.detail;
        this.refs.resendConfirmation.showApiError();
      });
  };

  removePrompt = (pending) => {
    this.curPending = pending;

    $('#remove-confirmation').foundation('open');
  };

  removeInvite = () => {
    this.refs.removeConfirmation.showSpinner();

    Api.cancelPendingInvite(this.curPending.id)
      .then(result => {
        this.refs.removeConfirmation.showConfirmation();
        this.retrievePendings();
      })
      .catch(err => {
        this.apiErrorMsg = err.responseJSON.detail;
        this.refs.removeConfirmation.showApiError();
      });
  };

  clearPrompt = () => {
    $('#clear-confirmation').foundation('open');
  };

  clearAll = () => {
    this.refs.clearConfirmation.showSpinner();

    Api.cancelAllPendingInvite(this.allPending.map(p => ({ id: p.id })))
      .then(result => {
        this.refs.clearConfirmation.showConfirmation();
        this.retrievePendings();
      })
      .catch(err => {
        this.apiErrorMsg = err.responseJSON.detail;
        this.refs.clearConfirmation.showApiError();
      });
  };

  changeFilter = (type) => {
    this.curType = type;
  };

  render() {
    const showTeams = this.user && ['coach', 'organisation'].includes(this.user.user_type);

    return <MainContentSectionWithSidebar expanded={!(this.props.sidebarStatus && this.props.sidebarStatus.expanded)}>
      <div className="pending-invites" ref="me">
        <div className="row align-center main-content-container">
          <div className="column">
            <HeaderHelpText className="content-heading">Manage your pending invites here.</HeaderHelpText>
            {showTeams && this.teamsPendings.length && this.individualPendings.length ?
              <div className="sports-filter">
                <Select choices={['All', 'Team', 'Athlete']}
                        onSelected={this.changeFilter}
                        index={['All', 'Team', 'Athlete'].findIndex(c => c === this.curType)}/>
              </div> : null
            }
            {showTeams && ('All' === this.curType || 'Team' === this.curType) &&
            this.teamsPendings.length ?
              <div>
                <H>Athletes and coaches invited to your teams</H>
                {this.teamsPendings.map(tp => <TeamPendings key={tp.team_id}
                                                            name={tp.name}
                                                            pendings={tp.pendings}
                                                            resendPrompt={this.resendPrompt}
                                                            removePrompt={this.removePrompt}/>)}
              </div>
              : null}
            {('All' === this.curType || 'Athlete' === this.curType) && this.individualPendings.length ?
              <div className="content-section">
                <H>
                  {'coach' === (this.user && this.user.user_type) ?
                    'Individual athlete invites' : 'Coaches Invites'
                  }
                </H>
                {this.individualPendings.map(pending =>
                  <SiglePending key={pending.id}
                                email={pending.recipient}
                                dateSent={pending.date_sent}
                                resendPrompt={() => {
                                  this.resendPrompt(pending);
                                }}
                                removePrompt={() => {
                                  this.removePrompt(pending);
                                }}/>)}
              </div> : null}
            {0 === this.allPending.length ?
              <p className="text-center">You're all up to date! Currently you have no pending invites.</p> :
              <ClearAllLink className="text-center link-text"
                            role="button"
                            onClick={this.clearPrompt}>Clear all pending invites</ClearAllLink>}
          </div>
        </div>

        <TwoStepConfirmation userType={this.props.user && this.props.user.user_type}
                             id="resend-confirmation"
                             title="Re-send invite"
                             msg="Are you sure? <br/>You can only re-send an invite once per week."
                             btnText="Yes, re-send it"
                             cancelBtnText="Cancel"
                             onProceed={this.resendInvite}
                             successMsg="Your invitation has been re-sent successfully."
                             apiMsg={this.apiErrorMsg ? this.apiErrorMsg : 'We have problem processing your request, please try again later.'}
                             ref="resendConfirmation"/>
        <TwoStepConfirmation userType={this.props.user && this.props.user.user_type}
                             id="remove-confirmation"
                             title="Remove invite"
                             msg="Are you sure?"
                             btnText="Yes, remove"
                             cancelBtnText="Cancel"
                             onProceed={this.removeInvite}
                             successMsg="Your invitation has been removed successfully."
                             apiMsg={this.apiErrorMsg ? this.apiErrorMsg : 'We have problem processing your request, please try again later.'}
                             ref="removeConfirmation"/>
        <TwoStepConfirmation userType={this.props.user && this.props.user.user_type}
                             id="clear-confirmation"
                             title="Clear all pending invites"
                             msg="Are you sure?"
                             btnText="Yes, clear all"
                             cancelBtnText="Cancel"
                             onProceed={this.clearAll}
                             successMsg="Your pending invites have been cleared successfully."
                             apiMsg={this.apiErrorMsg ? this.apiErrorMsg : 'We have problem processing your request, please try again later.'}
                             ref="clearConfirmation"/>
      </div>
    </MainContentSectionWithSidebar>
  }
}

export default inject('user', 'setUser', 'sidebarStatus')(observer(PendingInvite))
