import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { extendObservable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'
import styled from 'styled-components'

import Select from '../../components/select'
import { AssessmentButtonGroup, AssessmentButton } from './buttons'

const Label = styled.label`
  font-size: 1.3rem;
  color: black;`;

const Input = styled.input`
  background-color: white;
  border: none;
  font-size: 1.1rem;`;

const Textarea = styled.textarea`
  background-color: white !important;
  border: none;
  font-size: 1.1rem;`;

const CancelButton = styled(AssessmentButton)`
  &:hover {
    background: none;
    border: #26a7ef solid 2px;
    color: black;
  };
  border: none;`;

class OrganisationSupportForm extends Component {
  constructor() {
    super();

    this.supportTypes = [
      "General Inquiry"
    ];

    extendObservable(this, {
      user: computed(() => this.props.user),
      supportTypeChoices: computed(() => this.supportTypes),
      curSupportTypeIndex: computed(() => {
        return this.supportTypeChoices.findIndex(c => c === this.props.supportType)
      })
    });
  }

  componentDidMount() {
    const self = this;
    $(ReactDOM.findDOMNode(this.refs.organisationSupportForm)).foundation();

    $(ReactDOM.findDOMNode(this.refs.organisationSupportForm))
      .on("forminvalid.zf.abide", (ev, frm) => {
        ev.preventDefault();
        self.scrollToError();
      })
      .on("formvalid.zf.abide", (ev, frm) => {
        self.props.onSubmit({
          name: this.props.organisationSupport.name,
          email: this.props.organisationSupport.email,
          phone_number: this.props.organisationSupport.phoneNumber,
          support_type: this.props.organisationSupport.supportType,
          details: this.props.organisationSupport.details,
        });
      })
      .on("submit", ev => {
        ev.preventDefault();
      });
  }

  scrollToError = () => {
    const errorField = $('.form-error.is-visible')[0];
    $('body').scrollTop(errorField.offsetTop - 120);
  };

  setDetails = e => {
    this.props.organisationSupport.details = e.target.value;
  };

  setName = e => {
    this.props.organisationSupport.name = e.target.value;
  };

  setEmail = e => {
    this.props.organisationSupport.email = e.target.value;
  };

  setPhoneNumber = e => {
    this.props.organisationSupport.phoneNumber = e.target.value;
  };

  setSupportType = supportType => {
    this.props.setSupportType(supportType);
  };

  trySubmit = () => {
    $(ReactDOM.findDOMNode(this.refs.organisationSupportForm)).submit();
  };

  onCancel = (e) => {
    if (e) e.preventDefault();
    this.props.history.push(`/dashboard`);
  };

  render() {
    return (
      <form data-abide noValidate
            ref="organisationSupportForm"
            id="organisation-support-form"
            className="organisation-support-form">

        <div className="group-section">
          <Label>Name
            <Input type="text" name="name"
                   placeholder="Type name"
                   required
                   value={this.props.organisationSupport.name}
                   onChange={this.setName}/>
            <span className="form-error">This field is required.</span>
          </Label>

          <Label>Email
            <Input type="email" name="email"
                   placeholder="Type email"
                   required
                   value={this.props.organisationSupport.email}
                   onChange={this.setEmail}/>
            <span className="form-error">This field is required.</span>
          </Label>

          <Label>Phone number (optional)
            <Input type="tel" name="phoneNumber"
                   placeholder="Type phone number"
                   value={this.props.organisationSupport.phoneNumber}
                   onChange={this.setPhoneNumber}/>
          </Label>

          <Select placeholder="select"
                  title="What type of assistance are you looking for?"
                  ref={r => this.supportTypeSelect = r}
                  choices={this.supportTypeChoices}
                  onSelected={this.setSupportType}
                  customClass="new-dashboard-select"
                  index={this.curSupportTypeIndex}
          />

          <Label>What can we help you with?
            <Textarea name="details"
                      placeholder=""
                      maxLength="255"
                      rows="6"
                      required
                      value={this.props.organisationSupport.details}
                      onChange={this.setDetails}/>
            <span className="form-error">This field is required.</span>
          </Label>

        </div>
        <AssessmentButtonGroup>
          <CancelButton onClick={this.onCancel}>Cancel</CancelButton>
          <AssessmentButton type="submit" className="active">Submit</AssessmentButton>
        </AssessmentButtonGroup>
      </form>
    )
  }
}

export default inject('user')(observer(OrganisationSupportForm))
