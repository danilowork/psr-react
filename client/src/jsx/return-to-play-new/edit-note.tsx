import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { RouteComponentProps } from 'react-router-dom'
import { observable } from 'mobx'
import { observer, inject, IWrappedComponent } from 'mobx-react'
import styled from 'styled-components'

import Api from '../api'
import AthleteNoteForm from './components/athlete-note-form'
import CoachNoteForm from './components/coach-note-form'
import { User } from '../data-types';
import SaveConfirmation from '../components-new/save-confirmation';
import { mediaMax } from "../styled/theme";

const ContentCol = styled.div`
  ${mediaMax.xxlarge`max-width: 72%; flex: 0 0 72%;`}
  color: black;
  background-color: #f9f9f9;
  padding: 30px 40px;`;

interface EditNoteProps extends RouteComponentProps<{
  type: string
  id: string
}> {
  user?: User
}

@inject('user', 'setUser')
@observer
class EditNote extends Component<EditNoteProps, {}> {

  @observable note = {};
  @observable form: IWrappedComponent<AthleteNoteForm> |
    IWrappedComponent<CoachNoteForm> |
    undefined;

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)!).foundation();

    const getNoteFunc = 'athlete' == this.props.match.params.type ? Api.getAthleteNote : Api.getCoachNote;

    getNoteFunc(this.props.match.params.id)
      .then(note => {
        note.links = note.links.map((url: string, index: number) =>
          ({
            url,
            isConfirmed: true,
            key: index
          }));
        note.links.push({ url: '', key: note.links.length });
        (this.form!.wrappedInstance! as AthleteNoteForm).setNote(note)
      });
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  onSave = () => {
    (this.form!.wrappedInstance! as AthleteNoteForm).trySubmit();
  };

  onCancel = () => {
    this.props.history.push('/athlete-log')
  };

  submitForm = async (note: any,
                      filesToAdd: File[],
                      filesToDelete: number[]) => {
    $('#save-confirmation').foundation('open');

    const addedFiles = [];

    while (filesToDelete.length) {

      const fileId = filesToDelete.pop();
      const index = note.files.findIndex((f: any) => f.id == fileId);
      note.files.splice(index, 1);
      const result = await Api.deleteFile(fileId);
    }

    while (filesToAdd.length) {

      const formData = new FormData();

      formData.append('file', filesToAdd.pop()!);
      const file = await Api.uploadFile(formData);
      addedFiles.push(file);
    }

    note.links = note.links.map((l: any) => l.url)
      .filter((url: any) => url);
    note.files = note.files.map((f: any) => f.id).concat(addedFiles.map(f => f.id));

    const updateFunc = 'athlete' == this.props.user!.user_type ? Api.updateAthleteNote : Api.updateCoachNote;
    updateFunc(note)
      .then(result => {

        this.showConfirmation();
      })
      .catch(err => {

        this.showApiError();
      });
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
              <AthleteNoteForm ref={r => {
                if (r) {
                  this.form = r as any;
                }
              }}
                               action="edit"
                               onCancel={this.onCancel}
                               onSubmit={this.submitForm}/>
              :
              <CoachNoteForm ref={r => {
                if (r) {
                  this.form = r as any;
                }
              }}
                             action="edit"
                             onSubmit={this.submitForm}/>
            }
          </ContentCol>
        </div>

        <SaveConfirmation userType={this.props.user!.user_type}
                          msg="Your note has been changed successfully."
                          apiMsg="There is a problem submitting note."
                          onClose={this.onCancel}
                          ref="saveConfirmation"/>
      </div>
    )
  }
}

export default EditNote