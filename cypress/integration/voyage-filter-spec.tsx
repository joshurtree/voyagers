import React from 'react';
import { mount } from '@cypress/react';
import { VoyageFilter } from './components/voyage-filter';

describe('Render VoyageFilter', () => {
  mount(<VoyageFilter onChange={() => true} players={[]} />);
});
