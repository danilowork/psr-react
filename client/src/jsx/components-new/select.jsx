import React, { Component } from 'react'
import { extendObservable, computed } from 'mobx'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import blueDownArrow from '../../images/blue-down-arrow.png'

const Label = styled.label`
  width: 550px;
  font-size: 1.3rem;
  color: black;`;

const DivInput = styled.div`
  width: 550px;
  padding-left: 0.8rem;
  background: url(${blueDownArrow}) white no-repeat;
  background-position: right;
  background-size: auto 100%;
  background-color: white;
  border: 0 none;
  font-size: 1.1rem;
  :focus {
    background: url(${blueDownArrow}) white no-repeat;
    border-width: 0;
    background-position: right;
    background-size: auto 100%;
  };
  :after {
    content: none !important;
  };`;

class Select extends Component {

  constructor() {
    super();
    extendObservable(this,
      {
        listShown: false,
        curIndex: computed(() => this.props.index),
        curSelection: computed(() => this.curIndex >= 0 ? this.props.choices[this.props.index] :
          this.props.placeholder),
        showError: false,
        choices: computed(() => this.getChoices(this.props)),
      });
  }

  getChoices(props) {
    if (props && props.customClass === 'user-team-select') {
      return props.choices.filter((x, idx) => idx > 0);
    }
    return props.choices;
  }

  setValue = (e) => {
    this.toggleList();

    const value = e.target.innerText;
    if (value === this.curSelection) return;

    this.props.onSelected(value);

    this.showError = false;
  };

  toggleList = (e) => {
    this.listShown = !this.listShown;
  };

  validate = () => {
    if (this.props.placeholder === this.curSelection) {
      this.showError = true;
      return false;
    }
    this.showError = false;
    return true;
  };

  render() {
    return (
      <div className={`custom-select ${this.props.customClass}`}>
        {this.props.title ?
          <Label className={this.showError ? 'is-invalid-label' : ''}>{this.props.title}</Label>
          : ''
        }
        <DivInput className={'selected' + (this.showError ? ' is-invalid-label' : '')}
             onClick={this.toggleList}
             ref='select'
             tabIndex={this.props.tabIndex ? this.props.tabIndex : ''}>
          {this.curSelection}</DivInput>
        <ul className={(this.listShown ? 'show' : 'hide') + ' select-list no-bullet'}>
          {this.choices.map(item => <li onClick={this.setValue} key={item}>{item}</li>)}
        </ul>
        <div className={"form-error label" + (this.showError ? " is-visible" : "")}>This field is required.</div>
      </div>
    )
  }
}

export default observer(Select);
