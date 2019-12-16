import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { computed, observable } from 'mobx'
import { observer, inject } from 'mobx-react'

import SegSelect from '../../components/segmented-select'
import Attachments from './attachments'
import Urls from './urls'
import AvatarRed from '../../../images/avatar-red.png'
import AvatarTeam from '../../../images/avatar-team.png'
import { User } from '../../data-types';
import { PanelField, PanelRowTitle } from "../../styled/components";
import styled from "../../styled/styled-components";

const TextArea = styled.textarea.attrs({ rows: 6 })`
  font-size: 1.15rem;
  padding: 0.8rem; 
  background-color: white;
  border-bottom-width: 0;
  :focus {
    background-color: white;
    border-bottom-width: 0;
  }`;

interface CoachNoteFormProps {
  user?: User
  action: string
  onSubmit: (note: any, toAdd: any[], toDel: any[], type: string) => void
}

@inject('user')
@observer
class CoachNoteForm extends Component<CoachNoteFormProps, {}> {

  @computed get user() {
    return this.props.user;
  }

  @computed get listAthleteCoach() {
    return this.getListAthleteCoach();
  }

  @observable note = {
    id: 0,
    title: '',
    athlete_id: '',
    team_id: '',
    note: '',
    links: [{ url: '', key: 0 }],
  };
  @observable existingNoteFiles = [];
  @observable althleteOrTeamValid = true;
  @observable curRecipientIndex = -1;
  @observable fileError = false;

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)!).foundation();

    $(ReactDOM.findDOMNode(this.refs.me)!)
      .on("forminvalid.zf.abide", (ev, frm) => {
        ev.preventDefault();
        (this.refs.athleteTeamSelect as any).validate();
        this.scrollToError();
        return;
      })
      .on("formvalid.zf.abide", (ev, frm) => {
        if (!((this.refs.athleteTeamSelect as any).validate() &&
          (this.refs.urls as Urls).validate())) {
          setTimeout(() => this.scrollToError(), 0);
          return;
        }
        this.props.onSubmit(this.note,
          (this.refs.attachments as Attachments).getFilesToAdd(),
          (this.refs.attachments as Attachments).getFilesToDelete(),
          'coach');
      })
      .on("submit", ev => {
        ev.preventDefault();
      });
  }

  getListAthleteCoach = () => {
    const athletes = this.user!.linked_users.map(a =>
      ({
        id: a.id,
        type: 'athlete',
        name: `${a.first_name} ${a.last_name}`,
        isHeader: false,
        pictureUrl: a.profile_picture_url || AvatarRed
      }));
    const teams = this.user!.team_ownerships.concat(this.user!.team_memberships)
      .map((t: any) => ({
        id: t.id,
        type: 'team',
        name: t.name,
        isHeader: false,
        pictureUrl: t.team_picture_url || AvatarTeam
      }));
    const allItems = athletes.concat(teams);
    const all = allItems
      .reduce((acc, item) => {
        if (!acc.find(letter => letter == item.name[0].toUpperCase())) {
          acc.push(item.name[0].toUpperCase());
        }
        return acc;
      }, [] as any[])
      .sort((a: string, b: string) => a.localeCompare(b))
      .map(letter => {
        const entities = allItems
          .filter(item => {
            return item.name[0].toUpperCase() == letter;
          });

        return { letter, entities }
      })
      .map(item => {
        return [{ id: -1, name: item.letter, isHeader: true }].concat(item.entities);
      })
      .reduce((acc, items) => {
        acc = acc.concat(items);
        return acc;
      }, []);
    return all;
  };

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
    this.curRecipientIndex = this.listAthleteCoach.findIndex((ac: any) => {
      const type = note.athlete_id ? 'athlete' : 'team';
      return (ac.id == (note.athlete_id || note.team_id)) &&
        (ac.type == type);
    });
  };

  setTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.note.title = e.target.value;
  };

  setRecipient = (recipient: any, i: number) => {
    if ('athlete' == recipient.type) {
      this.note.athlete_id = recipient.id;
    } else {
      this.note.team_id = recipient.id;
    }
    this.curRecipientIndex = i;
  };

  setNoteField = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.note.note = ev.target.value;
  };

  render() {
    return (
      <form data-abide noValidate ref="me" className="note-form">
        <PanelField title='Note Title'
                    placeholder='Insert note title'
                    type='text'
                    value={this.note.title}
                    onChange={this.setTitle}/>

        <SegSelect choices={this.listAthleteCoach}
                   title="Select an athlete or team"
                   onSelected={this.setRecipient}
                   placeholder="Select an athlete or team"
                   ref="athleteTeamSelect"
                   customClass="new-dashboard notes"
                   index={this.curRecipientIndex}/>

        <PanelRowTitle>Share your notes here (ie: exercises / dates / etc.)</PanelRowTitle>
        <TextArea value={this.note.note} onChange={this.setNoteField} placeholder='Start typing...'/>

        <Attachments oldFiles={this.existingNoteFiles} ref='attachments'/>
        <Urls urls={this.note.links} ref="urls"/>
        <button type="submit"
                className="button expanded theme"
                value="Save">Save
        </button>

      </form>
    )
  }
}

export default CoachNoteForm
