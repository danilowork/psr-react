import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { computed, observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import moment from 'moment'

import Api from '../api'
import NoteCard from './components/note-card'
import TwoStepConfirmation from '../components-new/two-step-confirmation'
import { User, AthleteNote, CoachNote } from '../data-types'
import { H, FormButton, PlusIcon } from '../styled/components'
import styled from '../styled/styled-components'

const MainText = styled.p`
  padding-top: 45px;
  color: black;`;

const NoNotesP = styled.p`
  color: black;`;

const GroupHeader = styled.h3`
  margin-top: 2rem;
  font-size: 1.8rem;`;

interface TeamNotes {
  team_id: number
  teamName: string
  notes: CoachNote[]
}

interface CoachNotes {
  coach_id: number
  coachName: string
  notes: CoachNote[]
}

interface AthleteLogProps {
  user: User
}

@inject('user', 'setUser')
@observer
class AthleteLog extends Component<AthleteLogProps, {}> {

  @computed get user() {
    return this.props.user;
  }

  @observable athleteNotes = [] as AthleteNote[];
  @observable coachNotes = [] as CoachNotes[];
  @observable teamNotes = [] as TeamNotes[];
  @observable deleteFunc: ((nId: number) => Promise<void>) | undefined;
  @observable deletingNoteId = -1;

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    this.getNotes();
  }

  getNotes = () => {
    const sortFunc = (n1: AthleteNote | CoachNote,
                      n2: AthleteNote | CoachNote) => {
      return moment(n1.date_created).diff(moment(n2.date_created));
    };
    const getNotesFunc = 'athlete' == this.user.user_type ? Api.getAthleteNotes : Api.getCoachNotes;
    getNotesFunc()
      .then(([notesA, notesC]) => {
        this.athleteNotes = notesA.sort(sortFunc);

        const notesT = notesC.filter((n: CoachNote) => n.team_id);
        this.teamNotes = notesT.reduce((acc: TeamNotes[], note: CoachNote) => {

          const team = acc.find(item => item.team_id == note.team_id);

          if (team) {
            team.notes.push(note);
          } else {
            acc.push({
              team_id: note.team_id,
              teamName: note.team_name!,
              notes: [note]
            });
          }
          return acc;
        }, [] as TeamNotes[]);

        this.teamNotes = this.teamNotes.map(tn => ({
          team_id: tn.team_id,
          teamName: tn.teamName,
          notes: tn.notes.sort(sortFunc)
        }));

        notesC = notesC.filter((n: CoachNote) => !n.team_id);
        this.coachNotes = notesC.reduce((acc: CoachNotes[], note: CoachNote) => {

          const coach = acc.find(item => item.coach_id == note.owner);

          if (coach) {
            coach.notes.push(note);
          } else {
            acc.push({
              coach_id: note.owner,
              coachName: note.owner_name,
              notes: [note]
            });
          }
          return acc;
        }, [] as CoachNotes[]);
        this.coachNotes = this.coachNotes.map(cn => ({
          coach_id: cn.coach_id,
          coachName: cn.coachName,
          notes: cn.notes.sort(sortFunc)
        }));
      })
      .catch(err => {
        console.log(err);
      });
  };

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  deleteAthleteNote = (noteId: number) => {
    this.deletingNoteId = noteId;
    this.deleteFunc = Api.deleteAthleteNote;
    $('#remove-confirmation').foundation('open');
  };

  deleteCoachNote = (noteId: number) => {
    this.deletingNoteId = noteId;
    this.deleteFunc = Api.deleteCoachNote;
    $('#remove-confirmation').foundation('open');
  };

  doDeleteNote = () => {
    (this.refs.removeConfirmation as TwoStepConfirmation).showSpinner();

    this.deleteFunc!(this.deletingNoteId)
      .then(result => {
        (this.refs.removeConfirmation as TwoStepConfirmation).showConfirmation();
        this.getNotes();
        this.deletingNoteId = -1;
        this.deleteFunc = undefined;
      })
      .catch(err => {
        (this.refs.removeConfirmation as TwoStepConfirmation).showApiError();
      })
  };

  getNoteCreator = (note: any) => {
    if ('athlete' == this.user.user_type) return '';

    if (!note.owner_name) {
      const athlete: any = this.user.linked_users.find(u => u.id == note.owner);

      return athlete.first_name + ' ' + athlete.last_name;
    }
    return '';
  };

  render() {
    return (
      <div>
        <FormButton to="/athlete-log/add-note" className="button theme">
          <span className="btn-text"><PlusIcon/>Add a New Note</span>
        </FormButton>
        <div className="group-section">
          <MainText>
            {'athlete' == this.user.user_type ?
              'Welcome to your athlete log. This section of the sport record serves multiple purposes ranging from athlete journaling, to coach feedback to notes from any of your health professionals. Upload your physiotherapy exercises, latest updates and permission them to your coaches so that everyone is on the same page. Your coaches can share individual or team updates, so make sure to check in!'
              :
              'Welcome to our Athlete Log. To get the most out of PSR, this section is for coaches like you to get valuable and real time health and training updates from your team by getting access from any of your athlete\'s, their trainers and their health professionals. And as a coach, you can share valuable updates, and information to individual athletes or your whole team.'
            }
          </MainText>
          <div className="group-section">
            <H>
              {this.user.user_type == "athlete" ? "My Notes" :
                "Athlete's notes"}
            </H>
            {0 == this.athleteNotes.length && 0 == this.coachNotes.length ?
              <div>
                <NoNotesP className="text-left">Your notes are empty. Try adding one now.</NoNotesP>
              </div> : null}
            {this.athleteNotes.map(note => (
              <NoteCard title={note.title} key={note.id}
                        noteId={note.id}
                        deleteNote={this.deleteAthleteNote}
                        doctor={note.doctor}
                        doctorType={note.return_to_play_type}
                        creator={this.getNoteCreator(note)}
                        createdDate={moment(note.date_created).format("MMM D, YYYY")}
                        editLink={this.user && 'athlete' == this.user.user_type ?
                          `/athlete-log/edit-note/athlete/${note.id}` : ''}
                        viewLink={`/athlete-log/view-note/athlete/${note.id}/${this.user && 'coach' == this.user.user_type ? note.owner : ''}`}/>))}
          </div>

          {this.coachNotes.map((coach, index) =>
            <div className="group-section" key={index}>
              <H>Coach {coach.coachName} Notes</H>
              {coach.notes.map((note, nIndex) => {

                let recipient;

                if ('athlete' == this.user.user_type) {
                  recipient = note.owner_name;
                } else {
                  if (note.team_id) {
                    const theTeam = this.user.team_ownerships.concat(this.user.team_memberships)
                      .find((at: any) => at.id == note.team_id);
                  }
                  const theAthlete = this.user.linked_users.find(u => u.id == note.athlete_id);
                  recipient = theAthlete ? theAthlete.first_name + ' ' + theAthlete.last_name : '';
                }

                return <NoteCard title={note.title} key={nIndex}
                                 noteId={note.id}
                                 deleteNote={this.deleteCoachNote}
                                 recipient={recipient}
                                 createdDate={note.date_created}
                                 editLink={this.user && 'coach' == this.user.user_type ?
                                   `/athlete-log/edit-note/coach/${note.id}` : ''}
                                 viewLink={`/athlete-log/view-note/coach/${note.id}/${note.owner}`}/>
              })}
            </div>
          )}

          {this.teamNotes.map((team, index) =>
            <div className="group-section" key={index}>
              <H>Team {team.teamName} Notes</H>
              {team.notes.map((note, nIndex) =>

                <NoteCard title={note.title} key={nIndex}
                          noteId={note.id}
                          deleteNote={this.deleteCoachNote}
                          recipient={`${note.team_name}, Team`}
                          createdDate={note.date_created}
                          editLink={this.user && 'coach' == this.user.user_type ?
                            `/athlete-log/edit-note/coach/${note.id}` : ''}
                          viewLink={`/athlete-log/view-note/team/${note.id}/${note.owner}`}/>
              )}
            </div>
          )}
        </div>
        <TwoStepConfirmation userType={this.user.user_type}
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

export default AthleteLog