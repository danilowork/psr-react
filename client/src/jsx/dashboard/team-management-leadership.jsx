import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom'
import {extendObservable, computed, observe} from 'mobx'
import {observer, inject} from 'mobx-react'

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
                     { 
                       ratingReadOnly: true,//changes whether or not you can save/edit
                       editMode: false,//changes the level 1-4 dots to edit mode
                       mentalDefs: computed(() => { return DP.getMentalDefs(this.props.assDefs); }),
                       categorieNames: computed(() => {
                                         if (!this.mentalDefs.length) return [];
                                         return this.mentalDefs[0].childs.map(def => def.name);
                                       }),
                       curCategory: null,
                       curCategoryName: '',
                       curAssessments: [],
                       curAssessmentsNames: [],
                       curAssessment: null,
                       curAssessmentName: '',
                       assValues: [],
                       curAssLabel: computed(() => {
                                      if (!this.curAssessment) {
                                        return this.curAssessmentName;
                                      } else {
                                        return `${this.curAssessmentName} - ${UnitLabel[this.curAssessment.unit]}`;
                                      }
                                    })
                     });
  }

  componentDidMount() {

    if (this.props.assDefs) {

      this.initializeChoices();
    } else {

      const disploser = observe(this,
                                'mentalDefs',
                                change => {

                                  if (change.newValue.length) {
                                    this.initializeChoices();
                                    disploser();
                                  }
                                });
    }
  }

  initializeChoices = () => {

    this.onCategory(this.mentalDefs[0].childs[0].name);
  }

  onCategory = (cat) => {

    this.curCategoryName = cat;
    this.curCategory = this.mentalDefs[0].childs.find(def => def.name == cat);
    this.curAssessments = this.curCategory.childs;
    this.curAssessmentsNames = this.curAssessments.map(a => a.name);

    this.onAssessment(this.curAssessmentsNames[0]);
  }

  onAssessment = (assName) => {
    this.curAssessmentName = assName;
    this.curAssessment = this.curAssessments.find(a => a.name == assName);

    /*
    Api.getTeamAssessments(this.props.match.params.t_id, this.curAssessment.id)
      .then(assessments => {
        this.assValues = assessments;
      })
      .catch(err => { console.log(err); });
      */
    this.retrieveAssessments();

  }

  retrieveAssessments = () => {

    Api.getTeamAssessments(this.props.match.params.t_id, this.curAssessment.id)//2nd value is this.curAssessment.ass.id   in physical and technical
      .then(assessments => {
        this.assValues = assessments;
        //console.log('2assValues: ',this.assValues.slice());
      })
      .catch(err => { console.log(err); });
  }

  changeFilter = (type) => {
    this.curType = type;
  }

  linkFunc = (ent) => {

    return `/dashboard/directory/team-management/${this.props.team && this.props.team.id}/leadership/new-assessment/${ent.id}/${this.curCategory && this.curCategory.id}`;
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
        <div className="sports-filter">
          <Select choices={this.categorieNames}
            onSelected={this.onCategory}
            index={this.categorieNames.findIndex(c => c == this.curCategoryName)}/>
        </div>
        <div className="sports-filter">
          <Select choices={this.curAssessmentsNames}
            onSelected={this.onAssessment}
            index={this.curAssessmentsNames.findIndex(c => c == this.curAssessmentName)}/>
        </div>

        {!userIsOrganisation(this.props.user) && <div className="button-group left">
          <h3 className="group-heading">{this.curAssLabel}</h3>
              <div onClick={this.setReadOnly}
                    className="button border icon">
                <span className="btn-text">Assess my team now</span>
              </div>
        </div>}

        <TeamAssessForm readOnly={this.ratingReadOnly}
                        editMode={this.editMode}
                        onCancel={this.onCancel}
                        assValues={this.assValues}
                        assessmentDef={this.curAssessment}
                        linkFunc={this.linkFunc}/>

      </div>

    )
  }
}))
