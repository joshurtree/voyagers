import React from 'react';
import { mount } from '@cypress/react';
import { IntervalPicker } from './components/interval-picker'

describe('Test IntervalPicker component', () => {
  mount(<IntervalPicker onChange={() => true}/>);
});
