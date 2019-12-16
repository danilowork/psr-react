import React, { Component } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

import UploadedFile from './uploaded-file'
import { H } from '../../styled/components'
import styled from '../../styled/styled-components'
import { OldFile } from './athlete-note-form'

const LabelUpload = styled.label.attrs({ className: 'underline' })`
  color: #17A6F2;`;

const MainText = styled.p`
  font-size: 1.1rem;
  color: black;`;

const HR = styled.hr`
  width: 154%`;

interface AttachmentsProps {
  oldFiles: OldFile[]
}

@observer
class Attachments extends Component<AttachmentsProps, {}> {

  @observable newFiles: File[] = [];
  @observable filesToDelete: number[] = [];
  @observable fileError = false;

  isFileValid = (file: File) => {
    const ext = file.name!.split('.').pop()!.toLowerCase();
    const supportFormat = ["pdf", "jpg", "jpeg", "png", "mp4", "docx"];
    return supportFormat.indexOf(ext) > -1 && file.size <= 4 * 1024 * 1024;
  };

  addFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target!.files![0];
    if (this.isFileValid(file)) {
      this.fileError = false;
      this.newFiles.push(file)
    } else {
      this.fileError = true;
    }
  };

  removeFile = (file: OldFile | File) => {
    if (file.hasOwnProperty('id')) {
      this.filesToDelete.push((file as OldFile).id);
      const index = this.props.oldFiles.findIndex(f => f == file);
      this.props.oldFiles.splice(index, 1);
    } else {
      const index = this.newFiles.findIndex(f => f == file);
      this.newFiles.splice(index, 1);
    }
  };

  getFilesToDelete = () => {
    return this.filesToDelete;
  };

  getFilesToAdd = () => {
    return this.newFiles;
  };

  render() {
    return (
      <div>
        <H>Attachments</H>
        <HR/>
        <MainText>
          <b>File types supported at the moment: </b>.pdf, .jpg, .png, mp4, .docx<br/>
          Max file size: 4mb
        </MainText>
        <div className="file-list">
          {this.props.oldFiles.map((file, index) => <UploadedFile file={file}
                                                                  key={index}
                                                                  removeFile={this.removeFile}/>)}
          {this.newFiles.map((file, index) => <UploadedFile file={file}
                                                            key={index}
                                                            removeFile={this.removeFile}/>)}
        </div>
        <div className="upload-wrap">
          <p className={"form-error" + (this.fileError ? " visible" : "")}>
            Flag on the play! Your file type is too big or something we don't support.
            Try uploading a smalller file size or a different type of file.</p>
          <LabelUpload htmlFor="file">Upload a file</LabelUpload>
          <input type="file" className="show-for-sr" id="file"
                 onChange={this.addFile}/>
        </div>
      </div>
    )
  }
}

export default Attachments
