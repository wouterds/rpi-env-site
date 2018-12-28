import { createSelector } from 'reselect';
import { State } from './reducer';

export const selectSamples = (state: any) => state.samples;

export const getSamples = createSelector(
  [selectSamples],
  (state: State) => state.samples,
);
