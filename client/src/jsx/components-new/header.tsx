import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {observable} from 'mobx'
import {observer, inject} from 'mobx-react'
import styled, { ThemeProvider } from 'styled-components'
import * as $ from 'jquery'
import { Location } from 'history'

import goIcon from '../../images/icon-go.svg'
import { getAvatar } from '../utils/utils'
import LogoLink from './logo-link'
import { User } from '../data-types'
import { userIsOrganisation } from '../utils/utils'

import { breakpoints, mediaMin, mediaMax, themes } from '../styled/theme'

const StyledHeader = styled.header`
  position: fixed;
  z-index: 150;
  width: 100%;
  top: -500px;
  left: 0;
  background: #fff;
  padding-left: 71px;
  padding-right: 15px;
  border-bottom: 1px solid #BDC5D0;
  padding-top: 515px;
  padding-bottom: 15px;`

const DropdownMenuContainer = styled.div`
  position: absolute;
  z-index: 110;
  text-align: right;
  width: 300px;
  min-height: 100px;
  transform: translate(${(props: {xOffset: number}) => props.xOffset}px, 0px);`;

const DropdownMenuHelpContainer = DropdownMenuContainer.extend`
  width: 382px;`

const DropdownMain = styled.div`
  background: white;
  border-radius: 1px;
  text-align: left;
  padding: 25px;
  overflow: hidden;
  box-shadow: rgba(0, 0, 0, 0.07) 0 0 4px 4px;`;

const DropdownMenuHeader = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;`;

const DropdownMenuUserName = styled.h3`
  font-family: "Poppins", "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
  font-size: 0.875rem;
  font-weight: bold;
  color: #003059;`

const DropdownMenuHeaderRight = styled.div`
  margin-left: 20px;
  flex: 1;`

const ProfileThumb = styled.div`
  cursor: pointer;
  margin-right: 0;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #17A6F2;
  background-size: cover !important;
  background: url(${(props: { user: any, large?: boolean }) => (props.user && props.user.profile_picture_url) || getAvatar(props.user)}) #fff no-repeat center center;
  width: ${props => props.large ? 75 : 48}px;
  height: ${props => props.large ? 75 : 48}px;`;

const ProfileThumbWrap = styled.div`
  display: flex;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(to bottom right, #32D2FA, #17A6F2);
  align-items: center;
  justify-content: center`

const ProfilePicture = styled.div`
  position: relative;
  display: inline-block;
  align-items: center;
  justify-content: center;`

const HelpWrap = styled.div`
  width: 100%;
  height: 100vh;
  padding: 20px;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;`

const PlusIcon = styled.span`
  font-size: 0.7rem;
  font-family: 'psr-icons' !important;
  margin-right: ${(props: {side: 'left' | 'right'}) =>
                   'left' == props.side ? 0.4 : 0}rem;
  margin-left: ${props => 'right' == props.side ? 0.4 : 0}rem;
  :before {
    content: "\\E90E";
  }`

export const GradientButton = styled.button`
  height: 2rem;
  width: 180px;
  border-radius: 6px;
  font-family: 'Karla','Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
  font-weight: bold;
  color: white;
  ${mediaMax.large`width: 150px`};
  cursor: pointer;
  background: linear-gradient(#00C0EE, #008CD8);`

const DashboardLinkStyled = styled(Link)`
  color: black;
  font-size: 14px;
  font-weight: bold;
  font-family: Poppins, "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;`

const DashboardLinkUnderlinedStyled = styled(DashboardLinkStyled)`
  border-bottom: 2px solid #168ed5;`

const DashboardLink = ({underline, ...props}: any) =>
  (underline ? <DashboardLinkUnderlinedStyled {...props} /> : <DashboardLinkStyled {...props} />);

const HelpButton = styled.div`
  cursor: pointer;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 2px solid black;
  text-align: center;
  font-weight: bold;
  color: black;
  line-height: 19px;`

const FullWidthHLine = styled.hr`
  border-bottom: 1px solid #f0f2f5;
  width: 1000%;
  margin-top: 20px;
  margin-bottom: 20px;
  margin-left: -1000px;
  margin-right: -1000px`

const MobileNavBtnContainer = styled.div`
  display: flex;
  z-index: 110;
  justify-content: space-around;
  font-size: 0.75rem`

const HeaderMain = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  padding-top: 10px;
  padding-bottom: 10px;
  position: relative;
  ${mediaMin.large`padding-left: 20px`}`

const HeaderMainRight = styled.div`
  width: 45%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 40px;
  ${mediaMax.large`width: 35%`}`

const PoppinsText = styled.span`
  font-size: 14px;
  font-family: Poppins, "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;`

const HeaderDropdownMenuItem = styled.li`
  color: black;
  margin-top: 10px;
  font-size: 0.9rem;
  font-family: 'Karla','Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;`

const DropdownMenuItemLink = styled(Link)`
  color: black;`

const DropdownMenuItemAchor = styled.a`
  color: black;`

const GradientPlusButton = (props: {
  side: 'left' | 'right',
  text: string,
  className?: string,
  clickHandler?: (() => void),
}) =>
  <GradientButton className={props.className}>
    {props.side == 'left' ? <PlusIcon side='left'/> : undefined}
    <PoppinsText onClick={props.clickHandler}>{props.text}</PoppinsText>
    {props.side == 'right' ? <PlusIcon side='right'/> : undefined}
  </GradientButton>

interface HeaderDropdownMenuProps {
  curActive: string
  user: any
  clickHandler: () => void
}

const TrianglePointer = () =>
  <div style={{height: 20}}>
    <svg height="20" width="50">
      <filter id="black-glow">
        <feFlood result="flood" floodColor="#eeeeee" floodOpacity="1"/>
        <feComposite in="flood" result="mask" in2="SourceGraphic" operator="in"/>
        <feMorphology in="mask" result="dilated" operator="dilate" radius="2"/>
        <feGaussianBlur in="dilated" result="blurred" stdDeviation="2"/>
        <feMerge>
            <feMergeNode in="blurred"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <polygon points="27,0 12,20 42,20"
               style={{fill: 'white', filter: 'url(#black-glow)'}}/>
    </svg>
  </div>

const HeaderDropdownMenu = (props: HeaderDropdownMenuProps) =>
  <DropdownMenuContainer xOffset={-250}>
    <TrianglePointer />
    <DropdownMain>
      <DropdownMenuHeader>
        <ProfileThumb user={props.user} large/>
        <DropdownMenuHeaderRight>
          <DropdownMenuUserName>
            {props.user.first_name + ' ' + props.user.last_name}
          </DropdownMenuUserName>
          <p>{props.user.tagline}</p>
        </DropdownMenuHeaderRight>
      </DropdownMenuHeader>
      <FullWidthHLine/>
      <GradientPlusButton side='right' text='Invite a Coach'/>
      <StyledUL>
        <HeaderDropdownMenuItem>
          <DropdownMenuItemLink to='/profile'
                onClick={props.clickHandler}>
            Profile
          </DropdownMenuItemLink>
        </HeaderDropdownMenuItem>
        <HeaderDropdownMenuItem>
          <DropdownMenuItemLink to='/settings'
                                onClick={props.clickHandler}>
            Settings
          </DropdownMenuItemLink>
        </HeaderDropdownMenuItem>
        <HeaderDropdownMenuItem>
          <DropdownMenuItemLink to='/athlete-log'
                                onClick={props.clickHandler}>
            Athlete Log
          </DropdownMenuItemLink>
        </HeaderDropdownMenuItem>
        <HeaderDropdownMenuItem>
          <DropdownMenuItemLink to='/dashboard/pending-invites'
                                onClick={props.clickHandler}>
            Pending Invites
          </DropdownMenuItemLink>
        </HeaderDropdownMenuItem>
        <HeaderDropdownMenuItem>
          <DropdownMenuItemAchor target='_blank'
                                 href='//personalsportrecord.com/blog/'>
            Resources
          </DropdownMenuItemAchor>
        </HeaderDropdownMenuItem>
        <HeaderDropdownMenuItem>
          <DropdownMenuItemLink to={props.user ? '/logout' : '/login'}
                                onClick={props.clickHandler}>
            {props.user ? 'Sign out' : 'Log in'}
          </DropdownMenuItemLink>
        </HeaderDropdownMenuItem>
      </StyledUL>
    </DropdownMain>
  </DropdownMenuContainer>


interface MobileNavProps {
  curActive: string
  itemClickHandler: () => void
  user: any
}

const MobileNav = (props: MobileNavProps) =>
  <nav className="header-nav mobile for-nav" style={{display: 'none'}} >
    <div className="nav-wrap">
      <ul className="nav no-bullet">
        <li>
          <MobileNavBtnContainer>
            <GradientPlusButton side='right' text='Add Assessment' />
            <GradientPlusButton side='right' text='Invite Coach' />
          </MobileNavBtnContainer>
        </li>
        <HeaderDropdownMenuItem>
          <Link to='/dashboard'
                onClick={props.itemClickHandler}>
            Dashboard
          </Link>
        </HeaderDropdownMenuItem>
        <HeaderDropdownMenuItem>
          <Link to='/team-coach-list'
                onClick={props.itemClickHandler}>
            Team / Coach List
          </Link>
        </HeaderDropdownMenuItem>
        <HeaderDropdownMenuItem>
          <Link to='profile'
                onClick={props.itemClickHandler}>
            Profile
          </Link>
        </HeaderDropdownMenuItem>
        <HeaderDropdownMenuItem >
          <Link to='/athlete-log'
                onClick={props.itemClickHandler}>
            Athlete Log
          </Link>
        </HeaderDropdownMenuItem>
        <HeaderDropdownMenuItem>
          <Link to='/settings'
                onClick={props.itemClickHandler}>
            Settings
          </Link>
        </HeaderDropdownMenuItem>
        <HeaderDropdownMenuItem>
          <Link to='/dashboard/pending-invites'
                onClick={props.itemClickHandler}>
            Pending Invites
          </Link>
        </HeaderDropdownMenuItem>
        <HeaderDropdownMenuItem>
          <a className={"nav-link " + ('Resources' == props.curActive ? 'active' : '')}
              href="http://personalsportrecord.com/blog/"
              target="_blank"
              onClick={props.itemClickHandler}>
            Resources
          </a>
        </HeaderDropdownMenuItem>
        {props.user ?
          <HeaderDropdownMenuItem>
            <Link className="nav-link "
                  to="/logout"
                  onClick={props.itemClickHandler}>
              Sign out
            </Link>
          </HeaderDropdownMenuItem>
          :
          <HeaderDropdownMenuItem>
            <Link className="nav-link "
                  to="/login"
                  onClick={props.itemClickHandler}>
              Login
            </Link>
          </HeaderDropdownMenuItem>
        }
      </ul>
    </div>
  </nav>

interface HelpMenuProps {
  onClick: () => void,
  formType: string,
  history: any,
}

const HelpTitle = styled.div`
  color: black;
  font-weight: bold;
  padding-bottom: 8px;
  ${mediaMax.xxlarge`font-size: 1.0em;
                     font-family: "Poppins","Helvetica Neue",Helvetica,Roboto,Arial,sans-serif;`}
  ${mediaMax.large`font-size: 1.5em;
                   font-family: "Poppins","Helvetica Neue",Helvetica,Roboto,Arial,sans-serif;`}`

const HelpSubtitle = styled.div`
  color: black;
  font-weight: bold;
  padding-bottom: 8px;
  ${mediaMax.xxlarge`font-size: 0.9em;
                     font-family: "Poppins","Helvetica Neue",Helvetica,Roboto,Arial,sans-serif;`}
  ${mediaMax.large`font-size: 1.4em;
                   font-family: "Poppins","Helvetica Neue",Helvetica,Roboto,Arial,sans-serif;`}`

const HelpSafety = styled.p`
  color: black;
  line-height: 1.1rem;
  ${mediaMax.xxlarge`font-size: 0.9em`}
  ${mediaMax.large`font-size: 1.0em;
                   font-family: 'Karla','Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;`}`

const HelpContact = styled.a`
  display: block;
  font-size: 1.1rem;
  color: #30acf0 !important;
  &:hover { color: darken(#30acf0, 15%) !important; }
  margin-bottom: 3px;
  ${mediaMax.xxlarge`font-size: 12`}
  ${mediaMax.large`font-size: 1.2em;
                   font-family: 'Karla','Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;`}`

const StyledUL = styled.ul`
  list-style: none;
  margin-left: 0px;
  margin-top: 10px`

const ButtonLink = styled(Link)`
  color: black !important;
  font-size: 1rem !important;`

const FaqIcon = styled.img`
  margin-left: 5px;
  margin-bottom: 2px;
  height: 16px;
  width: 16px;`

const ContactFormLink = styled.div`
  cursor: pointer;`

const HELP_CONTENT_DATA = {
  HELP_CENTER: {
    HEADER: 'Help Center',
    SUB_HEADER: 'Tell someone',
    TEXT: 'Your safety is our #1 priority. If there is ever a time when a team mate, support stuff or coach ' +
    'verbally, physically or sexually hurts you, we want you to tell us so that we can help you.',
    PATH: '/help-center',
  },
  ORG_SUPPORT: {
    HEADER: 'Help Center',
    SUB_HEADER: 'Contact PSR for organisational support',
    TEXT: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et ' +
    'dolore magna aliqua.',
    PATH: '/dashboard/contact-psr',
  },
};

const HelpContent = (props: HelpMenuProps) =>
  <div>
    <ContactFormLink onClick={() => props.history.push(HELP_CONTENT_DATA[props.formType]['PATH'])}>
      <HelpTitle>{HELP_CONTENT_DATA[props.formType]['HEADER']}</HelpTitle>
      <HelpSubtitle>{HELP_CONTENT_DATA[props.formType]['SUB_HEADER']}</HelpSubtitle>
      <HelpSafety>{HELP_CONTENT_DATA[props.formType]['TEXT']}</HelpSafety>
    </ContactFormLink>
    <FullWidthHLine/>
    <StyledUL>
     <li>
       <ButtonLink to='/tutorial'
             onClick={props.onClick}>Tutorial</ButtonLink>
     </li>
     <li>
       <ButtonLink to='http://personalsportrecord.com/wp/faq'
                   target="_blank"
                   onClick={props.onClick}>FAQs
          <FaqIcon src={goIcon}/>
       </ButtonLink>
     </li>
    </StyledUL>
    <FullWidthHLine/>
    <HelpTitle>Contact us</HelpTitle>
    <HelpContact href="tel:(1)604-218-1716">(1)604-218-1716</HelpContact>
    <HelpContact href="mailto:support@personalsportrecord.com">support@personalsportrecord.com</HelpContact>
  </div>

const HelpMenuPopup = (props: HelpMenuProps) =>
  <DropdownMenuHelpContainer xOffset={-346}>
    <TrianglePointer />
    <DropdownMain>
      {HelpContent({
        formType: props.formType,
        onClick: props.onClick,
        history: props.history,
      })}
    </DropdownMain>
  </DropdownMenuHelpContainer>

const MobileHelp = (props: HelpMenuProps) =>
  <nav className="header-nav mobile for-help" style={{display: 'none'}}>
    <HelpWrap>
      {HelpContent({
        formType: props.formType,
        onClick: props.onClick,
        history: props.history,
      })}
    </HelpWrap>
  </nav>

interface HeaderProps {
  curActive: string
  showProfile: boolean
  user?: User
  history: any
  location: Location
}

@inject('user')
@observer
class Header extends Component<HeaderProps, {}> {

  @observable showPopupMenuD: boolean = false
  @observable showHelpDropdown: boolean = false
  @observable self: any
  @observable profileDiv: any
  @observable helpDiv: any

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.self)!).foundation();
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside = (event: any) => {
    if ((!this.profileDiv.contains(event.target)) &&
        (!this.helpDiv.contains(event.target))) {
      this.closeAllDropdown();
    }
  }

  toggleNav = () => {
    $('.header-nav.mobile.for-nav').slideToggle();
  }

  closeNav = () => {
    $('.header-nav.mobile.for-nav').slideUp();
  }

  toggleHelpM = () => {
    $('.header-nav.mobile.for-help').slideToggle();
  }

  closeHelpM = () => {
    $('.header-nav.mobile.for-help').slideUp();
  }

  toggleProfilePopup = () => {
    $(ReactDOM.findDOMNode(this.refs.profilePopup)!).slideToggle();
    $(ReactDOM.findDOMNode(this.refs.downArrow)!).toggleClass('open');
  }

  closeAllDropdown = () => {
    this.showHelpDropdown = false;
    this.showPopupMenuD = false;
  }

  togglePopupMenu = () => {
    if (screen.width >= breakpoints.large) {
      this.showPopupMenuD = !this.showPopupMenuD;
    } else {
      this.toggleNav();
      this.closeHelpM();
    }
    this.showHelpDropdown = false;
  }

  toggleHelp = () => {
    if (screen.width >= breakpoints.large) {
      this.showHelpDropdown = !this.showHelpDropdown;
      this.showPopupMenuD = false;
    } else {
      this.toggleHelpM();
      this.closeNav();
    }
  }

  closeHelp = () => {
    if (screen.width >= breakpoints.large) {
      this.showHelpDropdown = false;
    } else {
      this.closeHelpM();
    }
  }

  openHelpCenterForm = () =>
    this.props.history.push('/help-center');

  addAssessmentClick = () =>
    this.props.history.push('/dashboard/assess');

  createTeamClick = () =>
    this.props.history.push('/dashboard/directory/create-team');

  renderAddAssessmentBtn = () => {
    if (!this.props.user || this.props.user.user_type !== 'athlete') return null;
    return <GradientPlusButton side='left'
                               text='Add Assessment'
                               className='show-for-large'
                               clickHandler={this.addAssessmentClick}/>;
  };

  renderCreateTeamBtn = () => {
    if (!this.props.user || this.props.user.user_type !== 'coach') return null;
    return <GradientPlusButton side='left'
                               text='Create new team'
                               className='show-for-large'
                               clickHandler={this.createTeamClick}/>;
  };

  isDashboardUnderlined = (pathname: string) => {
    return pathname.endsWith('/dashboard/my-status') || pathname.endsWith('/dashboard');
  };

  render() {
    const formType = userIsOrganisation(this.props.user) ? 'ORG_SUPPORT' : 'HELP_CENTER';
    const pathname = this.props.location.pathname;

    return (
      <ThemeProvider theme={themes['althelet']}>
        <StyledHeader innerRef={r => this.self = r}>
          <HeaderMain>
            <LogoLink/>
            <HeaderMainRight>
              <DashboardLink to='/dashboard'
                             underline={this.isDashboardUnderlined(pathname)}
                             className="show-for-large">
                Dashboard
              </DashboardLink>
              {this.renderAddAssessmentBtn()}
              {this.renderCreateTeamBtn()}
              {this.props.showProfile ?
                <ProfilePicture onClick={this.togglePopupMenu}
                                innerRef={(r: any) => {
                                  if (r) {
                                    this.profileDiv = r;
                                  }
                                }}>
                  <ProfileThumbWrap>
                    <ProfileThumb user={this.props.user}/>
                  </ProfileThumbWrap>
                  {this.showPopupMenuD ?
                    <HeaderDropdownMenu curActive={this.props.curActive}
                                        user={this.props.user}
                                        clickHandler={this.closeAllDropdown}/>
                    :
                    undefined}
                </ProfilePicture>
                : null}
              <div ref={r => {
                if (r) {
                  this.helpDiv = r;
                }
              }}>
                <HelpButton onClick={this.toggleHelp}>?</HelpButton>
                {this.showHelpDropdown ? <HelpMenuPopup onClick={this.closeHelp}
                                                        formType={formType}
                                                        history={this.props.history}/> : undefined}
              </div>
            </HeaderMainRight>
          </HeaderMain>
          <MobileNav curActive={this.props.curActive}
                     itemClickHandler={this.closeNav}
                     user={this.props.user}/>
          <MobileHelp onClick={this.closeHelp}
                      formType={formType}
                      history={this.props.history}/>
        </StyledHeader>
      </ThemeProvider>
    )
  }
}

export default Header;