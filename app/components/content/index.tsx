import React, { useState, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Input, Button } from 'antd';
import { remote, ipcRenderer } from 'electron';
import { FindInPage } from 'electron-find';
import { setHost, writeHost, setCurrent } from '../../actions/hosts';

import styles from './index.css';

const { TextArea } = Input;

function mapStateToProps(state: any) {
  return {
    hosts: state.hosts
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      setHost,
      writeHost,
      setCurrent
    },
    dispatch
  );
}

type Props = {
  setHost: (payload: object) => void;
  setCurrent: (payload: string) => void;
  hosts: {
    hosts: object;
    current: string;
  };
};

const Content = (props: Props) => {
  const {
    setHost,
    writeHost,
    setCurrent,
    hosts: { hosts, current }
  } = props;

  useEffect(() => {
    const findInPage = new FindInPage(remote.getCurrentWebContents(), {
      offsetTop: 80,
      offsetRight: 10
    });
    ipcRenderer.on('open-find', () => {
      findInPage.openFindWindow();
    });
  }, []);

  const save = () => {
    const val = hosts[current];
    writeHost(val);
  };

  const handleChange = (e: any) => {
    const { value } = e.target;
    setHost(value);
  };

  return (
    <div id="content">
      <TextArea
        className={styles.content}
        value={hosts[current]}
        onChange={handleChange}
      />

      {current ? (
        <div className={styles.button}>
          <Button type="primary" onClick={save}>
            Save
          </Button>
        </div>
      ) : (
        ''
      )}
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Content);
