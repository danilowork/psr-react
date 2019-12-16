import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import styled from 'styled-components'

import logo from '../../images/logo.svg'

const StyledImg = styled.img`
  left: 0;
  width: 50px;
  height: 50px`

const LogoLink = () =>
  <Link to="/"><StyledImg src={logo} /></Link>

export default LogoLink;