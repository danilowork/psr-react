import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { RouteComponentProps } from 'react-router-dom'
import { computed, observable } from 'mobx'
import { observer, inject } from 'mobx-react'

import Api from '../api'
import { User, AthleteNote, CoachNote } from '../data-types';
import TwoStepConfirmation from '../components-new/two-step-confirmation';
import { mediaMax } from "../styled/theme";
import styled from 'styled-components'

interface ViewNoteProps extends RouteComponentProps<{
  type: string,
  coachId: number,
  id: number
}> {
  user?: User
}

const ContentCol = styled.div`
  ${mediaMax.xxlarge`max-width: 72%; flex: 0 0 72%;`}
  color: black;
  background-color: #f9f9f9;
  padding: 30px 40px;`;

const MainText = styled.p`
  font-size: 1rem;
  color: black;`;

const GroupHeader = styled.h3`
  color: black;
  margin-top: 2rem;
  font-size: 1.8rem;`;

@inject('user', 'setUser')
@observer
class ViewNote extends Component<ViewNoteProps, {}> {

  @computed get user() {
    return this.props.user;
  }

  @observable note: AthleteNote | CoachNote | undefined;
  @observable doctor = '';
  @observable doctorType = '';
  @observable recipient = '';

  @computed get editLink() {
    if ('athlete' == this.user!.user_type && 'athlete' != this.props.match.params.type) return '';
    if ('coach' == this.user!.user_type && 'athlete' == this.props.match.params.type) return '';
    return `/athlete-log/edit-note/${this.props.match.params.type}/${this.props.match.params.id}`;
  }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)!).foundation();

    this.getNote();
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  getNote = () => {
    let noteGetFunc;

    if ('athlete' == this.user!.user_type &&
      ('coach' == this.props.match.params.type ||
        'team' == this.props.match.params.type)) {

      noteGetFunc = Api.getCoachNote;
    } else {
      noteGetFunc = 'athlete' == this.props.match.params.type ? Api.getAthleteNote : Api.getCoachNote;
    }
    noteGetFunc(this.props.match.params.id, this.props.match.params.coachId)
      .then(note => {
        this.note = note;

        if ('athlete' == this.props.match.params.type) {
          this.doctor = note.doctor;
          this.doctorType = note.return_to_play_type;
        } else {
          if ('athlete' == this.user!.user_type &&
            'athlete' == this.props.match.params.type) {
            this.recipient = `${this.user!.first_name} ${this.user!.last_name}`;
          } else {
            if (note.team_id) {
              this.recipient = note.team_name;
            } else if (note.athlete_id) {
              const athlete = this.user!.linked_users.find(u => u.id == note.athlete_id);

              this.recipient = athlete ? athlete.first_name + ' ' + athlete.last_name :
                this.user!.first_name + ' ' + this.user!.last_name;
            } else {
              const owner = this.user!.linked_users.find(u => u.id == note.owner);

              this.recipient = owner ? owner.first_name + ' ' + owner.last_name :
                this.user!.first_name + ' ' + this.user!.last_name;
            }
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  getNoteCreator = (note: AthleteNote | CoachNote) => {
    if (!note.id || !this.user || 'athlete' == this.user.user_type) return '';

    if (!(note as CoachNote).owner_name) {
      const athlete = this.user.linked_users.find(u => u.id == note.owner);

      return athlete!.first_name + ' ' + athlete!.last_name;
    }
    return '';
  };

  onCancel = () => {
    this.props.history.push('/athlete-log')
  };

  onDeleteNote = () => {
    $('#remove-confirmation').foundation('open');
  };

  doDeleteNote = () => {
    (this.refs.removeConfirmation as TwoStepConfirmation).showSpinner();
    const deleteFunc = 'athlete' == this.props.match.params.type ? Api.deleteAthleteNote : Api.deleteCoachNote;

    deleteFunc(this.props.match.params.id)
      .then(_ => {

        (this.refs.removeConfirmation as TwoStepConfirmation).showConfirmation();
        this.props.history.push('/athlete-log');

        //maybe showConfirmation() should do this when it closes
        $('body').removeClass('is-reveal-open');

      })
      .catch(err => {

        (this.refs.removeConfirmation as TwoStepConfirmation).showApiError();
      })
  };

  coachNameFromId = (id: number) => {
    const coach = this.user!.linked_users.find(user => id == user.id);

    return coach ? coach.first_name + ' ' + coach.last_name : '';
  };

  render() {
    if (!this.note) return null;
    return (
      <div className="view-note" ref="me">
        <div className="row align-center main-content-container">
          <ContentCol>
            <div className="group-section">
              <MainText>
                {this.note.note || ''}
              </MainText>
            </div>
            <div className="group-section">
              <GroupHeader className="gray-heading">Attachments</GroupHeader>
              <div className="file-list">
                {this.note.files ?
                  this.note.files.map((f: any, index: number) => {
                    const lastSlash = f.file.lastIndexOf('/');
                    return <a href={f.file}
                              key={index}
                              className="uploaded-file"
                              target="_blank">{f.file.substr(lastSlash + 1)}</a>
                  }) : null}
              </div>
            </div>
            <div className="group-section link-list">
              <GroupHeader className="gray-heading">Links</GroupHeader>
              {this.note.links ?
                this.note.links.map((link: string) =>
                  <div><a href={(link.indexOf('http') > -1 ? link : 'http://' + link)} className="dark-text"
                          target="_blank">{link}</a></div>) : null}


            </div>
            <hr className="divider"/>
            <div className="group-section">
              <GroupHeader className="gray-heading">Note visibility</GroupHeader>
              <p>Visibility is about who can view your notes. You can update and change who can see your notes at any
                time.</p>
              {this.note.only_visible_to ?
                (0 == this.note.only_visible_to.length ?
                    <div className="dark-text">Everyone</div> :
                    this.note.only_visible_to.map((coach: any, index: number) =>
                      <div className="dark-text"
                           key={index}>{this.coachNameFromId(coach)}
                      </div>)
                ) : null}
            </div>
          </ContentCol>
        </div>

        <TwoStepConfirmation userType={this.user!.user_type}
                             id="remove-confirmation"
                             msg="Are you sure you want to delete this note?"
                             btnText="Yes, delete my note"
                             cancelBtnText="No, on second thought, I don't want to delete this"
                             onProceed={this.doDeleteNote}
                             successMsg="Your note has been removed successfully."
                             apiMsg="We have problem processing your request, please try again later."
                             ref="removeConfirmation"/>

      </div>
    )
  }
}

export default ViewNote
