import * as configsJson from '../../assets/configs.json';
import CharacterConfig from './gameobject/character';

export default class ConfigTable {
    public static get characters(): CharacterConfig[] {
        return configsJson.characters;
    }
    public static getCharacter(id: number): CharacterConfig {
        return configsJson.characters.find((character: CharacterConfig) => character.id === id);
    }
}