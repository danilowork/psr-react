import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed, toJS, observe} from 'mobx'
import {observer, inject} from 'mobx-react'
import moment from 'moment'

import Api from '../api'

class HelpForm extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { user: computed(() => this.props.user),
                       dateValid: true,
                       termsAgreed: true,
                     });
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.helpForm)).foundation();

    const date = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const self = this;
    $(ReactDOM.findDOMNode(this.refs.date)).datetimepicker({
      format: 'm/d/Y',
      yearStart: year - 10,
      yearEnd: year,
      timepicker: false,
      scrollInput: false,
      scrollMonth: false,
      scrollTime: false,
      defaultSelect: false,
      todayButton: false,
      maxDate: 0,
      // inline: true,
      onGenerate:function(ct){
        $('.calender-label').append($(this));
        $(this).addClass(self.user && self.user.user_type);
      },
      onSelectDate: ct => {
        const achieveDate = (ct.getMonth() + 1)  + '/' + ct.getDate() + '/' + ct.getFullYear();
        self.props.help.date = achieveDate;
        $('.selected-date').removeClass('empty');
        this.dateValid = true;
      }
    })

    $(ReactDOM.findDOMNode(this.refs.helpForm))
      .on("forminvalid.zf.abide", (ev,frm) => {
        ev.preventDefault();
        if(this.props.help.date == 'm/d/yyyy') {
          this.dateValid = false;
        }

        if (this.props.help.i_agree !== true){
          this.termsAgreed = false;
        }

        this.scrollToError();
      })
      .on("formvalid.zf.abide", (ev,frm) => {
        if(this.props.help.date == 'm/d/yyyy') {
          this.dateValid = false;
        }

        if (this.props.help.i_agree !== true){
          this.termsAgreed = false;
        }

        if(this.dateValid && this.props.help.i_agree) {
          this.props.onSubmit({ details: this.props.help.details,
                                organization: this.props.help.organization,
                                date: moment(this.props.help.date).format('YYYY-MM-DD'),
                                //i_agree: this.props.help.i_agree,
                                coach_name: this.props.help.coach_name,
                                name: this.props.help.name });
        }

      })
      .on("submit", ev => {
        ev.preventDefault();
      });
  }


  scrollToError = () => {
    const errorField = $('.form-error.is-visible')[0];
    $('body').scrollTop(errorField.offsetTop - 120);
  }

  setdetails = e => {
    this.props.help.details = e.target.value;
  }

  setorganization = e => {
    this.props.help.organization = e.target.value;
  }

  setcoachname = e => {
    this.props.help.coach_name = e.target.value;
  }

  setyourname = e => {
    this.props.help.name = e.target.value;
  }

  updateIAgree = e => {
    this.props.help.i_agree = e.target.checked;
    this.termsAgreed = true;
  }

  trySubmit = () => {
    $(ReactDOM.findDOMNode(this.refs.helpForm)).submit();
  }

  render() {

    return (
      <form data-abide noValidate ref="helpForm" id="help-form" className="help-form">
        <div className="group-section">

          <label>Association / Organization
            <input type="text" name="helpOrganization"
                   placeholder="Your Association / Organization here"
                   required
                   value={this.props.help.organization}
                   onChange={this.setorganization} />
            <span className="form-error">This field is required.</span>
          </label>

          <label>Coach's Name
            <input type="text" name="helpCoachName"
                   placeholder="Your Coach's name"
                   required
                   value={this.props.help.coach_name}
                   onChange={this.setcoachname} />
            <span className="form-error">This field is required.</span>
          </label>

          <label ref="dateLabel" className={"calender-label" + (this.dateValid ? "" : " is-invalid-label") }>
            Date
            <div ref="date">
              <div className="selected-date empty">
                {this.props.help.date}
              </div>
              <span className="psr-icons icon-calender"></span>
            </div>
            <span className={"form-error " + (this.dateValid ? "" : " is-visible")}>
              Please enter a valid date.
            </span>
          </label>

          <label>Details
            <textarea type="text" name="helpDetails"
                   placeholder=""
                   maxLength="255"
                   rows="6"
                   required
                   value={this.props.help.details}
                   onChange={this.setdetails} />
            <span className="form-error">This field is required.</span>
          </label>

          <label>Your name
            <input type="text" name="helpYourName"
                   placeholder="Your name"
                   value={this.props.help.name}
                   onChange={this.setyourname} />
            <span className="form-error">This field is required.</span>
          </label>

          <label className={"custom-checkbox" + (this.termsAgreed ? "" : " is-invalid-label") }>
            <input type="checkbox" 
                     checked={this.props.help.i_agree}
                     name="isAgreed"
                     id="isAgreed"
                     onChange={this.updateIAgree} />
            <span className="checkbox-indicator"></span>
            <span>I agree. This form will be received by PSR support staff. Thank you for letting someone know and helping in 
            keeping sports a safe an inclusive environment.</span>
            <span className={"form-error" + (this.termsAgreed ? "" : " is-visible") }>This field is required.</span>
          </label>

        </div>
        <button type="submit" className="button theme float-right" >Submit</button>
      </form>
    )
  }
}

export default inject('user')(observer(HelpForm))
