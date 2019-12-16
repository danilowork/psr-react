import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { extendObservable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import UtilBar from '../../components/util-bar'
import Api from '../../api'
import PerfLevel14 from '../components/performance-level'
import DP from '../../utils/data-proc'
import SaveConfirmation from '../../components/save-confirmation'
import Select from '../../components/select'
import InfoPopupLeadership from '../components/info-popup-leadership'
import { AssessmentButton } from '../../dashboard-new/components/buttons'
import { Column, Header, HeaderH1, HeaderP, ButtonGroup, AssLegend, Legend } from '../components/styled'

class MentalAss extends Component {

  constructor() {
    super();
    extendObservable(this, {
      curCategory: 'Connection',
      withAss: false,
      mentalDefs: computed(() => this.getMentalDefs()),
      mentalChoices: computed(() => this.mentalDefs.length ?
        this.mentalDefs[0].childs.map(def => def.name) : []),
      curDef: computed(() => {
        return this.mentalDefs && this.mentalDefs.length ?
          this.mentalDefs[0].childs.find(a => a.name === this.curCategory) :
          null
      }),
      title: 'New Assessment',
      isValidationErr: false,
      assessmentId: computed(() => this.getAssessment()),
      isNewDashboard: computed(() => !!this.props.assessmentId),
    });
  }

  getMentalDefs() {
    const date = (this.props.match && this.props.match.params && this.props.match.params.date) || null;
    return DP.getMentalDefs(
      this.props.assDefs,
      this.props.assessments,
      this.withAss,
      date)
  }

  getAssessment = () =>
    this.isNewDashboard ? this.props.assessmentId : this.props.match.params.catIndex;

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    const catIndex = parseInt(this.props.assessmentId);

    if (catIndex === 1) {
      this.curCategory = 'Character';
    } else if (catIndex === 2) {
      this.curCategory = 'Confidence';
    }

    $(ReactDOM.findDOMNode(this.refs.me)).foundation();

    if (this.props.title) {
      this.title = this.props.title;
      if ('History' === this.title) {
        this.withAss = true;
      }
    }

    $(ReactDOM.findDOMNode(this.refs.me)).foundation();
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  onSave = (e) => {
    e.preventDefault();
    $('#save-confirmation').foundation('open');

    const newAss = this.curDef.childs.filter(s => s.modified);

    if (newAss && newAss.length) {
      this.isValidationErr = false;
      const payload = newAss.map(s => ({
        assessment_id: s.id,
        assessor_permission: "read_write",
        value: "" + s.level
      }));

      const aId = this.isNewDashboard ? null : this.props.match.params.aId;
      Api.newAssessments(payload, aId || this.props.user.id)
        .then(result => {
          this.refs.saveConfirmation.showConfirmation();
          this.props.refreshAssessment();
        })
        .catch(err => {
          console.log(err);
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
      this.props.history.push('/dashboard/directory/athlete-management/' + this.props.match.params.aId + '/leadership');
    } else {
      this.props.history.push('/dashboard/leadership');
    }
  };

  onClose = () => {
    if (this.isValidationErr) return;
    this.onCancel();
  };

  setCategory = category => {
    this.curCategory = category;
  };

  infoClicked = (ev) => {
    $("#info-popup-default-title").show();
    $('#info-popup-title-content').hide();
    $('#info-popup-description-content').hide();
  };

  renderSportsFilter = () => {
    if (this.isNewDashboard) return;

    return <div>
      <h3 className="group-heading">Select your Assessment</h3>
      <div className="sports-filter">
        <Select choices={this.mentalChoices}
                onSelected={this.setCategory}
                index={this.mentalChoices.findIndex(c => c === this.curCategory)}/>
      </div>
    </div>
  };

  renderUtilBar = () =>
    !this.isNewDashboard &&
    <UtilBar title={this.title}
             onCancel={this.onCancel}
             onSave={this.onSave}
             readonly={false}/>;

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

  getColClass = () => `column ${this.isNewDashboard ? '' : 'content-column'}`;

  render() {
    return (
      <div className="assess" ref="me">
        {this.renderUtilBar()}
        <div className="row align-center main-content-container">
          <Column className={this.getColClass()}
                  isNewDashboard={this.isNewDashboard}>
            {this.renderHeader()}
            {this.renderSportsFilter()}
            <AssLegend className="group-heading text-right"
                       isNewDashboard={this.isNewDashboard}>
              Assessment Legend
              <span className="psr-icons icon-info" data-open="info-popup-leadership" onClick={this.infoClicked}/>
            </AssLegend>
            <form>
              <Legend isNewDashboard={this.isNewDashboard}
                      className="skillset-heading">{this.curCategory}
                <span className="psr-icons icon-info"
                      data-open="info-popup-leadership"
                      onClick={this.infoClicked}/>
              </Legend>
              {this.curDef ?
                <ul className="no-bullet">
                  {this.curDef.childs.map((skill, idx) => <PerfLevel14 key={skill.id}
                                                                       idx={idx}
                                                                       isNewDashboard={this.isNewDashboard}
                                                                       skill={skill}
                                                                       readonly={this.props.readonly}
                                                                       infoDescription={true}
                                                                       descriptionWithRatings={true}/>)}
                </ul> : null}
              {this.renderFormButtons()}
            </form>
          </Column>
        </div>

        <InfoPopupLeadership/>

        <SaveConfirmation userType={this.props.user ? this.props.user.user_type : ""}
                          msg="New assessment has been created successfully."
                          validationMsg="Please make sure you have made an assessment to at least one item."
                          noAutoPopup={true}
                          onClose={this.onClose}
                          ref="saveConfirmation"/>
      </div>
    )
  }
}

export default inject('user', 'assDefs', 'assessments', 'refreshAssessment')(observer(MentalAss))
