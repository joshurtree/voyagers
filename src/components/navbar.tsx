import React, { ChangeEvent } from 'react';
import {
  Autocomplete,
  Button,
  Breadcrumbs,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Icon,
  Input,
  InputLabel,
  Link,
  Popover,
  Select,
  Stack,
  TextField,
  MenuItem
} from '@mui/material';

import tr from '../utils/translate';
import { languages } from '../utils/constants';
import { ImportTaskState, LocalVoyageLog } from '../utils/voyagelog';
import { useTheme } from '@mui/material/styles';
import SimpleDialog, { ConfirmationDialog } from './simple-dialog';
import LocalVoyageLogContext from './voyage-context';

type NavBarPopupProps = {
  id?: string;
  title: string;
  children: JSX.Element;
};

function NavBarPopup(props: NavBarPopupProps) {
  const [ inPopup, setInPopup ] = React.useState(false);
  const [ anchor, setAnchor ] = React.useState(null);
  let popupTimeout = null;

  const navButton = (title) => (
    <Button
      onMouseEnter={(event) => setAnchor(event.currentTarget)}
      onMouseLeave={() => popupTimeout = setTimeout(() => {
          setAnchor(null);
      }, 1500)}
    >
      {title}
    </Button>
  );

  return (
    <span>
      {navButton(props.title)}
      <Popover
        id={props.title}
        open={anchor != null}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <span
          onMouseEnter={() => clearTimeout(popupTimeout)}
          onMouseLeave={() => {
            setInPopup(false);
            setAnchor(null);
          }}
        >
          {props.children}
        </span>
      </Popover>
    </span>
  );
}

type VoyageStatusDialogProps = {
  open: boolean;
  status: ImportTaskState[];
  onClose: () => void;
};

function VoyageStatusDialog(props: VoyageStatusDialogProps) {
  const messages = {
    parsedJson: [tr`Parsed player data.`, tr`Failed to parse player data`],
    voyageFound: [tr`Found running voyage.`, tr`No voyage found`],
    voyageComplete: [tr`Voyage has been recalled.`, tr`Recall the voyage before logging it`],
    voyageUnique: [tr`You have not yet logged the voyage.`, tr`You have already logged the voyage`],
    voyageNotExtended: [tr`The voyage has not been extended.`, tr`The voyage has been extended`],
    voyageSaved: [tr`The voyage has been stored locally`, tr`Failed to store voyage`],
    synced: [tr`The voyage has been uploaded to voyagers.org.`, tr`The voyage has not been uploaded to` + ' voyagers.app']
  }
  const {open, status, onClose} = props;
  const [removed, setRemoved] = React.useState(false);

  const statusMsg = (state: ImportTaskState) => 
     state.completed
      ? <p><Icon sx={{color: 'green', verticalAlign: 'bottom'}}>thumb_up</Icon>&emsp;{messages[state.name][0]}</p>
      : <p><Icon sx={{color: 'red', verticalAlign: 'bottom'}}>thumb_down</Icon>&emsp;{messages[state.name][1]}</p>;

  const removeEntry = () => {
    this._voyageLog.removeLastVoyage();
    setRemoved(true)
  };

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogContent>
        {status.map(state => statusMsg(state))}
        <DialogActions>
          {status.find(value => value.name == 'voyageSaved')?.completed && 
            <Button
              disabled={removed}
              onClick={() => removeEntry()}
            >
              {removed ? tr`Removed` : tr`Remove`}
            </Button>
          }
          <Button onClick={onClose}>
            {tr`Ok`}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

type LinkProps = {
  key: string;
  title: string;
  url?: string;
  call?: () => void;
  children?: LinkProps[];
};

interface NavBarProps {
  onLocaleChange: (value: string) => void
};

interface FileButtonProps {
  id: string;
  children: JSX.Element[];
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const FileButton = (props: FileButtonProps) => (
  <label htmlFor={props.id}>
    <input
      id={props.id}
      name={props.id}
      style={{ display: 'none' }}
      type='file'
      onChange={props.onChange} 
    />
    <Button component='span'>
      {props.children}
    </Button>  
  </label>
);

export const NavBar = (props: NavBarProps)  => {
  const voyageLog = React.useContext(LocalVoyageLogContext).voyageLog;
  let exportBlobURL: string = null;
  
  const [ dataClearConfirm, setDataClearConfirm ] = React.useState(false);      
  const [ voyageImportStatus, setVoyageImportStatus ] = React.useState(null);
  const [ locale, setLocale ] = React.useState(languages.find(lang => lang.code == 'en'));

  const logVoyage = (data : string) => {
    voyageLog.importVoyage(data)
      .then((voyageImportStatus: ImportTaskState[]) => setVoyageImportStatus(voyageImportStatus))
      .catch((voyageImportStatus: ImportTaskState[]) => setVoyageImportStatus(voyageImportStatus));
  }

  const logVoyageFromClipboard = (event) => {
    event.preventDefault();
    logVoyage(event.clipboardData.getData('text'));
  }

  const logVoyageFromFile = (e : ChangeEvent<HTMLInputElement>) => {
    const files: FileList = e.target.files;
    for (let i = 0; i < files.length; ++i) {
      const file = files[i];
      const fReader = new FileReader();
      const isWebArchive = file.name.toLowerCase().endsWith('.webarchive');
    
      fReader.onload = (e) => {
        const data = e.target.result.toString();
        logVoyage(isWebArchive ? data.substring(data.indexOf('>{') + 1, data.lastIndexOf('}}') + 2) : data);
      };

      fReader.readAsText(file);
    }
  }

  const importData = (e: ChangeEvent<HTMLInputElement>) => {
    const fReader = new FileReader();
    fReader.onload = ev => { 
      voyageLog.importData(ev.target.result.toString());
      fReader.readAsText(e.target.files[0]);
    };
  }

  const exportData = () => {
    const dataURL = URL.createObjectURL(voyageLog.exportData());
    const pom = document.createElement('a');
    pom.setAttribute('href', dataURL);
    pom.setAttribute('download', 'voyagers.json');
    pom.click();

    URL.revokeObjectURL(exportBlobURL);
  }

  const clearData = () => {
    voyageLog.clear()
  }

  const links : LinkProps[] = [
    {key: 'home', title: 'Home', url: '/'},
    {key: 'greatest', title: tr`Greatest voyagers`, url: '/voyagers-list'},
    {key: 'voyages', title: 'View voyages', url: '/voyage-list'}
  ];

  const createNavBarElement = (link: LinkProps) => {
    if (link.url || link.call) {
      const props = link.url ? {href: link.url} : {onclick: link.call};
      return (<Button {...props}>{link.title}</Button>);
    } else {
      return (
        <NavBarPopup title={link.title}>
          <Stack>
            {link.children.map(createNavBarElement)}
          </Stack>
        </NavBarPopup>
      );
    }
  };

  const changeLocale = (value: string) => {
    setLocale(languages.find(lang => lang.code == value));
    props.onLocaleChange(value);
  };

  const handleConfirmClose = (confirmed: boolean) => {
    confirmed && clearData();
    setDataClearConfirm(false);
  };

  return (
    <>
      <Stack direction='row' style={{float:'left'}}>
        {links.map(createNavBarElement)}
        {voyageLog?.isLoaded() &&
          <NavBarPopup id='data' title={tr`Data`}>
            <Stack>
              <FileButton id='import' onChange={importData}>{tr`Import...`}</FileButton>
              <Button id='export' onClick={exportData}>{tr`Export`}</Button>
              <Button id='clear' onClick={() => setDataClearConfirm(true)}>{tr`Clear...`}</Button>
            </Stack>
          </NavBarPopup>
        }
        {voyageLog?.isLoaded() &&
          <NavBarPopup id='log-voyage' title={tr`Log voyage`}>
            <Stack margin="5mm">
              <p>{tr`Paste the contents of your `}<a href="https://stt.disruptorbeam.com/player">{tr`player file`}</a>.</p>
              <textarea autoFocus onPaste={(e) => logVoyageFromClipboard(e)} />
              <div style={{textAlign: 'center'}}>{tr`or`}</div>
              <FileButton id='voyageImportFile' onChange={(e) => logVoyageFromFile(e)}>{tr`Import player file`}</FileButton>
            </Stack>
          </NavBarPopup>
        }
      </Stack>
      <Stack direction='row' style={{float: 'right'}}>
        <Select 
          value={locale.code}
          onChange={event => changeLocale(event.target.value as string)} 
          style={{margin: '0.5cm'}}
        >
          {languages.map(lang => <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>)}
        </Select>
      </Stack>
      <br style={{clear: 'both'}} />
      {voyageImportStatus &&
        <VoyageStatusDialog
          open={voyageImportStatus != null}
          status={voyageImportStatus}
          onClose={() => setVoyageImportStatus(null)}
        />
      }
      <ConfirmationDialog 
        id='dataClearConfirm'
        open={dataClearConfirm} 
        onClose={handleConfirmClose} 
        actions={SimpleDialog.YESNO} 
        title={tr`Are you sure?`}
      />
    </>
  );
}

export default NavBar;