import React, { Component } from 'react'
import { observer } from 'mobx-react'

import LevelComponent from './level-component'
import { Label, RatingRow } from '../components/styled'

class Performance14 extends Component {

  constructor() {
    super();
  }

  infoClicked = (ev) => {
    $('#physical-video').attr('src', this.props.video);
  };

  infoDescriptionClicked = (data) => {
    //uses legend 1-4 star rating popup and adds title and description
    //only in leadership(mental) section so far
    $("#info-popup-default-title").hide();
    $('#info-popup-title-content').text(data.name).show();
    $('#info-popup-description-content').html('<p>' + data.description + '</p>').show();
  };

  render() {
    return (
      <RatingRow className="row rating-row"
                 isNewDashboard={this.props.isNewDashboard}
                 idx={this.props.idx}
                 key={this.props.skill.name}>
        <div className="small-6 column">
          <Label isNewDashboard={this.props.isNewDashboard}>
            {this.props.skill.name}
            {
              //info icon for 1-4 rating legend popup with video
              this.props.video ?
                <span className="psr-icons icon-info"
                      data-open="info-popup-technical-physical-with-video"
                      onClick={this.infoClicked}/> : null}

            {
              //info icon for metric definition
              this.props.infoDescription && this.props.infoDescription !== true ?
                <span className="psr-icons icon-info"
                      data-open="info-popup-description"
                      onClick={() => this.infoDescriptionClicked(this.props.skill)}/> : null}

            {
              //info icon for metric definition and 1-4 rating legend combined
              //this.props.descriptionWithRatings passed as true
              this.props.infoDescription && this.props.infoDescription === true ?
                <span className="psr-icons icon-info"
                      data-open="info-popup-leadership"//will need to be changed if this approach is used on other sections
                      onClick={() => this.infoDescriptionClicked(this.props.skill)}/> : null}
          </Label>
        </div>
        <div className="small-6 column text-right">
          <LevelComponent skill={this.props.skill} readOnly={this.props.readOnly} editMode={this.props.editMode}/>
        </div>
      </RatingRow>
    )
  }
}

export default observer(Performance14)
