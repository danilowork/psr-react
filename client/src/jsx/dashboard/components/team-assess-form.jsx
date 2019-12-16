import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed, observe} from 'mobx'
import {observer, inject} from 'mobx-react'

import UtilBar from '../../components/util-bar'
import Api from '../../api'
import PerfLevelSet from '../components/level14-set'
import AthletePerfLevel14 from '../components/athlete-performance-level'

import DP from '../../utils/data-proc'
import AvatarRed from '../../../images/avatar-red.png'
import Select from '../../components/select'
import SaveConfirmation from '../../components/save-confirmation'
import InfoPopupTechnicalPhysical from '../components/info-popup-technical-physical'
import EntitySectionAss from './entity-section-ass'

class TeamTechnicalAss extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { 
/*
                      skillSets: computed(() => { return DP.constructSkillSet(this.props.assDefs,
                                                                               null,
                                                                               this.sport,
                                                                               this.curSubsportIndex) }),
*/
                      sections: computed(() => {

                         if (!this.props.team) return [];

                         return this.props.team.athletes.reduce((acc, a) => {
                                  if (!acc.find(letter => letter == a.first_name[0].toUpperCase())) {
                                    acc.push(a.first_name[0].toUpperCase());
                                  }
                                  return acc;
                                }, [])
                                .sort()
                                .map(letter => {
                                  const entities = this.props.team.athletes
                                                     .filter(e => e.first_name[0].toUpperCase() == letter)
                                                     .sort((a, b) => a.first_name > b.first_name)
                                                     .map(e => {
                                                       const value = this.props.assValues.find(v => v.assessed.id == e.id);

                                                       if (value && !isNaN(parseFloat(value.value))) {
                                                         e.value = parseFloat(value.value);
                                                       } else {
                                                         e.value = '';//this is an empty string instead of a float (0) so there is no value when using <input>
                                                       }
                                                       return e;
                                                     })
                                                     .map(e => {
                                                       const dateAssessed = this.props.assValues.find(v => v.assessed.id == e.id);

                                                       if (dateAssessed) {
                                                         e.date_assessed = dateAssessed.date_assessed;
                                                       } else {
                                                         e.date_assessed = '';
                                                       }
                                                       return e;
                                                     });

//date_assessed                                                    
//console.log("value map :",this.props.assValues);
                                  return { letter, entities }
                                }); }) });
  }

  componentWillMount() {

    $('.reveal-overlay').remove();
  }

  componentDidMount() {

    $(ReactDOM.findDOMNode(this.refs.me)).foundation();
  }



  onSave = (e) => {
    e.preventDefault();
    $('#save-confirmation').foundation('open');
   // console.log('this.sections',this.sections);



    const allSkills = this.sections.reduce((acc, sections) => {
                                              acc = acc.concat(sections.entities.slice());
                                              return acc;
                                            }, []);

    console.log('allSkills',allSkills);
    
    const allSkills2 = this.props.assValues.slice();

    //add assessment_id to  allSkills  from allSkills2
    const skillsAndAss = allSkills.map(e => {
      const assessment = allSkills2.find(v => v.assessed.id == e.id);

      e.assessed = assessment.assessed;
      e.assessment_id = Number.parseInt(assessment.assessment_id);

      return e;
    });



console.log('allSkills2',allSkills2);
//const skillsAndAss = [...new Map([...allSkills,...allSkills2])];
//new Map([...map1, ...map2, ...map3])

/*
const skillsAndAss = allSkills.map(def => {
    console.log(def);


  const skills = def.reduce((acc, s) => {


  },[]);
  return

})
*/
//const skillsAndAss = Object.assign({}, allSkills, allSkills2);
//const skillsAndAss = {...allSkills,...allSkills2};

/*
const skillsAndAss = [];

Object.keys(allSkills).forEach(function(key) {

  //join where id == assessed.id
    
    const skill = {...allSkills[key],...allSkills2[key]};

    skillsAndAss.push(skill);
    return skillsAndAss;


    assessment_id
    assessed_id
    level

});
*/
/*
const skillsAndAssEntered = allSkills.map(e => {
  const assessmentId = this.props.allSkills2.find(v => v.assessed.email == e.email);

  e.assessment_id = assessmentId;

});
*/

/*
const skillsAndAssEntered.map(s => ({ assessment_id: s.assessment_id,
                                                assessed_id: s.assessed.id,
                                                value: parseFloat(s.level).toFixed(2)})
*/


const skillsAndAssEntered = skillsAndAss.filter((e) => e.level > 0 );


//map where   allSkills.id == allSkills2.assessed.id

console.log(this.props.team.id);
console.log('skillsAndAssEntered',skillsAndAssEntered);
//console.log(testetetetr,skillsAndAss,skillsAndAss.length);

    if (skillsAndAssEntered && skillsAndAssEntered.length) {
      this.isValidationErr = false;
      Api.newTeamAssessments(skillsAndAssEntered.map(s => ({ assessment_id: s.assessment_id,
                                                assessed_id: s.assessed.id,
                                                value: parseFloat(s.level).toFixed(2)})),
                            this.props.team.id)
        .then(result => {
          this.isApiErr = false;
          this.refs.saveConfirmation.showConfirmation();
          //this.props.refreshAssessment();
          //this.props.onCancel();//refreshes and cancels edit mode
        })
        .catch(err => {
          console.log(err);
          this.isApiErr = true;
          this.refs.saveConfirmation.showApiError()
        });
    } else {
      this.isValidationErr = true;
      this.refs.saveConfirmation.showValidationError();
    }
    
  }


  onClose = () => {
    //console.log('confirmation closed');
    //console.log(this.isValidationErr,this.isApiErr);
    if(this.isValidationErr || this.isApiErr) return;
    this.props.onCancel();//refreshes and cancels edit mode
  }


  render() {

    return (

      <form>
      {this.props.editMode ? <UtilBar title={this.title} onCancel={this.props.onCancel} onSave={this.onSave} readonly={this.readonly}/> : null}

        {this.sections.map(section => <EntitySectionAss {...section}
                                                        readOnly={this.props.readOnly}
                                                        editMode={this.props.editMode}
                                                        assessmentDef={this.props.assessmentDef}
                                                        linkFunc={this.props.linkFunc}
                                                        userIsImperial={this.props.userIsImperial}
                                                        key={section.letter} />)}
                                      
      
      {this.props.editMode ? <button type="submit" className="button theme float-right" onClick={this.onSave}>Save</button> : null}

        <SaveConfirmation userType={this.props.user ? this.props.user.user_type : ""}
          msg="New assessment has been created successfully."
          apiMsg="The format of some fields are not correct, please enter in valid form and submit again."
          validationMsg="Please make sure you have made an assessment to at least one item."
          noAutoPopup={true}
          onClose={this.onClose}
          ref="saveConfirmation"/>

      </form>
    )
  }
}

export default inject('user', 'assDefs', 'team')(observer(TeamTechnicalAss))
