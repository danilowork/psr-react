import React, { Component } from 'react'
import { observer } from 'mobx-react'

import { OldFile } from './athlete-note-form'

interface UploadedFileProps {
  file: OldFile | File
  removeFile: (_: File | OldFile) => void
}

@observer
class UploadedFile extends Component<UploadedFileProps, {}> {

  render() {
    return (
      <div className="uploaded-file">
        <span>{this.props.file.name}</span>
        <span className="psr-icons icon-x"
              onClick={() => this.props.removeFile(this.props.file)}/>
      </div>
    )
  }

}

export default UploadedFile
