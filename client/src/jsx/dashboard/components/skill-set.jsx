import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { extendObservable, computed } from 'mobx'
import { observer } from 'mobx-react'

import PerfLevel14 from './performance-level'
import { Legend, RatingRow, Label } from './styled'

class SkillValue extends Component {

  constructor() {
    super();
    extendObservable(this, {
      skillValue: '',
      unitStr: computed(() => this.getUnitStr())
    });
  }

  componentDidMount() {
    this.skillValue = this.props.skill.value;
  }

  getUnitStr = () => {
    switch (this.props.skill.unit) {
      case 'sec':
        return '(s)';
      case 'kg':
        return this.props.isImperial ? '(lbs)' : '(kg)';
      case 'cm':
        return this.props.isImperial ? '(feet)' : '(m)';
      case 'degrees':
        return '(°)';
      case 'L/min':
        return '(L/min)';
      case 'watts':
        return '(W)';
      default:
        return '';
    }
  };

  onValueChanged = ev => {
    if (this.props.readonly) return;

    //only allow numbers and two decimal places
    let ex = /^\d*\.?\d{0,2}$/;
    //console.log(ev.target.value,ex.test(ev.target.value));
    if (ex.test(ev.target.value) === false) {
      ev.target.value = ev.target.value.substring(0, ev.target.value.length - 1);
    }
    this.skillValue = ev.target.value;
    this.updateValue();
    $('.assessment_' + this.props.skill.id).html('');
  };

  onToggle = ev => {
    if (this.props.readonly) return;
    this.skillValue = ev.target.checked;
    this.props.skill.value = this.skillValue ? 1 : 0;
    this.props.skill.modified = true;
  };

  updateValue = () => {
    this.props.skill.value = this.skillValue;
    this.props.skill.modified = !!this.skillValue;
  };

  render() {
    return (
      'competent/not-competent' === this.props.skill.unit ?
        <RatingRow className="row rating-row"
                   isNewDashboard={this.props.isNewDashboard}
                   idx={this.props.idx}
                   key={this.props.skill.name}>
          <div className="small-9 column" key='skillName1'>
            <Label isNewDashboard={this.props.isNewDashboard}>{this.props.skill.name + ' ' + this.unitStr}</Label>
          </div>
          <div className="small-3 column" key='input1'>
            <div className="switch small">
              <input className="switch-input"
                     type="checkbox"
                     id={this.props.skill.name}
                     name={this.props.skill.name}
                     value={this.props.skill.name}
                     checked={!!this.skillValue}
                     onChange={this.onToggle}/>
              <Label className="switch-paddle"
                     isNewDashboard={this.props.isNewDashboard}
                     htmlFor={this.props.skill.name}>
                <span className="show-for-sr">{this.props.skill.name}</span>
              </Label>
            </div>
          </div>
        </RatingRow>
        :
        <RatingRow className="row rating-row"
                   isNewDashboard={this.props.isNewDashboard}
                   idx={this.props.idx}
                   key={this.props.skill.name}>
          <div className="small-9 column" key='skillName2'>
            <Label isNewDashboard={this.props.isNewDashboard}>{this.props.skill.name + ' ' + this.unitStr}</Label>
          </div>
          <div className="small-3 column" key='input2'>

            <div>
              <input type="text"
                     disabled={!!this.props.readonly}
                     value={this.skillValue}
                     onChange={this.onValueChanged}/>
            </div>
          </div>
          <div className={'form-error column small-12 assessment_' +
          (this.props.skill.id || this.props.skill.assessment_id)}
               key='error'></div>
        </RatingRow>
    )
  }
}

const SkillValueObv = observer(SkillValue);

class SkillSet extends Component {
  constructor() {
    super();
    extendObservable(this, {});
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)).foundation();
  }

  render() {
    return (
      <fieldset key={this.props.skillSet.setName} ref="me">
        <Legend className="skillset-heading"
                isNewDashboard={this.props.isNewDashboard}>
          {this.props.skillSet.setName || this.props.skillSet.name}

          {this.props.infoBtn !== false || this.props.skillSet.name === 'Functional Movement Screen' ?
            <span className="psr-icons icon-info" data-open="info-popup-technical-physical"/>
            : ''}

        </Legend>
        <ul className="no-bullet">
          {this.props.skillSet.childs.map((skill, idx) => {
            return "stars" === skill.unit ?
              <PerfLevel14 key={skill.name}
                           idx={idx}
                           readonly={this.props.readonly}
                           isNewDashboard={this.props.isNewDashboard}
                           skill={skill}/> :
              <SkillValueObv key={skill.name}
                             idx={idx}
                             skill={skill}
                             isNewDashboard={this.props.isNewDashboard}
                             isImperial={this.props.isImperial}
                             readonly={this.props.readonly}/>
          })
          }
        </ul>
      </fieldset>
    )
  }
}

export default observer(SkillSet)
