import { Component } from 'react';
import Navbar from '../components/navbar'
import { CircularProgress, Grid } from '@mui/material';
import { tr } from '../utils';

type LayoutProps = {
  klingon: boolean
  loaded: boolean;
  onLocaleChange: (value: string) => void, 
  children: JSX.Element
};

export const Loading = () => (
  <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: '100vh' }}
  >
      <Grid item xs={12}>
        <Grid 
          container 
          spacing={0} 
          direction='row'
          alignItems='center'
          justifyContent='center'
        >
          <Grid item xs={3}>
            <CircularProgress />
            <div>{tr`Loading assets...`}</div>
          </Grid>
      </Grid>
    </Grid>   
  </Grid> 
)
export default function Layout(props:LayoutProps) {
  return (
    <div>
      <Navbar onLocaleChange={props.onLocaleChange} />
      <main style={{fontFamily: props.klingon ? 'klingon' : 'inherit'}}>
        {props.loaded ? props.children : <Loading />}
      </main>
    </div>
  )
}
