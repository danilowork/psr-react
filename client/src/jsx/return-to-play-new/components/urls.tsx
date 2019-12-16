import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { computed, observable } from 'mobx'
import { observer } from 'mobx-react'

import LinkField from './link-field'
import styled from '../../styled/styled-components'

const Label = styled.label`
  font-size: 1.15rem;
  color: black;
  font-weight: bold;`;

interface UrlsProps {
  urls: any[]
}

@observer
class Urls extends Component<UrlsProps, {}> {

  @observable curKey = 0;

  @computed get urls() {
    return this.props.urls;
  }

  @observable urlFields: any[] = [];

  componentDidMount() {
    this.curKey = this.props.urls.length;
  }

  componentDidUpdate() {
    setTimeout(() => {
      $('.link-field').last().focus();
    }, 0);
  }

  setUrls = (urls: any[]) => {
    this.curKey = urls.length;
  };

  addUrl = () => {
    this.props.urls.push({
      url: '',
      key: this.curKey
    });
    this.curKey++;
  };

  removeUrl = (index: number) => {
    this.props.urls.splice(index, 1);
    this.urlFields.splice(index, 1);
  };

  validate = () => {
    return this.urlFields[this.urls.length - 1].validate();
  };

  render() {
    this.urlFields = [];
    return (
      <Label>Add links
        {this.props.urls.map((u, index) =>
          <LinkField key={index}
                     url={u}
                     ref={r => {
                       if (r) {
                         this.urlFields.push(r);
                       }
                     }}
                     index={index}
                     addUrl={this.addUrl}
                     removeUrl={this.removeUrl}/>)}
      </Label>
    )
  }
}

export default Urls
