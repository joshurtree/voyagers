import * as React from 'react';
import { Box, Button, DialogTitle, DialogContent, DialogActions, Dialog } from '@mui/material';
import  tr  from '../utils/translate';
import { Data }  from 'dataclass';
import { Label } from 'theme-ui';

export class Action extends Data {
  label: string;
  key: string;
  confim: boolean;
};

type SimpleDialogProps = {
  id: string;
  open: boolean;
  onClose: (action: Action) => void;
  actions: Action[];
  title: string;
};

export const SimpleDialog = (props: SimpleDialogProps) => {
  const { actions, onClose, open, title, ...other } = props;

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
      {...other}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogActions>
        {actions.map(action => <Button key={action.key} onClick={() => onClose(action)}>{action.label}</Button>)}
      </DialogActions>
    </Dialog>
  );
};

SimpleDialog.OK = Action.create({label: tr`Ok`, key: 'ok', confim: true});
SimpleDialog.CANCEL = Action.create({label: tr`Cancel`, key: 'cancel', confim: false});
SimpleDialog.YES = Action.create({label: tr`Yes`, key: 'yes', confim: true });
SimpleDialog.NO = Action.create({ label: tr`No`, key: 'no', confim: false });

SimpleDialog.OKCANCEL = [ SimpleDialog.OK, SimpleDialog.CANCEL ];
SimpleDialog.YESNO = [ SimpleDialog.YES, SimpleDialog.NO ];

type MessageDialogProps = {
  id: string;
  open: boolean;
  title: string;
  message: string;
};

export const MessageDialog = (props: MessageDialogProps) => {
  return SimpleDialog({...props, actions: [SimpleDialog.OK], onClose: (action: Action) => true });
}

class ConfirmationDialogProps {
  id: string;
  open: boolean;
  onClose: (confirmed: boolean) => void;
  actions: Action[] = SimpleDialog.OKCANCEL;
  title: string;
};

export const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  return SimpleDialog({...props, onClose: (action: Action) => props.onClose(action.confim)});
}


export default SimpleDialog;