import {
  ADD_HOST,
  SET_HOST,
  DELETE_HOST,
  SET_ALL_HOST,
  SET_CURRENT,
  RENAME_HOST,
  MODIFY_CONFIG
} from '../actions/hosts';

const initState = {
  hosts: {
    aaa: 'xxx',
    bbb: 'yyy'
  },
  current: '',
  config: {
    switch: {}
  }
};

export default function host(state = initState, action: any) {
  switch (action.type) {
    case ADD_HOST:
      return {
        ...state,
        hosts: {
          ...state.hosts,
          ...action.payload
        }
      };
    case DELETE_HOST:
      return {
        ...state,
        hosts: Object.keys(state.hosts).reduce((res, item) => {
          if (item !== action.payload) {
            res[item] = state.hosts[item];
          }
          return res;
        }, {})
      };
    case RENAME_HOST:
      return {
        ...state,
        hosts: Object.keys(state.hosts).reduce((res, item) => {
          if (item !== action.payload.origin) {
            res[item] = state.hosts[item];
          } else {
            res[action.payload.target] = state.hosts[item];
          }
          return res;
        }, {})
      };
    case SET_HOST:
      return {
        ...state,
        hosts: {
          ...state.hosts,
          [state.current]: action.payload
        }
      };
    case SET_ALL_HOST:
      return {
        ...state,
        hosts: action.payload
      };
    case SET_CURRENT:
      return {
        ...state,
        current: action.payload || ''
      };
    case MODIFY_CONFIG:
      return {
        ...state,
        config: action.payload || {}
      };
    default:
      return state;
  }
}
