import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link, RouteComponentProps} from 'react-router-dom'
import {computed, observe, observable} from 'mobx'
import {observer, inject} from 'mobx-react'
import moment from 'moment'

interface HistoryBtnProps extends RouteComponentProps<{}>{
  dates: any
  user: any
  link: string
}

@observer
class HistoryBtn extends Component<HistoryBtnProps, {}> {
  
  @computed get assDates() { return this.props.dates; }

  componentDidMount() {

    const date = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const self = this;
    const d = new Date(Date.now());
    const lDate = d.getDate();
    const lMonth = d.getMonth();
    const lYear = d.getFullYear();
    const startDate = lYear + '-' + (lMonth+1) + '-' + lDate;
    const me: any = $(ReactDOM.findDOMNode(this.refs.calendar)!);
    
    me.datetimepicker({
      format: 'm/d/Y',
      yearStart: 2016,
      yearEnd: year,
      timepicker: false,
      scrollInput: false,
      defaultSelect: false,
      todayButton: false,
      // inline: true,
      startDate: startDate,
      minDate: 0,
      maxDate: 0,
      allowDates: self.props.dates,
      formatDate: 'Y-m-d',
      onGenerate:function(ct: any){
        const clName = "history " + (self.props.user ? self.props.user.user_type : "");
        $(this).addClass(clName);
        $("td[data-date=" + lDate + "][data-month=" + lMonth + "][data-year=" + lYear + "]").addClass('xdsoft_disabled');
        self.props.dates.map((assDate: any, index: number) => {
                               const mDate = moment(assDate);
                               const selector = `td[data-date=${mDate.date()}][data-month=${mDate.month()}][data-year=${mDate.year()}]`;
                               $(selector).removeClass('xdsoft_disabled');
                               if (index == self.props.dates.length - 1) {
                                 $(selector).addClass('latest');
                               }
                             });
      },
      onSelectDate: (ct: any) => {
        self.props.history.push(`/dashboard/${self.props.link}/history/${moment(ct).format("YYYY-MM-DD")}`);
      }
    });
  }

  render() {

    return (
      <button className="button border responsive" ref="calendar">
        <span className="psr-icons icon-calender"></span>
        <span className="show-for-large"> History</span>
      </button>
    )
  }
}

export default HistoryBtn