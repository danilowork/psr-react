import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { extendObservable, computed, observe } from 'mobx'
import { observer, inject } from 'mobx-react'
import moment from 'moment'
import styled from 'styled-components'

import Select from '../../components/select'
import PreCompeteLevel from './precompete-level'
import InfoPopupDescription from './info-popup-description'
import { AssessmentButton } from '../../dashboard-new/components/buttons'
import { ButtonGroup, AssLegend, Legend } from './styled'

const Label = styled.label`
  font-weight: ${p => p.isNewDashboard ? 'normal' : 'bold'} !important;
  font-size: ${p => p.isNewDashboard ? '1.05rem' : '0.9375rem;'} !important;
  color: ${p => p.isNewDashboard ? 'black' : '#5c6b7f'} !important;
  padding: ${p => p.isNewDashboard ? '0 5rem 0 3rem' : '0'} !important;`

class StatusForm extends Component {

  constructor() {
    super();
    extendObservable(this, {
      user: computed(() => this.props.user),
      statusIn: computed(() => this.props.preCompeteStatus),
      status: {
        title: '',
        stress: 0,
        fatigue: 0,
        hydration: 0,
        injury: 0,
        weekly_load: 0,
        date: 'm/d/yyyy',
        team_id: null,
        goal: ''
      },
      dateValid: false,
      showDateError: false,
      teams: computed(() => {
        if (!this.user) return [];

        return this.user.team_memberships.map(t => t.name);
      }),
      isNewDashboard: computed(() => this.props.isNewDashboard),
    });
  }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    if (this.props.preCompeteStatus) {
      if (!this.statusIn.id) {
        const disposer = observe(this,
          'statusIn',
          change => {
            if (change.newValue.id) {
              this.status = change.newValue;
              this.dateValid = true;
              disposer();
            }
          });
      }
    }

    $(ReactDOM.findDOMNode(this.refs.statusForm)).foundation();

    const date = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const self = this;
    $(ReactDOM.findDOMNode(this.refs.date)).datetimepicker({
      format: 'm/d/Y',
      yearStart: year,
      yearEnd: year + 10,
      timepicker: false,
      scrollInput: false,
      scrollMonth: false,
      scrollTime: false,
      defaultSelect: false,
      todayButton: false,
      minDate: 0,
      // inline: true,
      onGenerate: function (ct) {
        $('.calender-label').append($(this));
        $(this).addClass(self.user && self.user.user_type);
      },
      onSelectDate: ct => {
        const theDate = moment(ct).format('YYYY-MM-DD');
        self.status.date = theDate;
        $('.selected-date').removeClass('empty');
        this.dateValid = true;
        this.showDateError = false;
      }
    });

    $(ReactDOM.findDOMNode(this.refs.statusForm))
      .on("forminvalid.zf.abide", (ev, frm) => {
        ev.preventDefault();

        if (!this.dateValid) {
          this.showDateError = true;
        }
        this.scrollToError();
      })
      .on("formvalid.zf.abide", (ev, frm) => {

        if (!this.dateValid) {
          this.showDateError = true;
        }

        if (!this.status.stress || !this.status.fatigue || !this.status.hydration ||
          !this.status.injury || !this.status.weekly_load) {
          return;
        }

        if (this.dateValid) {
          this.props.onSubmit(this.status);
        }
      })
      .on("submit", ev => {
        ev.preventDefault();
      });
  }

  scrollToError = () => {
    const errorField = $('.form-error.is-visible')[0];
    $('body').scrollTop(errorField.offsetTop - 80);
  };

  setCompTitle = e => {
    this.status.title = e.target.value;
  };

  setTeam = team => {
    this.status.team_id = this.user.team_memberships.find(t => t.name === team).id;
  };

  setGoal = e => {
    this.status.goal = e.target.value;
  };

  setStress = level => {
    this.status.stress = level;
  };

  setFatigue = level => {
    this.status.fatigue = level;
  };

  setHydration = level => {
    this.status.hydration = level;
  };

  setInjury = level => {
    this.status.injury = level;
  };

  setWeekyLoad = level => {
    this.status.weekly_load = level;
  };

  trySubmit = () => {
    $(ReactDOM.findDOMNode(this.refs.statusForm)).submit();
  };

  onCancel = (e) => {
    if (e) e.preventDefault();

    if (this.isNewDashboard) {
      this.props.history.push(`/dashboard`);
    } else {
      this.props.history.push('/dashboard/overview');
    }
  };

  renderFormButtons = () => {
    if (!this.isNewDashboard) return <button type="submit"
                                             className="button theme expanded">Save</button>;
    return <ButtonGroup isNewDashboard={this.isNewDashboard}>
      <AssessmentButton onClick={this.onCancel}>Cancel</AssessmentButton>
      <AssessmentButton className="active"
                        type="submit">Save</AssessmentButton>
    </ButtonGroup>
  };

  render() {
    return (
      <form data-abide noValidate ref="statusForm" className="status-form">
        <div className="content-section">
          {!this.isNewDashboard &&
          <h2 className="section-heading">Competition Title</h2>}
          <Label isNewDashboard={this.isNewDashboard}>Competition Title
            <input type="text" name="compTilte"
                   placeholder="i.e. National, Juniors Tournament etc."
                   required
                   value={this.status && this.status.title}
                   onChange={this.setCompTitle}/>
            <span className="form-error">This field is required.</span>
          </Label>
          <Label isNewDashboard={this.isNewDashboard}
                 ref="dateLabel"
                 className={"calender-label" + (this.showDateError ? " is-invalid-label" : '')}>
            Competition Date
            <div ref="date">
              <div className="selected-date empty">
                {this.status.date}
              </div>
              <span className="psr-icons icon-calender"/>
            </div>
            <span className={"form-error " + (this.showDateError ? " is-visible" : '')}>
              Please enter a valid date.
            </span>
          </Label>
          <Select placeholder="select"
                  title="Team"
                  choices={this.teams}
                  customClass={this.isNewDashboard ? 'new-dashboard' : ''}
                  onSelected={this.setTeam}
                  index={this.user ? this.user.team_memberships.findIndex(t => t.id === this.status.team_id) : -1}/>
        </div>

        <div className="content-section">
          <AssLegend isNewDashboard={this.isNewDashboard} className="group-heading">Self-assessment</AssLegend>
          <ul className="no-bullet">
            {/*  changes:
                Stress = Nutrition
                Fatigue = Sleep
                Injury = Soreness
                Weekly load = Energy
                Hydration = Hydration
              */}
            <PreCompeteLevel title='Nutrition'
                             description='Rate your nutrition, taking into account both appropriate amount and quality<br />
                                          High: Appropriate amounts of well-balanced foods<br />
                                          Low: Too little/too much, mostly junk food'
                             infoDescription={true}
                             isNewDashboard={this.isNewDashboard}
                             level={this.status.stress}
                             setLevel={this.setStress}/>
            <PreCompeteLevel title='Sleep'
                             description='Rate your sleep, taking into account both duration and quality<br />
                                          High: 8+ hours of restful sleep<br />
                                          Low: Less than 5 hours of restless sleep'
                             infoDescription={true}
                             level={this.status.fatigue}
                             isNewDashboard={this.isNewDashboard}
                             setLevel={this.setFatigue}/>
            <PreCompeteLevel title='Soreness'
                             description='Rate your level of overall body soreness<br />
                                          Positive: No soreness or tightness<br />
                                          Negative: Very sore and tight'
                             infoDescription={true}
                             isNewDashboard={this.isNewDashboard}
                             level={this.status.injury}
                             setLevel={this.setInjury}/>
            <PreCompeteLevel title='Energy'
                             description='Rate your level of energy and focus<br />
                                          High: Energetic and focused<br />
                                          Low: Lethargic and scattered'
                             infoDescription={true}
                             isNewDashboard={this.isNewDashboard}
                             level={this.status.weekly_load}
                             setLevel={this.setWeekyLoad}/>
            <PreCompeteLevel title='Hydration'
                             description='Rate your hydration, taking into account both appropriate amount and quality<br />
                                          High: Well hydrated, quality fluids<br />
                                          Low: Very dehydrated, only drinking sugary drinks'
                             infoDescription={true}
                             isNewDashboard={this.isNewDashboard}
                             level={this.status.hydration}
                             setLevel={this.setHydration}/>
          </ul>
          <InfoPopupDescription/>
        </div>

        <div className="content-section">
          <Legend isNewDashboard={this.props.isNewDashboard} className="group-heading">Goal</Legend>
          <ButtonGroup isNewDashboard={this.props.isNewDashboard}>
            <textarea className="all-border status-goal"
                      value={this.status && this.status.goal}
                      onChange={this.setGoal}/>
          </ButtonGroup>
        </div>
        {this.renderFormButtons()}
      </form>
    )
  }
}

export default inject('user')(observer(StatusForm))