import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Link, RouteComponentProps } from 'react-router-dom'
import { computed } from 'mobx'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'

import { User } from '../data-types'
import { slugify } from '../utils/utils';
import TechnicalAssessment from '../dashboard/assessments/technical'
import PhysicalAssessment from '../dashboard/assessments/physical'
import MentalAssessment from '../dashboard/assessments/mental'
import AddStatus from '../dashboard/add-status'
import { Button, ButtonGroup } from './components/buttons'
import DP from '../utils/data-proc'
import CoachAssessment from '../dashboard/assessments/coach'
import { MainContentSectionWithSidebar } from '../components-new/section'
import GenericPopup from './components/generic-popup'
import Api from "../api";

interface CardProps {
  withPadding: boolean,
}

const Card = styled.div`
  margin-bottom: 40px;
  border: 1px solid #d5dce4;
  padding: ${(props: CardProps) => props.withPadding ? '13px 10px 35px 20px;' : '13px 0 35px 0'};
  width: ${(props: CardProps) => props.withPadding ? '100' : '78'}%;`;

const Header = styled.h3`
  color: black;
  font-size: 2.2rem;`;

const HeaderHelpText = styled.p`
  color: black;
  font-size: 1.1rem;`;

const BreadcrumbsGroup = styled.div`
  margin: 10px 0 20px 0;
  padding: 10px 10px 25px 0;
  font-size: 1.15rem;`;

const BreadcrumbsItem = styled(Link)`
  color: #26a7ef;`;

interface AssessStepperProps extends RouteComponentProps<{}> {
  user: User,
  sidebarStatus: any,
  assDefs: any,
  assessments: any,
  match: any,
}

@inject('user', 'assDefs', 'assessments')
@observer
class Assess extends Component<AssessStepperProps, {}> {
  private me: any;

  CATEGORIES = {
    STATUS: { 'path': 'status', 'label': 'Status' },
    TECHNICAL: { 'path': 'technical', 'label': 'Technical' },
    PHYSICAL: { 'path': 'physical', 'label': 'Physical' },
    LEADERSHIP: { 'path': 'leadership', 'label': 'Leadership' },
    COACH: { 'path': 'coach', 'label': 'Assess a Coach' },
  };

  PRE_COMPETE_ID = -1;

  constructor(props: any) {
    super(props);
    this.me = null;
  }

  componentWillMount() {
    if (window.location.pathname.endsWith(`/assess/${this.CATEGORIES.STATUS.path}`)) {
      this.props.history.push(`${window.location.pathname}/pre-competiton-status`);
    }
  }

  @computed get categorySlug() {
    try {
      return this.props.match.params.step1;
    } catch (e) {}
  }

  @computed get sportSlug() {
    try {
      const params = this.props.match.params;
      return params.step1 === this.CATEGORIES.TECHNICAL.path ? params.step2 : null;
    } catch (e) {}
  }

  @computed get assSlug() {
    try {
      const params = this.props.match.params;
      if (params.step1 === this.CATEGORIES.TECHNICAL.path) return params.step3;
      return params.step2;
    } catch (e) {}
  }

  @computed get user() {
    return this.props.user;
  }

  @computed get assDefs() {
    return this.props.assDefs;
  }

  @computed get sports() {
    return this.user.chosen_sports;
  }

  @computed get linkedUsersBySlug() {
    return this.user.linked_users.reduce((acc: any, user: any) => ({
      ...acc,
      [`${user.first_name}-${user.last_name}-${user.id}`]: {
        ...user,
        name: `${user.first_name} ${user.last_name}`,
      }
    }), {});
  }

  @computed get sportsBySlug() {
    return this.slugifyDefs(this.sports);
  }

  @computed get physicalDefsBySlug() {
    return this.slugifyDefs(this.physicalDefs);
  }

  @computed get mentalDefsBySlug() {
    return this.slugifyDefs(this.mentalDefs);
  }

  // {'speed-skating': {'bc-speed-skating': { id, name, is_flat, description, ... }}}
  @computed get assessmentsBySportSlugByAssSlug() {
    if (!this.assDefs) return {};
    return this.assDefs.reduce((sportAcc: any, sport: any) => ({
      ...sportAcc,
      [slugify(sport.name)]: sport.childs.reduce((assAcc: any, ass: any) => ({
        ...assAcc,
        [slugify(ass.name)]: ass,
      }), {})
    }), {})
  }

  @computed get physicalDefs() {
    return DP.getPhysicalDefs(
      this.props.assDefs,
      this.props.assessments,
      false,
      this.props.match.params.date)
  }

  @computed get mentalDefs() {
    const defs = DP.getMentalDefs(
      this.props.assDefs,
      this.props.assessments,
      false,
      this.props.match.params.date);

    return defs.length ? defs[0].childs : []
  }

  componentDidMount() {
    // @ts-ignore
    $(ReactDOM.findDOMNode<HTMLDivElement>(this.refs['me'])).foundation();
    $('.reveal-overlay').css('background-color', 'rgba(0, 0, 0, 0)');
    Api.getPreCompitionAss()
      .then(preCompitions => {
        if (!preCompitions.length) return;
        const preCompete = preCompitions[0];
        this.PRE_COMPETE_ID = preCompete.id;
      })
  }

  slugifyDefs(defs: any) {
    if (!defs) return {};
    return defs.reduce((acc: any, def: any) => ({
      ...acc,
      [slugify(def.name || def.sport)]: def,
    }), {});
  }

  renderButtons = () => {
    if (!this.categorySlug) return this.renderCategoryButtons();
    if (this.categorySlug === this.CATEGORIES.TECHNICAL.path && !this.sportSlug) return this.renderSportButtons();

    if (!this.assSlug) {
      const mapCategoryToAssessmentButtons = {
        [this.CATEGORIES.TECHNICAL.path]: this.renderTechnicalAssessmentButtons,
        [this.CATEGORIES.PHYSICAL.path]: this.renderPhysicalAssessmentButtons,
        [this.CATEGORIES.LEADERSHIP.path]: this.renderLeadershipAssessmentButtons,
        [this.CATEGORIES.COACH.path]: this.renderCoachListAssessmentButtons,
      };
      const renderFunc = mapCategoryToAssessmentButtons[this.categorySlug];
      if (renderFunc) return renderFunc();
    }
  };

  goToLink = (link: string) => this.props.history.push(link);

  onButtonClick = (link: string) => {
    if (link.endsWith(`/${this.CATEGORIES.STATUS.path}`))
      return this.gotoAddNewStatus();
    return this.goToLink(link)
  };

  renderCategoryButtons = () => {
    const mapUserToButtons = {
      'athlete': [
        this.CATEGORIES.STATUS,
        this.CATEGORIES.TECHNICAL,
        this.CATEGORIES.PHYSICAL,
        this.CATEGORIES.LEADERSHIP,
        this.CATEGORIES.COACH,
      ],
      'coach': []
    };
    const buttonData = mapUserToButtons[this.user.user_type];
    return buttonData.map((button: any) => {
      const link = `${window.location.pathname}/${button.path}`;
      return <Button key={button.path}
                     onClick={this.onButtonClick.bind(this, link)}>
        {button.label}
      </Button>
    })
  };

  renderDefButtons = (defsBySlug: any) =>
    Object.keys(defsBySlug).map((slug: any) => {
      const link = `${window.location.pathname}/${slug}`;
      const name = defsBySlug[slug].name || defsBySlug[slug].sport;
      return <Button key={slug}
                     onClick={() => this.props.history.push(link)}>
        {name}
      </Button>
    });

  renderSportButtons = () =>
    this.renderDefButtons(this.sportsBySlug);

  renderPhysicalAssessmentButtons = () =>
    this.renderDefButtons(this.physicalDefsBySlug);

  renderLeadershipAssessmentButtons = () =>
    this.renderDefButtons(this.mentalDefsBySlug);

  renderCoachListAssessmentButtons = () =>
    this.renderDefButtons(this.linkedUsersBySlug);

  getCleanedAssName = (assName: string, sportName: string) =>
    assName.replace(new RegExp(`^${sportName}: `), '');

  renderTechnicalAssessmentButtons = () => {
    const sportAssBySlug = this.assessmentsBySportSlugByAssSlug[this.sportSlug] || {};
    const sportName = (this.sportsBySlug[this.sportSlug] || {}).sport;

    return Object.keys(sportAssBySlug).map((assSlug: any) => {
      const link = `${window.location.pathname}/${assSlug}`;
      const assName = sportAssBySlug[assSlug].name;
      const cleanedAssName = this.getCleanedAssName(assName, sportName);
      return <Button key={assSlug}
                     onClick={() => this.props.history.push(link)}>
        {cleanedAssName}
      </Button>
    })
  };

  makeCrumb = ({ path, label, type }: { path: string, label: string, type: string }) => ({ path, label, type });

  renderBreadcrumbs = () => {
    let crumbs = [];
    const sport = this.sportsBySlug[this.sportSlug];
    const technicalAssessment = this.sportSlug && this.assSlug ?
      this.assessmentsBySportSlugByAssSlug[this.sportSlug][this.assSlug] : null;
    const physicalAssessment = this.physicalDefsBySlug[this.assSlug];
    const leadershipAssessment = this.mentalDefsBySlug[this.assSlug];
    const linkedUsers = this.linkedUsersBySlug[this.assSlug];

    // Make category crumb
    if (this.categorySlug) {
      const catKey = Object.keys(this.CATEGORIES).find(key => this.CATEGORIES[key].path === this.categorySlug);
      if (catKey) crumbs.push(this.makeCrumb({
        label: this.CATEGORIES[catKey].label,
        type: 'Category',
        path: '',
      }));
    }

    // Make sport crumb
    if (this.sportSlug) {
      if (sport) crumbs.push(this.makeCrumb({
        path: `/${this.categorySlug}`,
        label: sport.sport,
        type: 'Sport',
      }))
    }

    // Make assessment crumb
    if (this.assSlug) {
      if (technicalAssessment) {
        crumbs.push(this.makeCrumb({
          path: `/${this.categorySlug}/${this.sportSlug}`,
          label: this.getCleanedAssName(technicalAssessment.name, sport.sport),
          type: 'Assessments',
        }))
      }
      else if (physicalAssessment) crumbs.push(this.makeDefCrumb(physicalAssessment.name));
      else if (leadershipAssessment) crumbs.push(this.makeDefCrumb(leadershipAssessment.name));
      else if (linkedUsers) crumbs.push(this.makeDefCrumb(linkedUsers.name));
      else if (window.location.pathname.endsWith(this.CATEGORIES.STATUS.path)) crumbs.push(this.makeDefCrumb('Pre-Competiton Status'));
    }

    // Render built crumbs
    return <BreadcrumbsGroup>{crumbs.map(crumb => {
      const slash = crumb.type === 'Assessments' ? '' : ' / ';
      return <BreadcrumbsItem key={crumb.path} to={`/dashboard/assess${crumb.path}`}>
        {`${crumb.type} (${crumb.label})${slash}`}
      </BreadcrumbsItem>
    })}</BreadcrumbsGroup>
  };

  gotoAddNewStatus = () => {
    if(this.PRE_COMPETE_ID >= 0) {
      $('#generic-popup').foundation('open');
    } else {
      this.props.history.push('/dashboard/assess/status/pre-competiton-status')
    }
  };

  makeDefCrumb = (assessmentName: string) =>
    this.makeCrumb({
      path: `/${this.categorySlug}`,
      label: assessmentName,
      type: 'Assessments',
    });

  renderHeader = () => {
    let text = null;

    if (!this.categorySlug) text = 'What do you want to assess?';
    else if (this.categorySlug === this.CATEGORIES.STATUS.path) return;
    else if (this.categorySlug === this.CATEGORIES.COACH.path && !this.assSlug) text = 'My Coaches';
    else if (!this.sportSlug && this.categorySlug === this.CATEGORIES.TECHNICAL.path) text = 'Sports';
    else if (!this.assSlug) text = 'Assessments';

    if (text) return <Header>{text}</Header>
  };

  renderHeaderHelpText = () => {
    let text = null;

    if (!this.categorySlug) text = 'Pick a category';
    else if (this.categorySlug === this.CATEGORIES.STATUS.path) return;
    else if (this.categorySlug === this.CATEGORIES.COACH.path && !this.assSlug) text = 'Pick a coach to assess';
    else if (!this.sportSlug && this.categorySlug === this.CATEGORIES.TECHNICAL.path) text = 'Pick your sport';
    else if (!this.assSlug) text = 'Pick your assessment';

    if (text) return <HeaderHelpText>{text}</HeaderHelpText>
  };

  renderForm = () => {
    if (this.categorySlug === this.CATEGORIES.TECHNICAL.path) {
      const sport = this.sportsBySlug[this.sportSlug];
      const technicalAssessment = this.assessmentsBySportSlugByAssSlug[this.sportSlug][this.assSlug];
      return <TechnicalAssessment history={this.props.history}
                                  assessmentId={technicalAssessment.id}
                                  cleanedAssName={this.getCleanedAssName(technicalAssessment.name, sport.sport)}
                                  sportId={sport.sport_id}/>
    }
    if (this.categorySlug === this.CATEGORIES.PHYSICAL.path) {
      const physicalAssessment = this.physicalDefsBySlug[this.assSlug];
      return <PhysicalAssessment history={this.props.history}
                                 assessmentId={physicalAssessment.id}
                                 assessmentName={physicalAssessment.name}/>
    }
    if (this.categorySlug === this.CATEGORIES.LEADERSHIP.path) {
      const leadershipAssessment = this.mentalDefsBySlug[this.assSlug];
      return <MentalAssessment history={this.props.history}
                               assessmentId={leadershipAssessment.id}
                               assessmentName={leadershipAssessment.name}/>
    }
    if (this.categorySlug === this.CATEGORIES.COACH.path) {
      const coach = this.linkedUsersBySlug[this.assSlug];
      return <CoachAssessment history={this.props.history}
                              coachId={coach.id}
                              coachName={coach.name}/>
    }
    if (this.categorySlug === this.CATEGORIES.STATUS.path) return <AddStatus history={this.props.history}
                                                                             isNewDashboard={true}/>
  };

  renderCardBody = () => {
    // Render either navigation buttons with categories
    const navButtons = this.renderButtons();
    if (navButtons) return <ButtonGroup>{navButtons}</ButtonGroup>;

    // .. or assessment adding form
    return this.renderForm()
  };

  render() {
    const cardWithPadding = !this.assSlug;
    return <MainContentSectionWithSidebar expanded={true}
                                          ref="me">
      {this.renderBreadcrumbs()}
      <Card withPadding={cardWithPadding}>
        {this.renderHeader()}
        {this.renderHeaderHelpText()}
        {this.renderCardBody()}
      </Card>
      <GenericPopup msg="Adding a new Pre-Competition Assessment will then show up as your new current Assessment in your dashboard."
                    confirmLink={`/dashboard/assess/${this.CATEGORIES.STATUS.path}/pre-competiton-status`}
                    confirmBtnText="Let's Go"
                    declineBtnText="No, thanks"/>
    </MainContentSectionWithSidebar>
  }
}

export default Assess;