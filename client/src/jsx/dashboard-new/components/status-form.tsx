import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed, observe, observable} from 'mobx'
import {observer, inject} from 'mobx-react'
import moment from 'moment'

import Api from '../../api'
import Select from '../../components/select'
import PreCompeteLevel from '../../dashboard/components/precompete-level'
import InfoPopupDescription from '../../dashboard/components/info-popup-description'

interface StatusFormProps {
  user: any
  preCompeteStatus: any
  onSubmit: (s: any) => void
}

class StatusForm extends Component<StatusFormProps, {}> {

  @computed get user() { return this.props.user; }
  @computed get statusIn() { return this.props.preCompeteStatus}
  @computed get teams() {
                  if (!this.user) return [];

                  return this.user.team_memberships.map((t: any) => t.name);
                }
  @observable status = { title: '',
                         stress: 0,
                         fatigue: 0,
                         hydration: 0,
                         injury: 0,
                         weekly_load: 0,
                         date: 'm/d/yyyy',
                         team_id: null,
                         goal: ''}
  @observable dateValid = false
  @observable showDateError = false

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
    const form: any = $(ReactDOM.findDOMNode(this.refs.statusForm)!);
    form.foundation();

    const date = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const self = this;
    const dtPicker: any = $(ReactDOM.findDOMNode(this.refs.date)!);
    dtPicker.datetimepicker({
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
      onGenerate:function(ct: any){
        $('.calender-label').append($(this));
        $(this).addClass(self.user && self.user.user_type);
      },
      onSelectDate: (ct: any) => {
        const theDate = moment(ct).format('YYYY-MM-DD');//(ct.getMonth() + 1)  + '/' + ct.getDate() + '/' + ct.getFullYear();
        self.status.date = theDate;
        $('.selected-date').removeClass('empty');
        this.dateValid = true;
        this.showDateError = false;
      }
    })

    form
      .on("forminvalid.zf.abide", (ev: any,frm: any) => {
        ev.preventDefault();

        if (!this.dateValid) {
          this.showDateError = true;
        }
        this.scrollToError();
      })
      .on("formvalid.zf.abide", (ev: any,frm: any) => {

        if (!this.dateValid) {
          this.showDateError = true;
        }

        if (!this.status.stress || !this.status.fatigue || !this.status.hydration ||
            !this.status.injury || !this.status.weekly_load) {
          return;
        }

        if(this.dateValid ) {
          this.props.onSubmit(this.status);
        }
      })
      .on("submit", (ev: any) => {
        ev.preventDefault();
      });
  }

  scrollToError = () => {
    const errorField = $('.form-error.is-visible')[0];
    $('body').scrollTop(errorField.offsetTop - 80);
  }

  setCompTitle = (e: any) => {
    this.status.title = e.target.value;
  }

  setTeam = (team: any) => {
    this.status.team_id = this.user.team_memberships
                            .find((t: any) => t.name === team).id;
  }

  setGoal = (e: any) => {
    this.status.goal = e.target.value;
  }

  setStress = (level: any) => {
    this.status.stress = level;
  }

  setFatigue = (level: any) => {
    this.status.fatigue = level;
  }

  setHydration = (level: any) => {
    this.status.hydration = level;
  }

  setInjury = (level: any) => {
    this.status.injury = level;
  }

  setWeekyLoad = (level: any) => {
    this.status.weekly_load = level;
  }

  trySubmit = () => {
    const form: any = $(ReactDOM.findDOMNode(this.refs.statusForm)!);
    form.submit();
  }

  render() {

    return (
      <form data-abide noValidate ref="statusForm" className="status-form">
        <div className="content-section">
          <h2 className="section-heading">Competition Title</h2>
          <label>Competition Title
            <input type="text" name="compTilte"
                   placeholder="i.e. National, Juniors Tournament etc."
                   required
                   value={this.status && this.status.title}
                   onChange={this.setCompTitle} />
            <span className="form-error">This field is required.</span>
          </label>
          <label ref="dateLabel" className={"calender-label" + (this.showDateError ? " is-invalid-label" : '') }>
            Competition Date
            <div ref="date">
              <div className="selected-date empty">
                {this.status.date}
              </div>
              <span className="psr-icons icon-calender"></span>
            </div>
            <span className={"form-error " + (this.showDateError ? " is-visible" : '')}>
              Please enter a valid date.
            </span>
          </label>
          <Select placeholder="select"
                  title="Team"
                  choices={this.teams}
                  onSelected={this.setTeam}
                  index={this.user ? this.user.team_memberships
                                       .findIndex((t: any) => t.id == this.status.team_id) : -1}/>
        </div>

        <div className="content-section">
          <h2 className="group-heading">Self-assessment</h2>
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
                             level={this.status.stress}
                             setLevel={this.setStress} />
            <PreCompeteLevel title='Sleep'
                             description='Rate your sleep, taking into account both duration and quality<br />
                                          High: 8+ hours of restful sleep<br />
                                          Low: Less than 5 hours of restless sleep'
                             infoDescription={true}
                             level={this.status.fatigue}
                             setLevel={this.setFatigue} />
            <PreCompeteLevel title='Soreness'
                             description='Rate your level of overall body soreness<br />
                                          Positive: No soreness or tightness<br />
                                          Negative: Very sore and tight'
                             infoDescription={true}
                             level={this.status.injury}
                             setLevel={this.setInjury} />
            <PreCompeteLevel title='Energy'
                             description='Rate your level of energy and focus<br />
                                          High: Energetic and focused<br />
                                          Low: Lethargic and scattered'
                             infoDescription={true}
                             level={this.status.weekly_load}
                             setLevel={this.setWeekyLoad} />
            <PreCompeteLevel title='Hydration'
                             description='Rate your hydration, taking into account both appropriate amount and quality<br />
                                          High: Well hydrated, quality fluids<br />
                                          Low: Very dehydrated, only drinking sugary drinks'
                             infoDescription={true}
                             level={this.status.hydration}
                             setLevel={this.setHydration} />
          </ul>

        <InfoPopupDescription />
        </div>

        <div className="content-section">
          <h2 className="group-heading">Goal</h2>
          <textarea className="all-border status-goal"
                    value={this.status && this.status.goal}
                    onChange={this.setGoal}></textarea>
        </div>
        <button type="submit" className="button theme expanded" >Save</button>
      </form>
    )
  }
}

export default inject('user')(observer(StatusForm))
