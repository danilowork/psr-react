import React, { Component } from 'react'
import { extendObservable, computed } from 'mobx'
import { observer } from 'mobx-react'

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
          <label className={this.showError ? 'is-invalid-label' : ''}>{this.props.title}</label>
          : ''
        }
        <div className={'selected' + (this.showError ? ' is-invalid-label' : '')}
             onClick={this.toggleList}
             ref='select'
             tabIndex={this.props.tabIndex ? this.props.tabIndex : ''}>
          {this.curSelection}</div>
        <ul className={(this.listShown ? 'show' : 'hide') + ' select-list no-bullet'}>
          {this.choices.map(item => <li onClick={this.setValue} key={item}>{item}</li>)}
        </ul>
        <div className={"form-error label" + (this.showError ? " is-visible" : "")}>This field is required.</div>
      </div>
    )
  }
}

export default observer(Select);
