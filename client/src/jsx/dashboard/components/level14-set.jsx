import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'

import PerfLevel14 from './performance-level'

export default observer(class extends Component {

  constructor() {
    super();
    extendObservable(this, {});
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)).foundation();
  }

  render() {
    return (
      <fieldset>
        <legend className="skillset-heading">{this.props.levelSet.setName}
          <span className="psr-icons icon-info" data-open="speed-technical-physical"/>
        </legend>
        <ul className="no-bullet">
          {this.props.levelSet.skills.map((skill, idx) =>
            <PerfLevel14 key={skill.name}
                         idx={idx}
                         isNewDashboard={this.props.isNewDashboard}
                         readOnly={this.props.readOnly}
                         editMode={this.props.editMode}
                         skill={skill}/>)}
        </ul>
      </fieldset>
    )
  }
})
