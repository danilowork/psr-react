import React from 'react'
import styled from 'styled-components'

import MedalGrey from '../../../images/medal-0.png'
import MedalRed from '../../../images/medal-4.png'
import {
  AwardCardRoot,
  PenEditLink,
  AwardCardContent,
  AwardCardFooter
} from '../../styled/components'

export const AwardCardTitle = styled.h4`
  padding-top: 10px;
  font-size: 1.15rem;
  color: black`;

interface AwardCardGRProps {
  title: string
  isGrey: boolean
  content?: string
  team?: string
  link?: string
  footer: string
}

export default (props: AwardCardGRProps) => (
  <AwardCardRoot>
    <div className="row">
      <div className="column shrink col-left">
        <div className="medal-wrap">
          <img src={props.isGrey ? MedalGrey : MedalRed}/>
        </div>
      </div>
      <div className="column col-right">
        <div className="title-wrap">
          <AwardCardTitle className="group-title">{props.title}</AwardCardTitle>
          {props.content && <AwardCardContent>{props.content}</AwardCardContent>}
          {props.team && <AwardCardContent>{props.team}</AwardCardContent>}
          {props.link && <PenEditLink link={props.link}/>}
        </div>
        <hr className="divider"/>
        <AwardCardFooter>{props.footer}</AwardCardFooter>
      </div>
    </div>
  </AwardCardRoot>
)