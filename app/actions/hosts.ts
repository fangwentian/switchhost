import { message } from 'antd';

const fs = require('fs-extra');
const applescript = require('applescript');
const _ = require('lodash');

export const ADD_HOST = 'ADD_HOST';
export const SET_HOST = 'SET_HOST';
export const SET_ALL_HOST = 'SET_ALL_HOST';
export const SET_CURRENT = 'SET_CURRENT';
export const DELETE_HOST = 'DELETE_HOST';
export const RENAME_HOST = 'RENAME_HOST';
export const MODIFY_CONFIG = 'MODIFY_CONFIG';

const storagePath = '/Applications/switchhost_adam/documents/';
const hostFilesPath = `${storagePath}hostFiles/`;
const sysyemPath = '/etc/hosts';
const defaultHost = `127.0.0.1		localhost
127.0.0.1		localhost.kaola.com`;
const configFile = `${storagePath}config.json`;

const readDir = () => {
  fs.ensureDirSync(hostFilesPath);
  const fileName = fs.readdirSync(hostFilesPath);
  const tasks = fileName.map(name => fs.readFile(`${hostFilesPath}${name}`).then(res => {
      return {
        [name]: res.toString()
      };
    })
  );

  return Promise.all(tasks);
};

const readJson = (path: string) => {
  return fs.readJsonSync(path);
};

const writeLocalHost = (current, content) => {
  const path = `${hostFilesPath}${current}`;
  fs.outputFileSync(path, content);
};

const removeHost = (current) => {
  fs.removeSync(`${hostFilesPath}${current}`);
};

const runAppleScript = _.debounce(() => {
  const script = `tell application "Google Chrome"
    tell front window

        --record current active tab and its index.
        set origTab to active tab
        set origTabIndex to active tab index

        --open Chrome sockets page.
        set theTab to make new tab with properties {URL:"chrome://net-internals/#sockets"}

        --waiting for loading html document
        set isLoadDone to not loading of theTab
        repeat until isLoadDone
            set isLoadDone to not loading of theTab
        end repeat

        --Chrome has to spend some time to execute init javascript,or the javascript statements in the below execute commond won't work.
        --How long you should delay depends on the performance of your mac.
        --delay 1

        --flush Chrome sockets
        --you can find below javascript statements in Chrome's net-internal index.js on line 9860 and 9861
        execute theTab javascript "try {setTimeout(function() {var $=document.getElementById.bind(document);$('dns-view-clear-cache').click();$('sockets-view-flush-button').click();alert('host刷新成功');},0)} catch(e) {
console.log(e)
alert('清理失败，请手动清理')}"

        delay 1
        --close Chrome sockets page
        close theTab

        --reactive the previous tab
        set active tab index to origTabIndex

        --reload the previous tab
        reload origTab

    end tell
end tell`;

  applescript.execString(script, function(err, rtn) {
    console.log('done');
  });
}, 1500);

const writeSystem = (hosts, config) => {
  const res = Object.keys(hosts)
    .map(env => ({
      env,
      host: hosts[env],
      switch: config.switch[env]
    }))
    .filter(i => i.switch)
    .map(i => i.host)
    .join('\n');
  try {
    fs.outputFileSync(sysyemPath, `${res}\n`, {
      encoding: 'utf-8'
    });
  } catch (e) {
    message.error({
      content: e && e.message || '写入host失败，请命令行执行 sudo chmod 777 /etc/hosts',
      duration: 3
    });
  }
  runAppleScript();
};

const renameHostFile = (origin, target) => {
  fs.copySync(`${hostFilesPath}${origin}`, `${hostFilesPath}${target}`);
  removeHost(origin);
};

export function readHost() {
  return async (dispatch, getState) => {
    const result = await readDir();
    const host = result.reduce((res: object, current) => {
      return {
        ...res,
        ...current
      };
    }, {});

    dispatch({
      type: SET_ALL_HOST,
      payload: host
    });
  };
}

export function readOneHost(env) {
  return (dispatch, getState) => {
    const content = fs.readFileSync(`${hostFilesPath}${env}`);
    dispatch({
      type: SET_HOST,
      payload: content
    });
  };
}

export function readConfig() {
  return (dispatch, getState) => {
    const {
      hosts: { hosts }
    } = getState();
    let result;

    if (!fs.pathExistsSync(configFile)) {
      fs.outputJsonSync(configFile, { switch: {} });
    }
    // 不是json继续写入空文件
    try {
      result = fs.readJsonSync(`${storagePath}config.json`) || {};
    } catch (e) {
      fs.outputJsonSync(configFile, { switch: {} });
    }
    // 过滤掉不存在host文件的开关
    const hostsNames = Object.keys(hosts);
    const switchs = Object.keys(result.switch).reduce((res, current) => {
      if (hostsNames.includes(current)) {
        res[current] = result.switch[current];
      }
      return res;
    }, {});

    // 写入config
    fs.outputJsonSync(configFile, {
      ...result,
      switch: switchs
    });

    // dispatch modify config
    dispatch({
      type: MODIFY_CONFIG,
      payload: {
        ...result,
        switch: switchs
      }
    });
  };
}

export function setHost(payload = {}) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_HOST,
      payload
    });
  };
}

export function writeHost(payload = '') {
  return (dispatch, getState) => {
    const { hosts: { current, hosts, config } } = getState();
    writeLocalHost(current, payload);
    // 修改打开的host，采取写系统文件
    if (config.switch[current]) {
      writeSystem(hosts, config);
    }
    message.success({
      content: '设置成功',
      duration: 1
    });
  };
}

export function addHost(payload = '') {
  return (dispatch, getState) => {
    const env = payload || +new Date();
    writeLocalHost(env, defaultHost);
    dispatch({
      type: ADD_HOST,
      payload: { [env]: defaultHost }
    });
    dispatch({
      type: SET_CURRENT,
      payload: env
    });
  };
}

export function deleteHost(envName = '') {
  return (dispatch) => {
    dispatch({
      type: DELETE_HOST,
      payload: envName
    });
    removeHost(envName);
  };
}

export function renameHost(payload = { origin: '', target: '' }) {
  return (dispatch) => {
    renameHostFile(payload.origin, payload.target);
    dispatch({
      type: RENAME_HOST,
      payload
    });
  };
}

export function renameSwitch(payload = { origin: '', target: '' }) {
  return (dispatch, getState) => {
    let {
      hosts: { config }
    } = getState();
    const result = Object.keys(config.switch).reduce((res, env) => {
      if (env !== payload.origin) {
        res[env] = config.switch[env];
      }
      return res;
    }, {});
    result[payload.target] = config.switch[payload.origin];

    const res = {
      ...config,
      switch: result
    };

    fs.outputJsonSync(configFile, res);
    dispatch({
      type: MODIFY_CONFIG,
      payload: res
    });
  };
}

// 设置current
export function setCurrent(payload = '') {
  return (dispatch, getState) => {
    const { hosts: { hosts } } = getState();
    const current = payload || Object.keys(hosts)[0] || '';

    dispatch({
      type: SET_CURRENT,
      payload: current
    });
  };
}

// 修改整个config
export function setConfig(payload = {}) {
  return (dispatch, getState) => {
    const { hosts: { current, hosts, config } } = getState();
    fs.outputJsonSync(configFile, payload);
    writeSystem(hosts, payload);
    dispatch({
      type: MODIFY_CONFIG,
      payload
    });
  };
}
