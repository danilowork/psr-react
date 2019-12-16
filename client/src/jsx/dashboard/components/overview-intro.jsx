import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {computed, extendObservable} from 'mobx';
import {inject, observer} from 'mobx-react';
import TechnicalTacticalPreview from '../../../images/technical-tactical-skills-preview.png';
import MyStatusPreview from '../../../images/my-status-preview.png';
import PhysicalPreview from '../../../images/physical-preview.png';
import LeadershipPreview from '../../../images/leadership-preview.png';
import MovementPreview from '../../../images/movement-preview.png';
import TeamPreview from '../../../images/team-preview.png';

export default inject('user', 'assDefs', 'assessments')(observer(class extends Component {

  constructor(props) {
    super(props);

    extendObservable(this, {
      user: computed(() => this.props.user),
      page: 1,
      maxPage: computed(() => 6),
    });
  }

  setPage = (page) => {
    this.page = page;
  };

  getPage = (leftColSize, rightColSize, text, image, className) => {
    return (
      <div className="row intro-card-row">
        <div className={`large-${leftColSize} small-12 column`}>
          <p className="intro-card-text text-left" dangerouslySetInnerHTML={{__html: text}} />
        </div>
        <div className={`large-${rightColSize} small-12 column`}>
          <div className={`overview-preview-image ${className}`}
               style={{background: 'url(' + (image) + ') #fff no-repeat center center'}}>
          </div>
        </div>
      </div>
    );
  };

  getPageContent() {
    return {
      1: this.getPage1,
      2: this.getPage2,
      3: this.getPage3,
      4: this.getPage4,
      5: this.getPage5,
      6: this.getPage6,
    }[this.page]();
  }

  getPage1 = () => {
    const text = `To get started, the first thing to do is to join your coach & team so they can assess your skills.
      You can see all your sports related <strong>Technical</strong> Competence assessments from that tab
      in your dashboard.`;

    return this.getPage(7, 5, text, TechnicalTacticalPreview, 'technical-tactical-preview');
  };

  getPage2 = () => {
    const text = `One piece of key data you can share with your coach is in <strong>My Status</strong>.
      By sharing how you're doing before your next game or major event, you and your coach can start to
      understand how to best prepare for those big games and milestones.`;

    return this.getPage(6, 6, text, MyStatusPreview, 'my-status-preview');
  };

  getPage3 = () => {
    const text = `In your <strong>Physical</strong> Competence area you can see how you're doing for the basics like your
      speed, strength, power, and endurance.`;

    return this.getPage(6, 6, text, PhysicalPreview, 'physical-preview');
  };

  getPage4 = () => {
    const text = `One of the things that is just important in sports is not just what happens in the box score.&nbsp;
      <strong>Leadership</strong> is your key measurements about your connection, character and confidence.`;

    return this.getPage(7, 5, text, LeadershipPreview, 'leadership-preview');
  };

  getPage5 = () => {
    const text = `<strong>Fundamental Movement Skills</strong> are the building blocks of all your sport and physical
      skills. Everything from catching to throwing. We rate these with a simple initial to Emerging to
      Competent to Proficient metric scoring system.`;

    return this.getPage(7, 5, text, MovementPreview, 'movement-preview');
  };

  getPage6 = () => {
    const text = `The <strong>Team</strong> section is where you can keep track of what team's you belong to. 
      And in the future we'll be unlocking more team related functionality.`;

    return this.getPage(6, 6, text, TeamPreview, 'team-preview');
  };

  getNavDots() {
    const items = Array.from(Array(this.maxPage), (_, i) =>
      <li key={i + 1}
          className={this.page === i + 1 ? 'active' : null}>
        <a onClick={this.setPage.bind(this, i + 1)} />
      </li>);

    return (
      <div className="table">
        <div className="cell">
          <ul className="dots">{items}</ul>
        </div>
      </div>
    );
  }

  getPrevLink() {
    if (this.page > 1)
      return <a className="theme expanded intro-card-nav-prev-link"
                onClick={this.setPage.bind(this, this.page - 1)}>Previous</a>;
  }

  getNextLink() {
    if (this.page === this.maxPage)
      return <a className="button theme expanded intro-card-nav-link"
                onClick={this.setPage.bind(this, 1)}>Start over</a>;

    return <a className="button theme expanded intro-card-nav-link"
              onClick={this.setPage.bind(this, this.page + 1)}>Next</a>;
  }

  render() {
    const userName = (this.user && this.user.first_name) ? this.user.first_name : '';
    const pageContent = this.getPageContent();

    return (
      <div className="column content-column">
        <h2 className="content-heading">
          {`Hi ${userName}! Your Overview gives you a glimpse of all your latest activity within Personal Sport Record.`}
        </h2>

        <div className="group-section">
          <div className="card intro-card">
            <h1>Welcome to Personal Sport Record</h1>

            {pageContent}

            <div className="row intro-card-nav">
              {this.getPrevLink()}
              {this.getNextLink()}

              <div className="block-divider" />
              {this.getNavDots()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}));
