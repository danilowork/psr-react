import React, {Component} from 'react'
import {extendObservable, computed, observable} from 'mobx'
import {observer, inject} from 'mobx-react'

import AvatarRed from '../../../images/avatar-red.png'
import AvatarBlue from '../../../images/avatar-blue.png'
import AvatarTeam from '../../../images/avatar-team.png'
import backgroundImg from '../../../images/bg-cc-a.jpg'
import { User } from '../../data-types';
import styled from '../../styled/styled-components'
import { PenEditLink, AwardCardContent } from '../../styled/components'

const RootContainer = styled.div`
  background-color: #f9f9f9;
  padding-top: 0px;`

const HeaderImage = styled.div`
  width: 120%;
  height: 176px;
  overflow: hidden;
  margin: -0.3125rem -0.625rem 0 -10%;
  text-align: center;
  background: url(${backgroundImg}) top center no-repeat #ec494b;
  background-size: cover;`

const AvatarBorder = styled.div`
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: -100px;
  z-index: 0;
  border-radius: 50%;
  background-image: linear-gradient(to bottom right, #32D2FA, #17A6F2);`

const Avatar = styled.div`
  width: 192px;
  height: 192px;
  background-size: cover!important;
  border: 4px solid white;
  border-radius: 50%;
  background: url(${(props: {avatar: string}) => props.avatar}) #fff no-repeat center center;`

const HeaderRight = styled.div.attrs({className: "column col-right"})`
  &&& { padding-top: 0.5rem; }`

const SportList = styled.div.attrs({ className: 'small-heading stats-sport-list'})`
  color: black;
  font-size: 14pt;
  font-family: Poppins, "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;`

const H4 = styled.h4`
  font-size: 14pt;
  color: black;`

const Hr = styled.hr.attrs({className: 'divider'})`
  && { margin-bottom: 0.3rem; }`

const SPORTS_TO_SHOW = 4;

interface ContentCardProps {
  user?: User
  sports: string[]
  themeColor: string
  avatar: string
  tagline: string
  link: string
  season?: string
  name: string
}

@inject('user')
@observer
class ContentCard extends Component<ContentCardProps, {}> {

  @computed get user() { return this.props.user; }
  @observable allSportsShown: boolean = !!(this.props && this.props.user && this.props.user.user_type !== 'athlete')

  renderSports() {
    const sports = this.props.sports;
    if (!sports.length) return '';

    const showMoreNum = sports.length > SPORTS_TO_SHOW ? sports.length - SPORTS_TO_SHOW : 0;
    const sports_ = this.allSportsShown ? sports : sports.slice(0, SPORTS_TO_SHOW);

    const showMoreText = !this.allSportsShown ? `${showMoreNum} more ${showMoreNum !== 1 ? 'sports' : 'sport'}`
                                                : 'show less sports';

    return <div>
      <SportList>{sports_.join(', ')}</SportList>
      {showMoreNum > 0 &&
        <span>
          &nbsp;-&nbsp;
          <span className="link-text"
                role="button"
                onClick={this.toggleShowAllSports}>
            {showMoreText}
          </span>
        </span>}
    </div>
  }

  toggleShowAllSports = () => {
    this.allSportsShown = !this.allSportsShown
  };

  render() {
    const { name, tagline, link, season } = this.props;

    return (
      <RootContainer className={`card content-card ${this.props.themeColor}`}>
        <HeaderImage/>
        <div className="row content-row card-row">
          <AvatarBorder>
            <Avatar avatar={this.props.avatar} />
          </AvatarBorder>
          <HeaderRight>
            <div className="title-wrap">
              <H4 className="group-title">{name || ''}</H4>
              {tagline && <AwardCardContent>{`"${tagline}"`}</AwardCardContent>}
              {link && <PenEditLink link={link}/>}
            </div>
            <Hr/>
            <div className="stats">
              {this.renderSports()}
              {season && <div className="small-heading ">{season}</div>}
            </div>
          </HeaderRight>
        </div>
      </RootContainer>
    )
  }
}

export default ContentCard;