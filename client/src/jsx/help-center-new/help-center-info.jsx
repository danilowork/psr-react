import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import styled from 'styled-components'

import { H, PlusIcon, FormButton } from '../styled/components'
import { mediaMax } from '../styled/theme'

const MainText = styled.p`
  padding-top: 45px;
  color: black;`;

const HelpContact = styled.a`
  margin-top: 12px;
  margin-bottom: 12px;
  max-width: 350px;
  display: block;
  font-size: 1.1rem;
  color: #30acf0 !important;
  text-decoration: underline; 
  &:hover { 
    color: darken(#30acf0, 15%) !important;
    text-decoration: none;
  }
  ${mediaMax.xxlarge`font-size: 12`}
  ${mediaMax.large`font-size: 1.2em;
                   font-family: 'Karla','Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;`}`;

const HelpContactIcon = styled.span`
  margin-right: 10px;`;

export default inject('user', 'setUser', 'sidebarStatus')(observer(class HelpCenterInfo extends Component {

  render() {
    return <div>
      <FormButton to="/help-center/form" className="button theme">
        <span className="btn-text"><PlusIcon/>Complete Form</span>
      </FormButton>
      <div className="group-section">
        <MainText>Your safety is our #1 priority. If there is ever a time when a team mate, support staff or coach
          verbally
          (uses words), physically (uses
          force or contact) or sexually (using inappropriate contact) hurts you, we want you to tell us so we can
          help
          you. Simply fill in this form describing what has happened and we will take it from there. You don’t even
          have
          to include your name. The form can be completely anonymous. We do need a description of the events and the
          names of the personal / people so we may bring your hurt to a quick end.</MainText>
      </div>

      <div className="group-section">
        <H>Need Help?</H>
        <div className="help-contacts">
          <div>
            <HelpContact href="http://personalsportrecord.com/wp/faq" target="_blank">
              <HelpContactIcon className="icon-visit"/>Visit our FAQ’s</HelpContact>
          </div>
          <div>
            <HelpContact href="tel:16042181716">
              <HelpContactIcon className="icon-phone"/>1 604 218 1716</HelpContact>
          </div>
          <div>
            <HelpContact href="mailto:support@personalsportrecord.com">
              <HelpContactIcon className="icon-mail"/>support@personalsportrecord.com</HelpContact>
          </div>
        </div>
      </div>
    </div>
  }
}))