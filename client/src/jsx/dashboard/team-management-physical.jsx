import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {computed, extendObservable, observe} from 'mobx';
import {inject, observer} from 'mobx-react';

import Api from '../api';
import Select from '../components/select';
import DP from '../utils/data-proc';
import TeamAssessForm from './components/team-assess-form';
import UnitLabel from '../misc/unit-label';
import {getTargetUnit} from '../utils/unit-convert';
import {userIsOrganisation} from "../utils/utils";

export default inject('user', 'assDefs', 'team')(observer(class extends Component {

  constructor() {

    super();
    extendObservable(this,
                     {
                       ratingReadOnly: true,//changes whether or not you can save/edit
                       editMode: false,//changes the level 1-4 dots to edit mode
                       team: computed(() => this.props.team),
                       phyiscalDefs: computed(() => { return DP.getPhysicalDefs(this.props.assDefs); }),
                       categorieNames: computed(() => { return this.phyiscalDefs.map(def => def.name); }),
                       curAssessments: [],
                       curAssessmentsNames: [],
                       curCategory: null,
                       curCategoryName: '',
                       curAssessment: null,
                       curAssessmentName: '',
                       assValues: [],
                       userIsImperial: this.getUserIsImperial(),
                       curAssLabel: this.getCurAssLabel()
                     });
  }

  getCurAssLabel() {
    return computed(() => {
      if (!this.curAssessment) return this.curAssessmentName;

      const curAssessmentUserUnit = this.getCurAssessmentUserUnit();
      const unit = getTargetUnit(curAssessmentUserUnit, this.userIsImperial);
      return `${this.curAssessmentName} - ${UnitLabel[unit]}`;
    });
  }

  getUserIsImperial() {
    return computed(() =>
        this.props.user && this.props.user.measuring_system === 'imperial');
  }

  getCurAssessmentUserUnit() {
    return computed(() => {
      if (!this.curAssessment) return null;

      const curUnit = this.curAssessment.ass.unit;

      if (!this.userIsImperial) return curUnit;
      if (curUnit === 'kg') return 'lbs';
      if (curUnit === 'cm') return 'feet';
      return curUnit;
    })
  };

  componentDidMount() {

    if (this.props.assDefs) {

      this.initializeChoices();
    } else {
      const disposer = observe(this,
                               'phyiscalDefs',
                               change => {

                                 if (change.newValue && change.newValue.length) {
                                   this.initializeChoices();
                                   disposer();
                                 }
                               });
    }
  }

  initializeChoices = () => {

    this.onCategory(this.phyiscalDefs[0].name);
  }

  onCategory = (cat) => {
    this.curCategoryName = cat;
    this.curCategory = this.phyiscalDefs.find(def => def.name == cat);
    if (this.curCategory.is_flat) {

      this.curAssessments = this.curCategory.childs.map(ass =>({ name: ass.name,
                                                                 ass }));
    } else {

      this.curAssessments = this.curCategory.childs.reduce((acc, group) => {

                              acc = acc.concat(group.childs.map(ass => ({
                                      name: `${group.name} - ${ass.name}`,
                                      ass
                                    })));
                              return acc;
                            }, []);
    }
    this.curAssessmentsNames = this.curAssessments.map(a => a.name);
    this.onAssessment(this.curAssessmentsNames[0]);
  }

  onAssessment = (assName) => {

    this.curAssessmentName = assName;
    this.curAssessment = this.curAssessments.find(a => a.name == assName);
    
    this.retrieveAssessments();
  }

  changeFilter = (type) => {
    this.curType = type;
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

    return `/dashboard/directory/team-management/${this.team && this.team.id}/physical-competence/new-assessment/${ent.id}/${this.curCategory && this.curCategory.id}`;
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
                        assessmentDef={this.curAssessment && this.curAssessment.ass}
                        userIsImperial={this.userIsImperial}
                        linkFunc={this.linkFunc}/>

      </div>

    )
  }
}))
