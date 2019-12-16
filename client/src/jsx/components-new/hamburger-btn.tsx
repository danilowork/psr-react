import React, {Component} from 'react'

interface HamburgerBtnProps {
  onClick: () => void
}

const HamburgerButton = (props: HamburgerBtnProps) =>
  <button className="nav-toggler hide-for-large"
            role="button"
            onClick={props.onClick}>
      <span/>
      <span/>
      <span/>
      <span/>
    </button>

export default HamburgerButton;