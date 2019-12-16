import React, {Component} from 'react'
import ReactDOM from 'react-dom'

import Api from '../../api'

class InfoPopup extends Component {
/*
these id's are changed by $.text() when info is clicked:

 id="info-popup-title-content"
 id="info-popup-description-content"
*/
  render() {

    return (
      <div className="reveal assess-info-popup" id="info-popup-description" data-reveal
          data-reset-on-close="true" data-animation-in="fade-in"
          data-animation-out="fade-out">
        

        <h1 className="section-heading" id="info-popup-title-content"></h1>
      
        <button className="close-button" data-close="" aria-label="Close modal" type="button">
         <span aria-hidden="true" className="psr-icons icon-x"></span>
        </button>
        
        
        <div>
          <div className="content-section">
            {/*<h2 id="info-popup-title-content"></h2>*/ }
            <p id="info-popup-description-content"></p>
          </div>

        </div>
        
      </div>
    )
  }
}

export default InfoPopup
