import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import Menu from '../menu';
import Content from '../content';
import { readHost, setCurrent, readConfig } from '../../actions/hosts';
import styles from './Home.css';

function mapStateToProps(state: any) {
  return {
    hosts: state.hosts
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      readHost,
      setCurrent,
      readConfig
    },
    dispatch
  );
}

const Home = (props) => {
  useEffect(() => {
    async function temp() {
      await props.readHost();
      await props.readConfig();
      props.setCurrent();
    }
    temp();
  }, []);

  return (
    <div className={styles.container} data-tid="container">
      <div className={styles.left}>
        <Menu />
      </div>
      <div className={styles.right}>
        <Content />
      </div>
      <div className={styles.back}></div>
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
