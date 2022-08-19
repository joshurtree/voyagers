import React from 'react';
import { Crew } from '../utils';
import { Avatar, AvatarGroup, Popover } from '@mui/material';

type VoyagerSummaryProps = {
    voyager: Crew;
    square?: boolean;
};

export const VoyagerAvatar = (props: VoyagerSummaryProps) => {
    const { square, voyager } = props;

    return <Avatar alt={voyager.name} src={`/images/stt-assets/${voyager.iconUrl}`} variant={square ? 'square' : 'circular'}/>
};

type VoyagerAvatarGroupProps = {
    max?: number;
    voyagers: Crew[];
}

export const VoyagerAvatarGroup = (props: VoyagerAvatarGroupProps) => {
    const { max, voyagers } = props;

    return <AvatarGroup max={max ?? 4}>
        {
            voyagers.map((c, i) => <VoyagerAvatar key={i.toString()} voyager={c} />)
        }
    </AvatarGroup>;
}

