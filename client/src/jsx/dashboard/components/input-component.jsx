import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {extendObservable, computed, observe} from 'mobx'
import {observer} from 'mobx-react'



class Performance14 extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { originalLevel: computed(() => this.props.skill.level),
                       lastLevelSet: '',
                       isEditable: computed(() => this.props.editMode)
                     });
  }

  componentDidMount() {




    if (this.originalLevel) {

      this.setLevel(this.props.skill.level);

    } else {

      observe(this,
              'originalLevel',
              change => {
                //if (change.newValue) {//this can be 0 so it won't be true
                  console.log('change originalLevel');
                  console.log(this.props);
                  this.setLevel(this.props.skill.level);
                //}
              });

      observe(this,
              'isEditable',//name this better so it doesn't sound the same as readonly
              change => {


                this.props.skill.modified = false;
                delete this.props.skill.level;
                //console.log('second',this.props.skill);


              });
    }






  }

  componentWillReceiveProps(){
    
    //set after new props have come through so there will be a placeholder for edit mode
    this.lastLevelSet = this.props.skill.level;
    //console.log('this.lastLevelSet = this.props.skill.level;',this.lastLevelSet);

  }

  updateLevel = level => {
    //console.log('updateLevel()');
    if (this.props.readOnly) return;
    //if (this.props.readOnly && !this.props.editMode) return;
    //if (this.props.readOnly)
      //this.setLevel(0);


      this.setLevel(level);
    
  }


  setLevel = level => {

    if (level !== ""){
      
      this.props.skill.level = level;

      if (level != this.originalLevel) {
        this.props.skill.modified = true;
      } else {
        this.props.skill.modified = false;
      }
    
    }

  }

  changeLevel = (ev) => {

    console.log("this value",ev.target.value);
    //new level...

      //only allow numbers and two decimal places
    var ex = /^\d*\.?\d{0,2}$/;
    //console.log(ev.target.value,ex.test(ev.target.value));
    if(ex.test(ev.target.value)===false){
      ev.target.value = ev.target.value.substring(0,ev.target.value.length - 1);
    }

    this.updateLevel(ev.target.value);

  }

  render() {

      //where should this go?
      $(".rating-row input").val('');//value doesn't get removed when you change the second sports filter after just editing/entering a value

      let input = null;
      //console.log('this.lastLevelSet',this.lastLevelSet);
      if (this.isEditable) {
        input = <input type="text" className="editable" placeholder={this.lastLevelSet} readOnly={this.props.readOnly} onChange={this.changeLevel} />;
      } else {
        input = <input type="text" placeholder={this.originalLevel} readOnly={this.props.readOnly} />;
      }

      return (
        <div>
        {input}
        </div>        

      )



  }
}

export default observer(Performance14)
