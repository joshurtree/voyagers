import { tr } from './translate';
import localForage from 'localforage';
import { VoyageState, VOYAGE_SEATS } from './constants';
import { getEstimate } from './voyage-emulator';

const VOYAGER_LOG_KEY = 'voyageLog';

type Skill = {
  core: number;
  range_min: number;
  range_max: number;
};

type Skills = {
  command_skill: Skill;
  diplomacy_skill: Skill;
  engineering_skill: Skill;
  medicine_skill: Skill;
  science_skill: Skill;
  security_skill: Skill;
};

type Voyager = {
  symbol: string;
  skills: Skills;
  rarity: number;
};

type VoyageSeat = {
  id: number;
  voyager: Voyager;
  traitMatch: boolean;
};

export type VoyageEntry = {
  id: number;
  date_started: Date;
  dbid: number;
  duration: number;
  fleet: string;
  startAm: number;
  finalAm: number;
  shipid: number;
  primary_skill: string;
  secondary_skill: string;
  seats: VoyageSeat[];
  aggregates: Skills;
};

export type PlayerEntry = {
  dbid: number;
  currentPlayerName: string;
  voyagersUsed: string[];
};

export type AllData = {
  players: PlayerEntry[];
  voyages: VoyageEntry[];
};

export enum ImportTaskState {
  notDone,
  failed,
  succeeded
};

export class ImportStatus {
  parsedJson: ImportTaskState = ImportTaskState.notDone;
  voyageFound: ImportTaskState = ImportTaskState.notDone;
  voyageCompleted: ImportTaskState = ImportTaskState.notDone;
  voyageUnique: ImportTaskState = ImportTaskState.notDone;
  voyageNotExtended: ImportTaskState = ImportTaskState.notDone;
  authenticated: ImportTaskState = ImportTaskState.notDone;
  stored: ImportTaskState = ImportTaskState.notDone;
  synced: ImportTaskState = ImportTaskState.notDone;
};

export class LocalVoyageLog {
  _voyageLog: VoyageEntry[];
  _playerLog: PlayerEntry[];
  _loadPromise: any;
  _sync: boolean = false;

  constructor(sync: boolean = false) {
    this._loadPromise = localForage.getItem(VOYAGER_LOG_KEY)
      .then((log? : AllData) => {
        if (log) {
          this._voyageLog = log.voyages ?? [];
          this._playerLog = log.players ?? [];
        } else {
          this._voyageLog = [];
          this._playerLog = [];
        }
      });
    this._sync = sync;
  }

  importVoyage(json: string, resolve: () => void, reject: (reason: ImportStatus) => void) {
    return new Promise((resolve, reject) => {
      const status: ImportStatus = new ImportStatus();
      const taskResult = (succeeded) => succeeded ? ImportTaskState.succeeded : ImportTaskState.failed;

      try {
        status.parsedJson = ImportTaskState.failed;
        const playerData = JSON.parse(json);
        status.parsedJson = ImportTaskState.succeeded;
        const { dbid, fleet, character } = playerData.player;
        const voyage = character.voyage[0];
        status.voyageFound = taskResult(voyage != undefined);

        if (status.voyageFound != ImportTaskState.succeeded)
          return reject(status);

        status.voyageCompleted = taskResult(voyage.state != VoyageState.started);
        status.voyageUnique = taskResult(this._voyageLog.filter((entry) => entry.id == voyage.id).length == 0);

        const entry = this._voyageToEntry(dbid, fleet.slabel, voyage);
        status.voyageNotExtended = taskResult(this._checkVoyageLength(entry));

        if (status.voyageCompleted != ImportTaskState.succeeded || status.voyageUnique != ImportTaskState.succeeded)
          return reject(status);

        //if (this._authenticateVoyage(playerData, voyage))
        //  status.authenticated = true;

        this._voyageLog.push(entry);
        this._playerLog[dbid] = character.display_name;

        status.synced = taskResult(this.doSync());
        status.stored = ImportTaskState.succeeded;

        resolve(status);
      } catch (err) {
        reject(status);
      }
    });
  }

  then(callback) {
    return this._loadPromise.then(callback);
  }

  removeLastVoyage() {
    this._voyageLog.pop();
    this.doSync();
  }

  groupBySkillPair() {

  }

  _voyageToEntry(dbid: number, fleet: string, voyage: object) : VoyageEntry {
    const { id, created_at, max_hp, hp, log_index, shipid, seats, skill_aggregates, skills, crew_slots } = voyage;
    const { primary_skill, secondary_skill } = skills;
    return {
      id,
      dateStarted: new Date(created_at),
      dbid,
      fleet,
      duration: log_index*20,
      startAm: max_hp,
      finalAm: hp,
      shipid,
      primary_skill,
      secondary_skill,
      seats: crew_slots.map(slot => ({
        id: VOYAGE_SEATS.find(seat => seat.symbol == slot.symbol),
        crew: {
          symbol: slot.crew.symbol,
          skills: slot.crew.skills,
          rarity: slot.crew.rarity
        },
        traitMatch: slot.crew.traits.includes(slot.trait)
      })),
      aggregates: skill_aggregates
    };
  }

  _checkVoyageLength(entry: VoyageEntry) {
    const estimate = getEstimate(entry);
    return entry.duration <= estimate.maxResult;
  }

  fetchAllVoyages(dbid: number = null) : VoyageEntry[] {
    const { _voyageLog } = this;
    return dbid ? _voyageLog.filter((entry) => dbid == entry.dbid) : _voyageLog.slice();
  }

  doSync() {
    localForage.setItem(VOYAGER_LOG_KEY, {
      voyages: this._voyageLog,
      players: this._playerLog
    });
    return false; // No backend yet
  }
}
