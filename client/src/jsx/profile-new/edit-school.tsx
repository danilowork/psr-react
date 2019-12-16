import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {observable, computed} from 'mobx'
import { observer, inject } from 'mobx-react'
import { RouteComponentProps } from 'react-router-dom'

import SaveConfirmation from '../components-new/save-confirmation'
import { User } from '../data-types';
import { RootContainer, LabelForRadio } from '../styled/components'
import styled from '../styled/styled-components'

const Content = styled.div`
  margin-top: 50px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 14px;
  padding-left: 40px;
  padding-bottom: 100px;
  width: 80%;
  background-color: #f9f9f9;`

const Title = styled.h4`
  font-family: Poppins, "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
  font-size: 20px;
  color: black;
  margin-top: 28px;`

const GPA = styled.div`
  color: black;
  margin-top: 13px;
  font-size: 18px;
  font-family: Karla,'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;`

const Slider = styled.div.attrs({className: 'slider gpa-slider'})`
  background-color: white;
  margin-right: 40px;`

const SliderHandle = styled.span.attrs({className: 'slider-handle'})`
  && {
    height: 1.25rem;
    width: 1.25rem;
    ::after {
      background-color: #17A6F2;
    }
  }`

const GAPReading = styled.div.attrs({className: 'gpa-readings'})`
  color: black;
  margin-right: 40px;`

const SchoolName = styled.input`
  width: 60%;
  color: #191919;
  background-color: white;
  border-bottom: 0;
  font-size: 20px;
  font-family: Karla,'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
  :focus {
    background-color: white;
    border-bottom: 0;
  }`

const RadioText = styled.span`
  display: inline-block;
  color: black;
  margin-top: -10px;
  margin-left: 20px;
  margin-bottom:20px;
  font-size: 20px;
  font-family: Karla,'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;`

const YesNo = styled.div`
  margin-top: 20px;`

interface EditSchoolProps extends RouteComponentProps<{s_id: string}>{
  user: User
}

@inject('user')
@observer
class EditSchool extends Component<EditSchoolProps, {}> {

  @computed get school() {
    return this.props.user.schools.find(s => s.id == parseInt(this.props.match.params.s_id)) ||
           {id: 0, gpa: '0.0', school: '', user: this.props.user.id, current: false};
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)!).foundation();
  }

  onClose = () => {
    this.props.history.push('/profile')
  }

  onGPAChanged = () => {
    this.school.gpa = $('#gpa-value').val()! as string;
  }

  onSchoolNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.school.school = ev.target.value;
  }

  onAttendingChanged = (ev: React.ChangeEvent<HTMLInputElement>) => {

    if (("Yes" == ev.target.value && ev.target.checked) ||
        ("No" == ev.target.value && !ev.target.checked)) {
      this.school.current = true;
    } else {
      this.school.current = false;
    }
  }

  render() {
    return <RootContainer ref='me'>
      <Content>
        <Title>My Education</Title>
        <div className="shool-field-group coach">
          <div className="gpa-section">
            <GPA>GPA: {this.school.gpa}</GPA>
            <Slider aria-labelledby="GPALabel"
                    aria-describedby="GPAHelpText"
                    data-slider data-initial-start={this.school.gpa}
                    data-end='4.0'
                    data-step='0.1'
                    onClick={this.onGPAChanged}>
              <SliderHandle aria-controls='gpa-value'
                            data-slider-handle
                            role="slider"
                            tabIndex={1}/>
              <input type="hidden"
                     id='gpa-value'
                     onChange={this.onGPAChanged}/>
            </Slider>
            <GAPReading>
              <span>0</span>
              <span>1.0</span>
              <span>2.0</span>
              <span>3.0</span>
              <span>4.0</span>
            </GAPReading>
          </div>
          <fieldset>
            <Title>School</Title>
            <SchoolName type="text"
                        name="school"
                        placeholder="Enter you current school's name here"
                        value={this.school.school}
                        onChange={this.onSchoolNameChange}/>
            <div>
              <Title>Currently Attending</Title>
              <YesNo>
                <LabelForRadio>
                  <input type="radio"
                        name="currently-attending"
                        required
                        value='Yes'
                        checked={this.school.current}
                        onChange={this.onAttendingChanged}/>
                  <span className="radio-indicator"/>
                  <RadioText>Yes</RadioText>
                </LabelForRadio>
                <LabelForRadio>
                  <input type="radio"
                        name="currently-attending"
                        required
                        value='No'
                        checked={!this.school.current}
                        onChange={this.onAttendingChanged}/>
                  <span className="radio-indicator"/>
                  <RadioText>No</RadioText>
                </LabelForRadio>
              </YesNo>
            </div>
          </fieldset>
        </div>
      </Content>
      <SaveConfirmation userType={this.props.user!.user_type}
        msg="Your change has been saved successfully."
        apiMsg="There is problem processing your request, pleaes try again later."
        onClose={this.onClose}
        ref="saveConfirmation"/>
    </RootContainer>
  }
}

export default EditSchool;
