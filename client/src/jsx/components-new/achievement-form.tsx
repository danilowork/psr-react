import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import moment from 'moment'
import styled from 'styled-components'
import history from '../history'

import Api from '../api'
import { User } from '../data-types';
import { AssessmentButtonGroup, AssessmentButton, CancelButton } from '../dashboard-new/components/buttons'

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

interface AchievementFormProps {
  user?: User
  onSubmit: (aw: any) => void
  onSuccess: () => void
  onApiError: () => void
}

@inject('user')
@observer
class AchievementForm extends Component<AchievementFormProps, {}> {

  @observable award = {
    title: '',
    competition: '',
    date: 'm/d/yyyy',
    location: '',
    team: '',
    badge_id: 0
  };
  @observable dateValid = true;
  @observable badgeSelected = false;
  @observable badgeValid = true;
  @observable badges = [] as any[];

  componentDidMount() {
    Api.getBadges()
      .then(badges => {
        this.badges = badges;
      })
      .catch(err => {
        console.log(err);
      });

    $(ReactDOM.findDOMNode(this.refs.achievementForm)!).foundation();

    const date = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const self = this;
    const elDate = $(ReactDOM.findDOMNode(this.refs.date)!) as any;
    elDate.datetimepicker({
      format: 'm/d/Y',
      yearStart: 1990,
      yearEnd: year,
      timepicker: false,
      scrollInput: false,
      scrollMonth: false,
      scrollTime: false,
      defaultSelect: false,
      todayButton: false,
      // inline: true,
      onGenerate: function (ct: any) {
        $('.calender-label').append($(this));
        $(this).addClass(self.props.user!.user_type);
      },
      onSelectDate: (ct: any) => {
        self.award.date = moment(ct).format('YYYY-MM-DD');
        $('.selected-date').removeClass('empty');
        this.dateValid = true;
      }
    });

    $(ReactDOM.findDOMNode(this.refs.achievementForm)!)
      .on("forminvalid.zf.abide", (ev, frm) => {
        ev.preventDefault();
        if (this.award.date == 'm/d/yyyy') {
          this.dateValid = false;
        }
        if (!this.badgeSelected) this.badgeValid = false;
        this.scrollToError();
      })
      .on("formvalid.zf.abide", (ev, frm) => {
        if (this.award.date == 'm/d/yyyy') {
          this.dateValid = false;
        }
        if (!this.badgeSelected) this.badgeValid = false;

        if (this.dateValid && this.badgeValid) {
          this.props.onSubmit(this.award);
        }
      })
      .on("submit", ev => {
        ev.preventDefault();
      });
  }

  scrollToError = () => {
    const errorField = $('.form-error.is-visible')[0];
    $('html, body').scrollTop(errorField.offsetTop - 120);
  };

  setAward = (award: any) => {
    this.award = award;
    this.setBadge(award.badge_id);
  };

  setAchieveTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.award.title = e.target.value;
  };

  setTeam = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.award.team = e.target.value;
  };

  setBadge = (badgeId: number) => {
    this.badgeSelected = true;
    this.badgeValid = true;
    $('.badge').addClass('dirty').removeClass('active');
    $(`#badge_id_${badgeId}`).addClass('active');
    this.award.badge_id = this.badges.find(badge => badge.id === badgeId).id;
  };

  trySubmit = () => {
    $(ReactDOM.findDOMNode(this.refs.achievementForm)!).submit();
  };

  onCancel = (e: any) => {
    if (e) e.preventDefault();
    history.goBack();
  };

  render() {
    const badges = this.badges.map((badge) =>
      <div className="badge-col"
           key={badge.id}>
        <div className="badge"
             id={`badge_id_${badge.id}`}
             onClick={(ev) => {
               this.setBadge(badge.id);
             }}>
          <img src={badge.image_url}/>
        </div>
    </div>);

    return (
      <form data-abide noValidate ref="achievementForm" className="achievement-form">
        <div className="group-section">
          <Label>Achievement Title
            <Input type="text" name="achieveTilte"
                   placeholder="i.e. Fair Play, Sportsmanship etc."
                   required
                   value={this.award.title}
                   onChange={this.setAchieveTitle}/>
            <span className="form-error">This field is required.</span>
          </Label>
          <Label>Team, Event, or Organization
            <Input type="text"
                   placeholder=""
                   value={this.award.team}
                   onChange={this.setTeam}/>
          </Label>
          <Label ref="dateLabel"
                 className={"calender-label" + (this.dateValid ? "" : " is-invalid-label")}>Date Achieved
            <div ref="date">
              <DivInput className="selected-date empty">
                {this.award.date}
              </DivInput>
              <span className="psr-icons icon-calender"/>
            </div>
            <span className={"form-error " + (this.dateValid ? "" : " is-visible")}>Please enter a valid date.</span>
          </Label>
        </div>
        <div className="group-section">
          <Label className="section-heading">Choose a Badge</Label>
          <span className={"form-error " + (this.badgeValid ? "" : " is-visible")}>Please choose a badge.</span>
          <div className="row badges-list">
            {badges}
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

export default AchievementForm;