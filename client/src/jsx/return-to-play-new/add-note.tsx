import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import styled from 'styled-components'

import Api from '../api'
import AthleteNoteForm from './components/athlete-note-form'
import CoachNoteForm from './components/coach-note-form'
import { User } from '../data-types';
import { RouteComponentProps } from 'react-router';
import SaveConfirmation from '../components-new/save-confirmation';
import { mediaMax } from '../styled/theme';

const ContentCol = styled.div`
  ${mediaMax.xxlarge`max-width: 81%; flex: 0 0 81%;`}
  color: black;
  background-color: #f9f9f9;
  padding: 30px 40px;`;

interface AddNoteProps extends RouteComponentProps<{}> {
  user: User
}

@inject('user', 'setUser')
@observer
class AddNote extends Component<AddNoteProps, {}> {

  @observable fileIds: string[] = [];

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)!).foundation();
    window.scrollTo(0, 0);
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  onSave = () => {
    if ('athlete' == this.props.user.user_type) {
      (this.refs.athleteNoteForm as any).wrappedInstance.trySubmit();
    } else {
      (this.refs.coachNoteForm as any).wrappedInstance.trySubmit();
    }
  };

  onCancel = () => {
    this.props.history.push('/athlete-log')
  };

  submitNote = (note: any, type: string) => {
    $('#save-confirmation').foundation('open');

    note.links = note.links.map((u: any) => u.url).filter((u: any) => u.length > 0);

    note.files = this.fileIds;

    const addNoteFunc = 'athlete' == type ? Api.addAthleteNote : Api.addCoachNote;

    if (!note.team_id) {
      delete note.team_id;
    }
    if (!note.athlete_id) {
      delete note.athlete_id;
    }
    addNoteFunc(note)
      .then(result => {
        this.showConfirmation();
      })
      .catch(err => {
        this.showApiError();
        console.log(err);
      });
  };

  onSubmit = (note: any, filesToAdd: any[], filesToDelete: any, type: string) => {

    if (filesToAdd.length) {

      const formData = new FormData();

      formData.append('file', filesToAdd.pop());
      Api.uploadFile(formData)
        .then(result => {

          this.fileIds.push(result.id);
          this.onSubmit(note, filesToAdd, filesToDelete, type);
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      this.submitNote(note, type);
    }
  };

  showApiError = () => {
    (this.refs.saveConfirmation as SaveConfirmation).showApiError();
  };

  showConfirmation = () => {
    (this.refs.saveConfirmation as SaveConfirmation).showConfirmation();
  };

  render() {
    return (
      <div className="add-note" ref="me">
        <div className="row align-center main-content-container">
          <ContentCol>
            {this.props.user && 'athlete' == this.props.user.user_type ?
              <AthleteNoteForm ref="athleteNoteForm"
                               action="add"
                               onCancel={this.onCancel}
                               onSubmit={this.onSubmit}/> :
              <CoachNoteForm ref="coachNoteForm"
                             action="add"
                             onSubmit={this.onSubmit}/>
            }
          </ContentCol>
        </div>

        <SaveConfirmation userType={this.props.user && this.props.user.user_type}
                          msg="Your note has been added successfully."
                          apiMsg="There is a problem submitting note."
                          onClose={this.onCancel}
                          ref="saveConfirmation"/>
      </div>
    )
  }
}

export default AddNote