import * as React from 'react';
import { Box, Button, DialogTitle, DialogContent, DialogActions, Dialog } from '@mui/material';
import  tr  from '../utils/translate';

class ConfirmationDialogProps {
  id: string;
  open: boolean;
  onClose: (confirmed: boolean) => void;
  labels: string[] = ConfirmationDialog.OKCANCEL;
  title: string;
};

export default function ConfirmationDialog(props: ConfirmationDialogProps) {
  const { labels, onClose, open, title, ...other } = props;

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
      {...other}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogActions>
        <Button onClick={() => onClose(true)}>{labels[0]}</Button>
        <Button autoFocus onClick={() => onClose(false)}>{labels[1]}</Button>
        </DialogActions>
    </Dialog>
  );
}

ConfirmationDialog.YESNO = [tr`Yes`, tr`No`];
ConfirmationDialog.OKCANCEL = [tr`Ok`, tr`Cancel`];