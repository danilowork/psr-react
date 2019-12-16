import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { extendObservable, computed, observe } from 'mobx'
import { observer, inject } from 'mobx-react'

import UtilBar from '../../components/util-bar'
import Api from '../../api'
import PerfLevel14 from '../components/performance-level'
import SkillSet from '../components/skill-set'
import Select from '../../components/select'
import SaveConfirmation from '../../components/save-confirmation'
import InfoPopupTechnicalPhysical from '../components/info-popup-technical-physical'
import InfoPopupTechnicalPhysicalWithVideo from '../components/info-popup-technical-physical-with-video'
import DP from '../../utils/data-proc'
import videoLinks from '../video-links'
import { convertUnits } from '../../utils/unit-convert';
import { AssessmentButton } from '../../dashboard-new/components/buttons'
import { Column, Header, HeaderH1, HeaderP, ButtonGroup, AssLegend } from '../components/styled'

class PhysicalAss extends Component {

  constructor() {
    super();
    extendObservable(this, {
      user: computed(() => this.props.user),
      withAss: false,
      showInfoButton: true,
      physicalDefs: computed(() => this.getPhysicalDefs()),
      physicalChoices: computed(() => {
        return this.physicalDefs ? this.physicalDefs.map(def => def.name) : []
      }),
      curDef: computed(() => {
        return this.physicalDefs.find(a => a.name === this.curCategory)
      }),
      curAssCompType: 'flat14',
      curCategory: 'Physical Skills',
      skills: [],
      title: 'New Assessment',
      readonly: false,
      isImperial: true,
      isValidationErr: false,
      isApiErr: false,
      assessmentId: computed(() => this.getAssessment()),
      isNewDashboard: computed(() => !!this.props.assessmentId),
    });
  }

  getAssessment = () =>
    this.isNewDashboard ? this.props.assessmentId : this.props.match.params.cat_id;

  getPhysicalDefs() {
    const date = (this.props.match && this.props.match.params && this.props.match.params.date) || null;
    return DP.getPhysicalDefs(this.props.assDefs,
      this.props.assessments,
      this.withAss,
      date)
  }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    if (this.props.title) {
      this.title = this.props.title;
      if ('History' === this.title) {
        this.withAss = true;
      }
    }

    if (this.props.readonly) {
      this.readonly = this.props.readonly;
    }
    $(ReactDOM.findDOMNode(this.refs.me)).foundation();

    if (this.assessmentId) {
      if (this.physicalDefs) {
        const pDef = this.physicalDefs.find(a => a.id === this.assessmentId);
        if (pDef) {
          this.setCategory(pDef.name);
        }
      } else {
        const disposer = observe(this,
          'physicalDefs',
          change => {
            if (change.newValue) {
              this.setCategory(this.physicalDefs.find(a => a.id === this.assessmentId).name);
              disposer();
            }
          })
      }
    }
  }

  componentWillReceiveProps() {
    this.user ?
      this.isImperial = this.user.measuring_system === 'imperial' :
      null;
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  onSave = (e) => {
    e.preventDefault();
    $('#save-confirmation').foundation('open');
    const aId = this.isNewDashboard ? null : this.props.match.params.a_id;

    switch (this.curAssCompType) {
      case 'flat14':
        const newAss = this.curDef.childs.filter(s => s.modified);

        if (newAss && newAss.length) {
          this.isValidationErr = false;
          const payload = newAss.map(s => ({
            assessment_id: s.id,
            assessor_permission: "read_write",
            value: "" + s.level
          }));

          Api.newAssessments(payload, aId)
            .then(result => {
              this.isApiErr = false;
              this.props.refreshAssessment();
              this.refs.saveConfirmation.showConfirmation();
            })
            .catch(err => {
              if (400 === err.status) {
                const errObj = JSON.parse(err.responseText);

                if (errObj.rejected) {
                  console.log(errObj.rejected);
                }
              }
            });
        } else {
          this.isValidationErr = true;
          this.refs.saveConfirmation.showValidationError();
        }
        break;

      case 'values':
        const newAssV = this.curDef.childs.reduce((acc, def) => {
          acc = acc.concat(def.childs.slice());
          return acc;
        }, [])
          .filter(ass => ass.modified);

        if (newAssV && newAssV.length) {
          this.isValidationErr = false;

          const payload = newAssV.map(s => {
            let value = 'stars' === s.unit ? s.level : parseFloat(s.value);

            switch (s.unit) {
              case 'cm':
                value = convertUnits(this.isImperial ? 'feet' : 'm', s.unit, value);
                break;
              case 'kg':
                value = convertUnits(this.isImperial ? 'lbs' : 'kg', s.unit, value);
                break;
            }
            return {
              assessment_id: s.id,
              assessor_permission: "read_write",
              value: "" + value
            }
          });

          Api.newAssessments(payload, aId)
            .then(result => {
              this.isApiErr = false;
              this.props.refreshAssessment();
              this.refs.saveConfirmation.showConfirmation();
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
                  this.refs.saveConfirmation.showApiError();

                }
              }
            });
        } else {
          this.isValidationErr = true;
          this.refs.saveConfirmation.showValidationError();
        }
        break;
    }

  };

  onCancel = (e) => {
    if (e) e.preventDefault();

    if (this.isNewDashboard) {
      this.props.history.push(`/dashboard`);
    } else if ('coach' === this.props.user.user_type) {
      this.props.history.push('/dashboard/directory/athlete-management/' + this.props.match.params.a_id +
        '/physical-competence');
    } else {
      this.props.history.push(`/dashboard/physical-competence/${this.assessmentId || ''}`);
    }
  };

  onClose = () => {
    if (this.isValidationErr || this.isApiErr) return;
    this.onCancel();
  };

  onUnitToggle = ev => {
    this.isImperial = !ev.target.checked;
  };

  setCategory = (category) => {
    this.curCategory = category;
    this.setInfoBtn();

    switch (category) {
      case 'Fundamental Movement Skills':
        this.curAssCompType = 'flat14';
        break;
      default:
        this.curAssCompType = 'values';
        break;
    }

  };

  setInfoBtn = () => {
    this.showInfoButton = !(this.curCategory === 'Physical Skills' ||
      this.curCategory === 'Pacific Sport' ||
      this.curCategory === 'Fit Body Bootcamp' ||
      this.curCategory === 'Innovative Fitness');
  };

  renderAssComp = () => {
    if (!this.curDef) return null;

    switch (this.curAssCompType) {
      case 'flat14':
        return <ul className="no-bullet">
          {this.curDef.childs.map((skill, idx) => <PerfLevel14 key={skill.name}
                                                               readonly={this.props.readonly}
                                                               idx={idx}
                                                               isNewDashboard={this.isNewDashboard}
                                                               video={videoLinks.ass[skill.name]}
                                                               skill={skill}/>)}
        </ul>;
      case 'values'://there is a <PerfLevel14 inside of skillset for the 'Functional Movement Screen' section
        //overriding logic that shows info button in  skill-set.jsx
        return this.curDef.childs.map((skill, idx) => <SkillSet key={skill.name}
                                                                readonly={this.props.readonly}
                                                                idx={idx}
                                                                isNewDashboard={this.isNewDashboard}
                                                                skillSet={skill}
                                                                isImperial={this.isImperial}
                                                                infoBtn={this.showInfoButton}/>);
    }
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
      <HeaderH1 isNewDashboard={this.isNewDashboard}>{this.props.assessmentName}</HeaderH1>
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

  renderSportsFilter = () => {
    if (this.isNewDashboard) return;

    return <div>
      <h3 className="group-heading">Select your Assessment</h3>
      <div className="sports-filter">
        <Select choices={this.physicalChoices}
                onSelected={this.setCategory}
                index={this.physicalChoices.findIndex(c => c === this.curCategory)}/>
      </div>
    </div>
  };

  getColClass = () => `column ${this.isNewDashboard ? '' : 'content-column'}`;

  render() {
    return <div ref="me">
      {this.renderUtilBar()}
      <div className="row align-center main-content-container">
        <Column className={this.getColClass()}
                isNewDashboard={this.isNewDashboard}>
          {this.renderHeader()}
          <form>
            <h2 className="section-heading text-center">Physical Skills</h2>
            {this.physicalDefs && 'Fundamental Movement Skills' !== this.curCategory &&
            'History' !== this.title ?
              <div className=" unit-switch-container">
                <div className="switch">
                  <input id="unit-switch"
                         className="switch-input" type="checkbox"
                         name="unit-switch"
                         checked={this.isImperial ? '' : 'checked'}
                         onChange={this.onUnitToggle}/>
                  <label className="switch-paddle" htmlFor="unit-switch">
                    <span className="show-for-sr"/>
                    <span className="switch-active" aria-hidden="true">lb/in</span>
                    <span className="switch-inactive" aria-hidden="true">kg/cm</span>
                  </label>
                </div>
              </div> : null}
            {this.renderSportsFilter()}
            <AssLegend className="group-heading text-right"
                       isNewDashboard={this.isNewDashboard}>
              Assessment Legend
              {this.showInfoButton !== false ?
                <span className="psr-icons icon-info" data-open="info-popup-technical-physical"/> : ''}
            </AssLegend>
            {this.renderAssComp()}
            {this.renderFormButtons()}
          </form>
        </Column>
      </div>

      <InfoPopupTechnicalPhysical/>
      <InfoPopupTechnicalPhysicalWithVideo/>
      <SaveConfirmation userType={this.props.user ? this.props.user.user_type : ""}
                        msg="New assessment has been created successfully."
                        validationMsg="Please make sure you have made an assessment to at least one item."
                        apiMsg="The format of some fields are not correct, please enter in valid form and submit again."
                        noAutoPopup={true}
                        onClose={this.onClose}
                        ref="saveConfirmation"/>
    </div>
  }
}

export default inject('user', 'assDefs', 'assessments', 'refreshAssessment')(observer(PhysicalAss))
