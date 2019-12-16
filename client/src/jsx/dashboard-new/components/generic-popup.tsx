import React, {Component} from 'react'
import {Link} from 'react-router-dom'

import styled from '../../styled/styled-components'

const RootContainer = styled.div`
  max-width: 80%;
  min-height: 300px;
  height: 300px;
  margin: auto;
  padding: 1rem 3rem;
  border: 0;
  box-shadow: 0 1px 4px 0 #DADCE3;`

const ConfirmButton = styled(Link)`
  display: inline-block;
  padding-top: 8px;
  width: 189px;
  height: 41px;
  color: black;
  font-size: 16px;
  font-weight: bold;
  font-family: "Poppins", "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
  border: 2px solid #17A6F2;
  border-radius: 3px;
  margin-bottom: 38px;`

const Message = styled.p`
  color: black;
  font-family: 'Karla','Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
  font-size: 16px;
  margin-bottom: 42px;`

const ContentBox = styled.div`
  padding-top: 34px;
  margin: auto;
  max-width: 465px;`

const Decline = styled.div`
  font-family: 'Karla','Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
  color: #17A6F2;
  font-size: 16px;`

interface GenericPopupProps {
  msg: string
  confirmLink: string
  confirmBtnText: string
  declineBtnText?: string
}

class GenericPopup extends Component<GenericPopupProps, {}> {

  render() {

    return (
      <RootContainer className="reveal text-center"
                     id="generic-popup"
                     data-reveal
                     data-reset-on-close="true"
                     data-animation-in="fade-in"
                     data-animation-out="fade-out">
        <div className="flex-container">
          <ContentBox>
            <Message>{this.props.msg}</Message>
            <ConfirmButton to={this.props.confirmLink} data-close="">
              {this.props.confirmBtnText}
            </ConfirmButton>
            {this.props.declineBtnText &&
              <div className="dismiss" data-close="">
                {this.props.declineBtnText}
              </div>}
          </ContentBox>
        </div>
      </RootContainer>
    )
  }
}

export default GenericPopup
