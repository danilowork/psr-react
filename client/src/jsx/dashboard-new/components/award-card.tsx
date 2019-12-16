import React, { Component } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import Api from '../../api'
import Medal0 from '../../../images/medal-0.png'
import Medal1 from '../../../images/medal-1.png'
import Medal2 from '../../../images/medal-2.png'
import Medal3 from '../../../images/medal-3.png'
import Medal4 from '../../../images/medal-4.png'
import Medal5 from '../../../images/medal-5.png'
import Medal6 from '../../../images/medal-6.png'
import Medal7 from '../../../images/medal-7.png'
import Medal8 from '../../../images/medal-8.png'
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

interface AwardCardProps {
  imgId: number
  content?: string
  title: string
  team?: string
  footer: string
  link?: string
}

@observer
class AwardCard extends Component<AwardCardProps, {}> {

  @observable badges: any[] | undefined;

  componentDidMount() {
    Api.getBadges()
      .then(badges => {
        this.badges = badges;
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    const medalMap = {
      '0': Medal0,
      '1': Medal1,
      '2': Medal2,
      '3': Medal3,
      '4': Medal4,
      '5': Medal5,
      '6': Medal6,
      '7': Medal7,
      '8': Medal8
    };
    const medalImg = medalMap[this.props.imgId];
    const { imgId, title, content, team, link, footer } = this.props;
    const badgeUrl = this.badges && this.badges.length ?
      this.badges.find(badge => badge.id === imgId).image_url : medalImg;

    return (
      <AwardCardRoot>
        <div className="row">
          <div className="column shrink col-left">
            <div className="medal-wrap">
              <img src={badgeUrl}/>
            </div>
          </div>
          <div className="column col-right">
            <div className="title-wrap">
              <AwardCardTitle className="group-title">{title}</AwardCardTitle>
              {content && <AwardCardContent>{content}</AwardCardContent>}
              {team && <AwardCardContent>{team}</AwardCardContent>}
              {link && <PenEditLink link={link}/>}
            </div>
            <hr className="divider"/>
            <AwardCardFooter>{footer}</AwardCardFooter>
          </div>
        </div>
      </AwardCardRoot>
    )
  }
}

export default AwardCard