import React, {Component} from 'react'

import styled from '../styled/styled-components'

const StyledFooter = styled.footer`
  background-color: #F9F9F9 !important;
  border-top: 0;
  padding-top: 60px;
  padding-bottom: 15px;
  z-index: 150;`

const FooterNav = styled.footer`
  background-color: #F9F9F9 !important;
  border: none !important;
`;

const Achor = styled.a`
  && { font-family: Karla;
       font-size: 18px;
       color: black; }`

const AchorNoRightBorder = Achor.extend`
  && { border-right: 0; }`

const Spacing = styled.span`
  display: inline-block;
  width: 200px;`

class Footer extends Component {

  render() {
    return (
      <StyledFooter className="footer" ref="me">
        <ul className="socials no-bullet">
        </ul>
        <FooterNav className="footer-nav" >
          <ul className="nav no-bullet ">
            <li>
              <Achor href="http://personalsportrecord.com/contact-us/" >
                Contact us
              </Achor>
            </li>
            <li>
              <Achor href="http://personalsportrecord.com/about-us/">
                About us
              </Achor>
            </li>
            <li>
              <Achor href="http://personalsportrecord.com/faq/">FAQ</Achor>
            </li>
            <li>
              <Achor href="http://personalsportrecord.com/faq/"
                     className="menu-item-faq">Resources</Achor>
            </li>
            <br className="hide-for-medium"/>
            <li>
              <Achor href="http://personalsportrecord.com/user-agreement/"
                 target="_blank">User Agreement</Achor>
            </li>
            <li>
              <AchorNoRightBorder href="http://personalsportrecord.com/privacy-policy/"
                 target="_blank">Privacy Policy</AchorNoRightBorder>
            </li>
            <li>
              <Spacing/>
            </li>
            <li>
              <AchorNoRightBorder href="https://www.facebook.com/personalsportrecord/"
                                  className="social-icon"
                                  target="_blank">
                <span className="psr-icons icon-facebook"></span>
              </AchorNoRightBorder>
            </li>
            <li>
              <AchorNoRightBorder href="https://twitter.com/personalsportr"
                                  className="social-icon"
                                  target="_blank">
                <span className="psr-icons icon-twitter"></span>
              </AchorNoRightBorder>
            </li>
            <li>
              <AchorNoRightBorder href=""
                                  className="social-icon"
                                  target="_blank">
                <span className="psr-icons icon-instagram"></span>
              </AchorNoRightBorder>
            </li>
            <li>
              <AchorNoRightBorder href=""
                                  className="social-icon"
                                  target="_blank">
                <span className="psr-icons icon-linkedin2"></span>
              </AchorNoRightBorder>
            </li>
          </ul>
        </FooterNav>
      </StyledFooter>
    )
  }
}

export default Footer