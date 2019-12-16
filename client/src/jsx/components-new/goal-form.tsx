import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import moment from 'moment'
import styled from 'styled-components'
import history from '../history'

import { User } from '../data-types';
import { AssessmentButton, AssessmentButtonGroup, CancelButton } from "../dashboard-new/components/buttons";

interface GoalFormProps {
  user?: User
  goal: any
  onSubmit: (arg: {
    description: string,
    achieve_by: string,
    is_achieved: boolean
  }) => void
  onSuccess: () => void
  onApiError: () => void
}

const Label = styled.label`
  font-size: 1.3rem;
  color: black;`;

const Input = styled.input`
  background-color: white;
  border: none;
  font-size: 1.1rem;`;

const DivInput = styled.div`
  background-color: white;
  border: none;
  font-size: 1.1rem;`;

const Textarea = styled.textarea`
  background-color: white !important;
  border: none;
  font-size: 1.1rem;`;

@inject('user')
@observer
class GoalForm extends Component<GoalFormProps, {}> {

  @observable dateValid = true;

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.goalForm)!).foundation();

    const date = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const self = this as GoalForm;
    const elDate = $(ReactDOM.findDOMNode(this.refs.date)!) as any;
    elDate.datetimepicker({
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
      onGenerate: function (ct: any) {
        $('.calender-label').append($(this));
        $(this).addClass(self.props.user!.user_type);
      },
      onSelectDate: (ct: any) => {
        const achieveDate = (ct.getMonth() + 1) + '/' + ct.getDate() + '/' + ct.getFullYear();
        self.props.goal.achieve_by = achieveDate;
        $('.selected-date').removeClass('empty');
        this.dateValid = true;
      }
    });

    $(ReactDOM.findDOMNode(this.refs.goalForm)!)
      .on("forminvalid.zf.abide", (ev, frm) => {
        ev.preventDefault();
        if (this.props.goal.achieve_by == 'm/d/yyyy') {
          this.dateValid = false;
        }
        this.scrollToError();
      })
      .on("formvalid.zf.abide", (ev, frm) => {
        if (this.props.goal.achieve_by == 'm/d/yyyy') {
          this.dateValid = false;
        }

        if (this.dateValid) {
          this.props.onSubmit({
            description: this.props.goal.description,
            achieve_by: moment(this.props.goal.achieve_by).format('YYYY-MM-DD'),
            is_achieved: this.props.goal.is_achieved
          });
        }
      })
      .on("submit", ev => {
        ev.preventDefault();
      });
  }


  scrollToError = () => {
    const errorField = $('.form-error.is-visible')[0];
    $('body').scrollTop(errorField.offsetTop - 120);
  };

  setDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.goal.description = e.target.value;
  };

  updateIsAchieved = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.goal.is_achieved = e.target.checked;
  };

  trySubmit = () => {
    $(ReactDOM.findDOMNode(this.refs.goalForm)!).submit();
  };

  onCancel = (e: any) => {
    if (e) e.preventDefault();
    history.goBack();
  };

  render() {
    return (
      <form data-abide noValidate ref="goalForm" className="goal-form">
        <div className="group-section">
          <Label>Goal description
            <Textarea name="goalTilte"
                      placeholder="Start typing..."
                      maxLength={255}
                      required
                      value={this.props.goal.description}
                      onChange={this.setDescription}/>
            <span className="form-error">This field is required.</span>
          </Label>
          <Label ref="dateLabel" className={"calender-label" + (this.dateValid ? "" : " is-invalid-label")}>
            Achieve by:
            <div ref="date">
              <DivInput className="selected-date empty">
                {this.props.goal.achieve_by}
              </DivInput>
              <span className="psr-icons icon-calender"/>
            </div>
            <span className={"form-error " + (this.dateValid ? "" : " is-visible")}>
              Please enter a valid date.
            </span>
          </Label>
          <div className="switch-block">
            <Label>Has this goal been achieved?</Label>
            <span className="value left">No</span>
            <div className="switch small">
              <Input className="switch-input"
                     type="checkbox" checked={this.props.goal.is_achieved}
                     name="isAchieved"
                     id="isAchieved"
                     onChange={this.updateIsAchieved}/>
              <Label className="switch-paddle" htmlFor="isAchieved">
                <span className="show-for-sr">is achieved?</span>
              </Label>
            </div>
            <span className="value right">Yes</span>
          </div>
        </div>
        <AssessmentButtonGroup>
          <CancelButton onClick={this.onCancel}>Cancel</CancelButton>
          <AssessmentButton type="submit" className="active">Submit</AssessmentButton>
        </AssessmentButtonGroup>
      </form>
    )
  }
}

export default GoalForm;
