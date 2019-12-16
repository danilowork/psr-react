import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {observer} from 'mobx-react'

import styled from '../../styled/styled-components'

const GPACircle = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  margin-right: 20px;
  margin-left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: black;
  background-image: linear-gradient(to bottom right, #32D2FA, #17A6F2);
  font-family: "Poppins", "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;`

const GPAInner = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  width: 94px;
  height: 94px;`

const GPAValue = styled.div`
  font-size: 2rem;
  line-height: 1;
  padding-top: 0.3rem;`

const StyledGPA = styled.div`
  font-size: 1.3rem;`

const AttendStatus = styled.div`
  font-size: 18px;
  font-family: Karla,'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
  color: black;`

const SchoolName = styled.h4`
  color: black;
  font-weight: bold;
  font-size: 18px;
  font-family: "Poppins", "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;`

const GPA = (props: {gpa: string}) =>
  <GPACircle>
    <GPAInner>
      <GPAValue>{props.gpa}</GPAValue>
      <StyledGPA>GPA</StyledGPA>
    </GPAInner>
  </GPACircle>

interface SchoolCardProps {
  school_id: number
  gpa: string
  title: string
  attending: string
}

@observer
class SchoolCard extends Component<SchoolCardProps, {}> {

  render() {

    return (
      <div className="card school-card">
        <div className="row align-middle">
          <GPA gpa={this.props.gpa}/>
          <div className="column col-right">
            <div className="title-wrap">
              <SchoolName>{this.props.title}</SchoolName>
              <Link to={`/profile/edit-school/${this.props.school_id}`}
                    className="edit-btn">
                <span>edit </span>
                <span className="psr-icons icon-pen"></span>
              </Link>
            </div>
            <hr className="divider"/>
            <AttendStatus>
              {this.props.attending ? 'Currently attending' : 'Not currently attending'}
            </AttendStatus>
          </div>
        </div>
      </div>
    )
  }
}

export default SchoolCard