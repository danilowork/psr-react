import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { computed, observable } from 'mobx'
import { observer, inject } from 'mobx-react'

import Api from '../../api'
import Attachments from './attachments'
import Urls from './urls'
import { User } from '../../data-types';
import {
  PanelMain,
  PanelRowTitle,
  CheckBox,
  PanelField
} from '../../styled/components'
import styled from '../../styled/styled-components'
import { H } from '../../styled/components'
import { AssessmentButtonGroup, AssessmentButton } from '../../dashboard-new/components/buttons'

const ToggleOuter = styled.div`
  display: flex;
  width: 50px;
  height: 22px;
  justify-content: ${(props: { pos: 'left' | 'right' }) =>
  'left' == props.pos ? 'flex-start' : 'flex-end'};
  align-items: center;
  padding-left: 2px;
  padding-right: 2px;
  border-radius: 11px;
  background-color: #E0E4E8;`;

const ToggleKnob = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #17A6F2;`;

const TextArea = styled.textarea.attrs({ rows: 6 })`
  font-size: 1.15rem;
  padding: 0.8rem; 
  background-color: white;
  border-bottom-width: 0;
  :focus {
    background-color: white;
    border-bottom-width: 0;
  }`;

const CancelButton = styled(AssessmentButton)`
  &:hover {
    background: none;
    border: #26a7ef solid 2px;
    color: black;
  };
  border: none;`;

const FirstHR = styled.hr`
  margin: 0 auto 1.5rem auto;`;

const HR = styled.hr`
  width: 154%`;

type ReChangeEvtInput = React.ChangeEvent<HTMLInputElement>

export interface OldFile {
  id: number
  name: string
}

interface PanelProps {
  title: string
  onSave: () => void
  onCancel: () => void
}

@observer
class Panel extends Component<PanelProps, {}> {
  render() {
    return <div>
      <H>{this.props.title}</H>
      <FirstHR/>
      <PanelMain>
        {this.props.children}
      </PanelMain>
      <AssessmentButtonGroup>
        <CancelButton onClick={this.props.onCancel}>Cancel</CancelButton>
        <AssessmentButton onClick={this.props.onSave}
                          className="active"
                          data-open="save-confirmation">Save</AssessmentButton>
      </AssessmentButtonGroup>
    </div>
  }
}

interface AthleteNoteFormProps {
  user?: User
  action: string
  onCancel: () => void
  onSubmit: (note: any, toAdd: any[], toDel: any[], type: string) => void
}

@inject('user')
@observer
class AthleteNoteForm extends Component<AthleteNoteFormProps, {}> {

  @observable doctorTypes: string[] = [];

  @computed get user() {
    return this.props.user;
  }

  @observable note = {
    title: '',
    doctor: '',
    return_to_play_type: '',
    note: '',
    links: [{ url: '', key: 0 }],
    only_visible_to: [] as number[],
  };
  @observable existingNoteFiles: OldFile[] = [];
  @observable fileError = false;
  @observable visibleToEveryone = true;

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)!).foundation();

    Api.getRTPTypes()
      .then(types => {
        this.doctorTypes = types.map((t: any) => [t.value, t.value]);
      })
      .catch(err => {
        console.log(err);
      });

    $(ReactDOM.findDOMNode(this.refs.me)!)
      .on("forminvalid.zf.abide", (ev, frm) => {
        ev.preventDefault();
        this.scrollToError();
        return;
      })
      .on("formvalid.zf.abide", (ev, frm) => {
        ev.preventDefault();
        if (!(this.refs.urls as Urls).validate()) {
          setTimeout(() => this.scrollToError(), 0);
        } else {
          this.props.onSubmit(this.note,
            (this.refs.attachments as Attachments).getFilesToAdd(),
            (this.refs.attachments as Attachments).getFilesToDelete(),
            'athlete');
        }
      })
      .on("submit", ev => {
        ev.preventDefault();
      });
  }

  trySubmit = () => {
    $(ReactDOM.findDOMNode(this.refs.me)!).submit();
  };

  scrollToError = () => {
    $('html, body').scrollTop($('.form-error.is-visible, .form-error.visible')!.first()!.offset()!.top - 200);
  };

  setNote = (note: any) => {

    this.note = note;
    (this.refs.urls as Urls).setUrls(note.links);
    this.existingNoteFiles = note.files.map((file: any) => {
      const lastSlash = file.file.lastIndexOf('/');
      const name = file.file.substr(lastSlash + 1);

      return { id: file.id, name };
    });
    if (note.only_visible_to.length) {
      this.visibleToEveryone = false;
    }
  };

  setTitle = (e: ReChangeEvtInput) => {
    this.note.title = e.target.value;
  };

  setDoctor = (e: ReChangeEvtInput) => {
    this.note.doctor = e.target.value;
  };

  setDoctorType = (e: ReChangeEvtInput) => {
    this.note.return_to_play_type = e.target.value;
  };

  setNoteField = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.note.note = e.target.value;
  };

  setVisibleToEveryone = (ev: any) => {

    if (ev.target.checked) {
      this.visibleToEveryone = true;
      this.note.only_visible_to = [];
    } else {
      this.visibleToEveryone = false;
    }
  };

  setVisibility = (ev: ReChangeEvtInput, coach: any) => {

    if (ev.target.checked) {
      this.note.only_visible_to.push(coach.id);
      this.visibleToEveryone = false;
    } else {
      this.note.only_visible_to = this.note.only_visible_to.filter(c => c != coach.id);
    }
  };

  render() {
    return (
      <Panel title='Note'
             onSave={this.trySubmit}
             onCancel={this.props.onCancel}>
        <form data-abide noValidate ref="me" className="note-form">
          <PanelField title='Note Title'
                      placeholder='Insert note title'
                      type='text'
                      value={this.note.title}
                      onChange={this.setTitle}/>
          <PanelField title='Who gave you the note (Coach, Trainer, Doctor etc.)'
                      placeholder='e.g. Linda MacDonald'
                      type='text'
                      value={this.note.doctor}
                      onChange={this.setDoctor}/>
          <PanelField title='Note type'
                      placeholder='Select a type of note'
                      type='select'
                      selection={this.doctorTypes}
                      value={this.note.return_to_play_type}
                      onChange={this.setDoctorType}/>
          <PanelRowTitle>Share your notes here (ie: exercises / dates / etc.)</PanelRowTitle>
          <TextArea value={this.note.note} onChange={this.setNoteField} placeholder='Start typing...'/>
          <br/>
          <Attachments oldFiles={this.existingNoteFiles} ref='attachments'/>
          <Urls urls={this.note.links} ref="urls"/>
          <br/>
          <H>Note visibility</H>
          <HR/>
          <CheckBox title='Everyone'
                    checked={this.visibleToEveryone}
                    onChange={this.setVisibleToEveryone}/>
          {this.user && this.user.linked_users.map(coach => {
            return <CheckBox title={coach.first_name + coach.last_name}
                             checked={this.note.only_visible_to ?
                               this.note.only_visible_to.find(v => v == coach.id) != undefined : false}
                             onChange={(e: ReChangeEvtInput) => this.setVisibility(e, coach)}/>
          })}
        </form>
      </Panel>
    )
  }
}

export default AthleteNoteForm
