interface GameSettings {
  type: string;
  difficulty: string;
}

export default class GlobalSettings {
  static settings: GameSettings;

  static setDefault(setType: string, setDifficulty: string) {
    this.settings = {
      type: setType,
      difficulty: setDifficulty,
    };
  }
}
