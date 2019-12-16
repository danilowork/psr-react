import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom'
import {extendObservable, computed, observe} from 'mobx'
import {observer, inject} from 'mobx-react'

import UtilBar from '../components/util-bar'
import Api from '../api'
import Select from '../components/select'
import DP from '../utils/data-proc'
import TeamAssessForm from './components/team-assess-form'
import UnitLabel from '../misc/unit-label'
import {userIsOrganisation} from "../utils/utils";


export default inject('user', 'assDefs', 'team')(observer(class extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { curSubsportName: '',
                       curSubsport: null,
                       ratingReadOnly: true,//changes whether or not you can save/edit
                       editMode: false,//changes the level 1-4 dots to edit mode
                       //curType: 0,
                       //curSport: 'basketball',
                       //team: null,
                       /*skillSets: computed(() => { return DP.constructSkillSet(this.props.assDefs,
                                                                                this.props.assessments,
                                                                                this.curSport,
                                                                                this.curType,
                                                                                true) }),
                                                                                */
                       //teamId: computed(() => { return this.props.team ? this.props.team.id : 0 }),
                       subsports: computed(() => { return this.subsportsFromDefs() }),
                       subsportChoices: computed(() => { return this.subsports.map(ss => ss.name); }),
                       curAssessments: computed(() => { return this.getCurAssessments(); }),
                       assessmentChoices: computed(() => { return this.curAssessments.map(a => a.name); }),
                       //curSubsportIndex: 0,
                       //subSports: computed(() => { return this.getSubSports(); }),
                       curAssessment: null,
                       curAssessmentName: '',
                       curAssessmentIndex: 0,
                       assValues: [],
                       ///mike:[],
                       curAssLabel: computed(() => {
                                      if (!this.curAssessment) {
                                        return this.curAssessmentName;
                                      } else {
                                        return `${this.curAssessmentName} - ${UnitLabel[this.curAssessment.ass.unit]}`;
                                      }
                                    })
                     });
  }

  componentDidMount() {
//console.log("this.teamId="+this.teamId);
//console.log(this);
/*
console.log(this.subSports);
    this.curSubsportId = this.props.match.params.s_id;
    if (this.subSports.length) {
      this.curSubsportIndex = this.subSports.findIndex(ss => ss.id == this.curSubsportId);
    }
*/
    if (this.props.assDefs && this.props.team) {




      this.initializeChoices();
    } else {
      const disposer = observe(this,
                               'subsportChoices',
                               change => {
                                 if (change.newValue.length) {
                                   this.initializeChoices();
                                   disposer();
                                 }
                               });
    }
  }

  initializeChoices = () => {

    this.curSubsport = this.subsports[0];
    this.curSubsportName = this.curSubsport.name;
    this.curAssessment = this.curAssessments[0];
    this.curAssessmentName = this.curAssessment.name;
    this.curAssessmentIndex = 0;

//console.log( 'initializeChoices', this.curSubsport,this.curSubsportName,this.curSubsport.name,this.curAssessment,this.curAssessmentName);


    this.retrieveAssessments();
  }

  subsportsFromDefs = () => {

    if (!this.props.assDefs || !this.props.team) return [];

    return this.props.assDefs.find(assDef => assDef.id == this.props.team.sport_id).childs;
  }

  getCurAssessments = () => {

    if (!this.curSubsport) return [];

    return this.curSubsport.childs.reduce((acc, ass) => {

             if (ass.is_flat || undefined === ass.is_flat) {
               acc.push({ name: ass.name,
                          ass: ass });
             } else {
               const leafs = ass.childs.map(a => ({ name: `${ass.name} - ${a.name}`,
                                                    ass: a}));

               acc = acc.concat(leafs);
             }
             return acc;
           }, []);
  }

  onSubsport = (subsport) => {

    this.curSubsportName = subsport;
    this.curSubsport = this.subsports.find(s => s.name == subsport);

    this.onAssessmentType(this.assessmentChoices[0]);
  }

  onAssessmentType = assType => {

    this.curAssessmentName = assType;
    this.curAssessmentIndex = this.assessmentChoices.findIndex(a => a == assType);
    this.curAssessment = this.curAssessments[this.curAssessmentIndex];

    //console.log('onAssessmentType');
    this.retrieveAssessments();
    //this.onCancel();
  }

  retrieveAssessments = () => {

    Api.getTeamAssessments(this.props.match.params.t_id, this.curAssessment.ass.id)
      .then(assessments => {
        this.assValues = assessments;
        //console.log('2assValues: ',this.assValues.slice());
      })
      .catch(err => { console.log(err); });
  }

  linkFunc = (ent) => {

    return `/dashboard/directory/team-management/${this.props.team && this.props.team.id}/technical-competence/new-assessment/${ent.id}/${this.curSubsport && this.curSubsport.id}`;
  }




  onCancel = () => {
    console.log("on cancel");
    this.ratingReadOnly = true;
    this.editMode=false;
    this.retrieveAssessments();
  }


  setReadOnly = () => {
    console.log('make readonly true');
    this.ratingReadOnly = false;
    this.editMode=true;
  }


  render() {

    return (
      <div className="team-management-content">
        <h3 className="group-heading">Sport</h3>
        <div className="sports-filter">
          <Select choices={this.subsportChoices}
                  onSelected={this.onSubsport}
                  index={this.subsportChoices.findIndex(c => c == this.curSubsportName)}/>
        </div>
        <h3 className="group-heading">Skill Category</h3>
        <div className="sports-filter">
          <Select choices={this.assessmentChoices}
                  onSelected={this.onAssessmentType}
                  index={this.curAssessmentIndex}/>
        </div>

        {!userIsOrganisation(this.props.user) && <div className="button-group left">
          <h3 className="group-heading">{this.curAssLabel}</h3>
              <div onClick={this.setReadOnly}
                    className="button border icon">
                <span className="btn-text">Assess my team now</span>
              </div>
        </div>}




{
  /*
this.assValues:
assessed:Object
    email:"mike+a01@poundandgrain.com"
    first_name:"MikeP"
    id:52
    last_name:"Z"
    profile_picture_url:""
assessment_id:183
assessor_id:51
date_assessed:"2017-11-02T23:18:29.521807Z"
id:686
team_id:20
unit:"stars"
value:"2.000000"


after clicked:

entities:[{…}]
  date_assessed:"2017-11-07T07:12:54.438142Z"
  email:"mike+a01@poundandgrain.com"
  first_name:"MikeP"
  id:52
  last_name:"Z"
  level:1
  modified:trueprofile_picture_url:(...)
  value:3
letter:"M"


{this.assValues.map(skill => <PerfLevel14 key={skill.assessment_id}
            readonly={false}
            skill={skill} />)}
*/
}
  


        <TeamAssessForm readOnly={this.ratingReadOnly}
                        editMode={this.editMode}
                        onCancel={this.onCancel}
                        assValues={this.assValues}
                        linkFunc={this.linkFunc}
                        assessmentDef={this.curAssessment && this.curAssessment.ass}/>





      </div>

    )
  }
}))
