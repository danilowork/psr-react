import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {extendObservable, computed, observe} from 'mobx'
import {observer} from 'mobx-react'



class Performance14 extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { originalLevel: computed(() => this.props.skill.level),
                       isEditable: computed(() => this.props.editMode),
                       lastLevelSet: '',
                       clPerfLevel1: "perf-level-unreached",
                       clPerfLevel2: "perf-level-unreached",
                       clPerfLevel3: "perf-level-unreached",
                       clPerfLevel4: "perf-level-unreached" });
  }

  componentDidMount() {

    if (this.originalLevel) {

      this.setLevel(this.props.skill.level);

    } else {

      observe(this,
              'originalLevel',
              change => {
                //if (change.newValue) {//this can be 0 so it won't be true
                  //console.log('change originalLevel');
                  //console.log(this.props);
                  this.setLevel(this.props.skill.level);
                //}
              });

      observe(this,
              'isEditable',//name this better so it doesn't sound the same as readonly
              change => {
                console.log('change isEditable');
                // remove the level if it's set
                //console.log('first',this.props.skill);
                this.props.skill.modified = false;
                delete this.props.skill.level;
                //console.log('second',this.props.skill);

                if (change.newValue) {


                  for (var i = 1; i <= this.lastLevelSet; i++) {
                    this["clPerfLevel" + i] = "ghost perf-level" + i;
                  }
                  for (i = this.lastLevelSet + 1; i < 5; i++) {
                    this["clPerfLevel" + i] = "perf-level-unreached";
                  }
                }
              });
    }
  }

  componentWillReceiveProps(){
    
    //set after new props have come through so there will be a placeholder for edit mode
    this.lastLevelSet = this.props.skill.level;
    //console.log('this.lastLevelSet = this.props.skill.level;',this.lastLevelSet);

  }

  updateLevel = level => {
    console.log('updateLevel()');

    if (this.props.readOnly) return;
    //if (this.props.readOnly && !this.props.editMode) return;
    //if (this.props.readOnly)
      //this.setLevel(0);


      this.setLevel(level);
    
  }

  setLevel = level => {


    if (level > 0){
      
      this.props.skill.level = level;

      if (level != this.originalLevel) {
        this.props.skill.modified = true;
      } else {
        this.props.skill.modified = false;
      }
    
    }


    for (var i = 1; i <= level; i++) {
      this["clPerfLevel" + i] = "perf-level" + i;
    }
    for (i = level + 1; i < 5; i++) {
      this["clPerfLevel" + i] = "perf-level-unreached";
    }
  }

  render() {


      return (
        <div className={"perf-wrap" + (this.props.readOnly ? " readonly" : "")}>
          <span className={"perf-level " + this.clPerfLevel1} onClick={() => this.updateLevel(1)}></span>
          <span className={"perf-level " + this.clPerfLevel2} onClick={() => this.updateLevel(2)}></span>
          <span className={"perf-level " + this.clPerfLevel3} onClick={() => this.updateLevel(3)}></span>
          <span className={"perf-level " + this.clPerfLevel4} onClick={() => this.updateLevel(4)}></span>
        </div>
      )



  }
}

export default observer(Performance14)
