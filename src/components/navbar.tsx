import React from 'react';
import {
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
  Menu,
  MenuItem,
  Popover,
  Stack
} from '@mui/material';

import tr from '../utils/translate';
//import { } from '../utils/constants';
import { ImportStatus, ImportTaskState, LocalVoyageLog } from '../utils/voyagelog';

type NavBarPopupProps = {
  title: string;
  children: JSX.Element[];
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
  status: VoyageLog.ImportStatus;
  onClose: () => void;
};

function VoyageStatusDialog(props: ErrorDialogProps) {
  const {status, onClose, open} = props;
  const [removed, setRemoved] = React.useState(false);

  const statusMsg = (state: ImportTaskState, successMessage: string, failureMessage: string) => {
    const msg = state == ImportTaskState.succeeded
      ? <><Icon sx={{color: 'green', verticalAlign: 'bottom'}}>thumb_up</Icon>&emsp;{successMessage}</>
      : <><Icon sx={{color: 'red', verticalAlign: 'bottom'}}>thumb_down</Icon>&emsp;{failureMessage}</>;

    return (state != ImportTaskState.notDone ? <p>{msg}</p> : <></>);
  };
  const removeEntry = () => {
    this._voyageLog.removeLastVoyage();
    setRemoved(true)
  };

  return (
    <Dialog onClose={onClose} open={true}>
      <DialogContent>
        {statusMsg(status.parsedJson, tr`Parsed player data.`, tr`Failed to parse player data.`)}
        {statusMsg(status.voyageFound, tr`Found existing voyage.`, tr`No voyage found.`)}
        {statusMsg(status.voyageCompleted, tr`Voyage has been recalled.`, tr` Recall the voyage before logging it.`)}
        {statusMsg(status.voyageUnique, tr`You have not yet logged the voyage.`, tr`You have already logged the voyage.`)}
        {statusMsg(status.voyageNotExtended, tr`The voyage has not been extended.`, tr`The voyage has been extended`)}
        {statusMsg(status.stored, tr`The voyage has been stored locally`, tr`Failed to store voyage`)}
        {statusMsg(status.synced, tr`The voyage has been uploaded to voyagers.org.`, tr`The voyage has not been uploaded to voyagers.org.`)}
        {status.stored == ImportTaskState.succeeded &&
          <DialogActions>
            <Button
              disabled={removed}
              onClick={() => removeEntry()}
            >
              {removed ? tr`Removed` : tr`Remove`}
            </Button>
          </DialogActions>
        }
      </DialogContent>
    </Dialog>
  );
}

type LinkProps = {
  id: string;
  title: string;
  url?: string;
};

type NavBarProps = {
  loaded: boolean;
  voyageImportStatus?: ImportStatus;
};

export default class NavBar extends React.Component<NavBarProps> {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      voyageImportStatus: null
    };

  }

  componentDidMount() {
    this._voyageLog = new LocalVoyageLog();
    this._voyageLog.then(() => this.setState({loaded: true}));
  }

  _logVoyageFromClipboard(event) {
    event.preventDefault();
    this._logVoyage((event.clipboardData || window.clipboardData).getData('text'));
  }

  _logVoyageFromFile({target: {files: [file]}}) {
    const fReader = new FileReader();
    const isWebArchive = file.name.toLowerCase().endsWith('.webarchive');

		fReader.onload = (e) => {
			const data = e.target.result.toString();
			this._logVoyage(isWebArchive ? data.substring(data.indexOf('>{') + 1, data.lastIndexOf('}}') + 2) : data);
		};
		fReader.readAsText(file);
  }

  _logVoyage(data : string) {
    this._voyageLog.importVoyage(data)
        .then((voyageImportStatus) => this.setState({ voyageImportStatus }))
        .catch((voyageImportStatus) => this.setState({ voyageImportStatus }));
  }

  render() {
    const { loaded, voyageImportStatus } = this.state;

    const links : LinkProps[] = [
      {id: 'home', title: 'Home', url: '/'},
      {id: 'greatest', title: tr`Greatest voyagers`, children: [
        {id: 'greatest-count', title: tr`By voyage count`, url: '/voyagers?by=count'},
        {id: 'greatest-duration', title: tr`By total duration`, url: '/voyagers?by=duration'},
        {id: 'greatest-trait', title: tr`By trait matches`, url: '/voyagers?by=traits'}
      ]},
      //{id, 'hall-of-honour', title: tr`Voyage hall of honour`, url: '/Voyages'},
    ];

    const createNavBarElement = (link: LinkProps) => {
      if (link.url)
        return (<Button href={link.url}>{link.title}</Button>);
      else
        return (
          <NavBarPopup title={link.title}>
            <Stack>
              {link.children.map(createNavBarElement)}
            </Stack>
          </NavBarPopup>
        );
    };

    return (
      <>
        <Stack direction='row'>
          {links.map(createNavBarElement)}
          {loaded &&
            <NavBarPopup id='log-voyage' title={tr`Log voyage`}>
              <Stack margin="5mm">
                <p>{tr`Paste the contents of your `}<a href="https://stt.disruptorbeam.com/player">{tr`player file`}</a>.</p>
                <textarea autoFocus onPaste={(e) => this._logVoyageFromClipboard(e)} />
                <div style={{textAlign: 'center'}}>{tr`or`}</div>
                <InputLabel for="file-input">{tr`Import player file`}</InputLabel><Input id="file-input" type="file" onChange={(e) => this._logVoyageFromFile(e)} />
              </Stack>
            </NavBarPopup>
          }
        </Stack>
        {voyageImportStatus &&
          <VoyageStatusDialog
            status={voyageImportStatus}
            onClose={() => this.setState({voyageImportStatus: null})}
          />
        }
      </>
    );
  }
}
