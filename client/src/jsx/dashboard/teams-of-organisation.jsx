import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {observer, inject} from 'mobx-react'

import ContentCard from './components/content-card'
import AvatarTeam from '../../images/avatar-team.png'

const EmptyCard = (props) => (
  <div>
    <h2 className="content-heading text-center">
      Sports is all about team. With your Personal Sport Record you can
      connect with teams and coaches to record the data that maters.
    </h2>
    <div className="team-empty-state text-center">
      <p>Once connected to your team you can: </p>
      <p>1. Get invaluable feedback and data from your coach.</p>
      <p>2. See how you're doing vs. the rest of your team and how you're improving.</p>
    </div>

    <ContentCard forEmpty={true}
                 name="Team Name"
                 tagline="catchphease"
                 themeColor="team-empty"
                 avatar={null}
                 sports={["Sport"]}/>
  </div>
);

export default inject('user')(observer(class TeamsOfOrganisation extends Component {

  constructor() {
    super();
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  renderCards = () => {
    if (!this.props.user) return null;
    if (this.props.user.team_memberships.length) {
      return (
        <div className="group-section">
          <h3 className="group-heading">Private teams</h3>
          {this.renderTeamList(true)}
          <h3 className="group-heading">Public teams</h3>
          {this.renderTeamList(false)}
        </div>
      )
    } else {
      return <EmptyCard/>
    }
  };

  renderTeamList = (is_private) =>
    this.props.user.team_memberships.filter(t => t.is_private === is_private).map(team =>
      <Link to={`/dashboard/directory/team-management/${team.id}/team-directory`} key={team.id}>
        <ContentCard key={team.id}
                     name={team.name}
                     sports={[team.sport]}
                     avatar={team.team_picture_url || AvatarTeam}
                     tagline={team.tagline}
                     season={team.season}
                     themeColor='purple'/>
      </Link>
    );

  render() {
    return (
      <div ref="me">
        <div className="row align-center main-content-container">
          <div className="column content-column">
            {this.renderCards()}
          </div>
        </div>
      </div>
    )
  }
}))
