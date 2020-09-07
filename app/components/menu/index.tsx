import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import { Switch, Modal, Input, message } from 'antd';
import { bindActionCreators, Dispatch } from 'redux';
import { DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';

import {
  setCurrent,
  addHost,
  deleteHost,
  renameHost,
  setConfig,
  renameSwitch,
  readOneHost
} from '../../actions/hosts';
import styles from './index.css';

function mapStateToProps(state: any) {
  return {
    hosts: state.hosts
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      setCurrent,
      addHost,
      deleteHost,
      renameHost,
      setConfig,
      renameSwitch,
      readOneHost
    },
    dispatch
  );
}

type Props = {
  setCurrent: (payload: string) => void;
  addHost: (paylaod: string) => void;
  deleteHost: (paylaod: string) => void;
  renameHost: (paylaod: object) => void;
  renameSwitch: (paylaod: object) => void;
  setConfig: (paylaod: object) => void;
  readOneHost: (paylaod: string) => void;
  hosts: {
    hosts: object;
    current: string;
    config: object;
  };
};

const Menu = (props: Props) => {
  const {
    setCurrent,
    addHost,
    deleteHost,
    renameHost,
    setConfig,
    readOneHost,
    renameSwitch,
    hosts: { hosts, current, config }
  } = props;

  const [isVisible, setVisible] = useState(false);
  const [envName, setEnvName] = useState('');
  const [isEditVisible, setEditVisible] = useState(false);
  const [editEnvName, setEditEnvName] = useState('');

  const handleSelect = useCallback((env) => {
    setCurrent(env);
    readOneHost(env);
  }, []);

  // 新增弹窗
  const handleAdd = () => {
    setVisible(true);
  };

  const inputChange = (e: any) => {
    const val = e.target.value;
    setEnvName(val);
  };

  const handleOk = () => {
    const envs = Object.keys(hosts);
    if (envs.includes(envName)) {
      message.error({
        content: `${envName}已存在`,
        duration: 1
      });
      return;
    }

    addHost(envName);
    setVisible(false);
    setEnvName('');
  };

  const handleCancel = () => {
    setVisible(false);
    setEnvName('');
  };

  // 删除操作
  const handleDelete = (env: string) => {
    Modal.confirm({
      title: '提示',
      content: '确认删除吗？',
      onOk: () => {
        deleteHost(env);
      }
    });
  };

  // 修改操作
  const handleEdit = (env: string) => {
    setEditVisible(true);
  };

  const inputEditChange = (e: any) => {
    const val = e.target.value;
    setEditEnvName(val);
  };

  const handleEditOk = () => {
    const envs = Object.keys(hosts);
    if (envs.includes(editEnvName)) {
      message.error({
        content: `${editEnvName}已存在`,
        duration: 1
      });
      return;
    }
    renameHost({
      origin: current,
      target: editEnvName
    });
    renameSwitch({
      origin: current,
      target: editEnvName
    });
    setEditVisible(false);
    setEditEnvName('');
  };

  const handleEditCancel = () => {
    setEditVisible(false);
    setEditEnvName('');
  };

  const handleSwitchChange = (env, checked) => {
    config.switch[env] = checked;
    setConfig(config);
  };

  return (
    <div className={styles.wrap} id="menu">
      <div className={styles.oper} onClick={handleAdd}>
        <PlusOutlined className={styles.action} />
      </div>
      {
        Object.keys(hosts).map((item, index) => {
          return <div key={index} className={ item == current ? styles.active : '' } onClick={handleSelect.bind(null, item)}>
            {item}
            <span className={styles.switch}>
              <EditOutlined className={styles.icon} onClick={(e) => handleEdit(item, e)} />
              <DeleteOutlined className={styles.icon} onClick={(e) => handleDelete(item, e)} />
              <Switch checked={config.switch[item]} size="small" onChange={(checked) => handleSwitchChange(item, checked)}/>
            </span>
          </div>
        })
      }

      <Modal
        title="新增环境"
        visible={isVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          placeholder="请输入环境名"
          value={envName}
          onChange={inputChange}
        />
      </Modal>

      <Modal
        title="修改名称"
        visible={isEditVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
      >
        <Input
          placeholder="请输入环境名"
          onChange={inputEditChange}
          value={editEnvName}
        />
      </Modal>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
