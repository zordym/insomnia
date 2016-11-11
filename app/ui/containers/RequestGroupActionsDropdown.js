import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import PromptButton from '../components/base/PromptButton';
import {Dropdown, DropdownButton, DropdownItem, DropdownDivider, DropdownHint} from '../components/base/dropdown';
import EnvironmentEditModal from '../components/modals/EnvironmentEditModal';
import PromptModal from '../components/modals/PromptModal';
import * as globalActions from '../redux/modules/global';
import * as models from '../../models';
import {showModal} from '../components/modals';

class RequestGroupActionsDropdown extends Component {
  async _promptUpdateName () {
    const {requestGroup} = this.props;

    const name = await showModal(PromptModal, {
      headerName: 'Rename Folder',
      defaultValue: requestGroup.name
    });

    models.requestGroup.update(requestGroup, {name});
  }

  async _requestCreate () {
    const name = await showModal(PromptModal, {
      headerName: 'Create New Request',
      defaultValue: 'My Request',
      selectText: true
    });

    const workspace = this._getActiveWorkspace();
    const {requestGroup} = this.props;
    const parentId = requestGroup._id;
    const request = await models.request.create({parentId, name});
    this.props.actions.global.activateRequest(workspace, request);
  }

  _requestGroupDuplicate () {
    const {requestGroup} = this.props;
    models.requestGroup.duplicate(requestGroup);
  }

  _getActiveWorkspace (props) {
    // TODO: Factor this out into a selector

    const {entities, global} = props || this.props;
    let workspace = entities.workspaces[global.activeWorkspaceId];
    if (!workspace) {
      workspace = entities.workspaces[Object.keys(entities.workspaces)[0]];
    }

    return workspace;
  }

  render () {
    const {requestGroup, ...other} = this.props;

    return (
      <Dropdown {...other}>
        <DropdownButton>
          <i className="fa fa-caret-down"></i>
        </DropdownButton>
        <DropdownItem onClick={e => this._requestCreate()}>
          <i className="fa fa-plus-circle"></i> New Request
          <DropdownHint char="N"></DropdownHint>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem onClick={e => this._requestGroupDuplicate()}>
          <i className="fa fa-copy"></i> Duplicate
        </DropdownItem>
        <DropdownItem onClick={e => this._promptUpdateName()}>
          <i className="fa fa-edit"></i> Rename
        </DropdownItem>
        <DropdownItem
          onClick={e => showModal(EnvironmentEditModal, requestGroup)}>
          <i className="fa fa-code"></i> Environment
        </DropdownItem>
        <DropdownItem buttonClass={PromptButton}
                      onClick={e => models.requestGroup.remove(requestGroup)}
                      addIcon={true}>
          <i className="fa fa-trash-o"></i> Delete
        </DropdownItem>
      </Dropdown>
    )
  }
}

RequestGroupActionsDropdown.propTypes = {
  // Required
  entities: PropTypes.shape({
    workspaces: PropTypes.object.isRequired
  }).isRequired,

  actions: PropTypes.shape({
    global: PropTypes.shape({
      activateRequest: PropTypes.func.isRequired
    }).isRequired,
  }),

  global: PropTypes.shape({
    activeWorkspaceId: PropTypes.string
  }),

  // Optional
  requestGroup: PropTypes.object
};

function mapStateToProps (state) {
  return {
    global: state.global,
    entities: state.entities
  };
}

function mapDispatchToProps (dispatch) {
  return {
    actions: {
      global: bindActionCreators(globalActions, dispatch)
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RequestGroupActionsDropdown);
