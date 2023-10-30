import { makeAutoObservable } from 'mobx';

class NoteStore {
  notes = [];

  constructor() {
    makeAutoObservable(this);
  }
}

export default NoteStore;
