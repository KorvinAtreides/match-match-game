import User from './user';
import convertAvatarsDb from './shared';
import defaultDB from './defaultDB';
import GameResult from './gameResult';
import constants from './constants';

function idbOK() {
  return 'indexedDB' in window && !/iPad|iPhone|iPod/.test(navigator.platform);
}

export default class Database {
  status: string;

  async add(user: User, address: string, gameScore?: string) {
    const db: IDBDatabase = await this.openRequestToDB();
    const transaction = db.transaction([`${address}`], 'readwrite');
    const store = transaction.objectStore(`${address}`);
    let request: IDBRequest<IDBValidKey>;
    if (address === 'games') {
      const game: GameResult = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatarUrl: user.avatar,
        score: gameScore,
      };
      request = store.put(game);
    } else {
      request = store.put(user);
    }
    request.onerror = () => {
      this.status = 'error';
      throw new Error(`'Error: ${request.error.name}`);
    };
    request.onsuccess = () => {
      this.status = 'success';
    };
  }

  async createDB() {
    if (!idbOK()) {
      throw new Error("Error: Your device doesn't support IndexedBD");
    }
    const database: IDBDatabase = await this.openRequestToDB();
    const dbContainsUsers = database.objectStoreNames.contains('users');
    const dbContainsGames = database.objectStoreNames.contains('games');
    if (!dbContainsUsers && !dbContainsGames) {
      database.createObjectStore('users', { keyPath: 'hash' });
      database.createObjectStore('games', { keyPath: 'id', autoIncrement: true });
      this.createDefaultDB();
    }
  }

  async getMatchesDB() {
    const db: IDBDatabase = await this.openRequestToDB();
    const dbPromise = new Promise<Array<GameResult>>((resolve) => {
      const data: Array<GameResult> = [];
      const transaction = db.transaction(['games'], 'readonly');
      const store = transaction.objectStore('games');
      const cursor = store.openCursor();
      cursor.onsuccess = function onsuccess() {
        const currentCursor = cursor.result;
        if (currentCursor) {
          data.push(currentCursor.value);
          currentCursor.continue();
        }
      };
      transaction.oncomplete = () => {
        this.status = 'success';
        resolve(data);
      };
    });
    return dbPromise;
  }

  async createDefaultDB() {
    defaultDB.forEach(async (userData) => {
      const convertedUrl = await convertAvatarsDb(userData.avatarUrl);
      const defUser = new User(userData.firstName, userData.lastName, userData.email, convertedUrl);
      this.add(defUser, 'users');
      this.add(defUser, 'games', userData.score);
    });
  }

  async checkUser(key: number) {
    const db: IDBDatabase = await this.openRequestToDB();
    const dbPromise = new Promise<User>((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(key);
      request.onsuccess = () => {
        this.status = 'success';
        resolve(request.result);
      };
      request.onerror = (e) => {
        this.status = 'error';
        reject(new Error(`'Error: ${e}`));
      };
    });
    return dbPromise;
  }

  openRequestToDB() {
    const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const openRequest = indexedDB.open(constants.databaseAddress);
      this.status = 'pending';
      let database: IDBDatabase;
      openRequest.onupgradeneeded = () => {
        database = openRequest.result;
        resolve(database);
      };
      openRequest.onsuccess = () => {
        database = openRequest.result;
        resolve(database);
      };
      openRequest.onerror = (e) => {
        this.status = 'error';
        reject(new Error(`'Error: ${e}`));
      };
    });
    return dbPromise;
  }
}
