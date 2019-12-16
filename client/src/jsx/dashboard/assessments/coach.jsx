import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { computed, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'

import UtilBar from '../../components/util-bar'
import Api from '../../api'
import PerfLevel14 from '../components/performance-level'
import DP from '../../utils/data-proc'
import SaveConfirmation from '../../components/save-confirmation'
import InfoPopupLeadership from '../components/info-popup-leadership'
import InfoPopupDescription from '../components/info-popup-description'
import { AssessmentButton } from '../../dashboard-new/components/buttons'
import { Column, Header, HeaderH1, HeaderP, ButtonGroup, Legend } from '../components/styled'

class CoachAss extends Component {

  constructor() {
    super();
    extendObservable(this, {
      user: computed(() => this.props.user),
      categories: computed(() => ['Connection', 'Character']),
      coach: computed(() => this.getCoach()),
      withAss: false,
      mentalDefs: computed(() => this.getMentalDefs()),
      mentalChoices: computed(() => this.mentalDefs.length ? this.mentalDefs[0].childs.map(def => def.name) : []),
      athleteCoachAssessments: computed(() => this.getAthleteCoachAssessments(this.mentalDefs)),
      curDefs: computed(() => this.getCurDefs()),
      title: 'New Assessment',
      isValidationErr: false,
      apiMsg: null,
      isNewDashboard: computed(() => !!this.props.coachId),
    });

    this.onCancel = this.onCancel.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  getMentalDefs() {
    const date = (this.props.match && this.props.match.params && this.props.match.params.date) || null;
    return DP.getMentalDefs(
      this.props.assDefs,
      this.props.assessments,
      this.withAss,
      date);
  }

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)).foundation();

    this.validateAthleteCoachAssessmentTimeout();
  }

  // Validate if the athlete is able to assess the coach according to `ATHLETE_COACH_ASSESSMENT_TIMEOUT`
  validateAthleteCoachAssessmentTimeout() {
    const dummyData = {
      assessor_permission: 'read_write',
      dry_run: true,
    };

    Api.newAssessments([dummyData], this.coach.id)
      .catch(err => {
        try {
          this.apiMsg = err.responseJSON.rejected[0].error;
        } catch (e) {
        }
        this.refs.saveConfirmation.showApiError();
        $('#save-confirmation').foundation('open');
      });
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  onSave(e) {
    e.preventDefault();
    $('#save-confirmation').foundation('open');

    let newAss = [];
    this.curDefs.childs.forEach(item => newAss.push(...item.childs.filter(child => child.modified)));

    if (newAss && newAss.length) {
      this.isValidationErr = false;
      const payload = newAss.map(s => ({
        assessment_id: s.id,
        assessor_permission: 'read_write',
        value: '' + s.level,
      }));

      Api.newAssessments(payload, this.coach.id)
        .then(result => {
          this.refs.saveConfirmation.showConfirmation();
          this.props.refreshAssessment();
        }).catch(err => {
        console.log(err);
        try {
          this.apiMsg = err.responseJSON.rejected[0].error;
        } catch (e) {
        }
        this.refs.saveConfirmation.showApiError();
        $('#save-confirmation').foundation('open');
      });

    } else {
      this.isValidationErr = true;
      this.refs.saveConfirmation.showValidationError();
    }
  };

  onClose = () => {
    if (this.isValidationErr) return;
    this.onCancel();
  };

  getCurDefs() {
    if (!this.athleteCoachAssessments || !this.athleteCoachAssessments.length) return [];

    const res = this.athleteCoachAssessments.filter(
      item => item.childs.filter(
        child => this.categories.indexOf(child.name) !== -1));

    return res.length ? res[0] : [];
  }

  getCoach() {
    const user = this.user;
    const coachId = parseInt(this.props.coachId || this.props.match.params.coach_id, 10);
    return user && user.linked_users.find(lu => lu.id === coachId);
  }

  onCancel = (e) => {
    if (e) e.preventDefault();

    if (this.isNewDashboard) {
      this.props.history.push(`/dashboard`);
    } else {
      this.props.history.push('/dashboard/overview');
    }
  };

  getAthleteCoachAssessments(parentChilds, parentItem) {
    if (!parentChilds) return [];

    const filteredChilds = parentChilds.reduce((filtered, item) => {
      if (item.childs) {
        filtered.push(this.getAthleteCoachAssessments(item.childs, item));
      } else if (item.relationship_types.find(x => x.type === 'athlete_coach')) {
        filtered.push(item);
      }
      return filtered;
    }, []);

    if (parentItem) {
      parentItem.childs = filteredChilds;
      return parentItem;
    }
    return filteredChilds;
  }

  getCategories() {
    return this.categories.map(category => {
      const curDef = this.athleteCoachAssessments &&
      this.athleteCoachAssessments[0] &&
      this.athleteCoachAssessments[0].childs ?
        this.athleteCoachAssessments[0].childs.find(a => a.name === category) : null;

      return (
        <div key={category}>

          {/* Category title */}
          <Legend isNewDashboard={this.isNewDashboard}
                  className="skillset-heading">{category}
            <span className="psr-icons icon-info" data-open="info-popup-leadership"/>
          </Legend>

          {/* Category assessments */}
          {curDef ? <ul className="no-bullet">
            {curDef.childs.map((skill, idx) =>
              <PerfLevel14 skill={skill}
                           key={skill.id}
                           idx={idx}
                           isNewDashboard={this.isNewDashboard}
                           readonly={this.props.readonly}
                           infoDescription={true}/>,
            )}
          </ul> : null}
        </div>);
    });
  }

  renderUtilBar = () =>
    !this.isNewDashboard &&
    <UtilBar title={this.title}
             onCancel={this.onCancel}
             onSave={this.onSave}
             readonly={false}/>;

  renderHeader = () =>
    !!this.isNewDashboard &&
    <Header isNewDashboard={this.isNewDashboard}>
      <HeaderH1 isNewDashboard={this.isNewDashboard}>{this.props.coachName}</HeaderH1>
      <HeaderP isNewDashboard={this.isNewDashboard}>
        Fill out the assessment sheet to track the progress and visualize it on our graphs
      </HeaderP>
    </Header>;

  renderFormButtons = () => {
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
            <form>
              {/* Into */}
              {this.user && <div>
                <Legend isNewDashboard={this.isNewDashboard}
                        className="skillset-heading athlete-coach-header">
                  {`${this.coach.first_name} ${this.coach.last_name}'s leadership assessment`}
                </Legend>
                <Header isNewDashboard={this.isNewDashboard}>
                  <HeaderP isNewDashboard={this.isNewDashboard}>
                    Assessing your coaches is completely annonymous.
                    Your honest feedback will help them progress in their role.
                  </HeaderP>
                </Header>
              </div>
              }
              {this.getCategories()}
              {this.renderFormButtons()}
            </form>
          </Column>
        </div>

        <InfoPopupLeadership/>
        <InfoPopupDescription/>
        <SaveConfirmation userType={this.props.user ? this.props.user.user_type : ''}
                          msg="New assessment has been created successfully."
                          validationMsg="Please make sure you have made an assessment to at least one item."
                          apiMsg={this.apiMsg}
                          noAutoPopup={true}
                          onClose={this.onClose}
                          ref="saveConfirmation"/>
      </div>
    );
  }

}

export default inject('user', 'assDefs', 'assessments', 'refreshAssessment')(observer(CoachAss));
