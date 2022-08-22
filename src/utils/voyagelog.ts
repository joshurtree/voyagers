import { Data } from 'dataclass';
import { createContext } from 'react';
import localForage from 'localforage';
import { VoyageState, voyageSeats } from './constants';
import { getEstimate } from './voyage-emulator';
import { LoopTwoTone, Password, SearchTwoTone, Upload } from '@mui/icons-material';
import { resolve } from 'path';
import { ArrayQuery, OODBQuery } from '../utils/QueryAdapter';
import { duration } from '@mui/material';
import sample from './sample.json';

const VOYAGER_LOG_KEY = 'voyageLog';
const SAVE_PATH_KEY = 'savePath';
const UPLOAD_KEY = 'upload';
const EXPORT_VERSION = {
    major: 1,
    minor: 0
};

type Skill = {
    core: number;
    range_min: number;
    range_max: number;
};

const NO_SKILL: Skill = { core: 0, range_min: 0, range_max: 0 };

export type Skills = {
    command_skill?: Skill;
    diplomacy_skill?: Skill;
    engineering_skill?: Skill;
    medicine_skill?: Skill;
    science_skill?: Skill;
    security_skill?: Skill;
};

export class VoyagerRecord extends Data {
    seatid: number;
    voyagerid: number;
    symbol: string;
    skills: Skills;
    rarity: number;
    trait: string;
    traitMatch: boolean;
};

export class VoyagerRecordEx extends VoyagerRecord {
    voyage: VoyageEntry;
};

export type Item = {
    id: number;
    quantity: number;
};

type RawVoyage = {
    id: number;
    ship_trait: string;
    skills: { primary_skill: string; secondary_skill: string; }
    state: string;
    max_hp: number;
    hp: number;
    log_index: number;
    pending_rewards: { loot: Item[] };
    created_at: string;
    recalled_at?: string;
    voyage_duration: number;
    skill_aggregates: Skills;
    seconds_from_last_dilemma: number;
    ship_id: number;
    crew_slots: any[];
};

export type VoyageEntry = {
    id: number;
    dateStarted: Date;
    dbid: number;
    duration: number;
    fleet: string;
    startAm: number;
    finalAm: number;
    shipId: number;
    shipTrait?: string;
    primary_skill: string;
    secondary_skill: string;
    seats: VoyagerRecord[];
    aggregates: Skills;
    loot?: Item[];
    extended: boolean;
};

export type VoyageFilter = (value: VoyageEntry) => boolean;
export type VoyagerFilter = (value: VoyagerRecord) => boolean;

export type PlayerEntry = {
    id: number;
    dbid: number;
    currentPlayerName: string;
};

export class AllData {
    players: PlayerEntry[] = [];
    voyages: VoyageEntry[] = [];
};


export class ImportTaskState extends Data {
    name: string;
    completed: boolean = false;
};

export type ModifiedCallback = () => void;
const ensureUnique = <T>(testValue: string) => (all: T[], newValue: T) =>
    all.find(existingValue => newValue[testValue] == existingValue[testValue]) ? all : all.concat([newValue]);

const voyageStore = new class {
    players: PlayerEntry[] = [];
    voyages: VoyageEntry[] = [];
    loading: boolean = false;
    loaded: boolean = false;
    modCallbacks: ModifiedCallback[] = [];

    load() {
        this.loading = true;
        new Promise((resolve, _) => {
            localForage.getItem<AllData>(VOYAGER_LOG_KEY).then((data) => {
                this.players = data.players.reduce(ensureUnique<PlayerEntry>("dbid"), []) ?? [];
                this.voyages = data.voyages.reduce(ensureUnique<VoyageEntry>("id"), []) ?? [];
                resolve(data);
            }).then(() => {
                this.loading = false;
                this.loaded = true;
                this.notifyCallbacks();
            });
        });
    }

    addModifyCallback(callback) {
        this.modCallbacks.push(callback);
    }

    addVoyage(voyage: VoyageEntry) {
        this.voyages.push(voyage);
    }

    addPlayer(player: PlayerEntry) {
        if (this.players.find(entry => entry.dbid == player.dbid) == undefined)
            this.players.push(player);

    }

    importData(data: string) {
        const { players, voyages } = JSON.parse(data);
        const preCount = this.voyages.length;
        this.players.concat(players);
        this.voyages.concat(voyages);
        this.store();
        return this.voyages.length - preCount;
    }

    exportData(): Blob {
        const { players, voyages } = this;
        return new Blob([JSON.stringify({ 
            version: EXPORT_VERSION, 
            players, 
            voyages 
        })], { type: 'text/json' });
    }

    clear(playerFilter: number[]) {
        this.voyages = this.voyages.filter(voyage => playerFilter.includes(voyage.dbid));
        this.players = this.players.filter(player => playerFilter.includes(player.dbid));
        this.store();
    }

    notifyCallbacks() {
        console.log(`Notifying ${this.modCallbacks.length} listeners`);
        this.modCallbacks.forEach(callback => callback());
    }

    store() {
        localForage.setItem(VOYAGER_LOG_KEY, {
            voyages: this.voyages,
            players: this.players
        }).catch((err) => {
            console.error("Failed to store data,");
            console.error(err.toString());
        });

        this.notifyCallbacks();

        return false; // No backend yet
    }
};


export class LocalVoyageLog {
    constructor(modifyCallback: ModifiedCallback = undefined) {
        if (modifyCallback !== undefined)
            voyageStore.addModifyCallback(modifyCallback);
    }

    loadData() {
        if (!voyageStore.loading && !voyageStore.loaded)
            voyageStore.load();
    }

    loadSampleData() {
        voyageStore.players = sample.players;
        voyageStore.voyages = sample.voyages.map(voyage => {
            const dateStarted = new Date(voyage.dateStarted);
            return { ...voyage, dateStarted, seats: voyage.seats.map(seat => VoyagerRecord.create(seat)) };
        });
    
        voyageStore.notifyCallbacks();
    }

    isLoaded() {
        return voyageStore.loaded;
    }

    importVoyage(json: string) {
        return new Promise((resolve, reject) => {
            let status: ImportTaskState[] = [];
            const addState = (name: string, completed: boolean = false) => { status.push(ImportTaskState.create({ name, completed })); return completed; };
            const updateState = (name, completed) => status = status.map((value) => value.name == name ? ImportTaskState.create({ name, completed }) : value);

            try {
                addState('parsedJson');
                const playerData = JSON.parse(json);
                updateState('parsedJson', true);

                const { id, dbid, fleet, character } = playerData.player;
                const voyage = character.voyage[0];

                if (!addState('voyageFound', voyage != undefined) ||
                    !addState('voyageComplete', voyage.state != VoyageState.started) ||
                    !addState('voyageUnique', voyageStore.voyages.find((entry) => entry.id == voyage.id) == undefined))
                    return reject(status);

                const entry = this._voyageToEntry(dbid, fleet.slabel, voyage);
                addState('voyageNotExtended', !entry.extended); 
                
                voyageStore.addVoyage(entry);
                voyageStore.addPlayer({ id, dbid, currentPlayerName: character.display_name });
                voyageStore.store();
                addState('voyageSaved', true);

                resolve(status);
            } catch (err) {
                console.log(err);
                reject(status);
            }
        });
    }

    importData(data: string) {
        return voyageStore.importData(data);
    }

    exportData(): Blob {
        return voyageStore.exportData();
    }

    clear(playerFilter: number[] = []) {
        voyageStore.clear(playerFilter);
    }

    removeLastVoyage() {
        voyageStore.voyages.pop();
        voyageStore.store();
    }

    voyages(): OODBQuery<VoyageEntry> {
        return new ArrayQuery(voyageStore.voyages);
    }

    players(): OODBQuery<PlayerEntry> {
        return new ArrayQuery(voyageStore.players);
    }

    voyagerRecords(): OODBQuery<VoyagerRecordEx> {
        return new ArrayQuery(voyageStore.voyages.reduce(
            (voyagers, voyage) => voyagers.concat(voyage.seats.map(seat => VoyagerRecordEx.create({ ...seat, voyage}))), []
        ));
    }

    _voyageToEntry(dbid: number, fleet: string, voyage: RawVoyage): VoyageEntry {
        const {
            id,
            created_at,
            max_hp,
            hp,
            log_index,
            ship_id,
            ship_trait,
            pending_rewards,
            skill_aggregates,
            skills,
            crew_slots
        } = voyage;

        const { primary_skill, secondary_skill } = skills;
        const entry = {
            id,
            dateStarted: new Date(created_at),
            dbid,
            fleet,
            duration: log_index * 20,
            startAm: max_hp,
            finalAm: hp,
            shipId: ship_id,
            shipTrait: ship_trait,
            loot: pending_rewards.loot.map(({id, quantity}) => ({id, quantity})),
            primary_skill,
            secondary_skill,
            seats: crew_slots.map(slot => VoyagerRecord.create({
                seatid: voyageSeats.findIndex((seat) => seat.symbol == slot.symbol),
                voyagerid: slot.crew.id,
                symbol: slot.crew.symbol,
                skills: slot.crew.skills,
                rarity: slot.crew.rarity,
                trait: slot.trait,
                traitMatch: slot.crew.traits.includes(slot.trait)
            })),
            aggregates: skill_aggregates,
            extended: false
        };

        return { ...entry, extended: !this._checkVoyageLength(entry) };
    }

    _checkVoyageLength(entry: VoyageEntry) {
        const estimate = getEstimate(entry);
        return entry.duration <= estimate.maxResult;
    }

    store() {
        voyageStore.store();
    }
}
