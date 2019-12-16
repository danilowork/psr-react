import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed, observe} from 'mobx'
import {observer, inject} from 'mobx-react'

import AvatarRed from '../../../images/avatar-red.png'
import AthletePerfLevel14 from './athlete-performance-level'
import LevelComponent from './level-component'
import InputComponent from './input-component'
import moment from 'moment'
import {convertUnits, getTargetUnit} from '../../utils/unit-convert';

export default observer(class extends Component {

  constructor(props) {

    super(props);
    extendObservable(this,
                     { curAssessmentType: computed(() => {
                          //console.log(this.props);
                                            if (!this.props.assessmentDef) return '';

                                            switch (this.props.assessmentDef.unit) {
                                              case 'stars':
                                                return 'level14';
                                                break;
                                              case 'competent/not-competent':
                                                return 'trueFalse';
                                                break;
                                              default:
                                                return 'value';
                                                break;
                                            }
                                          })

                    });
  }

/*
timeSince = (date) => {

  var seconds = Math.floor((new Date() - new Date(date)) / 1000);

  var interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return interval + " years";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes";
  }
  interval = Math.floor(seconds);
  if (interval > 1) {
    return interval + " seconds";
  }

}
*/

/*
updateValue = (evt) => {

  console.log("this value",evt.target.value);
  //new level...

  if (evt.target.value === ""){
    this.props.skill.modified = false;
    delete this.props.skill.level;
  }else{
    this.props.skill.modified = false;
    this.props.skill.level = level;
  }


}
*/
  getConvertedValue(value) {
    if (!this.props.assessmentDef) return value;

    return convertUnits(
        this.props.assessmentDef.unit,
        getTargetUnit(this.props.assessmentDef.unit, this.props.userIsImperial),
        value,
        false,
    );
  }

  render() {

    return (
      <div key={this.props.letter}>
        <h3 className="letter-heading">{this.props.letter}</h3>
          <ul className="no-bullet">
            { this.props.entities.map((entity, i) => {

              switch (this.curAssessmentType) {
                case 'level14':


                  return  <li className="row rating-row">
                            <div className="small-6 column">
                              <Link to={this.props.linkFunc(entity)}  className="profile-wrap">
                                <div className="profile-thumb"
                                     style={{background: "url(" + (entity.profile_picture_url || AvatarRed) + ") #fff no-repeat center center"}}>
                                </div>
                                <div className="name">{`${entity.first_name} ${entity.last_name}`}</div>
                              </Link>
                              <div className="last-assessed">{(entity.date_assessed ? "Last Assessed: " + moment(entity.date_assessed).fromNow() : '')}</div>
                            </div>
                            <div className="small-6 column text-right">
                            { console.log('entity',entity)}
                              
                              <LevelComponent 
                                    skill={this.props.readOnly ? {name: "", level: entity.value} : entity} 
                                    readOnly={this.props.readOnly} 
                                    editMode={this.props.editMode}/>

                            </div>
                          </li>

                case 'trueFalse':

                  return  <li className="row rating-row " >
                            <div className="small-9 column">
                              <Link to={this.props.linkFunc(entity)} className="profile-wrap">
                                <div className="profile-thumb"
                                  style={{background: "url(" + (entity.profile_picture_url || AvatarRed)
                                                      + ") #fff no-repeat center center"}}>
                                </div>
                                <div className="name">{`${entity.first_name} ${entity.last_name}`}</div>
                              </Link>
                            </div>
                            <div className="small-3 column text-right ">
                              <div className="switch small">
                                <input className="switch-input"
                                       type="checkbox"
                                       id={"name"}
                                       name={"name"}
                                       checked={parseInt(entity.value) > 0}/>
                                <label className="switch-paddle" htmlFor={"name"}>
                                  <span className="show-for-sr">{"name"}</span>
                                </label>
                              </div>
                            </div>
                          </li>
                case 'value':
                  const convertedValue = this.getConvertedValue(entity.value);

                  return  <li className="row rating-row " >
                            <div className="small-9 column">
                              <Link to={this.props.linkFunc(entity)} className="profile-wrap">
                                <div className="profile-thumb"
                                  style={{background: "url(" + (entity.profile_picture_url || AvatarRed)
                                                      + ") #fff no-repeat center center"}}>
                                </div>
                                <div className="name">{`${entity.first_name} ${entity.last_name}`}</div>
                              </Link>
                              <div className="last-assessed">{(entity.date_assessed ? "Last Assessed: " + moment(entity.date_assessed).fromNow() : '')}</div>
                            </div>
                            <div className="small-3 column text-right ">
                              
                              <InputComponent 
                                    skill={this.props.readOnly ? {name: "", level: convertedValue} : entity}
                                    readOnly={this.props.readOnly} 
                                    editMode={this.props.editMode}/>

                            </div>
                          </li>
              }
            })}
        </ul>
      </div>)
  }
})