import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { extendObservable, computed, observe } from 'mobx'
import { observer, inject } from 'mobx-react'
import moment from 'moment'

import UtilBar from '../../components/util-bar'
import Api from '../../api'
import PerfLevelSet from '../components/level14-set'
import SkillSet from '../components/skill-set'
import DP from '../../utils/data-proc'
import Select from '../../components/select'
import SaveConfirmation from '../../components/save-confirmation'
import InfoPopupTechnicalPhysical from '../components/info-popup-technical-physical'
import { AssessmentButton } from '../../dashboard-new/components/buttons'
import { Column, Header, HeaderH1, HeaderP, ButtonGroup, AssLegend } from '../components/styled'

class TechnicalAss extends Component {

  constructor() {
    super();
    extendObservable(this, {
      sport: '',
      curType: 0,
      withAss: false,
      skillSets: computed(() => this.getSkillSets()),
      flattenSkillSet: computed(() => {
        const ss = this.skillSets.reduce((acc, skillSet) => {
          acc = acc.concat(skillSet.skills.slice());
          return acc;
        }, []);
        if (ss.length) {
          this.getHistory(ss[0].assessment_id);
        }
        console.log('flattened', ss);
        return ss;
      }),
      subCategories: computed(() => this.getSubCategories()),
      curSubcategory: '',
      curSubsportId: 0,
      subCategoryChoices: computed(() => {
        return this.subCategories.map(sc => sc.name)
      }),
      title: 'New Assessment',
      readonly: false,
      isValidationErr: false,
      isApiErr: false,
      assessments: [],
      assessmentId: computed(() => this.getAssessment()),
      isNewDashboard: computed(() => !!this.props.assessmentId),
    });
  }

  getAssessment = () =>
    this.isNewDashboard ? this.props.assessmentId : this.props.match.params.a_id;

  getSkillSets() {
    const date = (this.props.match && this.props.match.params && this.props.match.params.date) || null;
    return DP.constructSkillSet(this.props.assDefs,
      this.props.assessments,
      this.sport,
      this.curType,
      this.withAss,
      date)
  }

  getSubCategories() {
    return DP.getSubSports(this.props.assDefs, this.props.user, this.assessmentId)
  }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)).foundation();
    this.curSubsportId = this.isNewDashboard ? this.props.assessmentId : this.props.match.params.sport;
    if (this.curSubsportId) this.onSubCategoriesChange();

    if (this.props.title) {
      this.title = this.props.title;
      if ('History' === this.title) {
        this.withAss = true;
      }
    }
    if (this.props.readonly) {
      this.readonly = this.props.readonly;
    }
    if (this.props.match && this.props.match.params.a_id) {
      Api.retrieveAssessments(this.props.match.params.a_id)
        .then(assessments => this.assessments = assessments)
        .catch(err => console.log(err));
    }
    observe(this, 'subCategories', this.onSubCategoriesChange);
  }

  onSubCategoriesChange = (change) => {
    const cat = this.subCategories.find(sc => sc.id === this.curSubsportId);
    this.curSubcategory = cat && cat.name;
    this.sport = cat && cat.nameTop.toLowerCase();
    this.curType = (cat && cat.indexInTopCat) || this.curType;
  };

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  onSave = (e) => {
    e.preventDefault();
    $('#save-confirmation').foundation('open');

    const allSkills = this.skillSets.reduce((acc, skillSet) => {
      acc = acc.concat(skillSet.childs.slice());
      return acc;
    }, []);
    const newAss = allSkills.filter(s => s.modified);

    if (newAss && newAss.length) {
      this.isValidationErr = false;
      const aId = this.isNewDashboard ? null : this.assessmentId;
      const payload = newAss.map(s => ({
        assessment_id: s.assessment_id || s.id,
        assessor_permission: "read_write",
        value: s.level || parseFloat(s.value)
      }));
      Api.newAssessments(payload, aId)
        .then(result => {
          this.isApiErr = false;
          this.refs.saveConfirmation.showConfirmation();
          this.props.refreshAssessment();
        })
        .catch(err => {
          if (400 === err.status) {
            const errObj = JSON.parse(err.responseText);

            if (errObj.rejected) {
              for (let i = 0; i < errObj.rejected.length; i++) {
                $('.assessment_' + errObj.rejected[i].assessment_id).html(errObj.rejected[i].error).addClass('is-visible');
              }
              console.log(errObj.rejected);
              this.isApiErr = true;
              this.refs.saveConfirmation.showApiError()

            }
          }
        });
    } else {
      this.isValidationErr = true;
      this.refs.saveConfirmation.showValidationError();
    }
  };

  onCancel = (e) => {
    if (e) e.preventDefault();

    if (this.isNewDashboard) {
      this.props.history.push(`/dashboard`);
    } else if ('coach' === this.props.user.user_type) {
      this.props.history.push(
        '/dashboard/directory/athlete-management/' + this.assessmentId + '/' + this.curSubsportId);
    } else {
      this.props.history.push('/dashboard/technical-competence/' + this.curSubsportId);
    }
  };

  onClose = () => {
    if (this.isValidationErr || this.isApiErr) return;
    this.onCancel();
  };

  setSport = (sport) => {
    this.curSubcategory = sport;
    const cat = this.subCategories.find(sc => sc.name === sport);
    this.curSubsportId = cat.id;

    if (cat.nameTop !== this.sport) {
      this.sport = cat.nameTop.toLowerCase();
    }
    const newRoute = 'History' === this.title ? `history/${this.props.match.params.date}` :
      `new-assessment/${this.assessmentId ? this.assessmentId : ''}`;
    history.replaceState(null,
      "",
      `/dashboard/technical-competence/${this.curSubsportId}/${newRoute}`);
    this.curType = cat.indexInTopCat;
  };

  renderAssessor = () => {
    if (!this.skillSets.length || !this.skillSets[0].childs.length) return;
    const assessorId = this.skillSets.length && this.skillSets[0].childs[0].history[0].assessor_id;

    let assessorName = '';
    if (assessorId) {
      if (assessorId === this.props.user.id) {
        assessorName = `${this.props.user.first_name} ${this.props.user.last_name}`;
      } else {
        const assessor = this.props.user.linked_users.find(lu => lu.id === assessorId);
        if (assessor) assessorName = `${assessor.first_name} ${assessor.last_name}`;
      }
    }
    return <p className="text-center">Assessment by {assessorName}</p>
  };

  renderSportsFilter = () => {
    if (this.isNewDashboard) return;

    return <div>
      <h3 className="group-heading">Select your Assessment</h3>
      <div className="sports-filter">
        <Select choices={this.subCategoryChoices}
                onSelected={this.setSport}
                index={this.subCategoryChoices.findIndex(c => c === this.curSubcategory)}/>
      </div>
    </div>
  };

  renderUtilBar = () =>
    !this.isNewDashboard &&
    <UtilBar title={this.title}
             onCancel={this.onCancel}
             onSave={this.onSave}
             readonly={this.readonly}/>;

  renderHeader = () =>
    !!this.isNewDashboard &&
    <Header isNewDashboard={this.isNewDashboard}>
      <HeaderH1 isNewDashboard={this.isNewDashboard}>{this.props.cleanedAssName}</HeaderH1>
      <HeaderP isNewDashboard={this.isNewDashboard}>
        Fill out the assessment sheet to track your progress and visualize it on our graphs
      </HeaderP>
    </Header>;

  renderFormButtons = () => {
    if (this.props.readonly) return null;
    if (!this.isNewDashboard) return <button type="submit"
                                             className="button theme float-right"
                                             onClick={this.onSave}>Save</button>;
    return <ButtonGroup isNewDashboard={this.isNewDashboard}>
      <AssessmentButton onClick={this.onCancel}>Cancel</AssessmentButton>
      <AssessmentButton className="active"
                        onClick={this.onSave}>Save</AssessmentButton>
    </ButtonGroup>
  };

  getColClass = () => `column ${this.isNewDashboard ? '' : 'content-column'}`;

  render() {
    return (
      <div className="assess" ref="me">
        {this.renderUtilBar()}
        <div className="row align-center main-content-container">
          <Column className={this.getColClass()}
                  isNewDashboard={this.isNewDashboard}>
            {this.props.readonly ?
              <div>
                {this.props.match.params.date ?
                  <h3 className="section-heading text-center assess-date">
                    {moment(this.props.match.params.date).format('D MMM YYYY')}
                  </h3> : null
                }
                {this.renderAssessor()}
              </div>
              : ''
            }
            {this.renderSportsFilter()}
            {this.renderHeader()}
            <AssLegend className="group-heading text-right"
                       isNewDashboard={this.isNewDashboard}>
              Assessment Legend
              <span className="psr-icons icon-info" data-open="info-popup-technical-physical"/>
            </AssLegend>
            <form>
              {this.skillSets.map((skillSet, idx) => {
                if ('level14' === skillSet.setType) {
                  return <PerfLevelSet levelSet={skillSet}
                                       idx={idx}
                                       isNewDashboard={this.isNewDashboard}
                                       readonly={this.props.readonly}/>
                } else {
                  return <SkillSet key={skillSet.setName}
                                   readonly={this.props.readonly}
                                   skillSet={skillSet}
                                   idx={idx}
                                   isNewDashboard={this.isNewDashboard}
                                   isImperial={false}/>
                }
              })}
              {this.renderFormButtons()}
            </form>
          </Column>
        </div>

        <InfoPopupTechnicalPhysical/>
        <SaveConfirmation userType={this.props.user ? this.props.user.user_type : ""}
                          msg="New assessment has been created successfully."
                          apiMsg="The format of some fields are not correct, please enter in valid form and submit again."
                          validationMsg="Please make sure you have made an assessment to at least one item."
                          noAutoPopup={true}
                          onClose={this.onClose}
                          ref="saveConfirmation"/>
      </div>
    )
  }
}

export default inject('user', 'assDefs', 'assessments', 'refreshAssessment')(observer(TechnicalAss))
