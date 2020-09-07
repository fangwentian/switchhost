import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import hosts from './hosts';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    hosts
  });
}
