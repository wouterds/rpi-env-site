import axios, { AxiosResponse } from 'axios';
import { subHours } from 'date-fns';
import { call, fork, put, select, takeEvery } from 'redux-saga/effects';
import { API_ENDPOINT, GROUP_BY_MINUTES } from '../../config';
import { getSensors } from '../sensors/selectors';
import { Sensor } from '../sensors/types';
import { getTimeframe } from '../timeframe/selectors';
import { FETCH, fetchSuccess } from './actions';
import { Sample } from './types';

function* fetchFlow() {
  const timeframe: number = yield select(getTimeframe);
  const sensors: Sensor[] = yield select(getSensors);

  let samples: Sample[] = [];
  for (const sensor of sensors) {
    try {
      const response: AxiosResponse = yield call(
        axios.get,
        `${API_ENDPOINT}/samples`,
        {
          params: {
            sensorId: sensor.id,
            groupByMinutes: GROUP_BY_MINUTES,
            between: `${Math.floor(
              subHours(new Date(), timeframe).getTime() / 1000,
            )},${Math.floor(new Date().getTime() / 1000)}`,
          },
        },
      );

      if (response.status !== 200) {
        continue;
      }

      samples = [...samples, ...response.data];

      yield put(fetchSuccess(samples));
    } catch (error) {
      // yield put(fetchError());
      continue;
    }
  }
}

function* fetchFlowWatcher() {
  yield takeEvery(FETCH, fetchFlow);
}

export default [fork(fetchFlowWatcher)];