import React from 'react';
import { LocalVoyageLog } from '../utils';

type VoyageLogWrapper = {
    voyageLog: LocalVoyageLog;
    dirtyFlag: boolean;
  };
  
export const LocalVoyageLogContext : React.Context<VoyageLogWrapper> = React.createContext(undefined);

export default LocalVoyageLogContext;